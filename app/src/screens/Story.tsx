import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Eyebrow, Hairline, StatBig } from '../components/Card';
import { QRInstall } from '../components/QRInstall';
import { EvidenceModal } from '../components/EvidenceModal';
import { Ticker } from '../components/Ticker';
import { HEADLINE, PORTFOLIO } from '../data/keyNumbers';
import { EVIDENCE_BY_ID } from '../data/evidence';

export function Story() {
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const open = (id: string) => setEvidenceId(id);
  const entry = evidenceId ? EVIDENCE_BY_ID[evidenceId] ?? null : null;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Editorial broadsheet hero — 2-col on lg */}
      <section className="border border-rule bg-paper">
        <div className="grid lg:grid-cols-[1.6fr_1fr]">
          {/* Left: hero copy */}
          <div className="px-5 pt-6 pb-5 lg:px-10 lg:pt-10 lg:pb-8 lg:border-r lg:border-rule">
            <div className="flex items-center justify-between">
              <Eyebrow>Front page · Issue 2026/05</Eyebrow>
              <span className="font-mono text-[10px] uppercase tracking-eyebrow text-muted">
                R·I — Folio 01
              </span>
            </div>

            <h1 className="display mt-4 text-[44px] leading-[0.92] text-ink lg:text-[68px] lg:mt-6">
              Climate risk is a
              <span className="italic"> structural driver </span>
              of expected loss in <span className="italic">South-East Asia</span>.
            </h1>

            <Hairline className="mt-5 lg:mt-8" strong />

            <p className="mt-5 font-serif text-[16px] italic leading-relaxed text-ink lg:mt-7 lg:text-[20px]">
              On the client&apos;s notional <span className="not-italic font-semibold">USD {(PORTFOLIO.gwpUsdM / 1000).toFixed(1)} bn</span> SEA portfolio, the gap between a Net Zero 2050 and a Hot House World transition pathway by 2030 is <span className="not-italic font-semibold"> USD {HEADLINE.lossSwingUsdM} m</span> in expected loss — an <span className="not-italic font-semibold">{HEADLINE.lrSwingPp} pp</span> loss-ratio swing.
            </p>

            <p className="mt-4 text-[12px] text-muted lg:mt-6">
              Tap any number to open its source paragraph and report § anchor.
            </p>
          </div>

          {/* Right: KPI plate */}
          <div className="px-5 pt-5 pb-6 lg:px-8 lg:pt-10 lg:pb-8">
            <Eyebrow>Headline · base case</Eyebrow>

            <div className="mt-4 space-y-4 lg:mt-6">
              <button onClick={() => open('loss-swing')} className="block w-full text-left evidence-tap border-b border-rule pb-4">
                <StatBig value={`USD ${HEADLINE.lossSwingUsdM}m`} label="Loss swing" accent="rust" size="hero" />
              </button>
              <button onClick={() => open('lr-swing')} className="block w-full text-left evidence-tap border-b border-rule pb-4">
                <StatBig value={`+${HEADLINE.lrSwingPp}pp`} label="LR delta" accent="amber" size="lg" />
              </button>
              <button onClick={() => open('mape-xgb')} className="block w-full text-left evidence-tap">
                <StatBig value={`${HEADLINE.mapeXGBPct}%`} label="MAPE 2024" accent="sea" size="lg" hint="XGBoost hold-out" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QR install + portfolio sheet — 2-col on lg */}
      <section className="grid gap-6 lg:grid-cols-2 lg:gap-6">
        <QRInstall />

        <div className="border border-rule bg-sand px-5 py-5 lg:px-7 lg:py-6">
          <Eyebrow>Portfolio assumptions · base case</Eyebrow>
          <Hairline className="mt-3" />
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <button onClick={() => open('gwp-1200')} className="evidence-tap text-left">
              <dt className="text-[10px] uppercase tracking-eyebrow text-muted">GWP</dt>
              <dd className="display tab-num mt-1 text-[28px] text-ink lg:text-[34px]">
                <span className="text-[12px] font-mono align-top mr-0.5">USD</span>
                {PORTFOLIO.gwpUsdM}
                <span className="text-[14px] font-mono ml-0.5">m</span>
              </dd>
            </button>
            <div>
              <dt className="text-[10px] uppercase tracking-eyebrow text-muted">Base LR</dt>
              <dd className="display tab-num mt-1 text-[28px] text-ink lg:text-[34px]">
                {(PORTFOLIO.baseLossRatio * 100).toFixed(0)}<span className="text-[14px] font-mono">%</span>
              </dd>
            </div>
            <button onClick={() => open('elasticity-07')} className="evidence-tap text-left">
              <dt className="text-[10px] uppercase tracking-eyebrow text-muted">Elasticity ε</dt>
              <dd className="display tab-num mt-1 text-[28px] text-ink italic lg:text-[34px]">
                {PORTFOLIO.elasticity}
              </dd>
            </button>
          </dl>
          <p className="mt-3 text-[11px] leading-snug text-muted">
            ε from Swiss Re sigma 1/2024. Base loss ratio illustrative — replace with cedent-supplied book in production.
          </p>
        </div>
      </section>

      {/* Editorial table of contents — 3-col movements on lg */}
      <section className="border border-rule bg-paper px-5 py-5 lg:px-10 lg:py-8">
        <div className="flex items-baseline justify-between">
          <Eyebrow>The case file · 11 sections</Eyebrow>
          <span className="hidden lg:inline font-mono text-[10px] uppercase tracking-eyebrow text-muted">
            Three movements
          </span>
        </div>
        <h2 className="display mt-2 text-[28px] leading-[1.05] text-ink lg:text-[40px]">
          A reinsurance dossier in <span className="italic">three movements</span>.
        </h2>

        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8">
          <Movement
            roman="I"
            title="Evidence"
            blurb="Where the numbers come from."
            items={[
              { code: '02', name: 'Model',      to: '/model',      tag: 'Forecast leaderboard' },
              { code: '03', name: 'Diagnostic', to: '/diagnostic', tag: 'Three sign-flips' },
              { code: '04', name: 'Hot Spots',  to: '/hotspots',   tag: 'VN vs PH natural experiment' },
              { code: '05', name: 'Sectoral',   to: '/sectoral',   tag: '10 × 8 residual heatmap' },
              { code: '06', name: 'Compare',    to: '/compare',    tag: 'Two-country side-by-side' },
            ]}
          />
          <Movement
            roman="II"
            title="Pricing"
            blurb="Where the risk meets the book."
            items={[
              { code: '07', name: 'Stress', to: '/stress', tag: 'NGFS × elasticity slider' },
              { code: '08', name: 'Cedent', to: '/cedent', tag: 'Composite tier · live' },
            ]}
          />
          <Movement
            roman="III"
            title="Delivery"
            blurb="What lands on the CRO desk."
            items={[
              { code: '09', name: 'Actions',  to: '/actions',  tag: 'Four recommended actions' },
              { code: '10', name: 'Brief',    to: '/brief',    tag: 'Executive memo export' },
              { code: '11', name: 'Evidence', to: '/evidence', tag: 'Trace-back ledger' },
            ]}
          />
        </div>
      </section>

      {/* Persistent CTA */}
      <Link
        to="/stress"
        className="group flex items-center justify-between border border-ink bg-ink px-5 py-4 text-paper transition active:bg-ink/95 lg:px-8 lg:py-5"
      >
        <span className="flex items-center gap-3 lg:gap-5">
          <Ticker code="07" tone="paper" size="md" />
          <span className="text-[15px] font-medium lg:text-[18px]">Open the live stress test</span>
        </span>
        <span aria-hidden="true" className="font-mono text-[14px] lg:text-[16px]">→</span>
      </Link>

      <Card tone="paper">
        <Eyebrow>Provenance</Eyebrow>
        <p className="mt-2 text-[11px] leading-relaxed text-muted lg:text-[12px]">
          Sources: World Bank WDI (Wide format) · EM-DAT Country Profiles via OCHA HDX (snapshot 2026-04-24) · ND-GAIN Country Index 2026 release · Swiss Re sigma 1/2024 · NGFS Phase V · BNM CRST 2024.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          Data 2026-04-25 · Seed 2026 · Pipeline Python v1.0
        </p>
      </Card>

      <EvidenceModal entry={entry} onClose={() => setEvidenceId(null)} />
    </div>
  );
}

function Movement({
  roman, title, blurb, items,
}: {
  roman: string;
  title: string;
  blurb: string;
  items: { code: string; name: string; to: string; tag: string }[];
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 lg:block">
      <div className="display text-[40px] italic leading-[0.85] text-ink/80 lg:text-[64px]">{roman}</div>
      <div>
        <h3 className="text-[15px] font-semibold text-ink lg:text-[18px] lg:mt-3">{title}</h3>
        <p className="text-[12px] text-muted lg:text-[13px]">{blurb}</p>
        <ul className="mt-3 divide-y divide-rule border-y border-rule lg:mt-4">
          {items.map((it) => (
            <li key={it.to}>
              <Link
                to={it.to}
                className="flex items-baseline justify-between py-2.5 lg:py-3 hover:bg-ink/[0.03] -mx-2 px-2 transition"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-muted">{it.code}</span>
                  <span className="text-[14px] text-ink">{it.name}</span>
                </span>
                <span className="text-[11px] text-muted">{it.tag}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
