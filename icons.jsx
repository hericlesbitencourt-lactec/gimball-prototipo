// icons.jsx — line icon set (stroke = currentColor). Keep geometry simple.

const S = (p) => ({ fill: 'none', stroke: 'currentColor', strokeWidth: p.w || 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round' });

function Svg({ s = 24, vb = 24, children, style }) {
  return <svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`} style={style}>{children}</svg>;
}

/* ── project types ─────────────────────────── */
const IcHidro = ({ s, w }) => (
  <Svg s={s}><g {...S({ w })}>
    <path d="M12 3.2C12 3.2 6 9.6 6 14.2a6 6 0 0 0 12 0C18 9.6 12 3.2 12 3.2Z"/>
    <path d="M9.4 14.4a2.6 2.6 0 0 0 2.6 2.6"/>
  </g></Svg>
);
const IcEletr = ({ s, w }) => (
  <Svg s={s}><g {...S({ w })}>
    <path d="M13.2 2.5 5.5 13.2h5.1l-1.2 8.3 7.7-10.9h-5.1l1.2-8.1Z"/>
  </g></Svg>
);
const IcEstru = ({ s, w }) => (
  <Svg s={s}><g {...S({ w })}>
    <path d="M4 5h16M4 19h16"/>
    <path d="M8 5v14M16 5v14"/>
    <path d="M8 12h8"/>
  </g></Svg>
);
const PROJ_ICON = { hidro: IcHidro, eletr: IcEletr, estru: IcEstru };
const ProjIcon = ({ id, s = 24, w }) => { const C = PROJ_ICON[id]; return C ? <C s={s} w={w} /> : null; };

/* ── ui / controls ─────────────────────────── */
const IcChevL  = ({ s = 24, w }) => <Svg s={s}><path {...S({ w })} d="M15 5l-7 7 7 7"/></Svg>;
const IcChevR  = ({ s = 24, w }) => <Svg s={s}><path {...S({ w })} d="M9 5l7 7-7 7"/></Svg>;
const IcClose  = ({ s = 24, w }) => <Svg s={s}><path {...S({ w })} d="M6 6l12 12M18 6L6 18"/></Svg>;
const IcCheck  = ({ s = 24, w }) => <Svg s={s}><path {...S({ w })} d="M4 12.5l5 5 11-12"/></Svg>;
const IcDownload = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 3v12"/><path d="M7 10.5l5 5 5-5"/><path d="M4 20h16"/></g></Svg>;
const IcEye    = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></g></Svg>;
const IcEyeOff = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M3 3l18 18"/><path d="M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-3 3.6"/><path d="M6.3 7.9A15.7 15.7 0 0 0 2.5 12S6 18 12 18a9 9 0 0 0 3.6-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></g></Svg>;
const IcMove   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/></g></Svg>;
const IcReset  = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M4 12a8 8 0 1 1 2.5 5.8"/><path d="M3.5 19.5l1-4.2 4.2 1"/></g></Svg>;
const IcLayers = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13l9 5 9-5"/></g></Svg>;
const IcOpacity= ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 6.5l5.5 3M12 10l6 3.4M12 13.5l4.8 2.8M12 17l2.5 1.5" opacity=".9"/></g></Svg>;
const IcHelp   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.2-2.6 4"/><path d="M12 17.4h.01"/></g></Svg>;
const IcLock   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></g></Svg>;
const IcDoc    = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v4h4"/></g></Svg>;
const IcCube   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 2.8 3.5 7.4v9.2L12 21.2l8.5-4.6V7.4L12 2.8Z"/><path d="M3.5 7.4 12 12l8.5-4.6M12 12v9.2"/></g></Svg>;
const IcScan   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/></g></Svg>;
const IcGrid   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/></g></Svg>;
const IcMapPin = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></g></Svg>;
const IcLogout = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M9 8l-4 4 4 4M5 12h10"/></g></Svg>;
const IcWifi   = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M5 9.5a10 10 0 0 1 14 0M7.5 13a6.4 6.4 0 0 1 9 0M10 16.4a2.6 2.6 0 0 1 4 0"/><path d="M12 20h.01"/></g></Svg>;
const IcAlert  = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v5M12 18h.01"/></g></Svg>;
const IcInbox  = ({ s = 24, w }) => <Svg s={s}><g {...S({ w })}><path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z"/><path d="M3 13h5a2 2 0 0 0 4 0 2 2 0 0 0 4 0h5"/></g></Svg>;

Object.assign(window, {
  ProjIcon, IcHidro, IcEletr, IcEstru,
  IcChevL, IcChevR, IcClose, IcCheck, IcDownload, IcEye, IcEyeOff, IcMove, IcReset,
  IcLayers, IcOpacity, IcHelp, IcLock, IcDoc, IcCube, IcScan, IcGrid, IcMapPin,
  IcLogout, IcWifi, IcAlert, IcInbox,
});
