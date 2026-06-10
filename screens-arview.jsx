// screens-arview.jsx — AR viewer with anchored 3D model + live controls

/* holographic model overlay per project type (simple lines/rects/circles) */
function ModelOverlay({ typeId, color }) {
  const glow = { filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 2px ${color})` };
  const lineP = { fill: 'none', stroke: color, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const joint = (x, y) => <circle cx={x} cy={y} r={5} fill="#0c1622" stroke={color} strokeWidth={2.5} />;
  const sq = (x, y, s = 14, rot = 0) => <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2}
    fill="none" stroke={color} strokeWidth={2.5} transform={`rotate(${rot} ${x} ${y})`} />;

  let content;
  if (typeId === 'hidro') content = (<g>
    <path className="ar-dash" {...lineP} d="M40 120 H260 M80 120 V55 M210 120 V55 M150 120 V186 M80 55 H120 M210 55 H172" />
    {joint(80,120)}{joint(210,120)}{joint(150,120)}{joint(80,55)}{joint(210,55)}
    {sq(120,55,15,45)}{sq(150,186,15,45)}
  </g>);
  else if (typeId === 'eletr') content = (<g>
    <rect x="40" y="42" width="42" height="58" rx="4" fill="none" stroke={color} strokeWidth={2.5} />
    <path d="M52 58 H70 M52 70 H70 M52 82 H70" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <path className="ar-dash" {...lineP} d="M61 100 V152 H236 M120 152 V92 M180 152 V92 M236 152 V70" />
    {sq(120,86)}{sq(180,86)}{sq(236,64)}
    {joint(61,152)}{joint(120,152)}{joint(180,152)}
  </g>);
  else content = (<g>
    <rect x="58" y="44" width="16" height="150" rx="2" fill="none" stroke={color} strokeWidth={2.5} />
    <rect x="208" y="44" width="16" height="150" rx="2" fill="none" stroke={color} strokeWidth={2.5} />
    <path {...lineP} d="M58 50 H224 M58 118 H224 M58 188 H224" />
    <path className="ar-dash" {...lineP} d="M74 50 L208 118 M74 118 L208 188" opacity=".75" />
    {joint(66,118)}{joint(216,118)}
  </g>);

  return (
    <svg width="300" height="230" viewBox="0 0 300 230" style={glow}>{content}</svg>
  );
}

function ARViewScreen({ plant, propId, typeId, onExit, onBack }) {
  const t = window.projType(typeId);
  const [visible, setVisible] = React.useState(true);
  const [opacity, setOpacity] = React.useState(1);
  const [panel, setPanel] = React.useState(null); // 'transp' | null
  const [hint, setHint] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const modelColor = { hidro: '#5BB6E8', eletr: '#F0BE54', estru: '#CBD6E4' }[typeId];

  const ping = (msg) => { setToast(msg); setTimeout(() => setToast(null), 1700); };
  const reposition = () => { setHint(true); setPanel(null); setTimeout(() => setHint(false), 1800); };
  const reset = () => { setVisible(true); setOpacity(1); setPanel(null); ping('Visualização reiniciada'); };

  const ctrls = [
    { id: 'repos', label: 'Reposicionar', icon: <window.IcMove s={22} />, on: reposition },
    { id: 'vis', label: visible ? 'Ocultar' : 'Mostrar', icon: visible ? <window.IcEyeOff s={22} /> : <window.IcEye s={22} />, on: () => setVisible(v => !v), active: !visible },
    { id: 'transp', label: 'Transparência', icon: <window.IcOpacity s={22} />, on: () => setPanel(p => p === 'transp' ? null : 'transp'), active: panel === 'transp' },
    { id: 'reset', label: 'Resetar', icon: <window.IcReset s={22} />, on: reset },
  ];

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0a121c' }}>
      <window.ARScene />

      {/* anchored model */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', paddingBottom: 40 }}>
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center',
          opacity: visible ? opacity : 0, transition: 'opacity .35s' }}>
          {/* floor anchor shadow */}
          <div style={{ position: 'absolute', bottom: -26, width: 150, height: 26, borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,0,0,.5), transparent)' }} />
          <div style={{ transform: 'perspective(900px) rotateX(8deg) rotateY(-12deg)', animation: 'floatY 5s ease-in-out infinite' }}>
            <ModelOverlay typeId={typeId} color={modelColor} />
          </div>
          {/* anchor tether to marker */}
          <div style={{ position: 'absolute', bottom: -34, left: '50%', width: 1, height: 30,
            background: `linear-gradient(${modelColor},transparent)`, transform: 'translateX(-50%)' }} />
          <window.AprilTag size={30} locked />
        </div>

        {hint && (
          <div style={{ position: 'absolute', bottom: 150, background: 'rgba(11,18,28,.82)', color: '#fff',
            padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, animation: 'popIn .25s both',
            border: '1px solid rgba(255,255,255,.16)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <window.IcMove s={17} /> Toque e arraste para reposicionar
          </div>
        )}
      </div>

      {/* top: title + anchored status */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, paddingTop: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 10px' }}>
          <button className="tap" aria-label="Voltar" onClick={onBack} style={{ width: 42, height: 42, borderRadius: 14, flex: '0 0 auto',
            border: '1px solid rgba(255,255,255,.16)', background: 'rgba(18,28,42,.5)', backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <window.IcChevL s={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0, background: 'rgba(18,28,42,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#fff' }}>
              <span style={{ color: modelColor, display: 'flex' }}><window.ProjIcon id={typeId} s={15} w={2} /></span>
              <span style={{ fontSize: 13.5, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plant ? plant.name : t.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
              <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.7)', letterSpacing: '.02em' }}>Modelo ancorado pelo AprilTag</span>
            </div>
          </div>
        </div>
      </div>

      {/* transparency slider panel */}
      {panel === 'transp' && (
        <div style={{ position: 'absolute', left: 18, right: 18, bottom: 134, zIndex: 45,
          background: 'rgba(11,18,28,.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.14)', borderRadius: 18, padding: '14px 16px', color: '#fff',
          animation: 'toastIn .25s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 650, marginBottom: 10 }}>
            <span>Transparência do modelo</span><span className="mono">{Math.round((1 - opacity) * 100)}%</span>
          </div>
          <input type="range" min="0.15" max="1" step="0.01" value={opacity}
            onChange={e => { setOpacity(parseFloat(e.target.value)); if (!visible) setVisible(true); }}
            style={{ width: '100%', accentColor: modelColor }} />
        </div>
      )}

      {/* control bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, padding: '0 14px 38px' }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'stretch',
          background: 'rgba(11,18,28,.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, padding: 8 }}>
          {ctrls.map(c => (
            <button key={c.id} className="tap" onClick={c.on} style={{ flex: 1, border: 0, cursor: 'pointer',
              background: c.active ? 'rgba(232,132,58,.22)' : 'transparent', borderRadius: 15, padding: '10px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              color: c.active ? 'var(--orange)' : 'rgba(255,255,255,.86)' }}>
              {c.icon}
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '-.01em' }}>{c.label}</span>
            </button>
          ))}
          <button className="tap" onClick={onExit} style={{ flex: 1, border: 0, cursor: 'pointer',
            background: 'rgba(210,80,60,.18)', borderRadius: 15, padding: '10px 4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: '#ff9385' }}>
            <window.IcClose s={22} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>Sair</span>
          </button>
        </div>
      </div>

      {toast && <window.Toast tone="ok">{toast}</window.Toast>}
    </div>
  );
}

Object.assign(window, { ModelOverlay, ARViewScreen });
