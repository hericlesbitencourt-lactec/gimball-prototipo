// app.jsx - nav stack, side rail, state orchestration

const { useState, useEffect, useRef, useLayoutEffect } = React;
const DARK_SCREENS = ['camera', 'arview'];
const DEVICE_H = 874;

/* a single screen layer in the nav stack */
function Layer({ screen, role, instant, children }) {
  // role: 'top' | 'covered' | 'leaving'
  const [settled, setSettled] = useState(instant || role !== 'top');
  useEffect(() => {
    if (role === 'top' && !instant && !settled) { const t = setTimeout(() => setSettled(true), 470); return () => clearTimeout(t); }
  }, []);

  let cls = 'layer';
  const style = { zIndex: role === 'leaving' ? 3 : role === 'top' ? 2 : 1 };
  if (role === 'leaving') cls += ' lyr-out';
  else if (role === 'covered') style.transform = 'translateX(-22%)';
  else if (!instant && !settled) cls += screen.depth0 ? ' lyr-fade' : ' lyr-in';

  return (
    <div className={cls} aria-hidden={role !== 'top'} inert={role !== 'top' ? "" : undefined} style={{ ...style, pointerEvents: role === 'top' ? 'auto' : 'none' }}>
      {children}
      {role === 'covered' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,14,22,.28)' }} />}
    </div>
  );
}

function App() {
  const [authed, setAuthed] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [stack, setStack] = useState([{ key: 'dashboard' }]);
  const [leaving, setLeaving] = useState(null);
  const [instant, setInstant] = useState(false);
  const [dashState, setDashState] = useState('loading');
  const [cameraForce, setCameraForce] = useState(null);
  const [toast, setToast] = useState(null);
  const [route, setRoute] = useState('login'); // for rail highlight
  const busy = useRef(false);
  const [, refresh] = React.useReducer(n => n + 1, 0);
  React.useEffect(() => { window.addEventListener('demo-change', refresh); return () => window.removeEventListener('demo-change', refresh); }, []);
  const toastTimer = React.useRef();
  React.useEffect(() => () => clearTimeout(toastTimer.current), []);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 44) / 874, (window.innerWidth - 40) / 402));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  // reset the "instant" flag the frame after a jump
  useEffect(() => { if (instant) { const id = requestAnimationFrame(() => setInstant(false)); return () => cancelAnimationFrame(id); } }, [instant, stack]);

  // dashboard auto loading → normal
  useEffect(() => {
    if (authed && dashState === 'loading') { const t = setTimeout(() => setDashState('normal'), 1150); return () => clearTimeout(t); }
  }, [authed, dashState]);

  const top = stack[stack.length - 1];
  const dark = authed && DARK_SCREENS.includes((leaving || top).key);

  const fireToast = (tone, msg) => { setToast({ tone, msg }); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2200); };

  const push = (screen) => { if (busy.current) return; setStack(s => s.at(-1).key === screen.key ? s : [...s, screen]); };
  const pop = () => {
    if (busy.current || stack.length <= 1) { if (stack.length <= 1) setAuthed(false); return; }
    busy.current = true; setLeaving(top);
    setStack(s => s.slice(0, -1));
    setTimeout(() => { setLeaving(null); busy.current = false; }, 410);
  };
  const popTo = (key) => {
    if (busy.current) return; const idx = stack.findIndex(s => s.key === key);
    if (idx < 0) return; busy.current = true; setLeaving(top);
    setStack(s => s.slice(0, idx + 1));
    setTimeout(() => { setLeaving(null); busy.current = false; }, 410);
  };

  /* ── navigation actions ── */
  const doLogin = () => { setAuthed(true); setDashState('loading'); setStack([{ key: 'dashboard' }]); setRoute('dashboard'); };
  const logout = () => { setConfirmLogout(false); setToast(null); setAuthed(false); setRoute('login'); };
  const openProperty = (propId) => { push({ key: 'property', propId }); setRoute('property'); };
  const openType = (propId, typeId) => { push({ key: 'plans', propId, typeId }); setRoute('plans'); };
  const viewPlant = (propId, typeId, plant) => { setCameraForce(null); push({ key: 'camera', propId, typeId, plant }); setRoute('camera'); };
  const anchored = (s) => { setStack(st => [...st.slice(0, -1), { ...s, key: 'arview' }]); setRoute('arview'); };

  /* ── render one screen by descriptor ── */
  const render = (s) => {
    switch (s.key) {
      case 'dashboard': return <window.DashboardScreen user={window.residentUser()} state={dashState} onOpen={openProperty} onLogout={() => setConfirmLogout(true)} onProfile={() => push({ key: 'profile' })} />;
      case 'profile': return <window.ProfileScreen user={window.ADM_USERS.find(u => u.id === 'u1')} onBack={pop} onSaved={msg => { fireToast('ok', msg); pop(); }} />;
      case 'property': return <window.PropertyScreen propId={s.propId} onBack={pop} onOpenType={(t) => openType(s.propId, t)} />;
      case 'plans': return <window.PlansScreen propId={s.propId} typeId={s.typeId} onBack={pop}
        onView={(pl) => viewPlant(s.propId, s.typeId, pl)} onToast={fireToast} />;
      case 'camera': return <window.CameraScreen plant={s.plant} propId={s.propId} typeId={s.typeId} forceState={cameraForce}
        onBack={pop} onAnchored={() => anchored(s)} />;
      case 'arview': return <window.ARViewScreen plant={s.plant} propId={s.propId} typeId={s.typeId}
        onBack={pop} onExit={() => popTo('plans')} />;
      default: return null;
    }
  };

  return (
    <div className="stage">
      {/* phone */}
      <div className="phone-wrap" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <window.IOSDevice dark={dark}>
          <div className="app-surface">
            {authed ? (
              <>
                {stack.map((s, i) => {
                  const isTop = i === stack.length - 1;
                  return (
                    <Layer key={s.key + '-' + i} screen={{ ...s, depth0: i === 0 }}
                      role={isTop ? 'top' : 'covered'} instant={instant}>
                      {render(s)}
                    </Layer>
                  );
                })}
                {leaving && (
                  <Layer key={'leaving-' + leaving.key} screen={leaving} role="leaving" instant={false}>
                    {render(leaving)}
                  </Layer>
                )}
                {toast && <window.Toast tone={toast.tone}>{toast.msg}</window.Toast>}
              </>
            ) : (
              <Layer key="login" screen={{ depth0: true }} role="top" instant={instant}>
                <window.LoginScreen onLogin={doLogin} />
              </Layer>
            )}
          </div>
          <window.LogoutModal open={confirmLogout} onCancel={() => setConfirmLogout(false)} onConfirm={logout} />
        </window.IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
