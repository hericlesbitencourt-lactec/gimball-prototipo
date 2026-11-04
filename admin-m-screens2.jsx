// admin-m-screens2.jsx - Plantas + marcador · Empreendimentos · Construtoras (mobile)

/* faux AprilTag glyph */
function TagGlyph({ size = 34 }) {
  const bits = [[0,0,0,0,0,0],[0,1,1,0,1,0],[0,0,1,1,1,0],[0,1,0,0,1,0],[0,1,1,0,1,0],[0,0,0,0,0,0]];
  return <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', background: '#fff', flex: '0 0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
    {bits.flat().map((b, i) => <div key={i} style={{ background: b ? '#fff' : '#0a0a0a' }} />)}</div>;
}

/* ───────── PLANTAS (tab) ───────── */
function MPlantas({ push, toast, role = 'admin', userId }) {
  const [q, setQ] = React.useState('');
  const [disc, setDisc] = React.useState('all');
  const [up, setUp] = React.useState(false);
  const [status, setStatus] = React.useState('all');
  const plants = window.technicalPlants(role);
  const rows = plants.filter(p => (disc === 'all' || p.disc === disc) && (status === 'all' || p.status === status) && (p.name + ' ' + window.imovelName(p.imovel)).toLowerCase().includes(q.toLowerCase()));
  return (
    <window.Page title="Plantas" sub={`${plants.length} modelos`}
      right={(role === 'admin' || window.PERM_MATRIX['plantas.upload'].includes(role)) && <window.NavBtn icon={<window.MIc.upload s={19} />} accent label="Enviar" onClick={() => setUp(true)} />}>
      <window.Search value={q} onChange={setQ} placeholder="Buscar planta" />
      <window.Segment value={disc} set={setDisc} opts={[['all', 'Todas'], ['hidro', 'Hidro'], ['eletr', 'Elétrico'], ['estru', 'Estrut.']]} />
      <window.Segment value={status} set={setStatus} opts={[['all', 'Todos os status'], ['pending', 'Pendentes'], ['available', 'Disponíveis']]} />
      <window.Group>
        {rows.map((p, i) => (
          <window.PlantRow key={p.id} plant={p} last={i === rows.length - 1} onClick={() => push({ key: 'plantaForm', planta: p })} />
        ))}
      </window.Group>
      {rows.length === 0 && <window.EmptyState icon={<window.MIc.cube s={30} />} title="Nenhuma planta" body="Ajuste a busca ou envie um novo modelo." />}
      <UploadSheet open={up} onClose={() => setUp(false)} toast={toast} role={role} userId={userId} />
    </window.Page>
  );
}

function UploadSheet({ open, onClose, toast, role = 'admin', userId, planta, onUploaded }) {
  const [file, setFile] = React.useState(null);
  const [pick, setPick] = React.useState(null);
  const [imovel, setImovel] = React.useState('i1');
  const [disc, setDisc] = React.useState('hidro');
  const [kind, setKind] = React.useState('asbuilt');
  const fileName = `modelo_${planta?.disc || disc}_${planta?.kind || kind}.usdz`;
  React.useEffect(() => { if (!open) { setFile(null); } }, [open]);
  const upload = () => {
    const destination = planta?.imovel || imovel;
    if (!window.ADM_IMOVEIS.some(i => i.id === destination)) return toast('Selecione um imóvel cadastrado.');
    const values = { imovel: destination, disc: planta?.disc || disc, kind: planta?.kind || kind,
      name: planta?.name || window.DISC_META[disc].name + ' · Modelo técnico', version: planta?.version && planta.version !== '—' ? planta.version : 'v1.0',
      format: 'usdz', size: '18,4 MB', status: 'pending', updated: new Date().toLocaleDateString('pt-BR'),
      by: window.ADM_USERS.find(u => u.id === userId)?.name || window.Demo.profileUser(role)?.name || 'Equipe técnica', marker: planta?.marker || null };
    window.Demo.save('ADM_PLANTAS', planta, values);
    onUploaded?.(values);
    toast('Modelo carregado. Aguardando liberação do Administrador.');
    onClose();
  };
  return (
    <>
    <window.Sheet open={open} onClose={onClose} title={planta ? 'Carregar modelo' : 'Enviar planta'}
      footer={<><window.Action variant="ghost" onClick={onClose}>Cancelar</window.Action><window.Action disabled={!file} onClick={upload}>{planta ? 'Carregar' : 'Enviar'}</window.Action></>}>
      <p style={{ margin: '4px 20px 18px', fontSize: 13, lineHeight: 1.6, color: 'var(--slate)' }}>Após o carregamento, o modelo aguardará a liberação do Administrador. Substituir um arquivo disponível também exige uma nova liberação.</p>
      <div style={{ padding: '4px 16px 0' }}>
        <button type="button" className="tap" onClick={() => setFile(true)} style={{ width: '100%', border: `2px dashed ${file ? 'var(--green)' : 'var(--line)'}`, borderRadius: 16,
          padding: '26px 18px', textAlign: 'center', background: file ? 'var(--green-100)' : '#fff', cursor: 'pointer', marginBottom: 18, transition: '.15s' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: file ? '#fff' : '#EEF1F5', color: file ? 'var(--green)' : 'var(--slate)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            {file ? <window.IcCheck s={26} w={2.4} /> : <window.MIc.upload s={24} />}
          </div>
          {file ? <>
            <div className="mono" style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>{fileName}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3 }}>18,4 MB · pronto para enviar</div>
          </> : <>
            <div style={{ fontSize: 15, fontWeight: 650, color: 'var(--ink)' }}>Usar modelo de exemplo</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 3 }}>USDZ · Modelo de referência</div>
          </>}
        </button>
      </div>
      {planta ? <window.Group header="Vinculado a"><window.Row multiline title={window.imovelName(planta.imovel)} sub={window.DISC_META[planta.disc].name + ' · ' + (planta.kind === 'asbuilt' ? 'As-built' : 'Projetado')} last /></window.Group> : <window.Group header="Destino">
        <window.FSelect label="Imóvel" display={window.imovelName(imovel)} onClick={() => setPick('imovel')} />
        <window.FSelect label="Tipo de projeto" display={window.DISC_META[disc].name} onClick={() => setPick('disc')} />
        <window.FSelect label="Tipo" display={kind === 'asbuilt' ? 'Como foi construído' : 'Projetado'} onClick={() => setPick('kind')} last />
      </window.Group>}
    </window.Sheet>
    {/* pickers como irmãos do sheet: nunca cortados pelo scroll interno */}
    <window.Picker open={pick === 'imovel'} onClose={() => setPick(null)} title="Imóvel" value={imovel} onPick={setImovel} searchable searchPlaceholder="Buscar imóvel ou empreendimento" options={window.ADM_IMOVEIS.map(i => ({ v: i.id, l: i.identifier, sub: window.empName(i.emp) }))} />
    <window.Picker open={pick === 'disc'} onClose={() => setPick(null)} title="Tipo de projeto" value={disc} onPick={setDisc} options={[{ v: 'hidro', l: 'Hidrossanitário' }, { v: 'eletr', l: 'Elétrico' }, { v: 'estru', l: 'Estrutural' }]} />
    <window.Picker open={pick === 'kind'} onClose={() => setPick(null)} title="Tipo" value={kind} onPick={setKind} options={[{ v: 'asbuilt', l: 'Como foi construído', sub: 'Visível ao morador' }, { v: 'projeto', l: 'Projetado', sub: 'Restrito a engenheiro/admin' }]} />
    </>
  );
}

/* ───────── PLANTA (form/detail) ───────── */
function MPlantaForm({ planta, pop, toast, push, role = 'admin', userId }) {
  const p = planta;
  const [name, setName] = React.useState(p.name);
  const [version, setVersion] = React.useState(p.version);
  const [kind, setKind] = React.useState(p.kind);
  const [minRole, setMinRole] = React.useState(p.minRole || (p.kind === 'projeto' ? 'engenheiro' : 'morador'));
  const [marker, setMarker] = React.useState(p.marker);
  const [pick, setPick] = React.useState(null);
  const [showTag, setShowTag] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [availabilityAction, setAvailabilityAction] = React.useState(null);
  const [availabilityError, setAvailabilityError] = React.useState('');
  const { field, validate } = window.useFieldErrors();
  const save = () => {
    if (!validate({ Nome: !name.trim() && 'Informe o nome da planta.', Versão: !version.trim() && 'Informe a versão.', 'Papel mínimo': kind === 'projeto' && minRole === 'morador' && 'Projetos executivos são restritos à equipe técnica.' })) return;
    window.Demo.save('ADM_PLANTAS', p, { name: name.trim(), version: version.trim(), kind, minRole, marker }); toast('Planta atualizada.'); pop();
  };
  const genMarker = () => { setMarker({ family: 'tag36h11', code: window.nextTagCode(), size: '16,0', location: '' }); toast('Marcador gerado.'); };
  const setLoc = (v) => setMarker(m => ({ ...m, location: v }));
  const prepareAvailability = () => {
    setAvailabilityError('');
    if (p.status === 'available') return setAvailabilityAction('pending');
    if (!p.size || p.size === '—') return setAvailabilityError('Carregue um modelo antes de liberar a planta.');
    if (!validate({ Nome: !name.trim() && 'Informe o nome da planta.', Versão: (!version.trim() || version === '—') && 'Informe a versão do modelo.', Localização: marker && !marker.location?.trim() && 'Informe onde o marcador está instalado.', 'Papel mínimo': kind === 'projeto' && minRole === 'morador' && 'Projetos executivos são restritos à equipe técnica.' })) return;
    if (!marker) return setAvailabilityError('Gere um marcador e informe sua localização antes de liberar a planta.');
    setAvailabilityAction('available');
  };
  const confirmAvailability = () => {
    const result = window.Demo.setPlantAvailability(p.id, availabilityAction, userId, { name: name.trim(), version: version.trim(), kind, minRole, marker });
    setAvailabilityAction(null);
    if (result.error) return setAvailabilityError(result.error);
    toast(availabilityAction === 'available' ? 'Planta liberada.' : 'Planta retirada de disponibilidade.');
  };
  const viewAR = () => { if (p.status !== 'available' || !marker) return toast('Disponibilize o modelo e gere um marcador antes de visualizar em AR.'); push({
    key: 'camera', typeId: p.disc,
    plant: { ...p, name, marker, tag: marker ? `${marker.family} · id ${marker.code}` : 'tag36h11',
      file: `${p.imovel}_${p.disc}_${p.kind}.${p.format.toLowerCase()}` },
  }); };
  return (
    <window.Page large={false} title="Planta" onBack={{ label: 'Voltar', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Salvar</button>}>
      <div style={{ padding: '4px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #ECEEF1' }}>
          <div style={{ width: 50, height: 50, borderRadius: 13, background: 'var(--navy-900)', color: '#fff', display: 'grid', placeItems: 'center', flex: '0 0 auto' }}><window.MIc.cube s={26} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>{window.imovelName(p.imovel)}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}><window.DPill d={p.disc} /><window.KPill kind={kind} /></div>
          </div>
        </div>
      </div>
      <window.Group>
        <window.Row multiline icon={<window.MIc.scan s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)"
          title="Visualizar em AR" sub="Abrir câmera e ancorar o modelo pelo marcador" last onClick={viewAR} />
      </window.Group>
      <window.Group header="Disponibilidade" footer={role === 'admin' ? 'A liberação aplica os dados exibidos e disponibiliza esta versão para os perfis autorizados.' : 'A liberação e a retirada de disponibilidade são realizadas pelo Administrador.'}>
        <window.Row title="Situação" trailing={<window.SPill s={p.status} />} last={role !== 'admin'} />
        {role === 'admin' && <window.Row multiline icon={<window.IcCheck s={18} />} title={p.status === 'available' ? 'Retirar de disponibilidade' : 'Liberar planta'} sub={p.status === 'available' ? 'Suspender a visualização desta versão' : 'Validar modelo, versão e marcador'} chevron last onClick={prepareAvailability} />}
        {availabilityError && <p role="alert" style={{ margin: 0, padding: '0 14px 14px', color: 'var(--red)', fontSize: 13, lineHeight: 1.6 }}>{availabilityError}</p>}
      </window.Group>
      <window.Group header="Modelo">
        <window.Row multiline icon={<window.MIc.upload s={18} />} title="Carregar modelo" sub={p.size === '—' ? 'Adicionar o arquivo desta planta' : 'Substituir o arquivo atual'} chevron onClick={() => { setAvailabilityError(''); setUploadOpen(true); }} />
        <window.FInput label="Nome" value={name} {...field('Nome', setName)} />
        <window.FInput label="Versão" value={version} {...field('Versão', setVersion)} />
        <window.FSelect label="Formato" display={p.format.toUpperCase() + (p.size !== '—' ? ' · ' + p.size : '')} onClick={() => toast("O formato é definido pelo arquivo selecionado.")} last />
      </window.Group>
      <window.Group header="Acesso" footer="“Projetado” normalmente fica restrito a Engenheiro/Admin. O morador só vê o as-built.">
        <window.FSelect label="Tipo" display={kind === 'asbuilt' ? 'Como foi construído' : 'Projetado'} onClick={() => setPick('kind')} />
        <window.FSelect label="Papel mínimo" error={field('Papel mínimo', setMinRole).error} display={window.ROLE_BADGE[minRole].label} onClick={() => setPick('role')} last />
      </window.Group>

      {/* Marcador de ancoragem */}
      {marker ? (
        <window.Group header="Marcador de ancoragem" footer="O tamanho impresso é a referência para a escala do modelo.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderBottom: '1px solid #F1F3F6' }}>
            <TagGlyph size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>id {marker.code}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{marker.family}</div>
            </div>
            <window.Badge color="var(--slate)" bg="#EEF1F5">Gerado pelo sistema</window.Badge>
          </div>
          <window.FInput label="Localização" value={marker.location} {...field('Localização', setLoc)} placeholder="Hall hidráulico, parede norte" />
          <window.FSelect label="Tamanho impresso" display={`${marker.size} cm`} onClick={() => setPick('size')} />
          <window.Row icon={<window.MIc.download s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)" title="Prévia do marcador" sub="Prévia ilustrativa do marcador" last onClick={() => setShowTag(true)} />
        </window.Group>
      ) : (
        <window.Group header="Marcador de ancoragem" footer="Cada planta precisa de um marcador físico para ser posicionada no ambiente. O sistema atribui família e ID automaticamente.">
          <div style={{ padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: '#EEF1F5', color: 'var(--slate-300)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><window.MIc.scan s={26} /></div>
            <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--ink)' }}>Sem marcador</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', margin: '4px 0 14px', lineHeight: 1.45 }}>Gere um marcador para ancorar este modelo no AR.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <window.Action icon={<window.MIc.plus s={18} />} onClick={genMarker}>Gerar marcador</window.Action>
            </div>
          </div>
        </window.Group>
      )}

      <window.Group>
        <window.Row icon={<window.MIc.cube s={18} />} title="Baixar modelo" onClick={() => toast('O arquivo não está disponível para download.')} />
        <window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover planta" danger last onClick={() => { const error = window.Demo.remove('ADM_PLANTAS', p); if (error) return toast(error); toast('Planta removida.'); pop(); }} />
      </window.Group>
      <window.Picker open={pick === 'kind'} onClose={() => setPick(null)} title="Tipo" value={kind} onPick={setKind} options={[{ v: 'asbuilt', l: 'Como foi construído' }, { v: 'projeto', l: 'Projetado' }]} />
    <window.Picker open={pick === 'role'} onClose={() => setPick(null)} title="Papel mínimo" value={minRole} onPick={field('Papel mínimo', setMinRole).onChange} options={[{ v: 'morador', l: 'Morador (e acima)' }, { v: 'engenheiro', l: 'Engenheiro (e acima)' }, ...(role === 'admin' ? [{ v: 'admin', l: 'Apenas Admin' }] : [])]} />
      {marker && <window.Picker open={pick === 'size'} onClose={() => setPick(null)} title="Tamanho impresso" value={marker.size} onPick={(v) => setMarker(m => ({ ...m, size: v }))} options={[{ v: '10,0', l: '10 cm' }, { v: '16,0', l: '16 cm (padrão)' }, { v: '20,0', l: '20 cm' }, { v: '30,0', l: '30 cm' }]} />}
      {marker && <TagSheet open={showTag} onClose={() => setShowTag(false)} marker={marker} planta={p} toast={toast} />}
      <UploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} toast={toast} role={role} userId={userId} planta={p} onUploaded={values => { setVersion(current => current === '—' ? values.version : current); setAvailabilityError(''); }} />
      <window.ConfirmModal open={!!availabilityAction} onCancel={() => setAvailabilityAction(null)} onConfirm={confirmAvailability}
        title={availabilityAction === 'available' ? 'Liberar planta?' : 'Retirar disponibilidade?'} confirmLabel={availabilityAction === 'available' ? 'Liberar' : 'Retirar'} danger={availabilityAction === 'pending'}
        description={availabilityAction === 'available' ? 'Esta versão ficará disponível para os perfis autorizados. Confirme se o modelo e a referência do marcador foram revisados.' : 'Os usuários deixarão de visualizar esta versão. O cadastro, o modelo e o marcador serão preservados.'} />
    </window.Page>
  );
}

/* sheet to preview / “print” the generated marker */
function TagSheet({ open, onClose, marker, planta, toast }) {
  return (
    <window.Sheet open={open} onClose={onClose} title="Prévia do marcador"
      footer={<><window.Action variant="ghost" onClick={onClose}>Fechar</window.Action><window.Action icon={<window.MIc.download s={18} />} onClick={() => { toast('Exportação indisponível para esta prévia.'); onClose(); }}>Exportar marcador</window.Action></>}>
      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <TagGlyph size={150} />
        </div>
        <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>id {marker.code} · {marker.family}</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4, textAlign: 'center', padding: '0 24px', lineHeight: 1.45 }}>
          Prévia ilustrativa de <b>{marker.size} cm</b>. Este desenho não codifica o ID informado e não deve ser usado para reconhecimento ou impressão técnica.
        </div>
      </div>
      <window.Group header="Vinculado a" style={{ marginTop: 18 }}>
        <window.Row icon={<window.MIc.cube s={18} />} iconBg="var(--navy-900)" iconColor="#fff" title={planta.name} sub={window.imovelName(planta.imovel)} last />
      </window.Group>
    </window.Sheet>
  );
}

/* ───────── EMPREENDIMENTOS (list) ───────── */
function MEmpList({ push, pop }) {
  const [q, setQ] = React.useState('');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const term = normalize(q.trim());
  const rows = window.ADM_EMP.filter(e => normalize([e.name, window.construtoraName(e.construtora), e.city, e.state, e.address].join(' ')).includes(term));
  return (
    <window.Page title="Empreendimentos" sub={`${window.ADM_EMP.length} empreendimentos`} onBack={{ label: 'Mais', fn: pop }}
      right={<window.NavBtn icon={<window.MIc.plus s={20} />} accent label="Novo" onClick={() => push({ key: 'empForm' })} />}>
      <window.Search value={q} onChange={setQ} placeholder="Buscar empreendimento" />
      {rows.length > 0 && <window.Group>
        {rows.map((e, index) => <div key={e.id} style={{ borderBottom: index < rows.length - 1 ? '1px solid var(--line)' : undefined }}>
          <button type="button" className="tap" aria-label={`Editar ${e.name}`} onClick={() => push({ key: 'empForm', emp: e })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '17px 16px 13px', border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 750, lineHeight: 1.45, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{e.name}</span>
              <span style={{ display: 'block', marginTop: 5, fontSize: 13, lineHeight: 1.6, color: 'var(--slate)', overflowWrap: 'anywhere' }}>{window.construtoraName(e.construtora)}</span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 12, lineHeight: 1.6, color: 'var(--slate)', overflowWrap: 'anywhere' }}>{e.address}</span>
              <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 9, marginTop: 10 }}><window.SPill s={e.status} /><span style={{ fontSize: 12, color: 'var(--slate)' }}>{e.city}/{e.state}</span></span>
            </span>
            <span style={{ color: 'var(--slate)', flexShrink: 0 }}><window.IcChevR s={19} /></span>
          </button>
          <button type="button" className="tap" aria-label={`Ver imóveis de ${e.name}`} onClick={() => push({ key: 'imoveis', empId: e.id })}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: 'calc(100% - 32px)', minHeight: 46, margin: '0 16px 8px', padding: '10px 0', border: 0, borderTop: '1px solid #F1F3F6', background: 'transparent', color: 'var(--orange-600)', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Imóveis cadastrados</span>
            <span style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700 }}>{window.ADM_IMOVEIS.filter(i => i.emp === e.id).length}<window.IcChevR s={17} /></span>
          </button>
        </div>)}
      </window.Group>}
      {!rows.length && <window.EmptyState icon={<window.MIc.search s={28} />} title="Nenhum empreendimento" body="Busque pelo nome, construtora, cidade ou endereço." />}
    </window.Page>
  );
}

/* ───────── EMPREENDIMENTO (form) ───────── */
function MEmpForm({ emp, pop, toast, push }) {
  const isNew = !emp;
  const [name, setName] = React.useState(emp ? emp.name : '');
  const [construtora, setConstrutora] = React.useState(emp ? emp.construtora : '');
  const [address, setAddress] = React.useState(emp ? emp.address : '');
  const [estado, setEstado] = React.useState(emp ? emp.state : 'PR');
  const [city, setCity] = React.useState(emp ? emp.city : '');
  const [status, setStatus] = React.useState(emp ? emp.status : 'construction');
  const [pick, setPick] = React.useState(null);
  const { field, validate } = window.useFieldErrors();
  const setEstadoReset = (uf) => { setEstado(uf); if (!window.cidadesDe(uf).includes(city)) setCity(''); };
  const save = () => {
    if (!validate({ Nome: !name.trim() && 'Informe o nome do empreendimento.', Construtora: !window.ADM_CONSTRUTORAS.some(c => c.id === construtora) && 'Selecione uma construtora.', Endereço: !address.trim() && 'Informe o endereço.', Cidade: !city.trim() && 'Informe a cidade.' })) return;
    window.Demo.save('ADM_EMP', emp, { name: name.trim(), address: address.trim(), city: city.trim(), state: estado, construtora, status, cover: emp?.cover || '#457B9D', delivery: emp?.delivery || 'A definir' }); toast('Empreendimento salvo.'); pop();
  };
  return (
    <window.Page large={false} title={isNew ? 'Novo' : 'Editar'} onBack={{ label: 'Empreendimentos', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      <window.Group header="Dados">
        <window.FInput label="Nome" value={name} {...field('Nome', setName)} placeholder="Residencial Aurora" />
        <window.FSelect label="Construtora" error={field('Construtora', setConstrutora).error} display={construtora ? window.construtoraName(construtora) : 'Selecionar'} onClick={() => setPick('construtora')} last />
      </window.Group>
      <window.Group header="Localização">
        <window.FInput label="Endereço" value={address} {...field('Endereço', setAddress)} placeholder="Rua, número, bairro" />
        <window.FSelect label="Estado" display={estado} onClick={() => setPick('estado')} />
        <window.FInput label="Cidade" value={city} {...field('Cidade', setCity)} placeholder="Informe a cidade" last />
      </window.Group>
      <window.Group header="Situação">
        <window.FSelect label="Status" display={window.ADM_STATUS[status].label} onClick={() => setPick('status')} last />
      </window.Group>
      <window.Group header="Imóveis" footer={isNew ? 'Salve o empreendimento para cadastrar seus imóveis.' : 'A quantidade é calculada a partir dos imóveis cadastrados neste empreendimento.'}>
        {isNew ? <window.Row title="Imóveis cadastrados" value="0" last /> :
          <window.Row title="Imóveis cadastrados" value={window.ADM_IMOVEIS.filter(i => i.emp === emp.id).length} sub="Consultar e cadastrar imóveis" chevron last onClick={() => push({ key: 'imoveis', empId: emp.id })} />}
      </window.Group>
      {!isNew && <window.Group><window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover empreendimento" danger last onClick={() => { const error = window.Demo.remove('ADM_EMP', emp); if (error) return toast(error); toast('Empreendimento removido.'); pop(); }} /></window.Group>}
      <window.Picker open={pick === 'construtora'} onClose={() => setPick(null)} title="Construtora" value={construtora} onPick={field('Construtora', setConstrutora).onChange} searchable searchPlaceholder="Buscar construtora por nome ou CNPJ" options={window.ADM_CONSTRUTORAS.map(c => ({ v: c.id, l: c.name, sub: c.cnpj }))} />
      <window.Picker open={pick === 'estado'} onClose={() => setPick(null)} title="Estado" value={estado} onPick={setEstadoReset} options={window.ESTADOS.map(uf => ({ v: uf, l: uf }))} />
      <window.Picker open={pick === 'cidade'} onClose={() => setPick(null)} title="Cidade" value={city} onPick={setCity} options={window.cidadesDe(estado).map(c => ({ v: c, l: c }))} />
      <window.Picker open={pick === 'status'} onClose={() => setPick(null)} title="Situação" value={status} onPick={setStatus} options={[{ v: 'planning', l: 'Planejamento' }, { v: 'construction', l: 'Em obra' }, { v: 'delivered', l: 'Entregue' }]} />
    </window.Page>
  );
}

/* ───────── CONSTRUTORAS (list) ───────── */
function MConstrutoraList({ push, pop }) {
  const [q, setQ] = React.useState('');
  const rows = window.ADM_CONSTRUTORAS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || (c.cnpj || '').includes(q));
  return (
    <window.Page title="Construtoras" sub="Cadastro" onBack={{ label: 'Mais', fn: pop }}
      right={<window.NavBtn icon={<window.MIc.plus s={20} />} accent label="Nova" onClick={() => push({ key: 'construtoraForm' })} />}>
      <window.Search value={q} onChange={setQ} placeholder="Buscar por nome ou CNPJ" />
      <window.Group footer="As construtoras cadastradas aqui ficam disponíveis para seleção ao criar ou editar um empreendimento.">
        {rows.map((c, i) => (
          <window.Row key={c.id} last={i === rows.length - 1} onClick={() => push({ key: 'construtoraForm', construtora: c })}
            icon={<window.MIc.building s={18} />} iconBg="#E6F1F8" iconColor="#2C7BB0"
            title={c.name} sub={`${c.cnpj} · ${c.city}/${c.state}`}
            value={`${window.ADM_EMP.filter(e => e.construtora === c.id).length} obras`} chevron />
        ))}
      </window.Group>
      {rows.length === 0 && <window.EmptyState icon={<window.MIc.building s={30} />} title="Nenhuma construtora" body="Ajuste a busca ou cadastre uma nova." />}
    </window.Page>
  );
}

/* ───────── CONSTRUTORA (form) ───────── */
function MConstrutoraForm({ construtora, pop, toast }) {
  const isNew = !construtora;
  const [name, setName] = React.useState(construtora ? construtora.name : '');
  const [cnpj, setCnpj] = React.useState(construtora ? construtora.cnpj : '');
  const [estado, setEstado] = React.useState(construtora ? construtora.state : 'PR');
  const [city, setCity] = React.useState(construtora ? construtora.city : '');
  const [pick, setPick] = React.useState(null);
  const { field, validate } = window.useFieldErrors();
  const setEstadoReset = (uf) => { setEstado(uf); if (!window.cidadesDe(uf).includes(city)) setCity(''); };
  const save = () => {
    if (!validate({ Nome: !name.trim() && 'Informe o nome da construtora.', CNPJ: cnpj.replace(/\D/g, '').length !== 14 ? 'Informe um CNPJ com 14 dígitos.' : window.ADM_CONSTRUTORAS.some(c => c.id !== construtora?.id && c.cnpj.replace(/\D/g, '') === cnpj.replace(/\D/g, '')) && 'CNPJ já cadastrado.', Cidade: !city.trim() && 'Informe a cidade.' })) return;
    window.Demo.save('ADM_CONSTRUTORAS', construtora, { name: name.trim(), cnpj, city: city.trim(), state: estado, emps: construtora?.emps || 0 }); toast('Construtora salva.'); pop();
  };
  return (
    <window.Page large={false} title={isNew ? 'Nova construtora' : 'Editar'} onBack={{ label: 'Construtoras', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      <window.Group header="Dados">
        <window.FInput label="Nome" value={name} {...field('Nome', setName)} placeholder="Construtora Teste" />
        <window.FInput label="CNPJ" value={cnpj} {...field('CNPJ', setCnpj)} placeholder="00.000.000/0001-00" last />
      </window.Group>
      <window.Group header="Localização">
        <window.FSelect label="Estado" display={estado} onClick={() => setPick('estado')} />
        <window.FInput label="Cidade" value={city} {...field('Cidade', setCity)} placeholder="Informe a cidade" last />
      </window.Group>
      {!isNew && <window.Group><window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover construtora" danger last onClick={() => { const error = window.Demo.remove('ADM_CONSTRUTORAS', construtora); if (error) return toast(error); toast('Construtora removida.'); pop(); }} /></window.Group>}
      <window.Picker open={pick === 'estado'} onClose={() => setPick(null)} title="Estado" value={estado} onPick={setEstadoReset} options={window.ESTADOS.map(uf => ({ v: uf, l: uf }))} />
      <window.Picker open={pick === 'cidade'} onClose={() => setPick(null)} title="Cidade" value={city} onPick={setCity} options={window.cidadesDe(estado).map(c => ({ v: c, l: c }))} />
    </window.Page>
  );
}

Object.assign(window, { TagGlyph, MPlantas, MPlantaForm, MEmpList, MEmpForm, MConstrutoraList, MConstrutoraForm });
