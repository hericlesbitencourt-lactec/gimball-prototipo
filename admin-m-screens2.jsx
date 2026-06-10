// admin-m-screens2.jsx - Plantas + marcador · Empreendimentos · Construtoras (mobile)

/* faux AprilTag glyph */
function TagGlyph({ size = 34 }) {
  const bits = [[0,0,0,0,0,0],[0,1,1,0,1,0],[0,0,1,1,1,0],[0,1,0,0,1,0],[0,1,1,0,1,0],[0,0,0,0,0,0]];
  return <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', background: '#fff', flex: '0 0 auto', borderRadius: 4, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
    {bits.flat().map((b, i) => <div key={i} style={{ background: b ? '#fff' : '#0a0a0a' }} />)}</div>;
}

/* ───────── PLANTAS (tab) ───────── */
function MPlantas({ push, toast }) {
  const [q, setQ] = React.useState('');
  const [disc, setDisc] = React.useState('all');
  const [up, setUp] = React.useState(false);
  const rows = window.ADM_PLANTAS.filter(p => (disc === 'all' || p.disc === disc) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <window.Page title="Plantas" sub="7 modelos"
      right={<window.NavBtn icon={<window.MIc.upload s={19} />} accent label="Enviar" onClick={() => setUp(true)} />}>
      <window.Search value={q} onChange={setQ} placeholder="Buscar planta" />
      <window.Segment value={disc} set={setDisc} opts={[['all', 'Todas'], ['hidro', 'Hidro'], ['eletr', 'Elétrico'], ['estru', 'Estrut.']]} />
      <window.Group>
        {rows.map((p, i) => (
          <window.Row key={p.id} last={i === rows.length - 1} onClick={() => push({ key: 'plantaForm', planta: p })}
            icon={<window.MIc.cube s={18} />} iconBg="var(--navy-900)" iconColor="#fff"
            title={p.name} sub={`${window.imovelName(p.imovel)} · ${p.format.toUpperCase()} ${p.size !== '—' ? '· ' + p.size : ''}`}
            trailing={<window.SPill s={p.status} />} chevron />
        ))}
      </window.Group>
      {rows.length === 0 && <window.EmptyState icon={<window.MIc.cube s={30} />} title="Nenhuma planta" body="Ajuste a busca ou envie um novo modelo." />}
      <UploadSheet open={up} onClose={() => setUp(false)} toast={toast} />
    </window.Page>
  );
}

function UploadSheet({ open, onClose, toast }) {
  const [file, setFile] = React.useState(null);
  const [pick, setPick] = React.useState(null);
  const [imovel, setImovel] = React.useState('i1');
  const [disc, setDisc] = React.useState('hidro');
  const [kind, setKind] = React.useState('asbuilt');
  React.useEffect(() => { if (!open) { setFile(null); } }, [open]);
  return (
    <>
    <window.Sheet open={open} onClose={onClose} title="Enviar planta"
      footer={<><window.Action variant="ghost" onClick={onClose}>Cancelar</window.Action><window.Action disabled={!file} onClick={() => { toast('Planta enviada com sucesso.'); onClose(); }}>Enviar</window.Action></>}>
      <div style={{ padding: '4px 16px 0' }}>
        <div className="tap" onClick={() => setFile('apto1204_hidro_asbuilt.usdz')} style={{ border: `2px dashed ${file ? 'var(--green)' : 'var(--line)'}`, borderRadius: 16,
          padding: '26px 18px', textAlign: 'center', background: file ? 'var(--green-100)' : '#fff', cursor: 'pointer', marginBottom: 18, transition: '.15s' }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: file ? '#fff' : '#EEF1F5', color: file ? 'var(--green)' : 'var(--slate)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            {file ? <window.IcCheck s={26} w={2.4} /> : <window.MIc.upload s={24} />}
          </div>
          {file ? <>
            <div className="mono" style={{ fontSize: 13, fontWeight: 650, color: 'var(--ink)' }}>{file}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3 }}>18,4 MB · pronto para enviar</div>
          </> : <>
            <div style={{ fontSize: 15, fontWeight: 650, color: 'var(--ink)' }}>Selecionar arquivo</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 3 }}>USDZ ou GLB · até 80 MB</div>
          </>}
        </div>
      </div>
      <window.Group header="Destino">
        <window.FSelect label="Imóvel" display={window.imovelName(imovel)} onClick={() => setPick('imovel')} />
        <window.FSelect label="Tipo de projeto" display={window.DISC_META[disc].name} onClick={() => setPick('disc')} />
        <window.FSelect label="Tipo" display={kind === 'asbuilt' ? 'Como foi construído' : 'Projetado'} onClick={() => setPick('kind')} last />
      </window.Group>
    </window.Sheet>
    {/* pickers como irmãos do sheet: nunca cortados pelo scroll interno */}
    <window.Picker open={pick === 'imovel'} onClose={() => setPick(null)} title="Imóvel" value={imovel} onPick={setImovel} options={window.ADM_IMOVEIS.map(i => ({ v: i.id, l: i.identifier, sub: window.empName(i.emp) }))} />
    <window.Picker open={pick === 'disc'} onClose={() => setPick(null)} title="Tipo de projeto" value={disc} onPick={setDisc} options={[{ v: 'hidro', l: 'Hidrossanitário' }, { v: 'eletr', l: 'Elétrico' }, { v: 'estru', l: 'Estrutural' }]} />
    <window.Picker open={pick === 'kind'} onClose={() => setPick(null)} title="Tipo" value={kind} onPick={setKind} options={[{ v: 'asbuilt', l: 'Como foi construído', sub: 'Visível ao morador' }, { v: 'projeto', l: 'Projetado', sub: 'Restrito a engenheiro/admin' }]} />
    </>
  );
}

/* ───────── PLANTA (form/detail) ───────── */
function MPlantaForm({ planta, pop, toast, push }) {
  const p = planta;
  const [name, setName] = React.useState(p.name);
  const [version, setVersion] = React.useState(p.version);
  const [kind, setKind] = React.useState(p.kind);
  const [minRole, setMinRole] = React.useState(p.kind === 'projeto' ? 'engenheiro' : 'morador');
  const [marker, setMarker] = React.useState(p.marker);
  const [pick, setPick] = React.useState(null);
  const [showTag, setShowTag] = React.useState(false);
  const save = () => { toast('Planta atualizada.'); pop(); };
  const genMarker = () => { setMarker({ family: 'tag36h11', code: window.nextTagCode(), size: '16,0', location: '' }); toast('Marcador gerado.'); };
  const setLoc = (v) => setMarker(m => ({ ...m, location: v }));
  const viewAR = () => push({
    key: 'camera', typeId: p.disc,
    plant: { ...p, name, tag: marker ? `${marker.family} · id ${marker.code}` : 'tag36h11',
      file: `${p.imovel}_${p.disc}_${p.kind}.${p.format.toLowerCase()}` },
  });
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
        <window.Row icon={<window.MIc.scan s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)"
          title="Visualizar em AR" sub="Abrir câmera e ancorar o modelo pelo marcador" last onClick={viewAR} />
      </window.Group>
      <window.Group header="Modelo">
        <window.FInput label="Nome" value={name} onChange={setName} />
        <window.FInput label="Versão" value={version} onChange={setVersion} />
        <window.FSelect label="Formato" display={p.format.toUpperCase() + (p.size !== '—' ? ' · ' + p.size : '')} onClick={() => {}} last />
      </window.Group>
      <window.Group header="Acesso" footer="“Projetado” normalmente fica restrito a Engenheiro/Admin. O morador só vê o as-built.">
        <window.FSelect label="Tipo" display={kind === 'asbuilt' ? 'Como foi construído' : 'Projetado'} onClick={() => setPick('kind')} />
        <window.FSelect label="Papel mínimo" display={window.ROLE_BADGE[minRole].label} onClick={() => setPick('role')} last />
      </window.Group>

      {/* Marcador de ancoragem */}
      {marker ? (
        <window.Group header="Marcador de ancoragem" footer="Família e ID são gerados pelo sistema e impressos no marcador; a câmera os lê automaticamente. O tamanho impresso é essencial para escalar o modelo.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderBottom: '1px solid #F1F3F6' }}>
            <TagGlyph size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>id {marker.code}</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{marker.family}</div>
            </div>
            <window.Badge color="var(--slate)" bg="#EEF1F5">Gerado pelo sistema</window.Badge>
          </div>
          <window.FInput label="Localização" value={marker.location} onChange={setLoc} placeholder="Hall hidráulico, parede norte" />
          <window.FSelect label="Tamanho impresso" display={`${marker.size} cm`} onClick={() => setPick('size')} />
          <window.Row icon={<window.MIc.download s={18} />} iconBg="var(--orange-100)" iconColor="var(--orange-600)" title="Baixar marcador para impressão" sub="PDF · pronto para colar no ambiente" last onClick={() => setShowTag(true)} />
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
        <window.Row icon={<window.MIc.cube s={18} />} title="Baixar modelo" onClick={() => toast('Baixando modelo…')} />
        <window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover planta" danger last onClick={() => { toast('Planta removida.'); pop(); }} />
      </window.Group>
      <window.Picker open={pick === 'kind'} onClose={() => setPick(null)} title="Tipo" value={kind} onPick={setKind} options={[{ v: 'asbuilt', l: 'Como foi construído' }, { v: 'projeto', l: 'Projetado' }]} />
      <window.Picker open={pick === 'role'} onClose={() => setPick(null)} title="Papel mínimo" value={minRole} onPick={setMinRole} options={[{ v: 'morador', l: 'Morador (e acima)' }, { v: 'engenheiro', l: 'Engenheiro (e acima)' }, { v: 'admin', l: 'Apenas Admin' }]} />
      {marker && <window.Picker open={pick === 'size'} onClose={() => setPick(null)} title="Tamanho impresso" value={marker.size} onPick={(v) => setMarker(m => ({ ...m, size: v }))} options={[{ v: '10,0', l: '10 cm' }, { v: '16,0', l: '16 cm (padrão)' }, { v: '20,0', l: '20 cm' }, { v: '30,0', l: '30 cm' }]} />}
      {marker && <TagSheet open={showTag} onClose={() => setShowTag(false)} marker={marker} planta={p} toast={toast} />}
    </window.Page>
  );
}

/* sheet to preview / “print” the generated marker */
function TagSheet({ open, onClose, marker, planta, toast }) {
  return (
    <window.Sheet open={open} onClose={onClose} title="Marcador para impressão"
      footer={<><window.Action variant="ghost" onClick={onClose}>Fechar</window.Action><window.Action icon={<window.MIc.download s={18} />} onClick={() => { toast('Baixando PDF do marcador…'); onClose(); }}>Baixar PDF</window.Action></>}>
      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <TagGlyph size={150} />
        </div>
        <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>id {marker.code} · {marker.family}</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4, textAlign: 'center', padding: '0 24px', lineHeight: 1.45 }}>
          Imprima em <b>{marker.size} cm</b> e cole {marker.location ? <>em <b>{marker.location.toLowerCase()}</b></> : 'no local definido'}. Não redimensione ao imprimir.
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
  const rows = window.ADM_EMP.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <window.Page title="Empreendim." sub="3 obras" onBack={{ label: 'Mais', fn: pop }}
      right={<window.NavBtn icon={<window.MIc.plus s={20} />} accent label="Novo" onClick={() => push({ key: 'empForm' })} />}>
      <window.Search value={q} onChange={setQ} placeholder="Buscar empreendimento" />
      <div style={{ padding: '0 16px' }}>
        {rows.map(e => (
          <div key={e.id} className="tap" onClick={() => push({ key: 'empForm', emp: e })} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #ECEEF1', marginBottom: 13, cursor: 'pointer' }}>
            <div style={{ height: 64, background: `linear-gradient(135deg,${e.cover},var(--navy-900))`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: .4, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
              <div style={{ position: 'absolute', top: 10, right: 12 }}><window.SPill s={e.status} /></div>
            </div>
            <div style={{ padding: '13px 16px 15px' }}>
              <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--ink)' }}>{e.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 2 }}>{e.address}</div>
              <div style={{ display: 'flex', gap: 18, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                {[['Construtora', window.construtoraName(e.construtora)], ['Unidades', e.units], ['Local', `${e.city}/${e.state}`]].map(([l, v]) => (
                  <div key={l}><div className="mono" style={{ fontSize: 9, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--slate-300)' }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </window.Page>
  );
}

/* ───────── EMPREENDIMENTO (form) ───────── */
function MEmpForm({ emp, pop, toast, push }) {
  const isNew = !emp;
  const [name, setName] = React.useState(emp ? emp.name : '');
  const [construtora, setConstrutora] = React.useState(emp ? emp.construtora : 'c1');
  const [address, setAddress] = React.useState(emp ? emp.address : '');
  const [estado, setEstado] = React.useState(emp ? emp.state : 'PR');
  const [city, setCity] = React.useState(emp ? emp.city : '');
  const [status, setStatus] = React.useState(emp ? emp.status : 'construction');
  const [pick, setPick] = React.useState(null);
  const setEstadoReset = (uf) => { setEstado(uf); if (!window.cidadesDe(uf).includes(city)) setCity(''); };
  const save = () => { toast(isNew ? 'Empreendimento criado.' : 'Empreendimento salvo.'); pop(); };
  return (
    <window.Page large={false} title={isNew ? 'Novo' : 'Editar'} onBack={{ label: 'Empreendim.', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      <window.Group header="Dados">
        <window.FInput label="Nome" value={name} onChange={setName} placeholder="Residencial Aurora" />
        <window.FSelect label="Construtora" display={window.construtoraName(construtora)} onClick={() => setPick('construtora')} last />
      </window.Group>
      <window.Group header="Localização">
        <window.FInput label="Endereço" value={address} onChange={setAddress} placeholder="Rua, número, bairro" />
        <window.FSelect label="Estado" display={estado} onClick={() => setPick('estado')} />
        <window.FSelect label="Cidade" display={city || 'Selecionar'} onClick={() => setPick('cidade')} last />
      </window.Group>
      <window.Group header="Situação">
        <window.FSelect label="Status" display={window.ADM_STATUS[status].label} onClick={() => setPick('status')} last />
      </window.Group>
      {!isNew && <window.Group><window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover empreendimento" danger last onClick={() => { toast('Empreendimento removido.'); pop(); }} /></window.Group>}
      <window.Picker open={pick === 'construtora'} onClose={() => setPick(null)} title="Construtora" value={construtora} onPick={setConstrutora} options={window.ADM_CONSTRUTORAS.map(c => ({ v: c.id, l: c.name, sub: c.cnpj }))} />
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
            value={`${c.emps} ${c.emps === 1 ? 'obra' : 'obras'}`} chevron />
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
  const setEstadoReset = (uf) => { setEstado(uf); if (!window.cidadesDe(uf).includes(city)) setCity(''); };
  const save = () => { toast(isNew ? 'Construtora cadastrada.' : 'Construtora salva.'); pop(); };
  return (
    <window.Page large={false} title={isNew ? 'Nova construtora' : 'Editar'} onBack={{ label: 'Construtoras', fn: pop }}
      right={<button className="tap" onClick={save} style={{ background: 'none', border: 0, color: 'var(--orange-600)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>{isNew ? 'Criar' : 'Salvar'}</button>}>
      <window.Group header="Dados">
        <window.FInput label="Nome" value={name} onChange={setName} placeholder="Construtora Teste" />
        <window.FInput label="CNPJ" value={cnpj} onChange={setCnpj} placeholder="00.000.000/0001-00" last />
      </window.Group>
      <window.Group header="Localização">
        <window.FSelect label="Estado" display={estado} onClick={() => setPick('estado')} />
        <window.FSelect label="Cidade" display={city || 'Selecionar'} onClick={() => setPick('cidade')} last />
      </window.Group>
      {!isNew && <window.Group><window.Row icon={<window.MIc.trash s={18} />} iconBg="var(--red-100)" iconColor="var(--red)" title="Remover construtora" danger last onClick={() => { toast('Construtora removida.'); pop(); }} /></window.Group>}
      <window.Picker open={pick === 'estado'} onClose={() => setPick(null)} title="Estado" value={estado} onPick={setEstadoReset} options={window.ESTADOS.map(uf => ({ v: uf, l: uf }))} />
      <window.Picker open={pick === 'cidade'} onClose={() => setPick(null)} title="Cidade" value={city} onPick={setCity} options={window.cidadesDe(estado).map(c => ({ v: c, l: c }))} />
    </window.Page>
  );
}

Object.assign(window, { TagGlyph, MPlantas, MPlantaForm, MEmpList, MEmpForm, MConstrutoraList, MConstrutoraForm });
