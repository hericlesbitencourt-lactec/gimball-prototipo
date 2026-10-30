// admin-m-ui.jsx - iOS primitives for the Gimball admin (mobile)

/* ── admin-only icons (reuse window.Ic* from icons.jsx for the rest) ── */
function MSvg({ s = 24, w = 1.8, children }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}
const MIc = {
  home:     (p) => <MSvg {...p}><path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/></MSvg>,
  users:    (p) => <MSvg {...p}><circle cx="9" cy="8" r="3.3"/><path d="M3 19.5a6 6 0 0 1 12 0"/><path d="M16 5.3a3.3 3.3 0 0 1 0 6.4"/><path d="M17.5 14.6a6 6 0 0 1 3 4.9"/></MSvg>,
  building: (p) => <MSvg {...p}><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 9h2a2 2 0 0 1 2 2v10"/><path d="M3 21h18"/><path d="M8 7h2M8 11h2M8 15h2"/></MSvg>,
  cube:     (p) => <MSvg {...p}><path d="M12 2.8 3.5 7.4v9.2L12 21.2l8.5-4.6V7.4Z"/><path d="M3.5 7.4 12 12l8.5-4.6M12 12v9.2"/></MSvg>,
  scan:     (p) => <MSvg {...p}><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16"/></MSvg>,
  shield:   (p) => <MSvg {...p}><path d="M12 3 5 5.5v5C5 15 8 18.5 12 20c4-1.5 7-5 7-9.5v-5L12 3Z"/><path d="M9 11.5l2 2 4-4.5"/></MSvg>,
  db:       (p) => <MSvg {...p}><ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/><path d="M5 11.5v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6"/></MSvg>,
  dots:     (p) => <MSvg {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></MSvg>,
  plus:     (p) => <MSvg {...p}><path d="M12 5v14M5 12h14"/></MSvg>,
  search:   (p) => <MSvg {...p}><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/></MSvg>,
  edit:     (p) => <MSvg {...p}><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3Z"/><path d="M13.5 7.5l3 3"/></MSvg>,
  trash:    (p) => <MSvg {...p}><path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14"/><path d="M10 10v6M14 10v6"/></MSvg>,
  bell:     (p) => <MSvg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></MSvg>,
  upload:   (p) => <MSvg {...p}><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></MSvg>,
  download: (p) => <MSvg {...p}><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></MSvg>,
  filter:   (p) => <MSvg {...p}><path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/></MSvg>,
  user:     (p) => <MSvg {...p}><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></MSvg>,
  link:     (p) => <MSvg {...p}><path d="M9 15l6-6"/><path d="M11 7l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 17l-1 1a3.5 3.5 0 0 1-5-5l1-1"/></MSvg>,
  logout:   (p) => <MSvg {...p}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M9 8l-4 4 4 4M5 12h10"/></MSvg>,
  grid:     (p) => <MSvg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></MSvg>,
  chart:    (p) => <MSvg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></MSvg>,
};

/* ── pills (use morador Badge under the hood) ── */
function SPill({ s }) { const m = window.ADM_STATUS[s]; return m ? <window.Badge color={m.color} bg={m.bg} dot>{m.label}</window.Badge> : null; }
function RPill({ r }) { const m = window.ROLE_BADGE[r]; return m ? <window.Badge color={m.color} bg={m.bg}>{m.label}</window.Badge> : null; }
function DPill({ d }) { const m = window.DISC_META[d]; return m ? <window.Badge color={m.tint} bg={m.bg}>{m.name}</window.Badge> : null; }
function KPill({ kind }) { const ab = kind === 'asbuilt'; return <window.Badge color={ab ? 'var(--green)' : 'var(--navy-700)'} bg={ab ? 'var(--green-100)' : '#E9EEF4'}>{ab ? 'As-built' : 'Projetado'}</window.Badge>; }

/* role-tinted avatar */
function MAvatar({ initials, size = 38, role }) {
  const tints = { admin: ['#7A4FB0', '#5a3a85'], engenheiro: ['#C98A1E', '#9a6a12'], morador: ['#2C7BB0', '#1f567d'] };
  const [a, b] = tints[role] || ['var(--navy-700)', 'var(--navy-900)'];
  return <div style={{ width: size, height: size, borderRadius: '50%', flex: '0 0 auto', background: `linear-gradient(140deg,${a},${b})`,
    color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.37, letterSpacing: '.02em' }}>{initials}</div>;
}

/* ── iOS large-title header that condenses on scroll ── */
function NavBar({ title, sub, onBack, right, scrolled, large = true }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 30, paddingTop: 52,
      background: scrolled ? 'rgba(243,244,246,.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--line)' : 'transparent'}`, transition: 'background .25s, border-color .25s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 8px', minHeight: 38 }}>
        {onBack && (
          <button className="tap" onClick={onBack.fn} aria-label="Voltar" style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'none', border: 0,
            color: 'var(--orange-600)', cursor: 'pointer', fontWeight: 600, fontSize: 16, padding: '4px 6px 4px 0', marginLeft: -2 }}>
            <window.IcChevL s={24} /> <span className="nav-back-label">{onBack.label || 'Voltar'}</span>
          </button>
        )}
        {scrolled && !large && <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>}
        {scrolled && large && <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 8px' }}>{title}</div>}
        {!scrolled && <div style={{ flex: 1, minWidth: 0, textAlign: "center", fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{!large && title}</div>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{right}</div>
      </div>
      {large && (
        <div style={{ padding: '2px 18px 10px', maxHeight: scrolled ? 0 : 80, opacity: scrolled ? 0 : 1, overflow: 'hidden', transition: 'max-height .25s, opacity .2s' }}>
          {sub && <div className="mono" style={{ fontSize: 11, color: 'var(--slate)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 3 }}>{sub}</div>}
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--ink)', lineHeight: 1.05 }}>{title}</div>
        </div>
      )}
    </div>
  );
}

/* round header icon button */
function NavBtn({ icon, onClick, label, accent }) {
  return <button className="tap" aria-label={label} onClick={onClick} style={{ width: 36, height: 36, borderRadius: 11, border: '1px solid var(--line)',
    background: accent ? 'var(--orange)' : '#fff', color: accent ? '#fff' : 'var(--ink)', display: 'grid', placeItems: 'center', cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(16,35,57,.05)' }}>{icon}</button>;
}

/* ── grouped inset list (iOS settings style) ── */
function Group({ header, footer, children, style = {} }) {
  return (
    <div style={{ margin: '0 16px 22px', ...style }}>
      {header && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '.04em', padding: '0 6px 7px' }}>{header}</div>}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #ECEEF1', boxShadow: '0 1px 2px rgba(16,35,57,.04)' }}>{children}</div>
      {footer && <div style={{ fontSize: 12, color: 'var(--slate)', padding: '8px 6px 0', lineHeight: 1.45 }}>{footer}</div>}
    </div>
  );
}
function Row({ left, icon, iconBg, iconColor, title, sub, value, valueColor, chevron, onClick, danger, trailing, last, confirmation }) {
  const [confirming, setConfirming] = React.useState(false);
  const prompt = confirmation || (danger && title.startsWith('Remover') ? {
    title: title + '?', body: 'Este cadastro será removido. Esta ação não pode ser desfeita.', action: 'Remover',
  } : null);
  const activate = () => {
    if (prompt) setConfirming(true);
    else onClick?.();
  };
  return (
    <>
    <div role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={e => { if (onClick && e.target === e.currentTarget && ["Enter", " "].includes(e.key)) { e.preventDefault(); activate(); } }} className={onClick ? 'tap' : ''} onClick={onClick ? activate : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid #F1F3F6', cursor: onClick ? 'pointer' : 'default' }}>
      {icon && <div style={{ width: 32, height: 32, borderRadius: 9, flex: '0 0 auto', display: 'grid', placeItems: 'center', background: iconBg || '#F2F5F8', color: iconColor || 'var(--navy-700)' }}>{icon}</div>}
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 550, color: danger ? 'var(--red)' : 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {trailing}
      {value != null && <div style={{ fontSize: 14.5, color: valueColor || 'var(--slate)', fontWeight: 500, flex: '0 0 auto', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{value}</div>}
      {chevron && <span style={{ color: 'var(--slate-300)', flex: '0 0 auto', marginLeft: -2 }}><window.IcChevR s={19} /></span>}
    </div>
    {prompt && <Sheet open={confirming} onClose={() => setConfirming(false)} title={prompt.title}
      footer={<><Action variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Action><Action variant={danger ? 'danger' : 'primary'} onClick={() => { setConfirming(false); onClick?.(); }}>{prompt.action}</Action></>}>
      <p style={{ margin: '4px 20px 22px', color: 'var(--slate)', fontSize: 14, lineHeight: 1.6 }}>{prompt.body}</p>
    </Sheet>}
    </>
  );
}

/* ── search field ── */
function Search({ value, onChange, placeholder }) {
  return (
    <div style={{ margin: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(118,118,128,.1)', borderRadius: 11, padding: '0 11px' }}>
      <span style={{ color: 'var(--slate-300)', display: 'flex' }}><MIc.search s={18} /></span>
      <input aria-label={placeholder || "Buscar"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'Buscar'} spellCheck={false}
        style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', padding: '9px 0', fontSize: 15.5, fontFamily: 'var(--sans)', color: 'var(--ink)' }} />
      {value && <button aria-label="Limpar busca" onClick={() => onChange('')} style={{ border: 0, background: 'none', color: 'var(--slate-300)', cursor: 'pointer', display: 'flex', padding: 2 }}><window.IcClose s={16} /></button>}
    </div>
  );
}

/* ── segmented control ── */
function Segment({ value, set, opts }) {
  return (
    <div style={{ margin: '0 16px 16px', display: 'flex', gap: 2, background: 'rgba(118,118,128,.1)', borderRadius: 10, padding: 2 }}>
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => set(v)} style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: 0, cursor: 'pointer', fontFamily: 'var(--sans)',
          fontSize: 13, fontWeight: value === v ? 650 : 550, color: value === v ? 'var(--ink)' : 'var(--slate)',
          background: value === v ? '#fff' : 'transparent', boxShadow: value === v ? '0 1px 3px rgba(0,0,0,.12)' : 'none', transition: '.15s' }}>{l}</button>
      ))}
    </div>
  );
}

/* ── bottom sheet ──
   sem animação de entrada: overlays animados por keyframes permanentes podem
   congelar no 1º frame (iframe oculto / reduced-motion) e ficar fora da tela. */
function Sheet({ open, onClose, title, children, footer, height }) {
  const dialog = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const node = dialog.current;
    node?.focus();
    const handle = e => {
      const dialogs = [...document.querySelectorAll('[role="dialog"]')];
      if (dialogs.at(-1) !== node) return;
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'Tab') {
        const controls = [...node.querySelectorAll('button:not(:disabled), input, [tabindex="0"]')];
        const first = controls[0], last = controls.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { document.removeEventListener('keydown', handle); if (previous?.isConnected) previous.focus(); };
  }, [open]);
  if (!open) return null;
  return ReactDOM.createPortal(
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(8,14,22,.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: height || '88%', background: '#F3F4F6', borderRadius: '22px 22px 0 0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: '0 0 auto', paddingTop: 10 }}>
          <div style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 6px' }} />
          {title && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px 12px' }}>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>{title}</div>
            <button aria-label="Fechar" className="tap" onClick={onClose} style={{ width: 30, height: 30, borderRadius: 99, border: 0, background: 'rgba(118,118,128,.12)', color: 'var(--slate)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><window.IcClose s={18} /></button>
          </div>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>{children}</div>
        {footer && <div style={{ flex: '0 0 auto', padding: '12px 16px', paddingBottom: 26, borderTop: '1px solid var(--line)', background: '#fff', display: 'flex', gap: 10 }}>{footer}</div>}
      </div>
    </div>, document.querySelector('.app-surface')
  );
}

/* ── form controls (inside Group rows) ── */
function FInput({ label, value, onChange, placeholder, type = 'text', last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: last ? 'none' : '1px solid #F1F3F6' }}>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 550, flex: '0 0 38%' }}>{label}</div>
      <input aria-label={label} type={type} value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} spellCheck={false}
        style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 15, color: 'var(--ink)', textAlign: 'right', minWidth: 0 }} />
    </div>
  );
}
function FSelect({ label, value, display, onClick, last }) {
  return (
    <div role="button" tabIndex={0} aria-label={label} onKeyDown={e => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); onClick?.(); } }} className="tap" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: last ? 'none' : '1px solid #F1F3F6', cursor: 'pointer' }}>
      <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 550, flex: '0 0 auto' }}>{label}</div>
      <div style={{ flex: 1, textAlign: 'right', fontSize: 15, color: 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{display}</div>
      <span style={{ color: 'var(--slate-300)', flex: '0 0 auto', marginLeft: -4 }}><window.IcChevR s={18} /></span>
    </div>
  );
}
function FToggle({ label, on, onToggle, last, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: last ? 'none' : '1px solid #F1F3F6' }}>
      <div style={{ flex: 1, fontSize: 15, color: 'var(--ink)', fontWeight: 550 }}>{label}</div>
      <button role="switch" aria-label={label} aria-checked={on} onClick={() => !disabled && onToggle()} disabled={disabled} style={{ width: 50, height: 30, borderRadius: 99, border: 0, cursor: disabled ? 'default' : 'pointer',
        background: on ? 'var(--green)' : 'rgba(118,118,128,.22)', position: 'relative', transition: 'background .2s', opacity: disabled ? .55 : 1 }}>
        <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 26, height: 26, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .2s' }} />
      </button>
    </div>
  );
}

/* picker sheet (single choice) */
function Picker({ open, onClose, title, options, value, onPick, searchable = false, searchPlaceholder }) {
  const [query, setQuery] = React.useState('');
  React.useEffect(() => { if (!open) setQuery(''); }, [open]);
  const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const term = normalize(query);
  const rows = searchable && term ? options.filter(o => normalize(o.l + ' ' + (o.sub || '')).includes(term)) : options;
  return (
    <Sheet open={open} onClose={onClose} title={title} height="70%">
      {searchable && <Search value={query} onChange={setQuery} placeholder={searchPlaceholder || 'Buscar opção'} />}
      <window.Group>
        {rows.map((o, i) => (
          <Row key={o.v} title={o.l} sub={o.sub} last={i === rows.length - 1} onClick={() => { onPick(o.v); onClose(); }}
            trailing={value === o.v ? <span style={{ color: 'var(--orange)', display: 'flex' }}><window.IcCheck s={20} w={2.4} /></span> : null} />
        ))}
      </window.Group>
      {!rows.length && <window.EmptyState icon={<MIc.search s={28} />} title="Nenhum resultado" body={searchable ? 'Tente outro termo ou limpe a busca.' : 'Não há opções cadastradas.'} />}
    </Sheet>
  );
}

/* big primary action button used in forms/sheets */
function Action({ children, onClick, variant = 'primary', disabled, icon }) {
  const skins = { primary: { background: 'var(--orange)', color: '#fff', boxShadow: '0 6px 16px rgba(232,132,58,.3)' },
    dark: { background: 'var(--navy-800)', color: '#fff' }, ghost: { background: 'rgba(118,118,128,.12)', color: 'var(--ink)' },
    danger: { background: 'var(--red-100)', color: 'var(--red)' } };
  return <button className="tap" onClick={onClick} disabled={disabled} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '14px', borderRadius: 14, border: 0, cursor: disabled ? 'default' : 'pointer', fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700,
    letterSpacing: '-.01em', opacity: disabled ? .5 : 1, ...skins[variant] }}>{icon}{children}</button>;
}

/* stat tile */
function Tile({ label, value, sub, icon, tint, bg }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '14px 15px', border: '1px solid #ECEEF1', boxShadow: '0 1px 2px rgba(16,35,57,.04)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, color: tint, display: 'grid', placeItems: 'center', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ── bottom tab bar ── */
function TabBar({ active, onTab }) {
  const tabs = [['inicio', 'Início', MIc.grid], ['imoveis', 'Imóveis', MIc.home], ['plantas', 'Plantas', MIc.cube], ['mais', 'Mais', MIc.dots]];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, paddingBottom: 22, paddingTop: 8,
      background: 'rgba(243,244,246,.88)', backdropFilter: 'blur(18px) saturate(170%)', WebkitBackdropFilter: 'blur(18px) saturate(170%)',
      borderTop: '1px solid var(--line)', display: 'flex' }}>
      {tabs.map(([id, label, Ic]) => {
        const on = active === id;
        return (
          <button aria-current={on ? "page" : undefined} key={id} className="tap" onClick={() => onTab(id)} style={{ flex: 1, border: 0, background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? 'var(--orange)' : 'var(--slate)', padding: '2px 0' }}>
            <Ic s={24} w={on ? 2.1 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 650 : 500, letterSpacing: '-.01em' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  MIc, SPill, RPill, DPill, KPill, MAvatar, NavBar, NavBtn, Group, Row, Search, Segment,
  Sheet, FInput, FSelect, FToggle, Picker, Action, Tile, TabBar,
});
