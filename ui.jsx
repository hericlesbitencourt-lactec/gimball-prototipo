// ui.jsx - reusable building blocks for the Gimball AR prototype

/* Gimball wordmark (mini) */
function GMark({ size = 22, light = false }) {
  return (
    <span style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: size,
      letterSpacing: '-.03em', color: light ? '#fff' : 'var(--ink)', lineHeight: 1 }}>
      <span style={{ color: 'var(--orange)' }}>g</span>imball
    </span>
  );
}

/* Button - variants: primary | dark | ghost | soft | danger */
function Btn({ children, variant = 'primary', block, disabled, onClick, icon, style = {}, size = 'md' }) {
  const pad = size === 'lg' ? '16px 22px' : size === 'sm' ? '9px 14px' : '13px 18px';
  const fs = size === 'lg' ? 16.5 : size === 'sm' ? 13.5 : 15.5;
  const base = {
    display: block ? 'flex' : 'inline-flex', width: block ? '100%' : 'auto',
    alignItems: 'center', justifyContent: 'center', gap: 9,
    padding: pad, fontSize: fs, fontWeight: 650, borderRadius: 14,
    border: '1px solid transparent', cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'var(--sans)', letterSpacing: '-.01em', lineHeight: 1.1,
    opacity: disabled ? 0.5 : 1, transition: 'transform .12s, filter .15s, background .15s',
  };
  const skins = {
    primary: { background: 'var(--orange)', color: '#fff', boxShadow: '0 6px 16px rgba(232,132,58,.32)' },
    dark:    { background: 'var(--navy-800)', color: '#fff' },
    ghost:   { background: 'transparent', color: 'var(--slate)', border: '1px solid var(--line)' },
    soft:    { background: '#F1F3F6', color: 'var(--ink)' },
    danger:  { background: 'var(--red-100)', color: 'var(--red)' },
  };
  return (
    <button className="tap" disabled={disabled} onClick={onClick}
      style={{ ...base, ...skins[variant], ...style }}>
      {icon}{children}
    </button>
  );
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
function StatusBadge({ s }) { const m = window.PSTATUS[s] || window.STATUS[s]; return m ? <Badge color={m.color} bg={m.bg} dot>{m.label}</Badge> : null; }
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
    <div className={`tap ${className}`} onClick={onClick}
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
            width: 40, height: 40, flex: '0 0 auto', borderRadius: 13, border: '1px solid var(--line)',
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

/* toast */
function Toast({ tone = 'ok', children }) {
  const map = { ok: ['var(--green)', <window.IcCheck s={18} w={2.4} />],
    err: ['var(--red)', <window.IcAlert s={18} />],
    info: ['var(--navy-700)', <window.IcDownload s={18} />] };
  const [c, ic] = map[tone];
  return (
    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 30, zIndex: 80,
      display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', borderRadius: 16,
      background: 'rgba(20,32,49,.96)', color: '#fff', fontSize: 14, fontWeight: 550,
      boxShadow: '0 18px 40px rgba(0,0,0,.4)', animation: 'toastIn .35s cubic-bezier(.22,1,.36,1) both' }}>
      <span style={{ color: c, display: 'flex' }}>{ic}</span>{children}
    </div>
  );
}

Object.assign(window, {
  GMark, Btn, Badge, StatusBadge, KindBadge, Avatar, Spinner, Skel, Card,
  EmptyState, TopBar, Screen, Toast,
});
