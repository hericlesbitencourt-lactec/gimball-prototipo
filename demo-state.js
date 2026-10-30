// Session-only demonstration data. No network writes or real authentication.
(() => {
  const keys = ['ADM_USERS', 'ADM_CONSTRUTORAS', 'ADM_EMP', 'ADM_IMOVEIS', 'ADM_PLANTAS'];
  const storageKey = 'gimball-demo-v2';
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch (_) {}
  keys.forEach(key => {
    if (Array.isArray(saved?.[key])) window[key].splice(0, window[key].length, ...saved[key]);
  });
  if (saved?.PERM_MATRIX) Object.assign(window.PERM_MATRIX, saved.PERM_MATRIX);
  const notify = () => {
    const snapshot = Object.fromEntries(keys.map(k => [k, window[k]]));
    snapshot.PERM_MATRIX = window.PERM_MATRIX;
    try { sessionStorage.setItem(storageKey, JSON.stringify(snapshot)); } catch (_) {}
    window.dispatchEvent(new Event('demo-change'));
  };
  window.Demo = {
    notify,
    save(key, original, values) {
      const rows = window[key];
      if (original) Object.assign(original, values);
      else rows.push({ id: 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), ...values });
      notify();
    },
    remove(key, row) {
      const dependencies = {
        ADM_CONSTRUTORAS: () => window.ADM_EMP.some(e => e.construtora === row.id),
        ADM_EMP: () => window.ADM_IMOVEIS.some(i => i.emp === row.id),
        ADM_IMOVEIS: () => window.ADM_PLANTAS.some(p => p.imovel === row.id) || window.ADM_USERS.some(u => u.linked?.includes(row.id)),
      };
      if (dependencies[key]?.()) return 'Remova os vínculos deste cadastro antes de excluí-lo.';
      const index = window[key].findIndex(r => r.id === row.id);
      if (index < 0) return 'Este cadastro já foi removido.';
      window[key].splice(index, 1);
      notify();
      return null;
    },
  };
  // Keep both profiles on the same fictional records and permissions.
  window.ADM_USERS.forEach(u => { if (!u.linked) u.linked = u.id === 'u1' ? ['i1', 'i3', 'i5'] : []; });
  window.nextTagCode = () => Math.max(89, ...window.ADM_PLANTAS.map(p => p.marker?.code || 0)) + 1;
  const status = { delivered: 'entregue', construction: 'obra', planning: 'obra' };
  window.residentUser = () => {
    const user = window.ADM_USERS.find(u => u.id === 'u1');
    return { ...user, first: (user?.name || 'Morador').split(/\s+/)[0], initials: user?.initials || 'MO' };
  };
  window.residentProperties = () => {
    const user = window.ADM_USERS.find(u => u.id === 'u1' && u.status === 'active');
    return (user?.linked || []).flatMap(id => {
      const unit = window.ADM_IMOVEIS.find(i => i.id === id);
      const emp = unit && window.ADM_EMP.find(e => e.id === unit.emp);
      return emp ? [{ id, name: emp.name, unit: unit.identifier, address: emp.address,
        status: status[unit.status], area: `${unit.area} m²`, delivered: emp.delivery || 'A definir', cover: emp.cover || '#457B9D',
        counts: Object.fromEntries(window.PROJ_TYPES.map(t => [t.id, window.plantsFor(id, t.id).length])) }] : [];
    });
  };
  window.property = id => window.residentProperties().find(p => p.id === id);
  window.plantsFor = (id, type) => window.PERM_MATRIX['plantas.view_asbuilt'].includes('morador')
    ? window.ADM_PLANTAS.filter(p => p.imovel === id && p.disc === type && p.kind === 'asbuilt' && (!p.minRole || p.minRole === 'morador')).map(p => ({ ...p,
      status: p.status === 'available' ? 'disponivel' : 'pendente',
      file: `${id}_${type}_asbuilt.${p.format}`, tag: p.marker ? `${p.marker.family} · id ${p.marker.code}` : 'Sem marcador',
    })) : [];
})();
