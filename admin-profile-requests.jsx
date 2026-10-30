function MProfileRequests({ push, pop }) {
  const [filter, setFilter] = React.useState('pending');
  const rows = window.ADM_PROFILE_REQUESTS.filter(r => filter === 'all' || r.status === 'pending').slice().reverse();
  return <window.Page title="Solicitações" sub="Alterações cadastrais" onBack={{ label: 'Voltar', fn: pop }}>
    <window.Segment value={filter} set={setFilter} opts={[['pending', 'Pendentes'], ['all', 'Todas']]} />
    <window.Group>
      {rows.map((request, i) => <window.Row key={request.id} title={window.ADM_USERS.find(u => u.id === request.userId)?.name || request.before.name}
        sub={new Date(request.requestedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        icon={<window.MIc.edit s={18} />} trailing={<window.RequestStatus status={request.status} />} chevron last={i === rows.length - 1}
        onClick={() => push({ key: 'profileRequestReview', requestId: request.id })} />)}
    </window.Group>
    {!rows.length && <window.EmptyState icon={<window.IcInbox s={28} />} title={filter === 'pending' ? 'Nenhuma solicitação pendente' : 'Nenhuma solicitação'} body="As solicitações de alteração enviadas pelos usuários aparecerão aqui." />}
  </window.Page>;
}

function MProfileRequestReview({ requestId, reviewerId, pop, toast }) {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [decision, setDecision] = React.useState(null);
  const reasonInput = React.useRef(null);
  const request = window.ADM_PROFILE_REQUESTS.find(r => r.id === requestId);
  if (!request) return <window.Page title="Solicitação" onBack={{ label: 'Voltar', fn: pop }}><window.EmptyState icon={<window.IcAlert s={28} />} title="Solicitação indisponível" body="Esta solicitação não está mais disponível." /></window.Page>;
  const user = window.ADM_USERS.find(u => u.id === request.userId);
  const fields = [['name', 'Nome'], ['email', 'E-mail'], ['phone', 'Telefone']];
  const changes = fields.filter(([key]) => request.before[key] !== request.requested[key]);
  const emailChanged = request.before.email.toLowerCase() !== request.requested.email.toLowerCase();
  const review = () => {
    const result = window.Demo.reviewProfileChange(request.id, decision, reason, reviewerId);
    setDecision(null);
    if (result.error) return setError(result.error);
    toast(decision === 'approve' ? 'Solicitação aprovada.' : 'Solicitação recusada.');
    pop();
  };
  return <window.Page title="Revisar alteração" large={false} onBack={{ label: 'Solicitações', fn: pop }}>
    <window.Group header="Solicitante">
      <window.Row title={user?.name || request.before.name} sub={user?.email || request.before.email} last trailing={<window.RequestStatus status={request.status} />} />
    </window.Group>
    <window.Group header="Dados atuais e solicitados">
      {changes.map(([key, label], i) => <div key={key} style={{ padding: '14px 16px', borderTop: i ? '1px solid var(--line)' : undefined }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.6 }}>Atual: <span style={{ overflowWrap: 'anywhere' }}>{(user?.[key] === '—' ? '' : user?.[key]) || 'Não informado'}</span></div>
        <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, marginTop: 4 }}>Solicitado: <strong style={{ overflowWrap: 'anywhere' }}>{request.requested[key] || 'Não informado'}</strong></div>
      </div>)}
    </window.Group>
    {request.note && <window.Group header="Observação do usuário"><p style={{ margin: 0, padding: 16, fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{request.note}</p></window.Group>}
    {['pending', 'awaiting_email'].includes(request.status) ? <div style={{ margin: '0 16px' }}>
      {emailChanged && <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>Após a aprovação, o usuário precisará confirmar o novo e-mail. Até essa confirmação, os dados atuais serão preservados.</p>}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Motivo da recusa
        <textarea ref={reasonInput} rows={3} maxLength={500} value={reason} aria-invalid={error ? true : undefined} aria-describedby={error ? 'review-error' : undefined} onChange={e => { setReason(e.target.value); setError(''); }} placeholder="Obrigatório ao recusar" style={{ display: 'block', width: '100%', margin: '8px 0 18px', border: '1px solid var(--line)', borderRadius: 14, padding: 12, fontSize: 15, fontFamily: 'inherit', resize: 'vertical' }} />
      </label>
      {error && <p id="review-error" role="alert" style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <window.Action variant="danger" onClick={() => { if (!reason.trim()) { setError('Informe o motivo da recusa.'); reasonInput.current.focus(); } else { setError(''); setDecision('reject'); } }}>{request.status === 'awaiting_email' ? 'Cancelar aprovação' : 'Recusar'}</window.Action>
        {request.status === 'pending' && <window.Action onClick={() => { setError(''); setDecision('approve'); }}>Aprovar alteração</window.Action>}
      </div>
    </div> : <window.Group header="Análise">
      <div style={{ padding: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--slate)' }}>
        <div>Responsável: {window.ADM_USERS.find(u => u.id === request.reviewedBy)?.name || 'Administração'}</div>
        <div>{request.reviewedAt && new Date(request.reviewedAt).toLocaleString('pt-BR')}</div>
        {request.status === 'rejected' && <div style={{ marginTop: 8 }}>Motivo da recusa: {request.reason}</div>}
        {request.status === 'awaiting_email' && <div style={{ marginTop: 8 }}>Aguardando a confirmação do novo e-mail pelo usuário.</div>}
      </div>
    </window.Group>}
    <window.ConfirmModal open={!!decision} onCancel={() => setDecision(null)} title={decision === 'approve' ? 'Aprovar alteração?' : 'Recusar alteração?'}
      confirmLabel={decision === 'approve' ? 'Aprovar' : 'Recusar'} danger={decision === 'reject'} onConfirm={review}
      description={decision === 'approve' ? emailChanged ? 'A alteração será liberada após a confirmação do novo e-mail pelo usuário.' : 'Os dados solicitados substituirão os dados atuais do cadastro.' : 'O cadastro atual será preservado. O usuário poderá consultar o motivo da recusa.'} />
  </window.Page>;
}

Object.assign(window, { MProfileRequests, MProfileRequestReview });
