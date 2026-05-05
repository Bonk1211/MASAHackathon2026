import { NavLink } from 'react-router-dom';

type Tab = { to: string; code: string; label: string; tag?: string };
type Section = { name: string; tabs: Tab[] };

const SECTIONS: Section[] = [
  {
    name: 'Frame',
    tabs: [
      { to: '/',           code: '01', label: 'Story',      tag: 'Front page' },
    ],
  },
  {
    name: 'Evidence',
    tabs: [
      { to: '/model',      code: '02', label: 'Model',      tag: 'Forecast' },
      { to: '/diagnostic', code: '03', label: 'Diagnostic', tag: 'Sign-flips' },
      { to: '/hotspots',   code: '04', label: 'Hot Spots',  tag: 'VN vs PH' },
      { to: '/sectoral',   code: '05', label: 'Sectoral',   tag: '10 × 8 heatmap' },
      { to: '/compare',    code: '06', label: 'Compare',    tag: 'Side-by-side' },
    ],
  },
  {
    name: 'Pricing',
    tabs: [
      { to: '/stress',     code: '07', label: 'Stress',     tag: 'NGFS · ε live' },
      { to: '/cedent',     code: '08', label: 'Cedent',     tag: 'Composite tier' },
    ],
  },
  {
    name: 'Delivery',
    tabs: [
      { to: '/actions',    code: '09', label: 'Actions',    tag: 'Four recs' },
      { to: '/brief',      code: '10', label: 'Brief',      tag: 'Memo export' },
      { to: '/evidence',   code: '11', label: 'Evidence',   tag: 'Trace-back' },
    ],
  },
];

export function Sidebar() {
  return (
    <aside
      aria-label="Sections"
      className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-rule lg:bg-paper/70 lg:px-5 lg:py-7"
    >
      {/* Masthead */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="display text-[26px] leading-none text-ink">R</span>
          <span aria-hidden="true" className="h-[18px] w-[1px] bg-rule-strong" />
          <span className="display italic text-[26px] leading-none text-ink">Ignite</span>
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          SEA Climate Risk · 2026
        </p>
        <div className="mt-3 flex items-center gap-2 border-t border-rule pt-3">
          <span className="font-mono text-[9px] uppercase tracking-eyebrow text-muted">
            Hannover Re
          </span>
          <span className="h-[1px] flex-1 bg-rule" />
          <span className="font-mono text-[9px] uppercase tracking-eyebrow text-muted">
            Strategic
          </span>
        </div>
      </div>

      {/* Sections */}
      <nav className="mt-6 flex-1 overflow-y-auto no-scrollbar">
        {SECTIONS.map((s) => (
          <div key={s.name} className="mb-5 last:mb-0">
            <p className="eyebrow text-muted">{s.name}</p>
            <ul className="mt-2 space-y-px">
              {s.tabs.map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.to === '/'}
                    className={({ isActive }) =>
                      [
                        'group grid grid-cols-[28px_1fr] items-baseline gap-2 px-2 py-2 transition',
                        isActive ? 'bg-ink text-paper' : 'text-ink hover:bg-ink/[0.04]',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={['font-mono text-[10px] tab-num', isActive ? 'text-paper/80' : 'text-muted'].join(' ')}>
                          {t.code}
                        </span>
                        <span className="flex flex-col leading-tight">
                          <span className="text-[13px]">{t.label}</span>
                          {t.tag && (
                            <span
                              className={[
                                'mt-0.5 text-[10px]',
                                isActive ? 'text-paper/60' : 'text-muted',
                              ].join(' ')}
                            >
                              {t.tag}
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <footer className="border-t border-rule pt-4">
        <p className="font-mono text-[9px] uppercase tracking-eyebrow text-muted">
          Folio 2026/05 · MASA Grand Final
        </p>
        <p className="mt-1 font-mono text-[9px] tab-num text-muted">
          Pipeline · Python v1.0 · Seed 2026
        </p>
      </footer>
    </aside>
  );
}
