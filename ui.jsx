// ui.jsx - reusable building blocks for the Gimball AR prototype

/* Gimball wordmark (mini) */
function GMark({ size = 22 }) {
  return (
    <span style={{ display: 'inline-flex' }}>
      <img className="brand-image" src="assets/gimball-logo.png" alt="Gimball" style={{ width: size * 4.2, height: size * 1.11 }} />
    </span>
  );
}

function EmailNotice({ title, email, children }) {
  return (
    <div className="fadeup" style={{ padding: '24px 22px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, margin: '0 auto 22px', borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--orange-100)', color: 'var(--orange-600)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>
      </div>
      <h1 style={{ fontSize: 24, letterSpacing: '-.025em', margin: '0 0 14px', color: 'var(--ink)' }}>{title}</h1>
      <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>E-mail de destino<br/><strong style={{ color: 'var(--ink)', overflowWrap: 'anywhere' }}>{email}</strong></p>

      {children}
    </div>
  );
}

/* Button - variants: primary | dark | ghost | soft | danger */
function Btn({ children, variant = 'primary', block, disabled, onClick, icon, style = {}, size = 'md', ...props }) {
  const pad = size === 'lg' ? '16px 22px' : size === 'sm' ? '9px 14px' : '13px 18px';
  const fs = size === 'lg' ? 16.5 : size === 'sm' ? 13.5 : 15.5;
  const base = {
    display: block ? 'flex' : 'inline-flex', width: block ? '100%' : 'auto',
    alignItems: 'center', justifyContent: 'center', gap: 9,
    padding: pad, minHeight: 44, fontSize: fs, fontWeight: 650, borderRadius: 14,
    border: '1px solid transparent', cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--sans)', letterSpacing: '-.01em', lineHeight: 1.1,
    opacity: disabled ? 0.5 : 1, transition: 'transform .12s, filter .15s, background .15s',
  };
  const skins = {
    primary: { background: 'var(--orange-action)', color: '#fff', boxShadow: '0 6px 16px rgba(196,76,18,.18)' },
    dark:    { background: 'var(--navy-800)', color: '#fff' },
    ghost:   { background: 'transparent', color: 'var(--slate)', border: '1px solid var(--line)' },
    soft:    { background: '#F1F3F6', color: 'var(--ink)' },
    danger:  { background: 'var(--red-100)', color: 'var(--red)' },
  };
  return (
    <button type="button" {...props} className="tap" disabled={disabled} onClick={onClick}
      style={{ ...base, ...skins[variant], ...style }}>
      {icon}{children}
    </button>
  );
}

function PasswordInput({ id, label, value, onChange, autoComplete = 'new-password', disabled, error, invalid, describedBy, visibilityLabel, style }) {
  const [visible, setVisible] = React.useState(false);
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const target = visibilityLabel || label.toLowerCase();
  return <div style={style}>
    <label htmlFor={fieldId} style={{ display: 'block', fontSize: 13, fontWeight: 650, color: 'var(--slate)' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, border: '1px solid var(--line)', borderRadius: 14, background: '#fff' }}>
      <input id={fieldId} type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
        aria-invalid={error || invalid ? true : undefined} aria-describedby={error ? fieldId + '-error' : describedBy}
        style={{ flex: 1, width: '100%', minWidth: 0, minHeight: 50, padding: '13px 12px', border: 0, outline: 'none', background: 'transparent', color: 'var(--ink)' }} />
      <button type="button" aria-label={(visible ? 'Ocultar ' : 'Mostrar ') + target} aria-pressed={visible} disabled={disabled} onClick={() => setVisible(current => !current)}
        style={{ display: 'grid', placeItems: 'center', width: 44, minHeight: 44, flexShrink: 0, padding: 8, border: 0, background: 'transparent', color: 'var(--slate)', cursor: 'pointer' }}>
        {visible ? <window.IcEyeOff s={20} /> : <window.IcEye s={20} />}
      </button>
    </div>
    {error && <p id={fieldId + '-error'} role="alert" style={{ margin: '6px 0 0', color: 'var(--red)', fontSize: 12, lineHeight: 1.6 }}>{error}</p>}
  </div>;
}

/* status / kind pills */
function Badge({ children, color = 'var(--slate)', bg = '#F1F3F6', dot, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 650,
      letterSpacing: '.01em', color, background: bg, ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: color }} />}
      {children}
    </span>
  );
}
function StatusBadge({ s }) { const m = window.PSTATUS?.[s] || window.STATUS?.[s]; return m ? <Badge color={m.color} bg={m.bg} dot>{m.label}</Badge> : null; }
function KindBadge({ kind }) {
  const k = window.KIND[kind];
  const asbuilt = kind === 'asbuilt';
  return <Badge color={asbuilt ? 'var(--green)' : 'var(--navy-700)'}
    bg={asbuilt ? 'var(--green-100)' : '#E9EEF4'}>{k.label}</Badge>;
}

/* avatar */
function Avatar({ initials, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flex: '0 0 auto',
      background: 'linear-gradient(140deg,var(--navy-700),var(--navy-900))', color: '#fff',
      display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.38,
      letterSpacing: '.02em', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.08)' }}>{initials}</div>
  );
}

/* spinner ring */
function Spinner({ size = 26, color = 'var(--orange)', stroke = 3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" style={{ animation: 'spin .9s linear infinite' }}>
      <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeOpacity=".16" strokeWidth={stroke} />
      <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray="28 100" />
    </svg>
  );
}

/* skeleton shimmer block */
function Skel({ w = '100%', h = 14, r = 8, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r,
    background: 'linear-gradient(90deg,#ECEEF1 0,#F6F7F9 40%,#ECEEF1 80%)',
    backgroundSize: '300px 100%', animation: 'shimmer 1.25s linear infinite', ...style }} />;
}

/* card shell */
function Card({ children, onClick, style = {}, pad = 16, className = '' }) {
  return (
    <div role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={e => { if (onClick && ["Enter", " "].includes(e.key)) { e.preventDefault(); onClick(); } }} className={`tap ${className}`} onClick={onClick}
      style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: pad,
        boxShadow: '0 1px 2px rgba(16,35,57,.05), 0 8px 22px -16px rgba(16,35,57,.18)',
        border: '1px solid #EEF0F3', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

/* empty state */
function EmptyState({ icon, title, body, action }) {
  return (
    <div className="fadeup" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '54px 32px', color: 'var(--slate)' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, display: 'grid', placeItems: 'center',
        background: '#EEF1F5', color: 'var(--slate-300)', marginBottom: 18 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 250 }}>{body}</div>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

/* custom app top bar (over light screens) */
function TopBar({ title, sub, onBack, right, scrolled }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 52,
      background: scrolled ? 'rgba(243,244,246,.86)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px) saturate(160%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(160%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      transition: 'background .25s, border-color .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px 12px' }}>
        {onBack && (
          <button className="tap" onClick={onBack} aria-label="Voltar" style={{
            width: 44, height: 44, flex: '0 0 auto', borderRadius: 13, border: '1px solid var(--line)',
            background: '#fff', color: 'var(--ink)', display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(16,35,57,.05)' }}>
            <window.IcChevL s={22} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sub && <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', letterSpacing: '.04em', marginBottom: 2, textTransform: 'uppercase' }}>{sub}</div>}
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        </div>
        {right}
      </div>
    </div>
  );
}

/* a light scrollable screen surface that clears the status bar */
function Screen({ children, onScroll, dark, bg, pad = true }) {
  return (
    <div onScroll={onScroll} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden',
      background: bg || (dark ? 'var(--navy-900)' : 'var(--bg)'),
      WebkitOverflowScrolling: 'touch' }}>
      {children}
      {pad && <div style={{ height: 38 }} />}
    </div>
  );
}

function LegalScreen({ onBack, kind = 'privacy' }) {
  const [scrolled, setScrolled] = React.useState(false);
  const terms = kind === 'terms';
  const sections = terms ? ['Acesso à plataforma', 'Uso do aplicativo', 'Responsabilidades', 'Disposições gerais'] : ['Dados pessoais', 'Uso das informações', 'Compartilhamento de dados', 'Contato e direitos'];
  return <Screen onScroll={e => setScrolled(e.currentTarget.scrollTop > 8)}>
    <TopBar title={terms ? 'Termos' : 'Privacidade'} onBack={onBack} scrolled={scrolled} />
    <article style={{ padding: '12px 22px 38px', color: 'var(--ink)' }}>
      <GMark size={27} />
      <h1 style={{ margin: '24px 0 12px', fontSize: 27, lineHeight: 1.2, letterSpacing: '-.025em' }}>{terms ? 'Termos de uso' : 'Política de privacidade'}</h1>
      <Badge color="var(--slate)" bg="#E9EEF4">Conteúdo ilustrativo</Badge>
      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--slate)', marginTop: 22 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sollicitudin, neque a tincidunt volutpat, ipsum erat consequat lorem, vitae dignissim augue arcu vitae sapien.</p>
      {sections.map((title, i) => <section key={title} style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 17, lineHeight: 1.5, margin: '0 0 10px' }}>{i + 1}. {title}</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: 'var(--slate)' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec feugiat sapien sit amet magna facilisis, vel finibus neque elementum. Sed viverra nibh quis enim malesuada, in consectetur tellus tincidunt. Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.</p>
      </section>)}
    </article>
  </Screen>;
}

function PrivacyScreen(props) { return <LegalScreen {...props} />; }
function TermsScreen(props) { return <LegalScreen {...props} kind="terms" />; }

function ConfirmModal({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onCancel, onConfirm }) {
  const overlay = React.useRef(null);
  const panel = React.useRef(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  React.useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const node = panel.current;
    const siblings = [...overlay.current.parentElement.children].filter(el => el !== overlay.current);
    const previousInert = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    const buttons = [...node.querySelectorAll('button')];
    buttons[0].focus();
    const handleKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      if (e.key === 'Tab') {
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      siblings.forEach((el, i) => { el.inert = previousInert[i]; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  if (!open) return null;
  const buttonStyle = { flex: 1, minWidth: 0, minHeight: 52, border: 0, background: 'transparent', padding: '14px 10px', fontSize: 15, fontWeight: 650, cursor: 'pointer' };
  return ReactDOM.createPortal(
    <div ref={overlay} onClick={onCancel} style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', padding: 24, background: 'rgba(8,14,22,.48)' }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 320, maxHeight: '100%', overflowY: 'auto', borderRadius: 24, background: '#fff', boxShadow: '0 18px 60px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '25px 22px 23px', textAlign: 'center' }}>
          <h2 id={titleId} style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 750, letterSpacing: '-.02em', color: 'var(--ink)' }}>{title}</h2>
          <p id={descriptionId} style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--slate)', overflowWrap: 'anywhere' }}>{description}</p>
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid var(--line)' }}>
          <button type="button" onClick={onCancel} style={{ ...buttonStyle, color: 'var(--ink)', borderRight: '1px solid var(--line)' }}>{cancelLabel}</button>
          <button type="button" onClick={onConfirm} style={{ ...buttonStyle, color: danger ? 'var(--red)' : 'var(--orange-600)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>, document.querySelector('.app-surface')
  );
}

function LogoutModal(props) {
  return <ConfirmModal {...props} title="Sair do aplicativo?" description="Você voltará para a tela de acesso. Deseja realmente sair?" confirmLabel="Sair" danger />;
}

function useSessionGuard(active, onEnd) {
  const callback = React.useRef(onEnd);
  callback.current = onEnd;
  React.useEffect(() => {
    if (!active) return;
    let timer, ended = false;
    const check = () => {
      if (ended) return;
      clearTimeout(timer);
      const issue = window.Demo.sessionIssue();
      if (issue) {
        ended = true;
        window.Demo.endSession(issue);
        callback.current();
      } else timer = setTimeout(check, Math.min(30000, Math.max(1, window.Demo.session().expiresAt - Date.now())));
    };
    check();
    const stop = () => { ended = true; clearTimeout(timer); };
    window.addEventListener('demo-session-ended', stop);
    window.addEventListener('demo-change', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => { clearTimeout(timer); window.removeEventListener('demo-session-ended', stop); window.removeEventListener('demo-change', check); window.removeEventListener('focus', check); document.removeEventListener('visibilitychange', check); };
  }, [active]);
}

// Shared by the small forms: errors stay beside their fields and focus follows validation.
function useFieldErrors() {
  const [errors, setErrors] = React.useState({});
  const validate = next => {
    const invalid = Object.fromEntries(Object.entries(next).filter(([, message]) => message));
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() => {
        const input = [...document.querySelectorAll('[aria-invalid="true"]')].find(el => !el.closest('[inert]'));
        input?.focus();
        input?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return false;
    }
    return true;
  };
  const field = (label, set) => ({ error: errors[label], onChange: value => {
    set(value);
    setErrors(previous => ({ ...previous, [label]: undefined }));
  } });
  return { field, validate, clear: () => setErrors({}) };
}

/* toast */
function Toast({ tone = 'ok', children }) {
  const map = { ok: ['#72dca4', <window.IcCheck s={18} w={2.4} />],
    err: ['#ffad9f', <window.IcAlert s={18} />],
    info: ['#a6d9ff', <window.IcDownload s={18} />] };
  const [c, ic] = map[tone];
  return (
    <div role="status" aria-live="polite" style={{ position: 'absolute', left: 16, right: 16, bottom: 92, zIndex: 80,
      display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', borderRadius: 16,
      background: 'rgba(20,32,49,.96)', color: '#fff', fontSize: 14, fontWeight: 550,
      boxShadow: '0 18px 40px rgba(0,0,0,.4)', animation: 'toastIn .35s cubic-bezier(.22,1,.36,1) both' }}>
      <span style={{ color: c, display: 'flex' }}>{ic}</span>{children}
    </div>
  );
}

Object.assign(window, {
  GMark, EmailNotice, Btn, Badge, StatusBadge, KindBadge, Avatar, Spinner, Skel, Card,
  EmptyState, TopBar, Screen, Toast, ConfirmModal, LogoutModal, useFieldErrors, useSessionGuard, PrivacyScreen, TermsScreen, PasswordInput,
});
