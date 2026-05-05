import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

const META: Record<string, { code: string; title: string; eyebrow: string }> = {
  '/':           { code: '01', title: 'Story',          eyebrow: 'Frame' },
  '/model':      { code: '02', title: 'Model',          eyebrow: 'Evidence' },
  '/diagnostic': { code: '03', title: 'Diagnostic',     eyebrow: 'Evidence' },
  '/hotspots':   { code: '04', title: 'Hot Spots',      eyebrow: 'Evidence' },
  '/sectoral':   { code: '05', title: 'Sectoral',       eyebrow: 'Evidence' },
  '/compare':    { code: '06', title: 'Compare',        eyebrow: 'Evidence' },
  '/stress':     { code: '07', title: 'Stress',         eyebrow: 'Pricing' },
  '/cedent':     { code: '08', title: 'Cedent',         eyebrow: 'Pricing' },
  '/actions':    { code: '09', title: 'Actions',        eyebrow: 'Delivery' },
  '/brief':      { code: '10', title: 'Brief',          eyebrow: 'Delivery' },
  '/evidence':   { code: '11', title: 'Evidence',       eyebrow: 'Delivery' },
};

export function Layout() {
  const loc = useLocation();
  const nav = useNavigate();
  const meta = META[loc.pathname] ?? { code: '—', title: 'R-Ignite', eyebrow: '' };
  const showBack = loc.pathname !== '/';

  return (
    <div className="mx-auto min-h-full max-w-shell lg:grid lg:grid-cols-shell">
      <Sidebar />

      <div className="flex min-h-screen flex-col">
        {/* Mobile / desktop header band */}
        <header
          className="sticky top-0 z-20 border-b border-rule bg-paper/92 backdrop-blur"
          style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
        >
          {/* Mobile-only masthead */}
          <div className="flex items-center justify-between px-5 pt-3 lg:hidden">
            <Wordmark />
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-eyebrow text-muted">
              <span>Hannover Re</span>
              <span aria-hidden="true" className="h-[1px] w-3 bg-rule-strong" />
              <span>Strategic Partner</span>
            </div>
          </div>

          {/* Section line */}
          <div className="flex items-center justify-between border-t border-rule px-5 py-2.5 lg:border-t-0 lg:px-10 lg:py-4">
            <div className="flex items-center gap-3 lg:gap-5">
              {showBack && (
                <button
                  onClick={() => nav(-1)}
                  aria-label="Back"
                  className="grid min-h-[36px] min-w-[36px] place-items-center border border-rule text-ink hover:bg-ink/5 lg:hidden"
                >
                  <span aria-hidden="true">←</span>
                </button>
              )}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
                  {meta.code} · {meta.eyebrow}
                </p>
                <h1 className="display text-[22px] leading-none text-ink lg:text-[28px]">
                  {meta.title}
                </h1>
              </div>
            </div>
            <FolioStamp />
          </div>
        </header>

        <main
          className="flex-1 px-5 pt-5 pb-32 lg:px-10 lg:pt-8 lg:pb-12"
          style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0))' }}
        >
          <div className="mx-auto max-w-canvas">
            <Outlet />
          </div>
        </main>

        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="display text-[20px] leading-none text-ink">R</span>
      <span aria-hidden="true" className="h-[14px] w-[1px] bg-rule-strong" />
      <span className="display italic text-[20px] leading-none text-ink">Ignite</span>
    </span>
  );
}

function FolioStamp() {
  return (
    <div className="text-right">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">Folio</p>
      <p className="font-mono text-[11px] tab-num text-ink">SEA · 2026</p>
    </div>
  );
}
