// Single source of truth for headline numbers shown in the app.
// Mirrors values in `exhibits/results/key_numbers.json` and the figures quoted
// in `deliverables/01_report.md`. Update both together when re-running pipelines.

export const PORTFOLIO = {
  gwpUsdM: 1200,        // notional Hannover Re SEA portfolio (USD m)
  baseLossRatio: 0.62,  // current expected loss ratio
  elasticity: 0.7,      // loss-to-emissions elasticity, Swiss Re sigma 1/2024
};

export const MAPE = {
  log_linear: 9.23,
  ARIMA: 2.67,
  XGBoost: 2.18,
};

// Per-country XGBoost forecast vs actual 2024 — values mirror m3_per_country in
// exhibits/results/key_numbers.json (do not hand-edit; re-port if model re-runs).
export const FORECAST_2024 = [
  { country: 'Indonesia',  pred: 1272.16, actual: 1323.78, errPct: -3.90 },
  { country: 'Vietnam',    pred:  563.36, actual:  584.26, errPct: -3.58 },
  { country: 'Thailand',   pred:  415.61, actual:  422.39, errPct: -1.60 },
  { country: 'Malaysia',   pred:  327.90, actual:  332.17, errPct: -1.28 },
  { country: 'Philippines', pred: 262.40, actual:  266.60, errPct: -1.57 },
  { country: 'Myanmar',    pred:  117.85, actual:  117.79, errPct:  0.05 },
  { country: 'Singapore',  pred:   73.27, actual:   76.09, errPct: -3.71 },
  { country: 'Cambodia',   pred:   50.08, actual:   49.83, errPct:  0.49 },
  { country: 'Lao PDR',    pred:   42.55, actual:   41.55, errPct:  2.42 },
  { country: 'Brunei Darussalam', pred: 12.24, actual: 11.87, errPct: 3.19 },
];

// XGBoost M3b STRUCTURAL specification (no lag features) — surfaces driver
// attribution. Per CLAUDE.md "What not to do": do NOT replace with autoregressive
// (M3a) gains, which would be lag-dominated and obscure the structural story.
// Source: analysis/python/analysis.ipynb §5b (M3b feature importance, seed 2026).
export const DRIVERS = [
  { feature: 'GDP (log)',          gain: 0.50, kind: 'scale' },
  { feature: 'Population (log)',   gain: 0.40, kind: 'scale' },
  { feature: 'CO₂ intensity / GDP', gain: 0.03, kind: 'tech' },
  { feature: 'Industry % GDP',     gain: 0.02, kind: 'tech' },
  { feature: 'Urban pop %',        gain: 0.01, kind: 'scale' },
  { feature: 'Renewable energy %', gain: 0.01, kind: 'tech' },
  { feature: 'Forest area %',      gain: 0.01, kind: 'land' },
];

// EM-DAT Country Profiles (HDX snapshot 2026-04-24), 2018–2023, ISO3 = VNM/PHL.
export const EMDAT_VN_PH = {
  vietnam: {
    events: 48,
    perYear: 8.0,
    storms: 26,
    floods: 21,
    other: 1,
    affectedM: 4.5,
    deaths: 620,
    damageUsdBn2024: 2.30,
  },
  philippines: {
    events: 75,
    perYear: 12.5,
    storms: 41,
    floods: 13,
    other: 21, // earthquakes + volcanic + mass movement + drought
    affectedM: 54.5,
    deaths: 2008,
    damageUsdBn2024: 4.81,
  },
  insuredShareSigma: 0.12, // Swiss Re sigma 1/2024 SEA benchmark
};

// Insurance market structure for the VN vs PH comparison.
// Sources: Swiss Re sigma 1/2024 (penetration, protection gap); Vietnam Briefing
// 2024-12 (VN non-life +10.2 % YoY); PH Insurance Commission Q3 2024 stats.
export const MARKET_STRUCTURE = {
  vietnam:     { penetrationPct: 2.4, protectionGapPct: 92, nonLifeYoYPct: 10.2 },
  philippines: { penetrationPct: 1.7, protectionGapPct: 85, nonLifeYoYPct: 10.2 },
};

// Sector-weighted loss-ratio sensitivity for a Power-heavy book in each country
// (Hot House → Net Zero swing). Derived in deliverables/04_vn_vs_ph §7.
export const LR_SENSITIVITY_PP = { vietnam: 13.0, philippines: 2.0 };

// 2024 live data point — Hannover Re Annual Report 2024 statement on Yagi.
export const YAGI_2024 = {
  economicLossUsdBn: 14.0,   // Munich Re region-wide
  insuredLossUsdBn:  1.0,    // Munich Re region-wide
  vnInsuredUsdM:    471,     // VND 11.6 trn local insurer aggregate
  hannoverNote: 'Hannover Re 2024 AR: "Despite Typhoon Yagi, losses incurred… in Vietnam came in within our expectations."',
};

// ND-GAIN Country Index 2026 release, 2023 latest values
export const NDGAIN_2023 = [
  { country: 'Singapore',         iso3: 'SGP', gain: 70.6, vuln: 0.389, ready: 0.800 },
  { country: 'Malaysia',          iso3: 'MYS', gain: 56.9, vuln: 0.367, ready: 0.506 },
  { country: 'Brunei Darussalam', iso3: 'BRN', gain: 56.7, vuln: 0.404, ready: 0.538 },
  { country: 'Thailand',          iso3: 'THA', gain: 52.7, vuln: 0.435, ready: 0.489 },
  { country: 'Indonesia',         iso3: 'IDN', gain: 48.4, vuln: 0.430, ready: 0.398 },
  { country: 'Vietnam',           iso3: 'VNM', gain: 48.1, vuln: 0.468, ready: 0.429 },
  { country: 'Philippines',       iso3: 'PHL', gain: 45.6, vuln: 0.444, ready: 0.356 },
  { country: 'Lao PDR',           iso3: 'LAO', gain: 42.5, vuln: 0.486, ready: 0.336 },
  { country: 'Cambodia',          iso3: 'KHM', gain: 40.5, vuln: 0.481, ready: 0.292 },
  { country: 'Myanmar',           iso3: 'MMR', gain: 36.9, vuln: 0.514, ready: 0.252 },
];

// 2030 stress test outcome computed in 01_report.md §6.2.
export const STRESS_2030 = [
  { scenario: 'Net Zero 2050',     family: 'Orderly',          growth: -0.025, emissionsMt: 2772, lr: 0.507, lossUsdM: 609 },
  { scenario: 'Mitigation',        family: 'Client-specific',  growth: -0.010, emissionsMt: 3038, lr: 0.538, lossUsdM: 646 },
  { scenario: 'Delayed Transition', family: 'Disorderly',       growth:  0.010, emissionsMt: 3425, lr: 0.583, lossUsdM: 700 },
  { scenario: 'Current Policies',  family: 'Hot House World',  growth:  0.025, emissionsMt: 3742, lr: 0.620, lossUsdM: 744 },
];

export const HEADLINE = {
  lossSwingUsdM: 135,        // 744 - 609
  lrSwingPp: 11,             // 62 - 51
  mapeXGBPct: 2.18,
  vnVsPhGhgGrowthMultiple: 5,
};

export const RECOMMENDATIONS = [
  {
    id: 'parametric',
    title: 'SEA Parametric Typhoon Product',
    detail: 'Trigger: Saffir-Simpson Cat-3+ landfall in PH/VN/S-China coast. Target: top-5 primary insurers in PH and VN.',
    target: 'TAM ≈ USD 280 m premium by 2028',
    icon: '🌀',
  },
  {
    id: 'esg-screen',
    title: 'ESG-Linked Underwriting Screen',
    detail: 'Cedents with credible NDC-aligned transition plans receive 5–10 % premium discount. Aligned with Paris Article 2.1(c).',
    target: '+2 pp loss-ratio improvement at full adoption',
    icon: '🎯',
  },
  {
    id: 'cat-bond',
    title: 'Cat Bond Issuance — 2027 Window',
    detail: 'USD 250 m SEA multi-peril bond, timed to NGFS Disorderly Transition spread-widening window. Solvency II Art. 309 capital relief.',
    target: 'Lock spreads 12–18 months pre-repricing',
    icon: '📈',
  },
  {
    id: 'capital-buffer',
    title: 'Capital Buffer +8 %',
    detail: 'Hold an additional 8 % regional risk-capital buffer under Hot House scenario. Per BNM CRST 2024 §6.3.',
    target: 'Regulator-aligned',
    icon: '🛡️',
  },
];
