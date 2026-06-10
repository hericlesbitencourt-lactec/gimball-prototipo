// admin-m-app.jsx — tab nav-stack (login único fica no app do morador — index.html)

const { useState: aS, useEffect: aE, useRef: aR } = React;
const TAB_ROOTS = { inicio: 'inicio', imoveis: 'imoveis', plantas: 'plantas', mais: 'mais' };
const ADEVICE_H = 874;

/* nav-stack layer */
function ALayer({ depth0, role, instant, children }) {
  const [settled, setSettled] = aS(instant || role !== 'top');
  aE(() => { if (role === 'top' && !instant && !settled) { const t = setTimeout(() => setSettled(true), 470); return () => clearTimeout(t); } }, []);
  let cls = 'layer';
  const style = { zIndex: role === 'leaving' ? 3 : role === 'top' ? 2 : 1 };
  if (role === 'leaving') cls += ' lyr-out';
  else if (role === 'covered') style.transform = 'translateX(-22%)';
  else if (!instant && !settled) cls += depth0 ? ' lyr-fade' : ' lyr-in';
  return <div className={cls} style={{ ...style, pointerEvents: role === 'top' ? 'auto' : 'none' }}>{children}
    {role === 'covered' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,14,22,.22)' }} />}</div>;
}

function AdminMobileApp() {
  const [tab, setTab] = aS('inicio');
  const [stack, setStack] = aS([{ key: 'inicio' }]);
  const [leaving, setLeaving] = aS(null);
  const [instant, setInstant] = aS(false);
  const [toast, setToast] = aS(null);
  const [scale, setScale] = aS(1);
  const busy = aR(false);

  aE(() => { const f = () => setScale(Math.min(1, (window.innerHeight - 44) / ADEVICE_H, (window.innerWidth - 40) / 402)); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  aE(() => { if (instant) { const id = requestAnimationFrame(() => setInstant(false)); return () => cancelAnimationFrame(id); } }, [instant, stack]);

  const fireToast = (msg) => { setToast(msg); clearTimeout(fireToast._t); fireToast._t = setTimeout(() => setToast(null), 2000); };
  const top = stack[stack.length - 1];
  const atRoot = stack.length === 1;
  const dark = false;

  const push = (s) => { if (busy.current) return; setStack(st => [...st, s]); };
  const pop = () => {
    if (busy.current || stack.length <= 1) return;
    busy.current = true; setLeaving(top); setStack(s => s.slice(0, -1));
    setTimeout(() => { setLeaving(null); busy.current = false; }, 420);
  };
  const switchTab = (t) => {
    if (t === tab && atRoot) return;
    setInstant(true); setLeaving(null); busy.current = false;
    setTab(t); setStack([{ key: TAB_ROOTS[t] }]);
  };

  const render = (s) => {
    const P = { push, pop, toast: fireToast, go: switchTab };
    switch (s.key) {
      case 'inicio': return <window.MInicio {...P} />;
      case 'imoveis': return <window.MImoveis {...P} />;
      case 'plantas': return <window.MPlantas {...P} />;
      case 'mais': return <window.MMais {...P} />;
      case 'usersList': return <window.MUsersList {...P} />;
      case 'userForm': return <window.MUserForm user={s.user} {...P} />;
      case 'empList': return <window.MEmpList {...P} />;
      case 'empForm': return <window.MEmpForm emp={s.emp} {...P} />;
      case 'construtoraList': return <window.MConstrutoraList {...P} />;
      case 'construtoraForm': return <window.MConstrutoraForm construtora={s.construtora} {...P} />;
      case 'imovelDetail': return <window.MImovelDetail imovel={s.imovel} {...P} />;
      case 'imovelForm': return <window.MImovelForm imovel={s.imovel} {...P} />;
      case 'plantaForm': return <window.MPlantaForm planta={s.planta} {...P} />;
      case 'permList': return <window.MPermList {...P} />;
      case 'permRole': return <window.MPermRole role={s.role} {...P} />;
      default: return null;
    }
  };

  return (
    <div className="stage">
      <div className="phone-wrap" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
        <window.IOSDevice dark={dark}>
          <div style={{ position: 'relative', height: ADEVICE_H, overflow: 'hidden', background: 'var(--bg)' }}>
            {stack.map((s, i) => (
              <ALayer key={s.key + '-' + i} depth0={i === 0} role={i === stack.length - 1 ? 'top' : 'covered'} instant={instant}>
                {render(s)}
              </ALayer>
            ))}
            {leaving && <ALayer key={'lv-' + leaving.key} depth0={false} role="leaving" instant={false}>{render(leaving)}</ALayer>}
            {atRoot && !leaving && <window.TabBar active={tab} onTab={switchTab} />}
            {toast && <window.Toast tone="ok">{toast}</window.Toast>}
          </div>
        </window.IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminMobileApp />);
