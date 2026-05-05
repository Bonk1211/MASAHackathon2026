"""R-Ignite Pipeline FastAPI service.

Run locally:
    cd serve && uv sync
    uvicorn serve.main:app --host 0.0.0.0 --port 8000 --reload

Expose via ngrok for the live demo:
    ngrok http 8000
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from serve.pipeline import META, PredictRequest, run_pipeline

app = FastAPI(title="R-Ignite Pipeline", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


_INDEX_HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>R-Ignite Pipeline · API</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #F4EFE3; color: #0A1A2A;
           max-width: 640px; margin: 4rem auto; padding: 0 1.5rem; line-height: 1.55; }
    h1 { font-family: Georgia, serif; font-style: italic; font-weight: 400; font-size: 2.4rem; margin: 0 0 .25rem; }
    .eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #6E6A60; }
    code { font-family: ui-monospace, Menlo, monospace; background: rgba(10,26,42,0.06); padding: 1px 5px; border-radius: 2px; }
    a { color: #0E7C86; }
    .row { display: grid; grid-template-columns: 110px 1fr; gap: 12px; padding: 8px 0;
           border-bottom: 1px solid rgba(10,26,42,0.14); }
    .meth { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #8B2E1F; }
    .muted { color: #6E6A60; font-size: 12px; }
  </style>
</head>
<body>
  <p class="eyebrow">R·Ignite · MASA Hackathon 2026</p>
  <h1>Pipeline <em>API</em></h1>
  <p class="muted">FastAPI service · serves M3a / M3b XGBoost models exported from analysis.ipynb cell 42.</p>

  <h3 class="eyebrow" style="margin-top:2rem">Endpoints</h3>
  <div class="row"><span class="meth">GET</span><a href="/healthz">/healthz</a></div>
  <div class="row"><span class="meth">GET</span><a href="/meta">/meta</a> &nbsp;<span class="muted">slider bounds, country list, scenarios</span></div>
  <div class="row"><span class="meth">POST</span><code>/predict</code> &nbsp;<span class="muted">5-stage pipeline trace</span></div>
  <div class="row"><span class="meth">GET</span><a href="/docs">/docs</a> &nbsp;<span class="muted">Swagger UI · interactive testing</span></div>
  <div class="row"><span class="meth">GET</span><a href="/redoc">/redoc</a> &nbsp;<span class="muted">ReDoc reference</span></div>

  <h3 class="eyebrow" style="margin-top:2rem">Try it</h3>
  <pre style="background:#0A1A2A;color:#FAF7EE;padding:14px;font-size:11px;overflow:auto"><code>curl -X POST http://localhost:8000/predict \\
  -H 'content-type: application/json' \\
  -d '{"country":"Vietnam","mode":"hindcast"}'</code></pre>

  <p class="muted" style="margin-top:2rem">UI lives at <a href="http://localhost:5173/#/pipeline">localhost:5173/#/pipeline</a> when running <code>npm run dev</code> with <code>VITE_PIPELINE_API=http://localhost:8000</code>.</p>
</body>
</html>"""


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def index() -> str:
    return _INDEX_HTML


@app.get("/healthz")
def health() -> dict:
    return {"ok": True, "version": "1.0", "seed": META.get("random_state")}


@app.get("/meta")
def meta() -> dict:
    """Slider bounds, country list, scenarios, and base-year feature panels."""
    return META


@app.post("/predict")
def predict(req: PredictRequest) -> dict:
    return run_pipeline(req)
