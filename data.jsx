// data.jsx - mock domain data for the Gimball AR prototype (fluxo morador)

const USER = { name: 'Marina Alves', first: 'Marina', role: 'Morador', initials: 'MA' };

// project type meta
const PROJ_TYPES = [
  { id: 'hidro',  name: 'Hidrossanitário', sub: 'Água, esgoto e drenagem',  tint: '#2C7BB0', tintBg: '#E6F1F8' },
  { id: 'eletr',  name: 'Elétrico',         sub: 'Energia, tomadas e quadros', tint: '#C98A1E', tintBg: '#FAF0DA' },
  { id: 'estru',  name: 'Estrutural',       sub: 'Pilares, vigas e lajes',     tint: '#5A6675', tintBg: '#ECEEF1' },
];
const projType = (id) => PROJ_TYPES.find(p => p.id === id);

// imóveis / unidades do morador
const PROPERTIES = [
  {
    id: 'aurora', name: 'Residencial Aurora', unit: 'Torre B · Apto 1204',
    address: 'Av. Sete de Setembro, 3400, Batel, Curitiba/PR',
    status: 'entregue', area: '92 m²', delivered: 'mar/2024', cover: '#1d3a5f',
    counts: { hidro: 2, eletr: 2, estru: 2 },
  },
  {
    id: 'patio', name: 'Edifício Pátio Cabral', unit: 'Unidade 802',
    address: 'R. Mateus Leme, 1820, São Lourenço, Curitiba/PR',
    status: 'obra', area: '74 m²', delivered: 'previsto dez/2026', cover: '#27506e',
    counts: { hidro: 2, eletr: 1, estru: 2 },
  },
  {
    id: 'vista', name: 'Condomínio Vista Verde', unit: 'Casa 14',
    address: 'Al. Pres. Taunay, 920, Bigorrilho, Curitiba/PR',
    status: 'entregue', area: '138 m²', delivered: 'ago/2023', cover: '#21405c',
    counts: { hidro: 2, eletr: 2, estru: 1 },
  },
];
const property = (id) => PROPERTIES.find(p => p.id === id);

const STATUS = {
  entregue: { label: 'Entregue',  color: 'var(--green)', bg: 'var(--green-100)' },
  obra:     { label: 'Em obra',   color: 'var(--amber)', bg: 'var(--amber-100)' },
};

// plant status
const PSTATUS = {
  disponivel:  { label: 'Disponível',  color: 'var(--green)', bg: 'var(--green-100)' },
  pendente:    { label: 'Pendente',    color: 'var(--amber)', bg: 'var(--amber-100)' },
  indisponivel:{ label: 'Indisponível',color: 'var(--red)',   bg: 'var(--red-100)' },
};

// plant kinds
const KIND = {
  asbuilt: { label: 'Como foi construído', short: 'As built', desc: 'Versão final, conforme executado na obra.' },
  proj:    { label: 'Projetado',           short: 'Projeto',  desc: 'Versão planejada original do projeto.' },
};

// plantas por imóvel + tipo de projeto.
// kind 'proj' fica bloqueado para o morador (sem permissão).
function plantsFor(propId, typeId) {
  const seedDate = { aurora: '12/03/2024', patio: '28/04/2026', vista: '02/08/2023' }[propId] || '10/01/2024';
  const tagBase = { hidro: 21, eletr: 47, estru: 73 }[typeId];
  const base = [
    {
      id: `${propId}-${typeId}-ab`, kind: 'asbuilt', status: 'disponivel',
      name: `${projType(typeId).name} · Pavimento tipo`,
      file: `${propId}_${typeId}_asbuilt.usdz`, size: '18,4 MB',
      updated: seedDate, tag: `tag36h11 · id ${tagBase}`, tagSize: '16 cm',
    },
    {
      id: `${propId}-${typeId}-pr`, kind: 'proj', status: 'disponivel', locked: true,
      name: `${projType(typeId).name} · Projeto executivo`,
      file: `${propId}_${typeId}_proj.usdz`, size: '15,1 MB',
      updated: seedDate, tag: `tag36h11 · id ${tagBase + 1}`, tagSize: '16 cm',
    },
  ];
  // Pátio Cabral (em obra): as-built do estrutural ainda pendente
  if (propId === 'patio' && typeId === 'estru') base[0].status = 'pendente';
  // Vista Verde estrutural as-built indisponível (exemplo)
  if (propId === 'vista' && typeId === 'estru') base[0].status = 'indisponivel';
  return base;
}

Object.assign(window, {
  USER, PROJ_TYPES, projType, PROPERTIES, property,
  STATUS, PSTATUS, KIND, plantsFor,
});
