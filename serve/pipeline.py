"""R-Ignite pipeline runtime.

Loads the M3a (forecast) and M3b (structural) XGBoost models exported by
analysis/python/analysis.ipynb cell 42 and exposes a single
`run_pipeline()` function that returns a five-stage trace as JSON. The trace
shape mirrors what the PWA's Pipeline screen expects.
"""
from __future__ import annotations

import json
import math
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import numpy as np
from pydantic import BaseModel, Field
from xgboost import XGBRegressor

ROOT = Path(__file__).parent / "models"

m3a = XGBRegressor()
m3a.load_model(str(ROOT / "m3a.json"))

m3b = XGBRegressor()
m3b.load_model(str(ROOT / "m3b.json"))

with open(ROOT / "meta.json") as f:
    META = json.load(f)


class PredictRequest(BaseModel):
    mode: Literal["hindcast", "forward"] = "forward"
    country: str
    scenario: str = "Current Policies"
    elasticity: float = Field(default=0.7, ge=0.0, le=2.0)
    gwp_usdm: float = Field(default=1200.0, ge=0)
    base_lr: float = Field(default=0.62, ge=0, le=2)
    target_year: int | None = None
    feature_overrides: dict[str, float] | None = None


def run_pipeline(req: PredictRequest) -> dict:
    """Execute the full prediction pipeline and return the 5-stage trace."""
    t_start = time.perf_counter()

    # Stage 1 — assemble inputs.
    # M3a's 2024 row already contains lag1 = 2023 GHG and lag2 = 2022 GHG, which
    # is what the trained model expects for *both* the 2024 hindcast and the
    # 2024-anchored forward projection. The semantic difference is only what we
    # do downstream with the prediction.
    base_year = 2024
    target_year = req.target_year or (2024 if req.mode == "hindcast" else 2030)
    panel_key = "feature_panel_2024"
    panel = META.get(panel_key, {})
    if req.country not in panel:
        # fall back to Vietnam — keeps the demo alive if a country is missing
        country = "Vietnam"
    else:
        country = req.country
    base_features = dict(panel[country])

    overrides_in = req.feature_overrides or {}
    applied_overrides: dict[str, float] = {}
    raw_features = dict(base_features)
    for k, v in overrides_in.items():
        if v is None:
            continue
        raw_features[k] = float(v)
        applied_overrides[k] = float(v)

    stage_1 = {
        "country": country,
        "year": target_year,
        "mode": req.mode,
        "raw_features": raw_features,
        "applied_overrides": applied_overrides,
    }

    # Stage 2 — feature vector in M3a order
    feature_order: list[str] = META["m3a_features"]
    X = [float(raw_features.get(f, 0.0)) for f in feature_order]
    log_keys = [k for k in feature_order if k.startswith("log_")]

    stage_2 = {
        "feature_order": feature_order,
        "X": X,
        "log_transformed_keys": log_keys,
    }

    # Stage 3 — XGBoost inference
    X_arr = np.asarray([X], dtype=np.float32)
    t_inf = time.perf_counter()
    log_ghg_pred = float(m3a.predict(X_arr)[0])
    inference_ms = (time.perf_counter() - t_inf) * 1000.0
    ghg_pred_Mt = math.exp(log_ghg_pred)

    actual_Mt = None
    err_pct = None
    if req.mode == "hindcast":
        actual = META.get("actual_2024", {}).get(country)
        if actual is not None:
            actual_Mt = float(actual)
            err_pct = ((ghg_pred_Mt - actual_Mt) / actual_Mt) * 100.0

    stage_3 = {
        "log_ghg_pred": log_ghg_pred,
        "ghg_pred_Mt": ghg_pred_Mt,
        "actual_Mt": actual_Mt,
        "err_pct": err_pct,
        "inference_ms": round(inference_ms, 3),
        "model": "M3a",
    }

    # Stage 4 — NGFS scenario overlay.
    # Compound from the M3a-predicted 2024 emissions to target_year.
    scenarios: dict[str, float] = META["ngfs_scenarios"]
    g = float(scenarios.get(req.scenario, 0.0))
    hothouse_g = float(scenarios.get("Current Policies", 0.025))
    years = max(0, target_year - 2024)  # number of compound years from 2024 anchor
    target_Mt = ghg_pred_Mt * (1.0 + g) ** years
    hothouse_Mt = ghg_pred_Mt * (1.0 + hothouse_g) ** years
    delta_pct = (target_Mt - hothouse_Mt) / hothouse_Mt if hothouse_Mt > 0 else 0.0

    stage_4 = {
        "scenario": req.scenario,
        "growth_rate_pa": g,
        "years_compounded": years,
        "hothouse_Mt": hothouse_Mt,
        "target_Mt": target_Mt,
        "delta_pct": delta_pct,
    }

    # Stage 5 — loss-ratio mapping
    lr = req.base_lr * (1.0 + req.elasticity * delta_pct)
    loss_USDm = req.gwp_usdm * lr
    hothouse_lr = req.base_lr  # at delta=0
    hothouse_loss = req.gwp_usdm * hothouse_lr
    loss_swing = loss_USDm - hothouse_loss

    stage_5 = {
        "lr": lr,
        "lr_pp_vs_base": (lr - req.base_lr) * 100.0,
        "loss_USDm": loss_USDm,
        "loss_swing_vs_hothouse_USDm": loss_swing,
    }

    total_latency_ms = (time.perf_counter() - t_start) * 1000.0

    return {
        "stage_1_inputs": stage_1,
        "stage_2_features": stage_2,
        "stage_3_xgb": stage_3,
        "stage_4_scenario": stage_4,
        "stage_5_loss": stage_5,
        "trace_meta": {
            "pipeline_version": META.get("pipeline_version", "1.0"),
            "seed": META.get("random_state", 2026),
            "total_latency_ms": round(total_latency_ms, 3),
            "served_by": "fastapi",
            "served_at": datetime.now(timezone.utc).isoformat(),
        },
    }
