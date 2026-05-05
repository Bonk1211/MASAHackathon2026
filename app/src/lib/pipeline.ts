// Pipeline client — wraps POST /predict on the FastAPI service.
// Falls back to a local synthesiser using key_numbers_python.json when the API
// is unreachable or VITE_PIPELINE_API is unset, so the screen still renders
// honestly in offline / pre-deploy demos.

import canon from '../data/key_numbers_python.json';

export type Mode = 'hindcast' | 'forward';

export interface PredictRequest {
  mode: Mode;
  country: string;
  scenario?: string;
  elasticity?: number;
  gwp_usdm?: number;
  base_lr?: number;
  target_year?: number;
  feature_overrides?: Partial<Record<string, number>>;
}

export interface Trace {
  stage_1_inputs: {
    country: string;
    year: number;
    mode: Mode;
    raw_features: Record<string, number>;
    applied_overrides: Record<string, number>;
  };
  stage_2_features: {
    feature_order: string[];
    X: number[];
    log_transformed_keys: string[];
  };
  stage_3_xgb: {
    log_ghg_pred: number;
    ghg_pred_Mt: number;
    actual_Mt: number | null;
    err_pct: number | null;
    inference_ms: number | null;
    model: 'M3a' | 'M3b';
  };
  stage_4_scenario: {
    scenario: string;
    growth_rate_pa: number;
    years_compounded: number;
    hothouse_Mt: number;
    target_Mt: number;
    delta_pct: number;
  };
  stage_5_loss: {
    lr: number;
    lr_pp_vs_base: number;
    loss_USDm: number;
    loss_swing_vs_hothouse_USDm: number;
  };
  trace_meta: {
    pipeline_version: string;
    seed: number;
    total_latency_ms: number | null;
    served_by: 'fastapi' | 'cached';
    served_at: string;
  };
}

export interface PipelineMeta {
  pipeline_version: string;
  random_state: number;
  m3a_features: string[];
  m3b_features: string[];
  countries: string[];
  last_actual_year: number;
  ngfs_scenarios: Record<string, number>;
  feature_ranges: Record<string, { min: number; max: number }>;
  feature_panel_2023: Record<string, Record<string, number>>;
  feature_panel_2024: Record<string, Record<string, number>>;
  actual_2024: Record<string, number>;
  constants: { gwp_usdm: number; base_lr: number; elasticity: number };
}

const API = import.meta.env.VITE_PIPELINE_API as string | undefined;

let metaCache: PipelineMeta | null = null;

const FALLBACK_META: PipelineMeta = {
  pipeline_version: '1.0',
  random_state: 2026,
  m3a_features: [
    'log_GDP', 'log_pop', 'log_GHG_lag1', 'log_GHG_lag2',
    'renewable_energy_pct', 'urban_pop_pct', 'industry_pct_GDP',
    'forest_area_pct', 'CO2_intensity_GDP', 'GDP_per_capita_2015USD',
  ],
  m3b_features: [
    'log_GDP', 'log_pop', 'renewable_energy_pct', 'urban_pop_pct',
    'industry_pct_GDP', 'forest_area_pct', 'CO2_intensity_GDP', 'GDP_per_capita_2015USD',
  ],
  countries: [
    'Brunei Darussalam', 'Cambodia', 'Indonesia', 'Lao PDR', 'Malaysia',
    'Myanmar', 'Philippines', 'Singapore', 'Thailand', 'Vietnam',
  ],
  last_actual_year: 2024,
  ngfs_scenarios: {
    'Current Policies': 0.025,
    'Delayed Transition': 0.010,
    'Mitigation': -0.010,
    'Net Zero 2050': -0.025,
  },
  feature_ranges: {
    log_GDP:               { min: 22.0, max: 28.0 },
    log_pop:               { min: 13.0, max: 19.5 },
    log_GHG_lag1:          { min: 3.5,  max: 7.5 },
    log_GHG_lag2:          { min: 3.5,  max: 7.5 },
    renewable_energy_pct:  { min: 0,    max: 80 },
    urban_pop_pct:         { min: 20,   max: 100 },
    industry_pct_GDP:      { min: 15,   max: 60 },
    forest_area_pct:       { min: 0,    max: 80 },
    CO2_intensity_GDP:     { min: 0,    max: 1.5 },
    GDP_per_capita_2015USD:{ min: 800,  max: 70000 },
  },
  // Plausible Vietnam-anchored values — synthesiser only uses these when API absent.
  feature_panel_2023: {
    Vietnam: {
      log_GDP: 26.73, log_pop: 18.43, log_GHG_lag1: 6.30, log_GHG_lag2: 6.27,
      renewable_energy_pct: 16.92, urban_pop_pct: 38.49, industry_pct_GDP: 37.56,
      forest_area_pct: 46.84, CO2_intensity_GDP: 0.265, GDP_per_capita_2015USD: 4017,
    },
    Philippines: {
      log_GDP: 26.61, log_pop: 18.57, log_GHG_lag1: 5.59, log_GHG_lag2: 5.55,
      renewable_energy_pct: 22.5, urban_pop_pct: 55.45, industry_pct_GDP: 28.8,
      forest_area_pct: 24.27, CO2_intensity_GDP: 0.155, GDP_per_capita_2015USD: 3925,
    },
    Indonesia: {
      log_GDP: 27.85, log_pop: 19.45, log_GHG_lag1: 7.19, log_GHG_lag2: 7.17,
      renewable_energy_pct: 12.1, urban_pop_pct: 58.7, industry_pct_GDP: 41.4,
      forest_area_pct: 49.07, CO2_intensity_GDP: 0.21, GDP_per_capita_2015USD: 4788,
    },
  },
  feature_panel_2024: {
    Vietnam: {
      log_GDP: 26.78, log_pop: 18.43, log_GHG_lag1: 6.33, log_GHG_lag2: 6.30,
      renewable_energy_pct: 17.5, urban_pop_pct: 39.0, industry_pct_GDP: 37.7,
      forest_area_pct: 46.9, CO2_intensity_GDP: 0.262, GDP_per_capita_2015USD: 4180,
    },
    Philippines: {
      log_GDP: 26.66, log_pop: 18.57, log_GHG_lag1: 5.59, log_GHG_lag2: 5.59,
      renewable_energy_pct: 23.0, urban_pop_pct: 55.6, industry_pct_GDP: 28.5,
      forest_area_pct: 24.2, CO2_intensity_GDP: 0.152, GDP_per_capita_2015USD: 4080,
    },
    Indonesia: {
      log_GDP: 27.91, log_pop: 19.46, log_GHG_lag1: 7.19, log_GHG_lag2: 7.19,
      renewable_energy_pct: 12.5, urban_pop_pct: 59.0, industry_pct_GDP: 41.0,
      forest_area_pct: 48.9, CO2_intensity_GDP: 0.205, GDP_per_capita_2015USD: 4900,
    },
  },
  actual_2024: Object.fromEntries(
    canon.m3a_per_country.map((r) => [r.country, r.actual_2024]),
  ),
  constants: {
    gwp_usdm: canon.headline.gwp_usdm,
    base_lr: canon.headline.base_lr,
    elasticity: canon.headline.elasticity,
  },
};

/**
 * Fetch pipeline metadata. Memoised; falls back to FALLBACK_META if API absent.
 */
export async function getMeta(): Promise<PipelineMeta> {
  if (metaCache) return metaCache;
  if (!API) {
    metaCache = FALLBACK_META;
    return metaCache;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${API}/meta`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`meta ${res.status}`);
    metaCache = (await res.json()) as PipelineMeta;
    return metaCache;
  } catch (_) {
    metaCache = FALLBACK_META;
    return metaCache;
  }
}

/**
 * Predict — calls FastAPI; on failure, returns a synthesised cached trace so the UI
 * never sits on an empty state.
 */
export async function predict(req: PredictRequest): Promise<Trace> {
  if (API) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`predict ${res.status}`);
      const trace = (await res.json()) as Trace;
      return trace;
    } catch (_) {
      // fall through to synthesiser
    }
  }
  return synthesise(req);
}

/**
 * Cached-mode synthesiser. Uses canon JSON outputs to produce a
 * stage-shaped trace. Honest about being cached — `inference_ms` is null and
 * `served_by` reads 'cached'.
 */
function synthesise(req: PredictRequest): Trace {
  const meta = metaCache ?? FALLBACK_META;
  // Both modes anchor on the 2024 feature row — its lag features already encode 2023 GHG,
  // so M3a's input is identical for hindcast (predict 2024) and forward (predict 2024 then
  // compound to target_year). Mirrors serve/pipeline.py.
  const targetYear = req.target_year ?? (req.mode === 'hindcast' ? 2024 : 2030);
  const country = req.country;
  const panel = meta.feature_panel_2024;
  const baseFeatures = panel[country] ?? panel['Vietnam'];
  const overridesIn = req.feature_overrides ?? {};
  const overrides: Record<string, number> = Object.fromEntries(
    Object.entries(overridesIn).filter(([, v]) => v != null) as [string, number][],
  );
  const raw: Record<string, number> = { ...baseFeatures, ...overrides };

  const X = meta.m3a_features.map((f) => raw[f] ?? 0);

  // Fake "model output" — use canon m3a per-country prediction for hindcast,
  // exp(log_GHG_lag1) for forward (i.e. last-known emission).
  const canonM3a = canon.m3a_per_country.find((r) => r.country === country);
  const ghg_pred_Mt = req.mode === 'hindcast'
    ? (canonM3a?.pred_2024 ?? Math.exp(raw.log_GHG_lag1 ?? 6.3))
    : Math.exp(raw.log_GHG_lag1 ?? 6.3);
  const log_ghg_pred = Math.log(Math.max(ghg_pred_Mt, 0.0001));
  const actual_Mt = req.mode === 'hindcast' ? (meta.actual_2024[country] ?? canonM3a?.actual_2024 ?? null) : null;
  const err_pct = actual_Mt !== null
    ? ((ghg_pred_Mt - actual_Mt) / actual_Mt) * 100
    : null;

  // Stage 4 — scenario compound growth from 2024 anchor.
  const scenario = req.scenario ?? 'Current Policies';
  const g = meta.ngfs_scenarios[scenario] ?? 0;
  const yearsCompounded = Math.max(0, targetYear - 2024);
  const target_Mt = ghg_pred_Mt * Math.pow(1 + g, yearsCompounded);
  const hothouseG = meta.ngfs_scenarios['Current Policies'] ?? 0.025;
  const hothouse_Mt = ghg_pred_Mt * Math.pow(1 + hothouseG, yearsCompounded);
  const delta_pct = hothouse_Mt > 0 ? (target_Mt - hothouse_Mt) / hothouse_Mt : 0;

  // Stage 5 — loss-ratio mapping.
  const elasticity = req.elasticity ?? meta.constants.elasticity;
  const gwp = req.gwp_usdm ?? meta.constants.gwp_usdm;
  const baseLr = req.base_lr ?? meta.constants.base_lr;
  const lr = baseLr * (1 + elasticity * delta_pct);
  const loss_USDm = gwp * lr;
  const hothouseLr = baseLr * (1 + elasticity * 0);
  const hothouseLoss = gwp * hothouseLr;
  const loss_swing_vs_hothouse_USDm = loss_USDm - hothouseLoss;

  return {
    stage_1_inputs: {
      country, year: targetYear, mode: req.mode,
      raw_features: raw, applied_overrides: overrides,
    },
    stage_2_features: {
      feature_order: meta.m3a_features,
      X,
      log_transformed_keys: ['log_GDP', 'log_pop', 'log_GHG_lag1', 'log_GHG_lag2'],
    },
    stage_3_xgb: {
      log_ghg_pred, ghg_pred_Mt,
      actual_Mt, err_pct,
      inference_ms: null,
      model: 'M3a',
    },
    stage_4_scenario: {
      scenario,
      growth_rate_pa: g,
      years_compounded: yearsCompounded,
      hothouse_Mt, target_Mt, delta_pct,
    },
    stage_5_loss: {
      lr,
      lr_pp_vs_base: (lr - baseLr) * 100,
      loss_USDm,
      loss_swing_vs_hothouse_USDm,
    },
    trace_meta: {
      pipeline_version: meta.pipeline_version,
      seed: meta.random_state,
      total_latency_ms: null,
      served_by: 'cached',
      served_at: new Date().toISOString(),
    },
  };
}

export const HAS_API = !!API;
