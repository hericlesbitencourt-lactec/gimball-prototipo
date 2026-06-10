// admin-data.jsx - mock rows for the Gimball admin

/* ════════════════════════════════════════════════════════════
   LISTAS SELECIONÁVEIS (sem tabelas extras, apenas constantes)
   ════════════════════════════════════════════════════════════ */
const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const CIDADES = {
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
  SP: ['São Paulo', 'Campinas', 'Santos', 'Guarulhos', 'Ribeirão Preto', 'São José dos Campos'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Itajaí', 'Balneário Camboriú', 'Chapecó'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Nova Iguaçu', 'Campos dos Goytacazes'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Contagem', 'Betim'],
};
const cidadesDe = (uf) => CIDADES[uf] || [];

/* ════════════════════════════════════════════════════════════
   MOCK ROWS
   ════════════════════════════════════════════════════════════ */
const ADM_CONSTRUTORAS = [
  { id: 'c1', name: 'Construtora Teste', cnpj: '12.345.678/0001-90', city: 'Curitiba', state: 'PR', emps: 2 },
  { id: 'c2', name: 'Incorporadora Lume', cnpj: '98.765.432/0001-10', city: 'Curitiba', state: 'PR', emps: 1 },
  { id: 'c3', name: 'MRV Engenharia', cnpj: '01.234.567/0001-55', city: 'Belo Horizonte', state: 'MG', emps: 0 },
];
const construtoraName = (id) => (ADM_CONSTRUTORAS.find(c => c.id === id) || {}).name || '—';
const ADM_ROLES = [
  { id: 'r-adm', slug: 'admin', name: 'Administrador', is_system: true, desc: 'Acesso total ao painel e a todas as plantas.', users: 2 },
  { id: 'r-eng', slug: 'engenheiro', name: 'Engenheiro', is_system: true, desc: 'Gerencia plantas e enxerga “Projetado” + “As-built”.', users: 4 },
  { id: 'r-mor', slug: 'morador', name: 'Morador', is_system: true, desc: 'App AR. Enxerga apenas “As-built” dos próprios imóveis.', users: 128 },
];

const PERM_MODULES = [
  { module: 'Usuários', perms: [
    { code: 'users.view', desc: 'Listar usuários' },
    { code: 'users.manage', desc: 'Criar, editar e remover usuários' },
    { code: 'roles.manage', desc: 'Gerir papéis e permissões' },
  ]},
  { module: 'Imóveis', perms: [
    { code: 'construtoras.manage', desc: 'Gerir construtoras' },
    { code: 'empreendimentos.manage', desc: 'Gerir empreendimentos' },
    { code: 'imoveis.manage', desc: 'Gerir imóveis/unidades' },
    { code: 'vinculos.manage', desc: 'Vincular moradores a imóveis' },
  ]},
  { module: 'Plantas', perms: [
    { code: 'plantas.upload', desc: 'Enviar e versionar modelos 3D' },
    { code: 'plantas.view_asbuilt', desc: 'Visualizar “Como foi construído”' },
    { code: 'plantas.view_projeto', desc: 'Visualizar “Projetado”' },
    { code: 'plantas.marker', desc: 'Gerar marcador de ancoragem da planta' },
  ]},
  { module: 'Auditoria', perms: [
    { code: 'logs.view', desc: 'Consultar trilha de auditoria' },
  ]},
];
// permission matrix: which roles hold each code
const PERM_MATRIX = {
  'users.view':            ['admin'],
  'users.manage':          ['admin'],
  'roles.manage':          ['admin'],
  'construtoras.manage':   ['admin'],
  'empreendimentos.manage':['admin'],
  'imoveis.manage':        ['admin', 'engenheiro'],
  'vinculos.manage':       ['admin', 'engenheiro'],
  'plantas.upload':        ['admin', 'engenheiro'],
  'plantas.view_asbuilt':  ['admin', 'engenheiro', 'morador'],
  'plantas.view_projeto':  ['admin', 'engenheiro'],
  'plantas.marker':        ['admin', 'engenheiro'],
  'logs.view':             ['admin'],
};

const ADM_USERS = [
  { id: 'u1', name: 'Marina Alves', email: 'marina.alves@email.com', role: 'morador', status: 'active', phone: '(41) 99812-4477', last: 'há 2 h', units: 3, initials: 'MA' },
  { id: 'u2', name: 'Rafael Nogueira', email: 'rafael.eng@gimball.com.br', role: 'engenheiro', status: 'active', phone: '(41) 99654-1180', last: 'há 38 min', units: 12, initials: 'RN' },
  { id: 'u3', name: 'Carla Bittencourt', email: 'carla.admin@gimball.com.br', role: 'admin', status: 'active', phone: '(41) 99300-7781', last: 'agora', units: 0, initials: 'CB' },
  { id: 'u4', name: 'Diego Prestes', email: 'diego.prestes@email.com', role: 'morador', status: 'inactive', phone: '—', last: 'nunca', units: 1, initials: 'DP' },
  { id: 'u5', name: 'Helena Souza', email: 'helena.eng@gimball.com.br', role: 'engenheiro', status: 'active', phone: '(41) 99771-2204', last: 'há 1 dia', units: 8, initials: 'HS' },
  { id: 'u6', name: 'Paulo Andrade', email: 'paulo.andrade@email.com', role: 'morador', status: 'inactive', phone: '(41) 99102-9930', last: 'há 21 dias', units: 1, initials: 'PA' },
  { id: 'u7', name: 'Luana Martins', email: 'luana.admin@gimball.com.br', role: 'admin', status: 'active', phone: '(41) 99888-0021', last: 'há 5 h', units: 0, initials: 'LM' },
  { id: 'u8', name: 'Bruno Tavares', email: 'bruno.tavares@email.com', role: 'morador', status: 'active', phone: '(41) 99450-7712', last: 'há 3 dias', units: 2, initials: 'BT' },
];

const ADM_EMP = [
  { id: 'e1', name: 'Residencial Aurora', construtora: 'c1', city: 'Curitiba', state: 'PR', status: 'delivered', delivery: 'mar/2024', units: 96, address: 'Av. Sete de Setembro, 3400, Batel', cover: '#1d3a5f' },
  { id: 'e2', name: 'Edifício Pátio Cabral', construtora: 'c1', city: 'Curitiba', state: 'PR', status: 'construction', delivery: 'dez/2026', units: 48, address: 'R. Mateus Leme, 1820, São Lourenço', cover: '#27506e' },
  { id: 'e3', name: 'Condomínio Vista Verde', construtora: 'c2', city: 'Curitiba', state: 'PR', status: 'delivered', delivery: 'ago/2023', units: 22, address: 'Al. Pres. Taunay, 920, Bigorrilho', cover: '#21405c' },
];

const ADM_IMOVEIS = [
  { id: 'i1', emp: 'e1', identifier: 'Torre B · Apto 1204', floor: 12, area: '92,0', typology: '3 dorm', status: 'delivered', plantas: 6, tags: 3 },
  { id: 'i2', emp: 'e1', identifier: 'Torre A · Apto 0703', floor: 7, area: '78,5', typology: '2 dorm', status: 'delivered', plantas: 6, tags: 3 },
  { id: 'i3', emp: 'e2', identifier: 'Unidade 802', floor: 8, area: '74,0', typology: '2 dorm', status: 'construction', plantas: 5, tags: 2 },
  { id: 'i4', emp: 'e2', identifier: 'Unidade 1101', floor: 11, area: '88,0', typology: '3 dorm', status: 'construction', plantas: 4, tags: 2 },
  { id: 'i5', emp: 'e3', identifier: 'Casa 14', floor: 0, area: '138,0', typology: '4 dorm', status: 'delivered', plantas: 5, tags: 4 },
];

const ADM_PLANTAS = [
  { id: 'p1', imovel: 'i1', disc: 'hidro', kind: 'asbuilt', name: 'Hidrossanitário · Pavimento tipo', version: 'v2.1', format: 'usdz', size: '18,4 MB', status: 'available', updated: '12/03/2024', by: 'Rafael N.',
    marker: { family: 'tag36h11', code: 21, size: '16,0', location: 'Hall hidráulico, parede norte' } },
  { id: 'p2', imovel: 'i1', disc: 'hidro', kind: 'projeto', name: 'Hidrossanitário · Projeto executivo', version: 'v1.0', format: 'usdz', size: '15,1 MB', status: 'available', updated: '04/01/2024', by: 'Rafael N.',
    marker: { family: 'tag36h11', code: 22, size: '16,0', location: 'Hall hidráulico, parede norte' } },
  { id: 'p3', imovel: 'i1', disc: 'eletr', kind: 'asbuilt', name: 'Elétrico · Pavimento tipo', version: 'v1.3', format: 'usdz', size: '12,7 MB', status: 'available', updated: '12/03/2024', by: 'Helena S.',
    marker: { family: 'tag36h11', code: 47, size: '16,0', location: 'Quadro elétrico, corredor' } },
  { id: 'p4', imovel: 'i1', disc: 'estru', kind: 'asbuilt', name: 'Estrutural · Pavimento tipo', version: 'v1.0', format: 'glb', size: '22,9 MB', status: 'available', updated: '28/02/2024', by: 'Rafael N.',
    marker: { family: 'tag36h11', code: 73, size: '20,0', location: 'Pilar P3, sala' } },
  { id: 'p5', imovel: 'i3', disc: 'estru', kind: 'asbuilt', name: 'Estrutural · Pavimento tipo', version: '—', format: 'usdz', size: '—', status: 'pending', updated: '—', by: '—',
    marker: null },
  { id: 'p6', imovel: 'i3', disc: 'hidro', kind: 'projeto', name: 'Hidrossanitário · Projeto executivo', version: 'v0.9', format: 'usdz', size: '14,2 MB', status: 'available', updated: '28/04/2026', by: 'Helena S.',
    marker: { family: 'tag36h11', code: 31, size: '16,0', location: 'Shaft, área de serviço' } },
  { id: 'p7', imovel: 'i5', disc: 'estru', kind: 'asbuilt', name: 'Estrutural · Térreo', version: '—', format: 'usdz', size: '—', status: 'pending', updated: '—', by: '—',
    marker: null },
];

// próximo id livre na família (mock, o sistema atribuiria isso no backend)
let _nextTagCode = 90;
const nextTagCode = () => _nextTagCode++;

const DISC_META = {
  hidro: { name: 'Hidrossanitário', tint: '#2C7BB0', bg: '#E6F1F8' },
  eletr: { name: 'Elétrico', tint: '#C98A1E', bg: '#FAF0DA' },
  estru: { name: 'Estrutural', tint: '#5A6675', bg: '#ECEEF1' },
};
const ADM_STATUS = {
  active:       { label: 'Ativo', color: 'var(--green)', bg: 'var(--green-100)' },
  inactive:     { label: 'Inativo', color: 'var(--slate)', bg: '#EEF1F5' },
  delivered:    { label: 'Entregue', color: 'var(--green)', bg: 'var(--green-100)' },
  construction: { label: 'Em obra', color: 'var(--amber)', bg: 'var(--amber-100)' },
  planning:     { label: 'Planejamento', color: 'var(--slate)', bg: '#EEF1F5' },
  available:    { label: 'Disponível', color: 'var(--green)', bg: 'var(--green-100)' },
  pending:      { label: 'Pendente', color: 'var(--amber)', bg: 'var(--amber-100)' },
};
const ROLE_BADGE = {
  admin:      { label: 'Administrador', color: '#7A4FB0', bg: '#EFE8F8' },
  engenheiro: { label: 'Engenheiro', color: '#C98A1E', bg: '#FAF0DA' },
  morador:    { label: 'Morador', color: '#2C7BB0', bg: '#E6F1F8' },
};

const empName = (id) => (ADM_EMP.find(e => e.id === id) || {}).name || '—';
const imovelName = (id) => (ADM_IMOVEIS.find(i => i.id === id) || {}).identifier || '—';

Object.assign(window, {
  ESTADOS, CIDADES, cidadesDe, ADM_CONSTRUTORAS, construtoraName,
  ADM_ROLES, PERM_MODULES, PERM_MATRIX,
  ADM_USERS, ADM_EMP, ADM_IMOVEIS, ADM_PLANTAS, nextTagCode,
  DISC_META, ADM_STATUS, ROLE_BADGE, empName, imovelName,
});
