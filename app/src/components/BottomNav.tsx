import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

type Tab = { to: string; label: string; code: string; group: 'frame' | 'evidence' | 'price' | 'output' };

const PRIMARY: Tab[] = [
  { to: '/',            label: 'Story',      code: '01', group: 'frame' },
  { to: '/diagnostic',  label: 'Diagnostic', code: '03', group: 'evidence' },
  { to: '/stress',      label: 'Stress',     code: '07', group: 'price' },
  { to: '/cedent',      label: 'Cedent',     code: '08', group: 'price' },
];

const OVERFLOW: Tab[] = [
  { to: '/model',     label: 'Model',     code: '02', group: 'evidence' },
  { to: '/hotspots',  label: 'Hot Spots', code: '04', group: 'evidence' },
  { to: '/sectoral',  label: 'Sectoral',  code: '05', group: 'evidence' },
  { to: '/compare',   label: 'Compare',   code: '06', group: 'evidence' },
  { to: '/actions',   label: 'Actions',   code: '09', group: 'output' },
  { to: '/brief',     label: 'Brief',     code: '10', group: 'output' },
  { to: '/evidence',  label: 'Evidence',  code: '11', group: 'output' },
];

export function BottomNav() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const overflowActive = OVERFLOW.some((t) => t.to === loc.pathname);

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px]"
        />
      )}
      {open && (
        <div
          ref={sheetRef}
          role="dialog"
          aria-label="More screens"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-app rounded-t-[18px] border-t border-rule bg-paper px-5 pb-8 pt-5 shadow-plate"
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0))' }}
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
          <p className="eyebrow text-muted">Index — eleven screens</p>
          <h2 className="display mt-1 text-3xl text-ink">
            The full <span className="italic">case file</span>.
          </h2>
          <div className="mt-5 space-y-5">
            <Group title="Evidence" tabs={[...PRIMARY.filter((t) => t.group === 'evidence'), ...OVERFLOW.filter((t) => t.group === 'evidence')]} active={loc.pathname} onPick={(p) => nav(p)} />
            <Group title="Pricing" tabs={[...PRIMARY.filter((t) => t.group === 'price'), ...OVERFLOW.filter((t) => t.group === 'price')]} active={loc.pathname} onPick={(p) => nav(p)} />
            <Group title="Delivery" tabs={[...PRIMARY.filter((t) => t.group === 'frame'), ...OVERFLOW.filter((t) => t.group === 'output')]} active={loc.pathname} onPick={(p) => nav(p)} />
          </div>
        </div>
      )}

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app border-t border-rule bg-paper/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <ul className="grid grid-cols-5">
          {PRIMARY.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  [
                    'group flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium tracking-wide',
                    isActive ? 'text-ink' : 'text-muted',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={[
                        'mono-tab font-mono text-[11px] leading-none',
                        isActive ? 'text-ink' : 'text-muted/80',
                      ].join(' ')}
                    >
                      {t.code}
                    </span>
                    <span className={['uppercase', isActive ? 'tracking-eyebrow' : 'tracking-wider'].join(' ')}>
                      {t.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        'mt-0.5 h-[2px] w-6 transition-colors',
                        isActive ? 'bg-ink' : 'bg-transparent',
                      ].join(' ')}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={[
                'flex w-full min-h-[56px] flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium tracking-wide',
                overflowActive ? 'text-ink' : 'text-muted',
              ].join(' ')}
            >
              <span aria-hidden="true" className="font-mono text-[11px] leading-none">+07</span>
              <span className="uppercase tracking-wider">Index</span>
              <span aria-hidden="true" className={['mt-0.5 h-[2px] w-6 transition-colors', overflowActive ? 'bg-ink' : 'bg-transparent'].join(' ')} />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function Group({ title, tabs, active, onPick }: { title: string; tabs: Tab[]; active: string; onPick: (path: string) => void }) {
  return (
    <div>
      <p className="eyebrow text-muted">{title}</p>
      <ul className="mt-2 divide-y divide-rule border-y border-rule">
        {tabs.map((t) => (
          <li key={t.to}>
            <button
              onClick={() => onPick(t.to)}
              className={[
                'flex w-full items-center justify-between py-3 text-left',
                active === t.to ? 'text-ink' : 'text-ink/80',
              ].join(' ')}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-muted">{t.code}</span>
                <span className="text-[15px]">{t.label}</span>
              </span>
              <span aria-hidden="true" className="text-muted">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
