// screens-arview.jsx - AR viewer with anchored 3D model + live controls

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
  const [opacity, setOpacity] = React.useState(0.85);
  const [visible, setVisible] = React.useState(true);
  const modelColor = { hidro: '#5BB6E8', eletr: '#F0BE54', estru: '#CBD6E4' }[typeId];

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0a121c' }}>
      <window.ARScene />

      {/* anchored model */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', paddingBottom: 40 }}>
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          {/* floor anchor shadow */}
          <div style={{ position: 'absolute', bottom: -26, width: 150, height: 26, borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,0,0,.5), transparent)' }} />
          <div style={{ opacity: visible ? opacity : 0, transition: 'opacity .2s', transform: 'perspective(900px) rotateX(8deg) rotateY(-12deg)' }}>
            <ModelOverlay typeId={typeId} color={modelColor} />
          </div>
          {/* anchor tether to marker */}
          <div style={{ position: 'absolute', bottom: -34, left: '50%', width: 1, height: 30,
            background: `linear-gradient(${modelColor},transparent)`, transform: 'translateX(-50%)' }} />
          <window.AprilTag size={30} locked />
        </div>
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
              <span className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.7)', letterSpacing: '.02em' }}>Demonstração · sobreposição ilustrativa</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 148, left: 18, right: 18, color: "#fff", fontSize: 12, lineHeight: 1.5 }}>Prévia de {t.name.toLowerCase()}. Sem escala real ou rastreamento espacial.</div>
      {/* control bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, padding: '0 14px 38px' }}>
        <div style={{ color: "#fff", background: "rgba(11,18,28,.85)", borderRadius: 14, padding: 14, marginBottom: 10 }}><label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>Opacidade<input aria-label="Opacidade do modelo" type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ flex: 1, accentColor: "var(--orange)" }} /></label></div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'stretch',
          background: 'rgba(11,18,28,.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, padding: 8 }}>
          <button className="tap" onClick={() => setVisible(v => !v)} aria-pressed={visible} style={{ flex: 1, border: 0, borderRadius: 15, color: "#fff", background: "rgba(255,255,255,.12)", fontSize: 13 }}>{visible ? "Ocultar modelo" : "Mostrar modelo"}</button>
          <button className="tap" onClick={onExit} style={{ flex: 1, border: 0, cursor: 'pointer',
            background: 'rgba(210,80,60,.18)', borderRadius: 15, padding: '10px 4px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, color: '#ff9385' }}>
            <window.IcClose s={22} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModelOverlay, ARViewScreen });
