function RequestStatus({ status }) {
  const meta = window.PROFILE_REQUEST_STATUS[status];
  return meta ? <window.Badge color={meta.color} bg={meta.bg}>{meta.label}</window.Badge> : null;
}

function ProfileRequestNotice({ userId, onOpen }) {
  const requests = window.ADM_PROFILE_REQUESTS.filter(r => r.userId === userId).slice().reverse();
  const request = requests.find(r => ['pending', 'awaiting_email'].includes(r.status)) || requests[0];
  if (!request) return null;
  const titles = { pending: 'Alteração em análise', awaiting_email: 'Confirme seu novo e-mail', approved: 'Alteração cadastral aprovada', rejected: 'Alteração cadastral recusada' };
  const descriptions = { pending: 'A administração está analisando sua solicitação.', awaiting_email: 'Sua solicitação foi aprovada. Falta confirmar o novo endereço.', approved: 'Seus dados foram atualizados. Consulte seu cadastro.', rejected: request.reason };
  return <window.Card onClick={onOpen} style={{ marginBottom: 18, borderColor: 'var(--line)', borderLeft: '4px solid var(--orange)' }}>
    <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--ink)', marginBottom: 7 }}>{titles[request.status]}</div>
    <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--slate)', overflowWrap: 'anywhere' }}>{descriptions[request.status]}</div>
    <div style={{ fontSize: 13, fontWeight: 650, color: 'var(--orange-600)', marginTop: 10 }}>Ver solicitação →</div>
  </window.Card>;
}

function ProfileScreen({ user, onBack, onSaved, onPrivacy, onTerms }) {
  const [mode, setMode] = React.useState('view');
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone === '—' ? '' : user?.phone || '');
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [scrolled, setScrolled] = React.useState(false);
  const { field: formField, validate, clear: clearFieldErrors } = window.useFieldErrors();
  if (!user) return <window.Screen><window.TopBar title="Meus dados" onBack={onBack} /><window.EmptyState icon={<window.IcAlert s={28} />} title="Conta indisponível" body="Este cadastro não está mais disponível." /></window.Screen>;
  const requests = window.ADM_PROFILE_REQUESTS.filter(r => r.userId === user.id).slice().reverse();
  const active = requests.find(r => ['pending', 'awaiting_email'].includes(r.status));
  const request = active || requests[0];
  const labels = { name: 'Nome', email: 'E-mail', phone: 'Telefone' };
  const openRequest = () => {
    clearFieldErrors();
    setName(user.name); setEmail(user.email); setPhone(user.phone === '—' ? '' : user.phone || '');
    setNote(''); setError(''); setNotice(''); setMode('request');
  };
  const submit = e => {
    e.preventDefault();
    if (!validate({ Nome: !name.trim() && 'Informe o nome completo.', 'E-mail': !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Informe um e-mail válido.' : window.ADM_USERS.some(u => u.id !== user.id && u.email.toLowerCase() === email.trim().toLowerCase()) && 'Este e-mail já está cadastrado.' })) return;
    const result = window.Demo.requestProfileChange(user.id, { name, email, phone }, note);
    if (result.error) return setError(result.error);
    setError(''); setMode('view'); setNotice('Solicitação enviada para análise da administração.');
  };
  const confirmEmail = () => {
    const result = window.Demo.confirmProfileEmail(active.id, user.id);
    if (result.error) return setError(result.error);
    onSaved('Alteração cadastral concluída.');
  };
  const fieldStyle = { display: 'block', width: '100%', marginTop: 8, padding: '14px 12px', border: '1px solid var(--line)', borderRadius: 12, background: '#fff', color: 'var(--ink)' };
  const field = (label, value, set, type, autoComplete) => {
    const props = formField(label, set);
    const id = 'profile-' + autoComplete;
    return <div style={{ marginBottom: 18 }}><label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>{label}</label><input id={id} type={type} autoComplete={autoComplete} value={value} aria-invalid={props.error ? true : undefined} aria-describedby={props.error ? id + '-error' : undefined} onChange={e => { props.onChange(e.target.value); setError(''); }} style={fieldStyle} />{props.error && <div id={id + '-error'} role="alert" style={{ marginTop: 6, fontSize: 12, color: 'var(--red)' }}>{props.error}</div>}</div>;
  };
  return <window.Screen onScroll={e => setScrolled(e.currentTarget.scrollTop > 8)}>
    <window.TopBar title={mode === 'request' ? 'Solicitar alteração' : mode === 'email' ? 'Confirmar e-mail' : 'Meus dados'} onBack={() => { if (mode === 'view') onBack(); else { setError(''); setMode('view'); } }} scrolled={scrolled} />
    {mode === 'email' && active ? <window.EmailNotice title="Confirme seu novo e-mail" email={active.requested.email}>
      <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>A administração aprovou sua solicitação. Confirme o novo endereço para concluir a atualização. Até lá, seu cadastro atual permanece válido.</p>
      {error && <p role="alert" style={{ color: 'var(--red)' }}>{error}</p>}
      <window.Btn block onClick={confirmEmail}>Confirmar e-mail</window.Btn>
    </window.EmailNotice> : <div style={{ padding: '12px 18px 0' }}>
      {mode === 'view' ? <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '4px 0 24px' }}><window.Avatar initials={user.initials} size={68} /><window.Badge color="var(--navy-700)" bg="#E9EEF4">{window.ROLE_BADGE[user.role]?.label || user.role}</window.Badge></div>
        <window.Card pad={18}><dl style={{ margin: 0 }}>{Object.entries(labels).map(([key, label], i) => <div key={key} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : undefined }}><dt style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>{label}</dt><dd style={{ margin: 0, fontSize: 15, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{user[key] && user[key] !== '—' ? user[key] : 'Não informado'}</dd></div>)}</dl></window.Card>
        {notice && <p role="status" style={{ fontSize: 13, color: 'var(--green)', lineHeight: 1.6 }}>{notice}</p>}
        {request && <window.Card style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Última solicitação</div><RequestStatus status={request.status} />
          <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>{request.status === 'pending' ? 'Seus dados atuais permanecem válidos até a aprovação.' : request.status === 'awaiting_email' ? 'Solicitação aprovada. Confirme o novo e-mail para concluir a atualização.' : request.status === 'rejected' ? 'Motivo da recusa: ' + request.reason : 'Alteração concluída.'}</p>
          {active?.status === 'awaiting_email' && <window.Btn block onClick={() => { setError(''); setMode('email'); }}>Confirmar novo e-mail</window.Btn>}
        </window.Card>}
        {!active && <><p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, margin: '18px 2px' }}>Para corrigir seus dados, envie uma solicitação à administração.</p><window.Btn block onClick={openRequest}>Solicitar alteração</window.Btn></>}
        {(onPrivacy || onTerms) && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 18 }}>
          {[[onPrivacy, 'Política de privacidade'], [onTerms, 'Termos de uso']].filter(([action]) => action).map(([action, label]) => <button key={label} type="button" onClick={action} style={{ minHeight: 44, border: 0, background: 'transparent', color: 'var(--slate)', fontSize: 12, lineHeight: 1.5, fontWeight: 600, cursor: 'pointer' }}>{label}</button>)}
        </div>}
      </> : <form onSubmit={submit} noValidate>
        <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>Informe os novos dados. Seu cadastro só será atualizado após a aprovação da administração.</p>
        <window.Card pad={18}>{field('Nome', name, setName, 'text', 'name')}{field('E-mail', email, setEmail, 'email', 'email')}{field('Telefone', phone, setPhone, 'tel', 'tel')}<label style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>Observação (opcional)<textarea value={note} maxLength={500} rows={3} onChange={e => setNote(e.target.value)} style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit', fontSize: 15 }} /></label></window.Card>
        {error && <p role="alert" style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.5 }}>{error}</p>}
        <window.Btn type="submit" block style={{ marginTop: 18 }}>Enviar solicitação</window.Btn>
      </form>}
    </div>}
  </window.Screen>;
}
Object.assign(window, { ProfileScreen, RequestStatus, ProfileRequestNotice });
