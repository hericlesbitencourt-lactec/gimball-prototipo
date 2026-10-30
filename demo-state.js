// Session-only demonstration data. No network writes or real authentication.
(() => {
  const keys = ['ADM_USERS', 'ADM_CONSTRUTORAS', 'ADM_EMP', 'ADM_IMOVEIS', 'ADM_PLANTAS', 'ADM_PROFILE_REQUESTS'];
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
  const profileFields = ['name', 'email', 'phone'];
  const profileSnapshot = user => ({ name: user.name, email: user.email, phone: user.phone === '—' ? '' : user.phone || '' });
  const profileIsCurrent = (user, request) => user && profileFields.every(field => profileSnapshot(user)[field] === request.before[field]);
  const validateProfile = (values, userId, requestId) => {
    if (!values.name) return 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return 'Informe um e-mail válido.';
    if (window.ADM_USERS.some(u => u.id !== userId && u.email.toLowerCase() === values.email.toLowerCase()) ||
      window.ADM_PROFILE_REQUESTS.some(r => r.id !== requestId && r.status === 'awaiting_email' && r.requested.email.toLowerCase() === values.email.toLowerCase())) return 'Este e-mail já está cadastrado ou aguarda confirmação.';
    return null;
  };
  const applyProfile = (user, values) => Object.assign(user, Object.fromEntries(profileFields.map(field => [field, values[field]])), {
    initials: values.name.split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase(),
  });
  window.Demo.requestProfileChange = (userId, input, note = '') => {
    const user = window.ADM_USERS.find(u => u.id === userId);
    if (!user) return { error: 'Cadastro indisponível.' };
    if (window.ADM_PROFILE_REQUESTS.some(r => r.userId === userId && ['pending', 'awaiting_email'].includes(r.status))) return { error: 'Você já tem uma solicitação em andamento.' };
    const requested = Object.fromEntries(profileFields.map(field => [field, String(input[field] || '').trim()]));
    const error = validateProfile(requested, userId);
    if (error) return { error };
    const before = profileSnapshot(user);
    if (profileFields.every(field => before[field] === requested[field])) return { error: 'Altere pelo menos um dado para enviar a solicitação.' };
    const request = { id: 'request-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), userId, before, requested, note: note.trim(), status: 'pending', requestedAt: new Date().toISOString() };
    window.ADM_PROFILE_REQUESTS.push(request);
    notify();
    return { request };
  };
  window.Demo.reviewProfileChange = (requestId, decision, reason, reviewerId) => {
    const reviewer = window.ADM_USERS.find(u => u.id === reviewerId && u.role === 'admin' && u.status === 'active');
    if (!reviewer) return { error: 'Apenas administradores ativos podem analisar solicitações.' };
    const request = window.ADM_PROFILE_REQUESTS.find(r => r.id === requestId);
    if (!request || (request.status !== 'pending' && !(request.status === 'awaiting_email' && decision === 'reject'))) return { error: 'Esta solicitação já foi analisada.' };
    if (!['approve', 'reject'].includes(decision)) return { error: 'Decisão inválida.' };
    if (decision === 'reject' && !reason.trim()) return { error: 'Informe o motivo da recusa.' };
    const user = window.ADM_USERS.find(u => u.id === request.userId);
    if (decision === 'approve') {
      if (!profileIsCurrent(user, request)) return { error: 'O cadastro mudou após a solicitação. Recuse e solicite uma nova alteração com os dados atuais.' };
      const error = validateProfile(request.requested, request.userId, request.id);
      if (error) return { error };
      if (request.before.email.toLowerCase() !== request.requested.email.toLowerCase()) request.status = 'awaiting_email';
      else { applyProfile(user, request.requested); request.status = 'approved'; }
    } else request.status = 'rejected';
    Object.assign(request, { reason: reason.trim(), reviewedBy: reviewerId, reviewedAt: new Date().toISOString() });
    notify();
    return { request };
  };
  window.Demo.confirmProfileEmail = (requestId, userId) => {
    const request = window.ADM_PROFILE_REQUESTS.find(r => r.id === requestId && r.userId === userId && r.status === 'awaiting_email');
    if (!request) return { error: 'Não há confirmação pendente para esta conta.' };
    const user = window.ADM_USERS.find(u => u.id === userId);
    if (!profileIsCurrent(user, request)) return { error: 'O cadastro mudou. Peça à administração para cancelar a aprovação e envie uma nova solicitação.' };
    const error = validateProfile(request.requested, userId, requestId);
    if (error) return { error };
    applyProfile(user, request.requested);
    user.emailConfirmed = true;
    Object.assign(request, { status: 'approved', confirmedAt: new Date().toISOString() });
    notify();
    return { request };
  };
  window.pendingProfileCount = () => window.ADM_PROFILE_REQUESTS.filter(r => r.status === 'pending').length;
  // Keep both profiles on the same fictional records and permissions.
  window.ADM_USERS.forEach(u => { if (!u.linked) u.linked = u.id === 'u1' ? ['i1', 'i3', 'i5'] : []; });
  window.nextTagCode = () => Math.max(89, ...window.ADM_PLANTAS.map(p => p.marker?.code || 0)) + 1;
  window.canViewPlant = (plant, role = 'admin') => !!plant && (role === 'admin' || (
    role === 'engenheiro' && plant?.minRole !== 'admin' &&
    !!window.PERM_MATRIX[plant?.kind === 'projeto' ? 'plantas.view_projeto' : 'plantas.view_asbuilt']?.includes(role)
  ));
  window.technicalPlants = (role = 'admin') => window.ADM_PLANTAS.filter(p => window.canViewPlant(p, role));
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
