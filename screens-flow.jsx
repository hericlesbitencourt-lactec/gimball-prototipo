// screens-flow.jsx - Login · Dashboard · Property detail · Plan selection

/* ───────────────────── LOGIN ───────────────────── */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('marina.alves@email.com');
  const [pass, setPass] = React.useState('demo1234');
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(false);
  const [recovery, setRecovery] = React.useState(false);
  const timer = React.useRef();
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || pass.length < 6) { setErr(true); return; }
    setErr(false); setBusy(true);
    timer.current = setTimeout(() => onLogin(), 700);
  };

  const field = (label, value, set, type, node) => (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
        color: 'var(--slate)', marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
        border: `1px solid ${err ? 'rgba(210,80,60,.7)' : 'var(--line)'}`, borderRadius: 14, padding: '0 14px' }}>
        <input value={value} type={type} spellCheck={false}
          onChange={e => set(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', color: 'var(--ink)',
            fontFamily: 'var(--sans)', fontSize: 15.5, fontWeight: 500, padding: '15px 0' }} />
        {node}
      </div>
    </label>
  );

  if (recovery) return <RecoveryScreen initialEmail={email} onBack={() => setRecovery(false)}
    onReset={(address, password) => { setEmail(address); setPass(password); setErr(false); setRecovery(false); }} />;

  return (
    <window.Screen pad={false}>
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column',
        background: 'var(--bg)',
        position: 'relative' }}>
        <div style={{ position: 'relative', padding: '0 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 118 }} />
          <div className="fadeup" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
            <window.GMark size={48} />
            <div className="mono" style={{ marginTop: 12, fontSize: 11.5, letterSpacing: '.22em',
              color: 'var(--slate)', textTransform: 'uppercase' }}>AR · As-built · BIM</div>
          </div>

          <div className="fadeup" style={{ animationDelay: '.08s' }}>
            <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em', marginBottom: 4 }}>Bem-vindo de volta</div>
            <div style={{ fontSize: 14.5, color: 'var(--slate)', marginBottom: 24 }}>Acesse as plantas técnicas do seu imóvel.</div>

            {field('E-mail', email, setEmail, 'email', null)}
            {field('Senha', pass, setPass, show ? 'text' : 'password',
              <button onClick={() => setShow(s => !s)} aria-label="Mostrar senha"
                style={{ background: 'none', border: 0, color: 'var(--slate)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                {show ? <window.IcEyeOff s={20} /> : <window.IcEye s={20} />}
              </button>)}

            {err && <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--red)', fontSize: 13, fontWeight: 600, margin: '2px 2px 14px' }}>
              <window.IcAlert s={16} /> Verifique seu e-mail e senha.</div>}

            <window.Btn block size="lg" onClick={submit} disabled={busy}
              style={{ marginTop: 8 }}>
              {busy ? <><window.Spinner size={20} color="#fff" /> Entrando…</> : 'Entrar'}
            </window.Btn>

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => setRecovery(true)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--slate)', fontSize: 13.5, fontWeight: 600 }}>Esqueci minha senha</button>
            </div>

            {/* perfis de acesso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--slate)', whiteSpace: 'nowrap', flex: '0 0 auto' }}>Entrar como</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }}></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="tap" onClick={submit} style={{ flex: 1, padding: '13px 8px', borderRadius: 13,
                border: '1px solid rgba(232,132,58,.55)', background: 'rgba(232,132,58,.14)', color: 'var(--ink)',
                fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>Morador</button>
              <a href="admin.html" className="tap" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px 8px', borderRadius: 13, border: '1px solid var(--line)', background: '#fff',
                color: 'var(--ink)', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>Administrador</a>
            </div>
          </div>

          <div style={{ flex: 1 }} />
          <div className="mono" style={{ textAlign: 'center', fontSize: 10.5, letterSpacing: '.04em',
            color: 'var(--slate)', padding: '24px 0' }}>Demonstração · dados fictícios</div>
        </div>
      </div>
    </window.Screen>
  );
}

/* ───────────────────── DASHBOARD ───────────────────── */
function RecoveryScreen({ initialEmail, onBack, onReset }) {
  const [step, setStep] = React.useState('request');
  const [email, setEmail] = React.useState(initialEmail);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [resent, setResent] = React.useState(false);
  const timer = React.useRef();
  React.useEffect(() => () => clearTimeout(timer.current), []);
  React.useEffect(() => {
    if (!cooldown) return;
    const id = setTimeout(() => setCooldown(n => n - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  const send = () => {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Informe um e-mail válido.');
    setError(''); setBusy(true);
    timer.current = setTimeout(() => { setEmail(email.trim()); setBusy(false); setResent(step === 'sent'); setStep('sent'); setCooldown(30); }, 700);
  };
  const reset = () => {
    if (busy) return;
    if (password.length < 8) return setError('Use uma senha com pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As senhas não coincidem.');
    setError(''); setBusy(true);
    timer.current = setTimeout(() => { setBusy(false); setStep('done'); }, 700);
  };
  const fieldStyle = { display: 'block', width: '100%', marginTop: 8, marginBottom: 20, padding: '15px 14px', border: '1px solid var(--line)', borderRadius: 14, background: '#fff', color: 'var(--ink)' };
  return (
    <window.Screen>
      <window.TopBar title={step === 'reset' ? 'Nova senha' : 'Recuperar senha'} onBack={onBack} />
      {step === 'request' && <div className="fadeup" style={{ padding: '24px 24px 0' }}>
        <window.GMark size={32} />
        <h1 style={{ fontSize: 25, marginTop: 30, letterSpacing: '-.025em' }}>Esqueceu sua senha?</h1>
        <p style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Informe o e-mail da sua conta para receber as instruções de recuperação.</p>
        <form onSubmit={e => { e.preventDefault(); send(); }} noValidate>
          <label style={{ fontSize: 14, fontWeight: 600 }}>E-mail<input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} style={fieldStyle} aria-invalid={!!error} aria-describedby={error ? 'recovery-error' : undefined} /></label>
          {error && <p id="recovery-error" role="alert" style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <window.Btn type="submit" block disabled={busy}>{busy ? <><window.Spinner size={18} color="#fff" /> Enviando…</> : 'Enviar instruções'}</window.Btn>
        </form>
        <p className="demo-label" style={{ marginTop: 22, lineHeight: 1.6 }}>Envio simulado para apresentação do fluxo.</p>
      </div>}
      {step === 'sent' && <window.EmailNotice title="Confira seu e-mail" email={email}>
        <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>Se houver uma conta com esse endereço, você receberá um link para criar uma nova senha. Confira também a pasta de spam.</p>
        {resent && <p role="status" style={{ fontSize: 13, color: 'var(--green)' }}>Reenvio simulado com sucesso.</p>}
        <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <window.Btn block variant="dark" onClick={() => { setError(''); setStep('reset'); }}>Simular abertura do link</window.Btn>
          <window.Btn block variant="ghost" disabled={busy || cooldown > 0} onClick={send}>{busy ? 'Reenviando…' : cooldown ? 'Reenviar em ' + cooldown + 's' : 'Reenviar instruções'}</window.Btn>
          <window.Btn block variant="soft" onClick={() => { setError(''); setStep('request'); }}>Corrigir e-mail</window.Btn>
          <window.Btn block variant="ghost" onClick={onBack}>Voltar ao login</window.Btn>
        </div>
      </window.EmailNotice>}
      {step === 'reset' && <div className="fadeup" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: 25 }}>Crie uma nova senha</h1>
        <p style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.6 }}>Use pelo menos 8 caracteres. Nesta demonstração, a senha será preenchida no login ao concluir.</p>
        <form onSubmit={e => { e.preventDefault(); reset(); }} noValidate>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Nova senha<input type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={fieldStyle} /></label>
          <label style={{ fontSize: 14, fontWeight: 600 }}>Confirmar nova senha<input type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={fieldStyle} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 24 }}><input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} />Mostrar senhas</label>
          {error && <p role="alert" style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <window.Btn type="submit" block disabled={busy}>{busy ? <><window.Spinner size={18} color="#fff" /> Salvando…</> : 'Salvar nova senha'}</window.Btn>
        </form>
        <p className="demo-label" style={{ marginTop: 24, lineHeight: 1.6 }}>Link e redefinição simulados. Nenhuma credencial real é alterada.</p>
      </div>}
      {step === 'done' && <window.EmailNotice title="Senha redefinida" email={email}>
        <p style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.6 }}>Redefinição concluída na demonstração. Volte ao login para continuar.</p>
        <window.Btn block onClick={() => onReset(email, password)} style={{ marginTop: 24 }}>Voltar ao login</window.Btn>
      </window.EmailNotice>}
    </window.Screen>
  );
}

function DashboardScreen({ user, state, onOpen, onLogout }) {
  const [scrolled, setScrolled] = React.useState(false);
  const props = window.residentProperties();
  const isEmpty = state === 'empty' || props.length === 0;
  const loading = state === 'loading';

  return (
    <window.Screen onScroll={e => setScrolled(e.target.scrollTop > 8)}>
      {/* greeting header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 56,
        background: scrolled ? 'rgba(243,244,246,.86)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(160%)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`, transition: '.25s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 18px 14px' }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', letterSpacing: '.04em', textTransform: 'uppercase' }}><window.GMark size={22} /></div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.025em', color: 'var(--ink)' }}>Olá, {user.first}</div>
          </div>
          <button className="tap" onClick={onLogout} aria-label="Sair" style={{ width: 40, height: 40, borderRadius: 13,
            border: '1px solid var(--line)', background: '#fff', color: 'var(--slate)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <window.IcLogout s={20} />
          </button>
          <window.Avatar initials={user.initials} />
        </div>
      </div>

      <div style={{ padding: '4px 18px 0' }}>
        <p className="demo-label">AMBIENTE DE DEMONSTRAÇÃO</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 2px 14px' }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--slate)' }}>Meus imóveis</div>
          <window.Badge color="var(--navy-700)" bg="#E9EEF4">{loading ? '—' : isEmpty ? 0 : props.length} unidades</window.Badge>
        </div>

        {loading && [0, 1, 2].map(i => (
          <window.Card key={i} style={{ marginBottom: 14, padding: 0, overflow: 'hidden' }}>
            <window.Skel h={70} r={0} />
            <div style={{ padding: 16 }}>
              <window.Skel w="62%" h={16} style={{ marginBottom: 10 }} />
              <window.Skel w="84%" h={12} style={{ marginBottom: 8 }} />
              <window.Skel w="40%" h={12} />
            </div>
          </window.Card>
        ))}

        {isEmpty && !loading && (
          <window.EmptyState icon={<window.IcInbox s={32} />}
            title="Nenhum imóvel vinculado"
            body="Você ainda não tem imóveis associados à sua conta. Fale com a administração do empreendimento."
            action={<a href="mailto:contato@gimball.com.br">Falar com o suporte</a>} />
        )}

        {!loading && !isEmpty && (
          <div className="stagger">
            {props.map(p => <PropertyCard key={p.id} p={p} onClick={() => onOpen(p.id)} />)}
          </div>
        )}
      </div>
    </window.Screen>
  );
}

function PropertyCard({ p, onClick }) {
  const st = window.STATUS[p.status];
  const total = p.counts.hidro + p.counts.eletr + p.counts.estru;
  return (
    <window.Card onClick={onClick} pad={0} style={{ marginBottom: 14, overflow: 'hidden' }}>
      {/* cover band */}
      <div style={{ height: 78, position: 'relative', background: `linear-gradient(135deg,${p.cover},var(--navy-900))`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .5,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)',
          backgroundSize: '22px 22px' }} />
        <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,.92)' }}>
          <window.IcCube s={18} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: '.05em' }}>{p.area} · {p.delivered}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 14 }}>
          <window.Badge color="#fff" bg="rgba(255,255,255,.16)" dot style={{ backdropFilter: 'blur(6px)' }}>{st.label}</window.Badge>
        </div>
      </div>
      <div style={{ padding: '15px 16px 16px' }}>
        <div style={{ fontSize: 17.5, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>{p.name}</div>
        <div style={{ fontSize: 13.5, color: 'var(--orange-600)', fontWeight: 600, marginTop: 1 }}>{p.unit}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: 'var(--slate)', fontSize: 12.5, marginTop: 9, lineHeight: 1.4 }}>
          <span style={{ marginTop: 1, flex: '0 0 auto' }}><window.IcMapPin s={15} /></span>{p.address}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13,
          paddingTop: 13, borderTop: '1px solid var(--line)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--slate)', fontSize: 13, fontWeight: 600 }}>
            <window.IcDoc s={17} /> {total} plantas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--orange-600)', fontSize: 13.5, fontWeight: 700 }}>
            Abrir <window.IcChevR s={17} />
          </span>
        </div>
      </div>
    </window.Card>
  );
}

/* ───────────────────── PROPERTY DETAIL ───────────────────── */
function PropertyScreen({ propId, onBack, onOpenType }) {
  const [scrolled, setScrolled] = React.useState(false);
  const p = window.property(propId);
  const st = window.STATUS[p.status];

  return (
    <window.Screen onScroll={e => setScrolled(e.target.scrollTop > 8)}>
      <window.TopBar title={p.name} sub="Imóvel / Unidade" onBack={onBack} scrolled={scrolled} />

      <div className="fadeup" style={{ padding: '4px 18px 0' }}>
        {/* summary card */}
        <window.Card style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange-600)' }}>{p.unit}</div>
            <window.Badge color={st.color} bg={st.bg} dot>{st.label}</window.Badge>
          </div>
          <Row label="Endereço" value={p.address} />
          <Row label="Área privativa" value={p.area} />
          <Row label="Entrega" value={p.delivered} last />
        </window.Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 2px 13px' }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>Tipos de projeto</div>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <div className="stagger">
          {window.PROJ_TYPES.map(t => (
            <TypeCard key={t.id} t={t} count={p.counts[t.id]} onClick={() => onOpenType(t.id)} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 18, padding: '13px 14px',
          background: '#EAF1F8', borderRadius: 14, color: '#2C5A7E' }}>
          <span style={{ flex: '0 0 auto', marginTop: 1 }}><window.IcCube s={18} /></span>
          <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
            Como morador, você visualiza as plantas <b>“Como foi construído”</b> (as-built), a versão final conforme executado na obra.
          </div>
        </div>
      </div>
    </window.Screen>
  );
}
function Row({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0',
      borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ fontSize: 13, color: 'var(--slate)', flex: '0 0 auto' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function TypeCard({ t, count, onClick }) {
  return (
    <window.Card onClick={onClick} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 50, height: 50, borderRadius: 14, flex: '0 0 auto', display: 'grid', placeItems: 'center',
        background: t.tintBg, color: t.tint }}>
        <window.ProjIcon id={t.id} s={26} w={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 750, letterSpacing: '-.01em', color: 'var(--ink)' }}>{t.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 1 }}>{t.sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <window.Badge color="var(--slate)" bg="#F1F3F6">{count}</window.Badge>
        <span style={{ color: 'var(--slate-300)' }}><window.IcChevR s={20} /></span>
      </div>
    </window.Card>
  );
}

/* ───────────────────── PLAN SELECTION ───────────────────── */
function PlansScreen({ propId, typeId, onBack, onView, onToast }) {
  const [scrolled, setScrolled] = React.useState(false);
  const p = window.property(propId);
  const t = window.projType(typeId);
  const plants = window.plantsFor(propId, typeId);
  const visible = plants.filter(pl => pl.kind === 'asbuilt'); // morador vê apenas o que tem permissão

  return (
    <window.Screen onScroll={e => setScrolled(e.target.scrollTop > 8)}>
      <window.TopBar title={t.name} sub={p.name} onBack={onBack} scrolled={scrolled}
        right={<div style={{ width: 40, height: 40, borderRadius: 13, display: 'grid', placeItems: 'center',
          background: t.tintBg, color: t.tint }}><window.ProjIcon id={t.id} s={22} w={1.9} /></div>} />

      <div className="fadeup" style={{ padding: '4px 18px 0' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--slate)', margin: '2px 2px 13px' }}>Plantas disponíveis</div>

        <div className="stagger">
          {!visible.length && <window.EmptyState icon={<window.IcDoc s={28} />} title="Nenhuma planta liberada" body="A administração disponibilizará as plantas deste tipo de projeto para sua unidade." />}
          {visible.map(pl => <PlantCard key={pl.id} pl={pl} onView={() => onView(pl)} onToast={onToast} />)}
        </div>
      </div>
    </window.Screen>
  );
}

function PlantCard({ pl, onView, onToast }) {
  const ok = pl.status === 'disponivel';
  return (
    <window.Card style={{ marginBottom: 13 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flex: '0 0 auto', display: 'grid', placeItems: 'center',
          background: 'var(--navy-900)', color: '#fff' }}><window.IcCube s={22} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 750, letterSpacing: '-.01em', color: 'var(--ink)', lineHeight: 1.25 }}>{pl.name}</div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
            <window.KindBadge kind={pl.kind} />
            <window.StatusBadge s={pl.status} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 13, paddingTop: 13, borderTop: '1px solid var(--line)' }}>
        <Meta label="Formato" value={pl.format.toUpperCase()} />
        <Meta label="Tamanho" value={pl.size} />
        <Meta label="Atualizado" value={pl.updated} />
      </div>

      <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
        {ok ? (
          <window.Btn block disabled={!pl.marker} onClick={onView} icon={<window.IcScan s={19} />}>Visualizar planta</window.Btn>
        ) : (
          <window.Btn block variant="soft" disabled icon={<window.IcAlert s={18} />}>
            {pl.status === 'pendente' ? 'Aguardando liberação' : 'Indisponível'}
          </window.Btn>
        )}
        <window.Btn variant="ghost" disabled={!ok} onClick={() => onToast('info', 'Download demonstrativo. O modelo real ainda não está conectado.')}
          aria-label="Baixar modelo" style={{ flex: '0 0 auto', padding: '13px 15px' }} icon={<window.IcDownload s={20} />} />
      </div>

      {!ok && (
        <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 10, lineHeight: 1.4 }}>
          {pl.status === 'pendente'
            ? 'O as-built deste sistema ainda está em validação pela equipe técnica.'
            : 'Arquivo ainda não enviado para este imóvel.'}
        </div>
      )}
    </window.Card>
  );
}
function Meta({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="mono" style={{ fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--slate-300)' }}>{label}</div>
      <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

Object.assign(window, { LoginScreen, DashboardScreen, PropertyScreen, PlansScreen });
