// data.jsx - mock domain data for the Gimball AR prototype (fluxo morador)

const USER = { name: 'Marina Alves', first: 'Marina', role: 'Morador', initials: 'MA' };

// project type meta
const PROJ_TYPES = [
  { id: 'hidro',  name: 'Hidrossanitário', sub: 'Água, esgoto e drenagem',  tint: '#2C7BB0', tintBg: '#E6F1F8' },
  { id: 'eletr',  name: 'Elétrico',         sub: 'Energia, tomadas e quadros', tint: '#C98A1E', tintBg: '#FAF0DA' },
  { id: 'estru',  name: 'Estrutural',       sub: 'Pilares, vigas e lajes',     tint: '#5A6675', tintBg: '#ECEEF1' },
];
const projType = (id) => PROJ_TYPES.find(p => p.id === id);

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

// Unit and plan records are shared by both profiles through demo-state.js.
Object.assign(window, { USER, PROJ_TYPES, projType, STATUS, PSTATUS, KIND });
