// admin-m-more.jsx - Mais (menu) · Permissões · Banco de dados (mobile)

/* ───────── MAIS (menu) ───────── */
function MMais({ push, go, role = 'admin', userId }) {
  const [confirmLogout, setConfirmLogout] = React.useState(false);
  const engineer = role === 'engenheiro';
  const user = window.ADM_USERS.find(u => u.id === userId);
  return (
    <window.Page title="Mais" sub={engineer ? 'Engenharia' : 'Administração'}>
      <window.Group header="Conta">
        <window.Row left={<window.MAvatar initials={user?.initials || 'AD'} role={role} size={42} />} title="Meus dados" sub={user ? `${user.name} · ${user.email}` : 'Conta indisponível'} chevron last onClick={() => push({ key: 'profile' })} />
      </window.Group>

      {!engineer && <window.Group header="Cadastros">
        <window.Row icon={<window.MIc.users s={18} />} iconBg="#EFE8F8" iconColor="#7A4FB0" title="Usuários" chevron onClick={() => push({ key: 'usersList' })} />
        <window.Row icon={<window.MIc.edit s={18} />} iconBg="var(--amber-100)" iconColor="var(--amber)" title="Solicitações cadastrais" trailing={<window.Badge>{window.pendingProfileCount()}</window.Badge>} chevron onClick={() => push({ key: 'profileRequests' })} />
        <window.Row icon={<window.MIc.building s={18} />} iconBg="#E6F1F8" iconColor="#2C7BB0" title="Empreendimentos" chevron onClick={() => push({ key: 'empList' })} />
        <window.Row icon={<window.MIc.building s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)" title="Construtoras" chevron last onClick={() => push({ key: 'construtoraList' })} />
      </window.Group>}

      {!engineer && <window.Group header="Sistema">
        <window.Row icon={<window.MIc.shield s={18} />} iconBg="var(--amber-100)" iconColor="var(--amber)" title="Permissões" sub="Grupos e acessos" chevron last onClick={() => push({ key: 'permList' })} />
      </window.Group>}

      {engineer && <window.Group header="Área técnica">
        <window.Row icon={<window.MIc.home s={18} />} title="Imóveis" chevron onClick={() => go('imoveis')} />
        <window.Row icon={<window.MIc.cube s={18} />} title="Plantas" chevron last onClick={() => go('plantas')} />
      </window.Group>}

      <window.Group header="Sobre o aplicativo">
        <window.Row icon={<window.MIc.shield s={18} />} title="Política de privacidade" chevron onClick={() => push({ key: 'privacy' })} />
        <window.Row icon={<window.MIc.link s={18} />} title="Termos de uso" chevron last onClick={() => push({ key: 'terms' })} />
      </window.Group>

      <window.Group>
        <window.Row icon={<window.MIc.logout s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Sair" danger last onClick={() => setConfirmLogout(true)} />
      </window.Group>
      <window.LogoutModal open={confirmLogout} onCancel={() => setConfirmLogout(false)} onConfirm={() => { window.Demo.endSession(); setConfirmLogout(false); window.location.href = 'index.html'; }} />

    </window.Page>
  );
}

/* ───────── PERMISSÕES (roles list) ───────── */
function MPermList({ push, pop }) {
  return (
    <window.Page title="Permissões" sub="Grupos de acesso" onBack={{ label: 'Mais', fn: pop }}>
      <window.Group footer="Toque num papel para ver e ajustar exatamente o que ele pode fazer no sistema.">
        {window.ADM_ROLES.map((r, i) => {
          const m = window.ROLE_BADGE[r.slug];
          const count = Object.values(window.PERM_MATRIX).filter(arr => arr.includes(r.slug)).length;
          return (
            <window.Row key={r.id} last={i === window.ADM_ROLES.length - 1} onClick={() => push({ key: 'permRole', role: r })}
              icon={<window.MIc.shield s={18} />} iconBg={m.bg} iconColor={m.color}
              title={r.name} sub={`${window.ADM_USERS.filter(u => u.role === r.slug).length} usuários · ${count} permissões`} chevron />
          );
        })}
      </window.Group>

      <div style={{ padding: '0 16px' }}>
        {window.ADM_ROLES.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '4px 6px 14px' }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: window.ROLE_BADGE[r.slug].color, marginTop: 6, flex: '0 0 auto' }} />
            <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.45 }}><b style={{ color: 'var(--ink)' }}>{r.name}:</b> {r.desc}</div>
          </div>
        ))}
      </div>
    </window.Page>
  );
}

/* ───────── PERMISSÕES (one role, toggles) ───────── */
function MPermRole({ role, pop, toast }) {
  const [matrix, setMatrix] = React.useState(window.PERM_MATRIX);
  const isAdmin = role.slug === 'admin';
  const m = window.ROLE_BADGE[role.slug];
  const toggle = (code) => {
    if (isAdmin) return;
    const has = matrix[code].includes(role.slug);
    const next = { ...matrix, [code]: has ? matrix[code].filter(s => s !== role.slug) : [...matrix[code], role.slug] };
    Object.assign(window.PERM_MATRIX, next);
    setMatrix(next);
    window.Demo.notify(); toast('Permissão atualizada.');
  };
  return (
    <window.Page large={false} title={role.name} onBack={{ label: 'Permissões', fn: pop }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 18px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: m.bg, color: m.color, display: 'grid', placeItems: 'center' }}><window.MIc.shield s={32} /></div>
        <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>{role.name}</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 3, textAlign: 'center', padding: '0 32px' }}>{role.desc}</div>
      </div>
      {isAdmin && (
        <div style={{ margin: '0 16px 18px', display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: '#EFE8F8', borderRadius: 14, color: '#7A4FB0' }}>
          <window.MIc.shield s={20} /><div style={{ fontSize: 12.5, lineHeight: 1.4, fontWeight: 600 }}>O Administrador tem acesso total; as permissões não podem ser desativadas.</div>
        </div>
      )}
      {window.PERM_MODULES.map(mod => (
        <window.Group key={mod.module} header={mod.module}>
          {mod.perms.map((p, i) => (
            <window.FToggle key={p.code} label={p.desc} disabled={isAdmin}
              on={matrix[p.code].includes(role.slug)} onToggle={() => toggle(p.code)} last={i === mod.perms.length - 1} />
          ))}
        </window.Group>
      ))}
    </window.Page>
  );
}

Object.assign(window, { MMais, MPermList, MPermRole });
