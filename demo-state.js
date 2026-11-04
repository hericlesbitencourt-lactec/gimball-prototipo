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
  const passwords = saved?.passwords || {};
  const notify = () => {
    const snapshot = Object.fromEntries(keys.map(k => [k, window[k]]));
    snapshot.PERM_MATRIX = window.PERM_MATRIX;
    snapshot.passwords = passwords;
    try { sessionStorage.setItem(storageKey, JSON.stringify(snapshot)); } catch (_) {}
    window.dispatchEvent(new Event('demo-change'));
  };
  window.Demo = {
    notify,
    save(key, original, values) {
      const rows = window[key];
      const row = original || { id: 'demo-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) };
      Object.assign(row, values);
      if (!original) rows.push(row);
      notify();
      return row;
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
  // Local access simulation. These values are never real credentials or server authorization.
  const sessionKey = 'gimball-session-v1';
  const noticeKey = 'gimball-access-notice';
  const session = () => {
    try { return JSON.parse(sessionStorage.getItem(sessionKey)); } catch (_) { return null; }
  };
  const startSession = user => {
    sessionStorage.setItem(sessionKey, JSON.stringify({ userId: user.id, role: user.role, expiresAt: Date.now() + 30 * 60 * 1000 }));
  };
  window.Demo.session = session;
  window.Demo.legalVersions = { privacy: 'ilustrativo-v1', terms: 'ilustrativo-v1' };
  window.Demo.examplePassword = userId => passwords[userId] || (window.ADM_USERS.find(u => u.id === userId)?.invitation ? '' : 'demo1234');
  window.Demo.sendInvitation = (userId, actorId) => {
    const actor = window.ADM_USERS.find(u => u.id === actorId && u.role === 'admin' && u.status === 'active');
    if (!actor) return { error: 'Apenas administradores ativos podem enviar convites.' };
    const user = window.ADM_USERS.find(u => u.id === userId && u.status === 'invited');
    if (!user) return { error: 'Esta conta não aguarda ativação.' };
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)), n => n.toString(16).padStart(2, '0')).join('');
    user.invitation = { token, email: user.email, sentAt: new Date().toISOString(), expiresAt: Date.now() + 24 * 60 * 60 * 1000, usedAt: null };
    user.emailConfirmed = false;
    notify();
    return { user };
  };
  window.Demo.inspectInvitation = token => {
    const user = window.ADM_USERS.find(u => u.invitation?.token === token);
    if (!user) return { state: 'invalid' };
    if (user.invitation.usedAt) return { state: 'used', user };
    if (user.status === 'inactive') return { state: 'inactive' };
    if (user.status !== 'invited' || user.invitation.email.toLowerCase() !== user.email.toLowerCase()) return { state: 'invalid' };
    if (user.invitation.expiresAt <= Date.now()) return { state: 'expired' };
    return { state: 'valid', user };
  };
  window.Demo.acceptInvitation = (token, password, acceptance = {}) => {
    const result = window.Demo.inspectInvitation(token);
    if (result.state !== 'valid') return { error: 'Este convite não pode mais ser utilizado.', state: result.state };
    if (password.length < 8) return { error: 'Use uma senha com pelo menos 8 caracteres.' };
    if (acceptance.privacy !== true || acceptance.terms !== true) return { error: 'Aceite a Política de privacidade e os Termos de uso para ativar a conta.' };
    if (acceptance.privacyVersion !== window.Demo.legalVersions.privacy || acceptance.termsVersion !== window.Demo.legalVersions.terms) return { error: 'Os documentos foram atualizados. Leia e aceite novamente.' };
    const acceptedAt = new Date().toISOString();
    passwords[result.user.id] = password;
    Object.assign(result.user, { status: 'active', emailConfirmed: true, legalAcceptance: {
      privacy: { version: acceptance.privacyVersion, acceptedAt }, terms: { version: acceptance.termsVersion, acceptedAt },
    } });
    result.user.invitation.usedAt = acceptedAt;
    notify();
    return { user: result.user };
  };
  window.Demo.endSession = reason => {
    sessionStorage.removeItem(sessionKey);
    if (reason) sessionStorage.setItem(noticeKey, reason);
    else sessionStorage.removeItem(noticeKey);
    window.dispatchEvent(new Event('demo-session-ended'));
  };
  window.Demo.takeAccessNotice = () => {
    const reason = sessionStorage.getItem(noticeKey);
    sessionStorage.removeItem(noticeKey);
    return reason;
  };
  window.Demo.sessionIssue = () => {
    const current = session();
    if (!current || !Number.isFinite(current.expiresAt) || current.expiresAt <= Date.now()) return 'expired';
    const user = window.ADM_USERS.find(u => u.id === current.userId);
    if (!user || user.status !== 'active') return 'inactive';
    if (user.role !== current.role) return 'changed';
    return null;
  };
  window.Demo.profileUser = role => {
    const current = session();
    return window.ADM_USERS.find(u => current?.role === role && u.id === current.userId) ||
      window.ADM_USERS.find(u => u.id === ({ morador: 'u1', engenheiro: 'u2', admin: 'u3' })[role]);
  };
  // Direct technical-profile URLs remain available for presenting the prototype.
  window.Demo.enterRole = role => {
    const user = window.Demo.profileUser(role);
    if (session()?.role !== role && user) startSession(user);
    return user;
  };
  window.Demo.signIn = (email, password, role) => {
    const user = window.ADM_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.role === role);
    if (user?.status === 'invited') return { error: 'Sua conta aguarda ativação. Defina sua senha pelo link do convite recebido por e-mail. Se necessário, solicite um novo convite à administração.', field: 'invitation' };
    if (!user || password !== window.Demo.examplePassword(user.id)) return { error: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.', field: 'credentials' };
    if (user.status !== 'active') return { error: 'Sua conta está desativada. Entre em contato com a administração para solicitar a reativação.', field: 'account' };
    startSession(user);
    sessionStorage.removeItem(noticeKey);
    return { user };
  };
  window.Demo.resetPassword = (email, password) => {
    const user = window.ADM_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return { error: 'Este link de recuperação é inválido. Solicite novas instruções.' };
    if (user.status === 'invited' || (user.invitation && !user.invitation.usedAt)) return { error: 'Use o convite de primeiro acesso para definir sua senha. Se necessário, peça um novo convite à administração.' };
    if (password.length < 8) return { error: 'Use uma senha com pelo menos 8 caracteres.' };
    passwords[user.id] = password;
    notify();
    return { user };
  };
  window.Demo.setPlantAvailability = (plantId, status, actorId, values = {}) => {
    const actor = window.ADM_USERS.find(u => u.id === actorId && u.role === 'admin' && u.status === 'active');
    if (!actor) return { error: 'A liberação de plantas é exclusiva do Administrador.' };
    const plant = window.ADM_PLANTAS.find(p => p.id === plantId);
    if (!plant || !['available', 'pending'].includes(status)) return { error: 'Planta indisponível.' };
    const candidate = { ...plant, ...Object.fromEntries(['name', 'version', 'kind', 'minRole', 'marker'].filter(key => key in values).map(key => [key, values[key]])) };
    if (status === 'available') {
      if (!candidate.name?.trim() || !candidate.version?.trim() || candidate.version === '—' || !candidate.size || candidate.size === '—') return { error: 'Carregue um modelo e informe sua versão antes de liberar a planta.' };
      if (!candidate.marker || !candidate.marker.location?.trim()) return { error: 'Gere o marcador e informe sua localização antes de liberar a planta.' };
      if (candidate.kind === 'projeto' && candidate.minRole === 'morador') return { error: 'Projetos executivos são restritos à equipe técnica.' };
      Object.assign(plant, candidate);
    }
    Object.assign(plant, { status, availabilityBy: actorId, availabilityAt: new Date().toISOString() });
    notify();
    return { plant };
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
    const user = window.Demo.profileUser('morador');
    return { ...user, first: (user?.name || 'Morador').split(/\s+/)[0], initials: user?.initials || 'MO' };
  };
  window.residentProperties = () => {
    const account = window.Demo.profileUser('morador');
    const user = account?.status === 'active' ? account : null;
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
