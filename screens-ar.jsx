// screens-ar.jsx - Camera (AprilTag scan) + AR viewer

/* shared simulated environment (photo of the room + fallback + vignette) */
function ARScene({ blur = 0 }) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0c1622' }}>
      {/* fallback CSS room (always there, behind photo) */}
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg,#26313f 0%,#1a232f 52%,#11161d 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%',
        background: 'linear-gradient(180deg,transparent,rgba(0,0,0,.35)), repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 2px,transparent 2px 46px)',
        transform: 'perspective(500px) rotateX(58deg)', transformOrigin: 'bottom' }} />
      {/* real photo */}
      <img alt="" src="assets/demo-room.jpg"
        onLoad={() => setLoaded(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          filter: `saturate(.9) brightness(.74) blur(${blur}px)`, opacity: loaded ? 1 : 0, transition: 'opacity .6s' }} />
      {/* vignette + grain */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(5,9,14,.62) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: .05, mixBlendMode: 'overlay',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/></svg>")' }} />
    </div>
  );
}

/* a faux AprilTag (tag36h11-style) - just black & white squares */
const TAG_BITS = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0],
  [0,1,1,0,0,1,1,0],
  [0,1,0,1,1,0,1,0],
  [0,1,1,0,1,1,1,0],
  [0,1,1,1,0,0,1,0],
  [0,0,0,0,0,0,0,0],
];
function AprilTag({ size = 72, locked }) {
  return (
    <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)',
      background: '#fff', padding: 0, boxShadow: locked ? '0 0 0 3px var(--green), 0 8px 24px rgba(0,0,0,.5)' : '0 6px 18px rgba(0,0,0,.5)',
      transition: 'box-shadow .3s' }}>
      {TAG_BITS.flat().map((b, i) => <div key={i} style={{ background: b ? '#fff' : '#0a0a0a' }} />)}
    </div>
  );
}

/* corner-bracket reticle */
function Reticle({ tone = 'var(--cyan)', size = 230, locked }) {
  const c = locked ? 'var(--green)' : tone;
  const L = 30, t = 3;
  const corner = (pos) => (
    <div style={{ position: 'absolute', width: L, height: L, ...pos }}>
      <div style={{ position: 'absolute', background: c, borderRadius: 2, transition: 'background .3s',
        ...(pos.top !== undefined ? { top: 0 } : { bottom: 0 }),
        ...(pos.left !== undefined ? { left: 0 } : { right: 0 }), width: L, height: t }} />
      <div style={{ position: 'absolute', background: c, borderRadius: 2, transition: 'background .3s',
        ...(pos.top !== undefined ? { top: 0 } : { bottom: 0 }),
        ...(pos.left !== undefined ? { left: 0 } : { right: 0 }), width: t, height: L }} />
    </div>
  );
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {corner({ top: 0, left: 0 })}{corner({ top: 0, right: 0 })}
      {corner({ bottom: 0, left: 0 })}{corner({ bottom: 0, right: 0 })}
      {!locked && (
        <div style={{ position: 'absolute', left: 8, right: 8, height: 2, top: '50%',
          background: `linear-gradient(90deg,transparent,${tone},transparent)`,
          boxShadow: `0 0 14px ${tone}`, animation: 'scanSweep 2.2s ease-in-out infinite' }} />
      )}
    </div>
  );
}

function GlassTop({ children, dark = true }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, paddingTop: 52 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 12px' }}>{children}</div>
    </div>
  );
}
function RoundBtn({ icon, onClick, label, tone }) {
  return (
    <button className="tap" aria-label={label} onClick={onClick} style={{ width: 42, height: 42, borderRadius: 14,
      flex: '0 0 auto', border: '1px solid rgba(255,255,255,.16)', background: tone || 'rgba(18,28,42,.5)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: '#fff', display: 'grid',
      placeItems: 'center', cursor: 'pointer' }}>{icon}</button>
  );
}

/* ───────────────────── CAMERA / APRILTAG ───────────────────── */
function CameraScreen({ plant, propId, typeId, onBack, onAnchored, forceState }) {
  const [phase, setPhase] = React.useState(forceState || 'searching'); // searching|detected|loading|error
  const [help, setHelp] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const t = window.projType(typeId);
  const timers = React.useRef([]);

  React.useEffect(() => {
    timers.current.forEach(clearTimeout); timers.current = [];
    const add = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    if (help) return;
    else if (phase === 'detected') add(() => setPhase('loading'), 1150);
    else if (phase === 'loading') {
      setProgress(0);
      const iv = setInterval(() => setProgress(p => Math.min(100, p + 9)), 130);
      timers.current.push(iv);
      add(() => onAnchored(), 1700);
    }
    return () => timers.current.forEach(c => { clearTimeout(c); clearInterval(c); });
  }, [phase, help]);


  const locked = phase === 'detected' || phase === 'loading';

  const caption = {
    searching: ['Enquadre o marcador', 'Na versão final, a câmera reconhecerá o AprilTag. Aqui, escolha um resultado para explorar o fluxo.'],
    detected: ['Reconhecimento simulado', `AprilTag identificado · ${plant ? plant.tag : 'tag36h11'}`],
    loading: ['Preparando demonstração…', plant ? plant.file : 'modelo.usdz'],
    error: ['Não encontramos o marcador', 'Verifique a iluminação e mantenha o AprilTag inteiro no enquadramento.'],
  }[phase];

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#0a121c' }}>
      <ARScene blur={phase === 'loading' ? 1.5 : 0} />

      {/* top bar */}
      <GlassTop>
        <RoundBtn label="Voltar" icon={<window.IcChevL s={22} />} onClick={onBack} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 13px', borderRadius: 999,
            background: 'rgba(18,28,42,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,.14)', color: '#fff', maxWidth: 220 }}>
            <span style={{ color: 'var(--orange)', display: 'flex' }}><window.ProjIcon id={typeId} s={16} w={2} /></span>
            <span style={{ fontSize: 12.5, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
          </div>
        </div>
        <RoundBtn label="Ajuda" icon={<window.IcHelp s={22} />} onClick={() => setHelp(true)} />
      </GlassTop>

      <div style={{ position: "absolute", top: 124, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".08em" }}>DEMONSTRAÇÃO · CÂMERA SIMULADA</div>
      {/* center reticle + marker */}
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          {phase !== 'error' && <Reticle locked={locked} />}
          {/* the physical marker sitting in the scene */}
          {phase !== 'error' && (
            <div style={{ position: 'absolute', transform: 'perspective(620px) rotateY(-20deg) rotateX(7deg)',
              opacity: phase === 'searching' ? 0.55 : 1, transition: 'opacity .4s, transform .5s',
              animation: phase === 'searching' ? 'floatY 3s ease-in-out infinite' : 'none' }}>
              <AprilTag locked={locked} />
            </div>
          )}
          {/* pulse rings while searching */}
          {phase === 'searching' && [0, 1].map(i => (
            <div key={i} style={{ position: 'absolute', width: 230, height: 230, borderRadius: 28,
              border: '2px solid var(--cyan)', animation: `pulseRing 2.4s ease-out ${i * 1.2}s infinite` }} />
          ))}
          {phase === 'detected' && (
            <div style={{ position: 'absolute', top: -54, background: 'var(--green)', color: '#fff', borderRadius: 999,
              width: 40, height: 40, display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(46,165,107,.5)',
              animation: 'popIn .3s both' }}><window.IcCheck s={24} w={2.6} /></div>
          )}
          {phase === 'error' && (
            <div style={{ width: 92, height: 92, borderRadius: 26, display: 'grid', placeItems: 'center',
              background: 'rgba(210,80,60,.16)', border: '1.5px solid rgba(210,80,60,.5)', color: '#ff9f8f', animation: 'popIn .3s both' }}>
              <window.IcScan s={40} />
            </div>
          )}
        </div>
      </div>

      {/* bottom status panel */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, padding: '0 18px 40px' }}>
        <div style={{ background: 'rgba(11,18,28,.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 22, padding: '18px 18px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 6 }}>
            {phase === 'searching' && <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)', animation: 'spin 1s linear infinite' }} />}
            {phase === 'loading' && <window.Spinner size={18} color="var(--orange)" />}
            {phase === 'detected' && <span style={{ color: 'var(--green)', display: 'flex' }}><window.IcCheck s={18} w={2.6} /></span>}
            {phase === 'error' && <span style={{ color: '#ff9f8f', display: 'flex' }}><window.IcAlert s={18} /></span>}
            <span style={{ fontSize: 16, fontWeight: 750, letterSpacing: '-.01em' }}>{caption[0]}</span>
          </div>
          <div className={phase === 'loading' ? 'mono' : ''} style={{ fontSize: 12.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.45, padding: '0 6px' }}>{caption[1]}</div>

          {phase === 'searching' && <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
            <window.Btn block onClick={() => setPhase('detected')}>Simular reconhecimento</window.Btn>
            <window.Btn block variant="ghost" style={{ color: '#fff' }} onClick={() => setPhase('error')}>Simular falha de leitura</window.Btn>
          </div>}
          {phase === 'loading' && (
            <div style={{ marginTop: 13, height: 5, borderRadius: 99, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: progress + '%', background: 'var(--orange)', borderRadius: 99, transition: 'width .13s linear' }} />
            </div>
          )}
          {phase === 'error' && (
            <window.Btn block onClick={() => setPhase('searching')} style={{ marginTop: 14 }} icon={<window.IcReset s={18} />}>Tentar novamente</window.Btn>
          )}
        </div>
      </div>

      {help && <HelpSheet onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpSheet({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(5,9,14,.55)',
      display: 'flex', alignItems: 'flex-end', animation: 'fadeUp .2s both' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '26px 26px 0 0',
        padding: '12px 22px 40px', animation: 'toastIn .32s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--line)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ width: 50, height: 50, flex: '0 0 auto', borderRadius: 14, display: 'grid', placeItems: 'center', background: '#0a0a0a', padding: 7 }}>
            <AprilTag size={36} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-.02em' }}>O que é o AprilTag?</div>
            <div style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.5, marginTop: 6 }}>
              É um <b>marcador físico</b> de referência fixado no ambiente. A câmera o reconhece e usa sua posição e tamanho real para <b>ancorar e escalar</b> o modelo 3D corretamente no espaço.
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5, marginTop: 10 }}>
              O marcador <b>não é</b> a planta; ele apenas indica onde o modelo deve aparecer. Na versão final, a busca será automática. Este protótipo usa uma foto e simula o reconhecimento, sem acessar sua câmera.
            </div>
          </div>
        </div>
        <window.Btn block onClick={onClose} variant="dark" style={{ marginTop: 18 }}>Entendi</window.Btn>
      </div>
    </div>
  );
}

Object.assign(window, { ARScene, AprilTag, CameraScreen });
