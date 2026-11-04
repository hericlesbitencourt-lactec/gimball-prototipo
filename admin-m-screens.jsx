// admin-m-screens.jsx - Início · Usuários · Imóveis (mobile)

const { useState: mState } = React;

/* helper: scrollable screen with condensing large-title nav
   NOTE: children must NOT be wrapped in a transform-animated element:
   sheets/pickers inside are position:absolute and a transform creates a
   containing block that misplaces/clips them. */
function Page({ title, sub, onBack, right, children, large = true, bottomPad = 96 }) {
  const [sc, setSc] = mState(false);
  return (
    <window.Screen onScroll={e => setSc(e.currentTarget.scrollTop > (large ? 56 : 8))} pad={false}>
      <window.NavBar title={title} sub={sub} onBack={onBack} right={right} scrolled={sc} large={large} />
      <div>{children}</div>
      <div style={{ height: bottomPad }} />
    </window.Screen>
  );
}

/* ───────── INÍCIO ───────── */
function MInicio({ go, push, role = 'admin', userId }) {
  const engineer = role === 'engenheiro';
  const plants = window.technicalPlants(role);
  return (
    <Page title="Início" sub={engineer ? 'Engenharia' : 'Administração'}>
      <div style={{ padding: "0 18px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><window.GMark size={26} /><span className="demo-label">{engineer ? 'Engenheiro' : 'Administrador'}</span></div>
      {!engineer && window.pendingProfileCount() > 0 && <window.Group header="Aguardando sua análise" style={{ marginBottom: 18 }}>
        <window.Row multiline icon={<window.MIc.bell s={20} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)" title="Solicitações cadastrais"
          sub={`${window.pendingProfileCount()} ${window.pendingProfileCount() === 1 ? 'solicitação pendente' : 'solicitações pendentes'} · Revisar dados enviados pelos usuários`}
          chevron last onClick={() => push({ key: 'profileRequests' })} />
      </window.Group>}
      <div style={{ margin: '0 16px' }}><window.ProfileRequestNotice userId={userId} onOpen={() => push({ key: 'profile' })} /></div>
      <div style={{ padding: '4px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 22 }}>
        {!engineer && <window.Tile label="Usuários" value={window.ADM_USERS.length} sub={`${window.ADM_USERS.filter(u => u.role === "morador").length} moradores`} icon={<window.MIc.users s={18} />} tint="#7A4FB0" bg="#EFE8F8" />}
        <window.Tile label="Imóveis" value={window.ADM_IMOVEIS.length} sub="Imóveis cadastrados" icon={<window.MIc.home s={18} />} tint="var(--orange)" bg="var(--orange-100)" />
        {!engineer && <window.Tile label="Empreendimentos" value={window.ADM_EMP.length} sub="Empreendimentos" icon={<window.MIc.building s={18} />} tint="#2C7BB0" bg="#E6F1F8" />}
        <window.Tile label="Plantas" value={plants.length} sub={`${plants.filter(p => p.status === "available").length} disponíveis`} icon={<window.MIc.cube s={18} />} tint="var(--green)" bg="var(--green-100)" />
      </div>

      <window.Group header={engineer ? 'Área técnica' : 'Gestão'}>
        {!engineer && <window.Row icon={<window.MIc.users s={18} />} iconBg="#EFE8F8" iconColor="#7A4FB0" title="Usuários" sub="Contas e papéis de acesso" chevron onClick={() => push({ key: 'usersList' })} />}
        {!engineer && !window.pendingProfileCount() && <window.Row icon={<window.MIc.edit s={18} />} iconBg="var(--amber-100)" iconColor="var(--amber)" title="Solicitações cadastrais" sub="Nenhuma solicitação pendente" chevron onClick={() => push({ key: 'profileRequests' })} />}
        {!engineer && <window.Row icon={<window.MIc.building s={18} />} iconBg="#E6F1F8" iconColor="#2C7BB0" title="Empreendimentos" sub="Obras e condomínios" chevron onClick={() => push({ key: 'empList' })} />}
        <window.Row icon={<window.MIc.home s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)" title="Imóveis" sub="Cadastros e projetos técnicos" chevron onClick={() => go('imoveis')} />
        <window.Row icon={<window.MIc.cube s={18} />} iconBg="var(--green-100)" iconColor="var(--green)" title="Plantas" sub="Modelos 3D técnicos" chevron last onClick={() => go('plantas')} />
      </window.Group>
    </Page>
  );
}

/* ───────── USUÁRIOS (list) ───────── */
function MUsersList({ push, pop }) {
  const [q, setQ] = mState('');
  const [role, setRole] = mState('all');
  const rows = window.ADM_USERS.filter(u => (role === 'all' || u.role === role) &&
    (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())));
  const byRole = { admin: [], engenheiro: [], morador: [] };
  rows.forEach(u => byRole[u.role].push(u));
  const labels = { admin: 'Administradores', engenheiro: 'Engenheiros', morador: 'Moradores' };
  return (
    <Page title="Usuários" sub={`${window.ADM_USERS.length} contas`} onBack={{ label: 'Início', fn: pop }}
      right={<window.NavBtn icon={<window.MIc.plus s={20} />} accent label="Novo" onClick={() => push({ key: 'userForm' })} />}>
      <Search value={q} onChange={setQ} placeholder="Buscar nome ou e-mail" />
      <window.Segment value={role} set={setRole} opts={[['all', 'Todos'], ['admin', 'Admin'], ['engenheiro', 'Engenheiro'], ['morador', 'Morador']]} />
      {['admin', 'engenheiro', 'morador'].filter(rk => byRole[rk].length).map(rk => (
        <window.Group key={rk} header={labels[rk]}>
          {byRole[rk].map((u, i) => (
            <window.Row multiline key={u.id} last={i === byRole[rk].length - 1} onClick={() => push({ key: 'userForm', user: u })}
              left={<window.MAvatar initials={u.initials} role={u.role} size={38} />}
              title={u.name} sub={u.email}
              details={<div style={{ marginTop: 7 }}><window.SPill s={u.status} /></div>} chevron />
          ))}
        </window.Group>
      ))}
      {rows.length === 0 && <window.EmptyState icon={<window.MIc.user s={30} />} title="Nada encontrado" body="Ajuste a busca ou o filtro de papel." />}
    </Page>
  );
}
const Search = window.Search;

/* ───────── USUÁRIO (form/detail) ───────── */
function MUserForm({ user, pop, toast, userId }) {
  const isNew = !user;
  const [name, setName] = mState(user ? user.name : '');
  const [email, setEmail] = mState(user ? user.email : '');
  const [phone, setPhone] = mState(user && user.phone !== '—' ? user.phone : '');
  const [role, setRole] = mState(user ? user.role : 'morador');
  const [status, setStatus] = mState(user ? user.status : 'invited');
  const [pick, setPick] = mState(null);
  const [linked, setLinked] = mState(() => user?.linked || []);
  const [linkOpen, setLinkOpen] = mState(false);
  const [createdUser, setCreatedUser] = mState(null);
  const { field, validate } = window.useFieldErrors();

  const roleLabel = window.ROLE_BADGE[role].label;
  const save = () => {
    if (!validate({
      Nome: !name.trim() && 'Informe o nome completo.',
      'E-mail': !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Informe um e-mail válido.' : window.ADM_USERS.some(u => u.id !== user?.id && u.email.toLowerCase() === email.trim().toLowerCase()) && 'Este e-mail já está cadastrado.',
    })) return;
    const emailChanged = user && user.email.toLowerCase() !== email.trim().toLowerCase();
    const saved = window.Demo.save('ADM_USERS', user, { name: name.trim(), email: email.trim(), phone, role, status, linked, units: linked.length, initials: name.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(), last: user?.last || 'nunca', ...(isNew ? { emailConfirmed: false } : {}) });
    if (isNew || (status === 'invited' && emailChanged)) {
      const result = window.Demo.sendInvitation(saved.id, userId);
      if (result.error) return toast(result.error);
      toast(null); setCreatedUser(result.user);
    } else { toast('Alterações salvas.'); pop(); }
  };
  const unlink = (id) => setLinked(l => l.filter(x => x !== id));

  if (createdUser) return (
    <Page key="invitation-notice" large={false} title={isNew ? 'Usuário criado' : 'Convite de acesso'} onBack={{ label: 'Usuários', fn: pop }}>
      <window.EmailNotice title="Convite enviado" email={createdUser.email}>
        {createdUser.invitation.expiresAt <= Date.now() ? <window.Badge color="var(--amber)" bg="var(--amber-100)">Convite expirado</window.Badge> : <window.SPill s={createdUser.status} />}
        <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}><strong>{createdUser.name}</strong> receberá um link para definir a própria senha, confirmar o e-mail e ativar a conta. O convite tem validade de 24 horas.</p>
        <div style={{ marginTop: 22, padding: 16, borderRadius: 14, background: '#fff', border: '1px solid var(--line)', textAlign: 'left' }}>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>A tela seguinte será acessada pelo link recebido no e-mail. Use o botão para percorrer essa etapa no protótipo.</p>
          <window.Btn block variant="dark" onClick={() => { window.location.href = 'index.html?convite=' + encodeURIComponent(createdUser.invitation.token); }}>Simular clique no e-mail</window.Btn>
        </div>
        <window.Btn block onClick={pop} style={{ marginTop: 24 }}>Concluir</window.Btn>
      </window.EmailNotice>
    </Page>
  );

  return (
    <Page large={false} title={isNew ? 'Novo usuário' : user.name} onBack={{ label: 'Usuários', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer', padding: '4px 4px' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      {!isNew && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 20px' }}>
          <window.MAvatar initials={user.initials} role={user.role} size={72} />
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>{user.name}</div>
          <div style={{ marginTop: 8 }}><window.RPill r={role} /></div>
        </div>
      )}

      <window.Group header="Dados">
        <window.FInput label="Nome" value={name} {...field('Nome', setName)} placeholder="Nome completo" />
        <window.FInput label="E-mail" value={email} {...field('E-mail', setEmail)} placeholder="nome@email.com" type="email" />
        <window.FInput label="Telefone" value={phone} onChange={setPhone} type="tel" placeholder="(00) 00000-0000" last />
      </window.Group>

      <window.Group header="Acesso" footer={role === 'morador' ? 'Moradores só enxergam o as-built dos imóveis vinculados abaixo.' : role === 'engenheiro' ? 'Engenheiros gerenciam plantas e veem projeto + as-built.' : 'Acesso total ao painel administrativo.'}>
        <window.FSelect label="Papel" display={roleLabel} onClick={() => setPick('role')} />
        <window.Row title="Status" trailing={<window.SPill s={status} />} last />
      </window.Group>

      {role === 'morador' && (
        <window.Group header={`Imóveis vinculados (${linked.length})`} footer="Use a busca para encontrar o imóvel; a base pode ter milhares de imóveis.">
          {linked.map(id => {
            const im = window.ADM_IMOVEIS.find(i => i.id === id);
            if (!im) return null;
            return (
              <window.Row key={id} icon={<window.MIc.home s={18} />} title={im.identifier} sub={window.empName(im.emp)}
                trailing={<button className="tap" onClick={() => unlink(id)} aria-label="Desvincular" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 99, border: 0, background: 'var(--red-100)', color: 'var(--red)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}><window.IcClose s={18} /></button>} />
            );
          })}
          <window.Row icon={<window.MIc.plus s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)"
            title="Vincular imóvel" sub="Buscar por imóvel ou empreendimento" last onClick={() => setLinkOpen(true)} />
        </window.Group>
      )}

      {!isNew && (
        <window.Group header="Ações da conta" footer="A desativação preserva o cadastro e os imóveis vinculados.">
          <window.Row multiline icon={<window.MIc.user s={18} />} title={status === 'inactive' ? 'Reativar usuário' : 'Desativar usuário'} last={status === 'inactive'}
            confirmation={{ title: status === 'inactive' ? 'Reativar usuário?' : 'Desativar usuário?', body: status === 'inactive' ? 'O acesso será restabelecido. Se o usuário ainda não definiu a senha, a conta continuará aguardando ativação pelo convite.' : 'O usuário não poderá acessar nem ativar a conta. O cadastro e os imóveis vinculados serão preservados.', action: status === 'inactive' ? 'Reativar' : 'Desativar' }}
            onClick={() => { const next = status === 'inactive' ? (user.invitation && !user.invitation.usedAt ? 'invited' : 'active') : 'inactive'; window.Demo.save('ADM_USERS', user, { status: next }); setStatus(next); toast(next === 'inactive' ? 'Usuário desativado.' : 'Usuário reativado.'); }} />
          {status === 'invited' && <>
            <window.Row multiline icon={<window.MIc.bell s={18} />} title="Reenviar convite" sub={user.email}
              confirmation={{ title: 'Reenviar convite?', body: 'Enviar um novo convite para ' + user.email + '? O link anterior deixará de funcionar.', action: 'Reenviar' }}
              onClick={() => { const result = window.Demo.sendInvitation(user.id, userId); if (result.error) return toast(result.error); toast(null); setCreatedUser(result.user); }} />
            {user.invitation && <window.Row multiline icon={<window.MIc.link s={18} />} title="Ver convite enviado" sub={user.invitation.expiresAt <= Date.now() ? 'Convite expirado · Reenvie para renovar o acesso' : 'Simular a abertura do link recebido por e-mail'} last onClick={() => { toast(null); setCreatedUser(user); }} />}
          </>}
          {status === 'active' && <window.Row multiline icon={<window.MIc.bell s={18} />} title="Enviar recuperação de senha" sub={user.email} last
            confirmation={{ title: 'Enviar recuperação de senha?', body: 'Enviar instruções para redefinir a senha de ' + user.email + '?', action: 'Enviar' }}
            onClick={() => { window.Demo.save('ADM_USERS', user, { passwordResetSentAt: new Date().toISOString() }); toast('Instruções de recuperação de senha enviadas.'); }} />}
        </window.Group>
      )}

      {!isNew && (
        <window.Group>
          <window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover usuário" danger last onClick={() => { const error = window.Demo.remove('ADM_USERS', user); if (error) return toast(error); toast('Usuário removido.'); pop(); }} />
        </window.Group>
      )}

      <window.Picker open={pick === 'role'} onClose={() => setPick(null)} title="Papel de acesso" value={role} onPick={setRole}
        options={[{ v: 'morador', l: 'Morador', sub: 'App AR · vê apenas as-built' }, { v: 'engenheiro', l: 'Engenheiro', sub: 'Gerencia plantas · vê projeto' }, { v: 'admin', l: 'Administrador', sub: 'Acesso total' }]} />
      <LinkImovelSheet open={linkOpen} onClose={() => setLinkOpen(false)} linked={linked}
        onAdd={(id) => setLinked(l => [...l, id])} />
    </Page>
  );
}

/* busca + vínculo de imóvel (preparado para bases com milhares de unidades) */
function LinkImovelSheet({ open, onClose, linked, onAdd }) {
  const [q, setQ] = mState('');
  React.useEffect(() => { if (!open) setQ(''); }, [open]);
  const term = q.trim().toLowerCase();
  const results = term.length < 2 ? [] : window.ADM_IMOVEIS
    .filter(i => !linked.includes(i.id) &&
      (i.identifier.toLowerCase().includes(term) || window.empName(i.emp).toLowerCase().includes(term)))
    .slice(0, 20);
  return (
    <window.Sheet open={open} onClose={onClose} title="Vincular imóvel" height="86%"
      footer={<window.Action variant="ghost" onClick={onClose}>Concluir</window.Action>}>
      <Search value={q} onChange={setQ} placeholder="Buscar imóvel ou empreendimento" />
      {term.length < 2 ? (
        <div style={{ textAlign: 'center', padding: '34px 40px', color: 'var(--slate)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: '#EEF1F5', color: 'var(--slate-300)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><window.MIc.search s={24} /></div>
          <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--ink)' }}>Digite para buscar</div>
          <div style={{ fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>Informe ao menos 2 caracteres do imóvel ou do empreendimento.</div>
        </div>
      ) : results.length ? (
        <window.Group footer={results.length === 20 ? 'Mostrando os 20 primeiros resultados. Refine a busca.' : null}>
          {results.map((im, i) => (
            <window.Row key={im.id} last={i === results.length - 1} onClick={() => onAdd(im.id)}
              icon={<window.MIc.home s={18} />} title={im.identifier} sub={window.empName(im.emp)}
              trailing={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--orange-600)', fontSize: 13.5, fontWeight: 700 }}><window.MIc.plus s={16} /> Vincular</span>} />
          ))}
        </window.Group>
      ) : (
        <div style={{ textAlign: 'center', padding: '34px 40px', color: 'var(--slate)', fontSize: 13.5 }}>Nenhum imóvel encontrado para “{q}”.</div>
      )}
    </window.Sheet>
  );
}

/* ───────── IMÓVEIS (tab list) ───────── */
function MImoveis({ push, pop, empId }) {
  const [q, setQ] = mState('');
  const units = window.ADM_IMOVEIS.filter(i => !empId || i.emp === empId);
  const rows = units.filter(i => i.identifier.toLowerCase().includes(q.toLowerCase()) || window.empName(i.emp).toLowerCase().includes(q.toLowerCase()));
  const byEmp = {};
  rows.forEach(i => { (byEmp[i.emp] = byEmp[i.emp] || []).push(i); });
  return (
    <Page title="Imóveis" sub={empId ? window.empName(empId) : `${units.length} imóveis`} onBack={empId ? { label: 'Empreendimento', fn: pop } : undefined}
      right={<window.NavBtn icon={<window.MIc.plus s={20} />} accent label="Novo" onClick={() => push({ key: 'imovelForm', empId })} />}>
      <Search value={q} onChange={setQ} placeholder="Buscar imóvel ou empreendimento" />
      {Object.keys(byEmp).map(eid => (
        <window.Group key={eid} header={window.empName(eid)}>
          {byEmp[eid].map((i, idx) => (
            <window.Row key={i.id} last={idx === byEmp[eid].length - 1} onClick={() => push({ key: 'imovelDetail', imovel: i })}
              icon={<window.MIc.home s={18} />} title={i.identifier} sub={`${i.typology} · ${i.area} m²`}
              trailing={<window.SPill s={i.status} />} chevron />
          ))}
        </window.Group>
      ))}
      {rows.length === 0 && <window.EmptyState icon={<window.MIc.home s={30} />} title="Nenhum imóvel" body={empId && !units.length ? 'Este empreendimento ainda não tem imóveis cadastrados.' : 'Ajuste a busca.'}
        action={empId && !units.length ? <window.Btn onClick={() => push({ key: 'imovelForm', empId })}>Cadastrar imóvel</window.Btn> : undefined} />}
    </Page>
  );
}

/* ───────── IMÓVEL (detail) ───────── */
function MImovelDetail({ imovel, pop, push, toast, role = 'admin' }) {
  const i = window.ADM_IMOVEIS.find(row => row.id === imovel.id) || imovel;
  const plantas = window.technicalPlants(role).filter(p => p.imovel === i.id);
  return (
    <Page large={false} title={i.identifier} onBack={{ label: 'Imóveis', fn: pop }}
      right={<button className="tap" onClick={() => push({ key: 'imovelForm', imovel: i })} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Editar</button>}>
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ background: `linear-gradient(135deg,#27506e,var(--navy-900))`, borderRadius: 18, padding: '18px 18px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: .4, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.02em' }}>{i.identifier}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{window.empName(i.emp)}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
              {[['Área', `${i.area} m²`], ['Tipologia', i.typology], ['Andar', i.floor ?? '—']].map(([l, v]) => (
                <div key={l}><div className="mono" style={{ fontSize: 9.5, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <window.Group header={`Plantas (${plantas.length})`} footer="Cada planta carrega seu próprio marcador de ancoragem (AprilTag).">
        {plantas.length ? plantas.map((p, idx) => (
          <window.PlantRow key={p.id} plant={p} last={idx === plantas.length - 1} onClick={() => push({ key: 'plantaForm', planta: p })} />
        )) : <window.Row title="Sem plantas" sub="Envie um modelo 3D para este imóvel" last />}
      </window.Group>
    </Page>
  );
}

/* ───────── IMÓVEL (form) ───────── */
function MImovelForm({ imovel, initialEmp, pop, toast }) {
  const isNew = !imovel;
  const [ident, setIdent] = mState(imovel ? imovel.identifier : '');
  const [area, setArea] = mState(imovel ? imovel.area : '');
  const [typ, setTyp] = mState(imovel ? imovel.typology : '');
  const [emp, setEmp] = mState(imovel ? imovel.emp : initialEmp || 'e1');
  const [status, setStatus] = mState(imovel ? imovel.status : 'construction');
  const [pick, setPick] = mState(null);
  const { field, validate } = window.useFieldErrors();
  const save = () => {
    if (!validate({
      Empreendimento: !window.ADM_EMP.some(e => e.id === emp) && 'Selecione um empreendimento.',
      Identificação: !ident.trim() ? 'Informe a identificação do imóvel.' : window.ADM_IMOVEIS.some(i => i.id !== imovel?.id && i.emp === emp && i.identifier.toLowerCase() === ident.trim().toLowerCase()) && 'Este imóvel já está cadastrado.',
      'Área (m²)': !(Number(String(area).replace(',', '.')) > 0) && 'Informe uma área maior que zero.',
      Tipologia: !typ.trim() && 'Informe a tipologia do imóvel.',
    })) return;
    window.Demo.save('ADM_IMOVEIS', imovel, { identifier: ident.trim(), area, typology: typ.trim(), emp, status, floor: imovel?.floor ?? 0 }); toast('Imóvel salvo.'); pop();
  };
  return (
    <Page large={false} title={isNew ? 'Novo imóvel' : 'Editar imóvel'} onBack={{ label: 'Voltar', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      <window.Group header="Identificação" footer="É assim que o morador verá o imóvel no app.">
        <window.FSelect label="Empreendimento" error={field('Empreendimento', setEmp).error} display={window.empName(emp)} onClick={() => setPick('emp')} />
        <window.FInput label="Identificação" value={ident} {...field('Identificação', setIdent)} placeholder="Torre B · Apto 1204" last />
      </window.Group>
      <window.Group header="Detalhes">
        <window.FInput label="Área (m²)" value={area} {...field('Área (m²)', setArea)} placeholder="92,0" />
        <window.FInput label="Tipologia" value={typ} {...field('Tipologia', setTyp)} placeholder="3 dorm" />
        <window.FSelect label="Status" display={window.ADM_STATUS[status].label} onClick={() => setPick('status')} last />
      </window.Group>
      {!isNew && <window.Group><window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover imóvel" danger last onClick={() => { const error = window.Demo.remove('ADM_IMOVEIS', imovel); if (error) return toast(error); toast('Imóvel removido.'); pop(); }} /></window.Group>}
      <window.Picker open={pick === 'emp'} onClose={() => setPick(null)} title="Empreendimento" value={emp} onPick={field('Empreendimento', setEmp).onChange} searchable searchPlaceholder="Buscar empreendimento" options={window.ADM_EMP.map(e => ({ v: e.id, l: e.name, sub: `${window.construtoraName(e.construtora)} · ${e.city}/${e.state}` }))} />
      <window.Picker open={pick === 'status'} onClose={() => setPick(null)} title="Status" value={status} onPick={setStatus} options={[{ v: 'construction', l: 'Em obra' }, { v: 'delivered', l: 'Entregue' }]} />
    </Page>
  );
}

Object.assign(window, { Page, MInicio, MUsersList, MUserForm, MImoveis, MImovelDetail, MImovelForm });
