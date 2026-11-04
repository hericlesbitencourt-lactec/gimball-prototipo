function FirstAccessScreen({ token, onLogin }) {
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [legal, setLegal] = React.useState(null);
  const [accepted, setAccepted] = React.useState(false);
  const [complete, setComplete] = React.useState(null);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [, refresh] = React.useReducer(n => n + 1, 0);
  const { field, validate } = window.useFieldErrors();
  const timer = React.useRef();
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const invitation = window.Demo.inspectInvitation(token);
  React.useEffect(() => {
    if (invitation.state !== 'valid') return;
    const timeout = setTimeout(refresh, Math.min(2147483647, Math.max(1, invitation.user.invitation.expiresAt - Date.now())));
    const check = () => refresh();
    window.addEventListener('focus', check);
    return () => { clearTimeout(timeout); window.removeEventListener('focus', check); };
  }, [token, invitation.state, invitation.user?.invitation.expiresAt]);
  if (legal) return legal === 'privacy' ? <window.PrivacyScreen onBack={() => setLegal(null)} /> : <window.TermsScreen onBack={() => setLegal(null)} />;
  const submit = e => {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!validate({ Senha: password.length < 8 && 'Use uma senha com pelo menos 8 caracteres.', 'Confirmar senha': password !== confirm && 'As senhas não coincidem.', Documentos: !accepted && 'Aceite a Política de privacidade e os Termos de uso para ativar a conta.' })) return;
    setBusy(true);
    timer.current = setTimeout(() => {
      const result = window.Demo.acceptInvitation(token, password, { privacy: accepted, terms: accepted, privacyVersion: window.Demo.legalVersions.privacy, termsVersion: window.Demo.legalVersions.terms });
      setBusy(false);
      if (result.error) { setError(result.error); refresh(); }
      else { setPassword(''); setConfirm(''); setComplete(result.user); }
    }, 650);
  };
  const input = (label, value, set, id) => {
    const props = field(label, set);
    return <window.PasswordInput id={id} label={label} value={value} disabled={busy} visibilityLabel={label === 'Confirmar senha' ? 'confirmação de senha' : 'senha'}
      onChange={value => { props.onChange(value); setError(''); }} error={props.error} style={{ marginTop: 18 }} />;
  };
  const acceptance = field('Documentos', setAccepted);
  const documents = <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
    <window.Btn block variant="ghost" size="sm" disabled={busy} onClick={() => setLegal('privacy')} style={{ fontSize: 12, lineHeight: 1.5 }}>Política de privacidade</window.Btn>
    <window.Btn block variant="ghost" size="sm" disabled={busy} onClick={() => setLegal('terms')} style={{ fontSize: 12, lineHeight: 1.5 }}>Termos de uso</window.Btn>
  </div>;
  const failures = {
    expired: ['Convite expirado', 'Este convite tinha validade de 24 horas. Peça à administração para enviar um novo convite.'],
    used: ['Convite já utilizado', 'A senha desta conta já foi definida. Entre com seu e-mail e senha ou use a recuperação de senha.'],
    inactive: ['Convite indisponível', 'Esta conta está desativada. Entre em contato com a administração para verificar o acesso.'],
    invalid: ['Convite inválido', 'Este link não está disponível. Ele pode ter sido substituído por um novo convite. Consulte a administração.'],
  };
  return <window.Screen key={complete ? 'complete' : invitation.state === 'valid' ? 'form' : 'failure'} onScroll={e => setScrolled(e.currentTarget.scrollTop > 8)}>
    <window.TopBar title="Primeiro acesso" scrolled={scrolled} onBack={() => onLogin(complete || invitation.user)} />
    <div style={{ padding: '16px 22px 30px' }}>
      <window.GMark size={32} />
      {complete ? <>
        <h1 style={{ margin: '28px 0 12px', fontSize: 26, letterSpacing: '-.025em' }}>Senha definida com sucesso</h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--slate)' }}>Seu e-mail foi confirmado e sua conta está ativa. Entre para acessar os imóveis e projetos disponíveis para você.</p>
        <window.Btn block onClick={() => onLogin(complete)} style={{ marginTop: 24 }}>Ir para login</window.Btn>
      </> : invitation.state !== 'valid' ? <>
        <h1 style={{ margin: '28px 0 12px', fontSize: 26, letterSpacing: '-.025em' }}>{(failures[invitation.state] || failures.invalid)[0]}</h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--slate)' }}>{(failures[invitation.state] || failures.invalid)[1]}</p>
        <window.Btn block onClick={() => onLogin(invitation.user)} style={{ marginTop: 24 }}>Ir para login</window.Btn>
      </> : <>
        <h1 style={{ margin: '26px 0 10px', fontSize: 26, letterSpacing: '-.025em' }}>Defina sua senha</h1>
        <p style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.7, color: 'var(--slate)' }}>Você recebeu um convite para acessar a Gimball. Defina sua senha para confirmar seu e-mail e ativar a conta.</p>
        <window.Card pad={16}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{invitation.user.name}</div>
          <div style={{ marginTop: 5, fontSize: 13, lineHeight: 1.6, color: 'var(--slate)', overflowWrap: 'anywhere' }}>{invitation.user.email}</div>
        </window.Card>
        <form onSubmit={submit} noValidate>
          {input('Senha', password, setPassword, 'first-password')}
          {input('Confirmar senha', confirm, setConfirm, 'first-confirm')}
          <div style={{ marginTop: 20, padding: 14, borderRadius: 14, border: '1px solid var(--line)', background: '#fff' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minHeight: 44, fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', cursor: 'pointer' }}>
              <input type="checkbox" aria-label="Aceito a Política de privacidade e os Termos de uso" checked={accepted} disabled={busy} onChange={e => { acceptance.onChange(e.target.checked); setError(''); }}
                aria-invalid={acceptance.error ? true : undefined} aria-describedby={acceptance.error ? 'acceptance-error' : undefined}
                style={{ width: 20, height: 20, flexShrink: 0, margin: '3px 0 0', accentColor: 'var(--orange-action)' }} />
              <span>Li e aceito a Política de privacidade e os Termos de uso.</span>
            </label>
            {acceptance.error && <p id="acceptance-error" role="alert" style={{ margin: '6px 0 0', color: 'var(--red)', fontSize: 12, lineHeight: 1.6 }}>{acceptance.error}</p>}
            {documents}
          </div>
          {error && <p role="alert" style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
          <window.Btn type="submit" block disabled={busy} style={{ marginTop: 14 }}>{busy ? <><window.Spinner size={18} color="#fff" /> Ativando…</> : 'Definir senha e ativar conta'}</window.Btn>
        </form>
      </>}
      {(complete || invitation.state !== 'valid') && documents}
    </div>
  </window.Screen>;
}
window.FirstAccessScreen = FirstAccessScreen;
