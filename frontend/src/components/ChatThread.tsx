// Phase 1 multi-turn consultant chat — Claude-style chatbox.
//
// Visual = Claude chat: centered narrow column, no message bubbles for
// assistant (plain text, serif italic for ILMU's voice), user messages in
// a right-aligned gray rounded card, large rounded composer with send
// arrow inside the textarea.
//
// Keeps the scoping data layer untouched (useScoping → localStorage +
// Supabase). Sidebars / rail / suggestion chips / inline AxisViz removed
// per the Claude-pure brief; props (extraBubbles, composerHint,
// continueTo/showContinue) preserved so Phase1Discovery's wizard injection
// still works.

import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  pinnedAxes,
  SCOPING_AXES,
  type ChatTurn,
  type ScopingAxis,
  useScoping,
} from '../lib/scoping';

const PIPELINE_API = (import.meta.env.VITE_PIPELINE_API as string | undefined) ?? '';
const AGENT_API =
  (import.meta.env.VITE_AGENT_API as string | undefined) ??
  (PIPELINE_API ? `${PIPELINE_API}/agent` : '/agent');

type AgentResponse = {
  updates: Record<string, unknown>;
  narration: string;
  tool_called: string | null;
  scoping_profile: Record<string, unknown> | null;
  complete: boolean;
  session_id: string | null;
  error: string | null;
};

// Predicted-input chips — shift to the next-unpinned axis so the user always
// gets relevant prompts. Phrasings TESTED against ilmu nemo-super: each chip
// pins its axis at confidence ≥0.9 reliably (3/3 cold runs). Don't edit
// without re-testing — the model is sensitive to enum casing and
// abbreviation ("UW" fails, "underwriting" works; "TCFD only" fails,
// "TCFD and ISSB_S2" works).
//
// Three-chip set per axis: canonical SEA-typhoon demo persona first, a
// diversified middle option, then a contrasting profile for variety.
const SUGGESTIONS_BY_AXIS: Record<ScopingAxis, string[]> = {
  line_of_business: [
    'Mostly property cat — 70% property cat, 20% agriculture, 10% specialty',
    'Diversified — 50% property cat, 25% agriculture, 25% specialty',
    'Cat-heavy with casualty tail — 80% property cat, 15% specialty, 5% casualty',
  ],
  geography: [
    'SEA core — Vietnam, Philippines, Indonesia',
    'Mekong only — Vietnam and Philippines',
    'Asean-5 — Indonesia, Thailand, Malaysia',
  ],
  time_horizon: [
    '1-year underwriting horizon, 30-year liability tail',
    '3-year underwriting horizon, 20-year liability tail',
    '1-year underwriting horizon, 50-year liability tail',
  ],
  frameworks: [
    'TCFD and ISSB_S2',
    'TCFD and Solvency_II_ORSA',
    'ISSB_S2 and Internal_Capital',
  ],
  disclosures: [
    'Public TCFD and ISSB_S2 annual disclosure',
    'Regulatory_Stress_Test only — confidential',
    'Internal_Only',
  ],
};

// Opener chips on a fresh chat — first option = canonical demo persona so a
// single tap pins LOB instantly; remaining chips give variety.
const OPENING_SUGGESTIONS = SUGGESTIONS_BY_AXIS.line_of_business;

export function ChatThread({
  continueTo = '/phase2',
  continueLabel = 'Continue to Phase 2 →',
  showContinue = true,
  extraBubbles = null,
  composerHint = null,
}: {
  continueTo?: string | null;
  continueLabel?: string;
  showContinue?: boolean;
  extraBubbles?: React.ReactNode;
  composerHint?: React.ReactNode;
} = {}) {
  const nav = useNavigate();
  const { profile, transcript, sessionId, setFullProfile, appendTurn } = useScoping();
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const inFlight = useRef(false);

  // Auto-scroll on new turn / spinner / injected wizard bubbles.
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  // Auto-grow textarea up to ~10 rows.
  const autoSize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
  }, []);

  async function submit(text: string) {
    if (!text.trim() || loading || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setErr(null);
    const userTurn: ChatTurn = {
      role: 'user',
      content: text.trim(),
      ts: new Date().toISOString(),
    };
    appendTurn(userTurn);
    setMsg('');
    requestAnimationFrame(() => {
      autoSize();
      scrollToBottom();
    });

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const { getCurrentUserId } = await import('../lib/supabase');
      const r = await fetch(AGENT_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          screen: 'scoping',
          session_id: sessionId,
          user_id: getCurrentUserId(),
          current_state: profile,
        }),
        signal: ctrl.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as AgentResponse;

      if (data.scoping_profile) setFullProfile(data.scoping_profile);
      if (data.narration) {
        appendTurn({
          role: 'assistant',
          content: data.narration,
          ts: new Date().toISOString(),
        });
      }
      if (data.error) setErr(data.error);
    } catch (e) {
      const name = e instanceof Error ? e.name : '';
      const m = e instanceof Error ? e.message : String(e);
      setErr(name === 'AbortError' ? 'Timed out (20s) — server may be cold.' : m);
    } finally {
      clearTimeout(t);
      setLoading(false);
      inFlight.current = false;
      requestAnimationFrame(scrollToBottom);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submit(msg);
  }

  // Predicted suggestions: pick the first unpinned axis after the latest
  // assistant turn; opener chips before the user has spoken; nothing once
  // scoping is complete or when the parent has injected its own UI.
  const suggestions = useMemo(() => {
    if (profile.complete) return [];
    if (composerHint) return [];
    if (transcript.length === 0) return OPENING_SUGGESTIONS;
    const pinned = pinnedAxes(profile);
    const nextAxis = SCOPING_AXES.find((a) => !pinned.includes(a));
    if (!nextAxis) return [];
    return SUGGESTIONS_BY_AXIS[nextAxis];
  }, [profile, transcript.length, composerHint]);

  const isEmpty = transcript.length === 0 && !loading;

  return (
    <div className="mx-auto flex h-[80vh] w-full max-w-3xl flex-col">
      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="display text-[28px] leading-[1.05] text-ink lg:text-[40px]">
              Hi — I'm <span className="italic">ILMU</span>.
            </p>
            <p className="mt-3 max-w-md font-serif text-[15px] italic leading-relaxed text-ink lg:text-[16px]">
              Five questions, then I'll propose the risk taxonomy and the indicator panel
              — all in this chat.
            </p>
            <p className="mt-4 max-w-md font-mono text-[10px] uppercase tracking-eyebrow text-muted">
              Tap a suggested answer below or just type.
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {transcript.map((turn, i) => (
              <li
                key={i}
                className={[
                  'flex',
                  turn.role === 'user' ? 'justify-end' : 'justify-start',
                ].join(' ')}
              >
                {turn.role === 'user' ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-ink/[0.06] px-4 py-2.5 text-[14px] leading-relaxed text-ink">
                    {turn.content}
                  </div>
                ) : (
                  <div className="max-w-full whitespace-pre-wrap font-serif text-[15px] italic leading-relaxed text-ink">
                    {turn.content}
                  </div>
                )}
              </li>
            ))}
            {loading && (
              <li className="flex justify-start">
                <div className="font-serif text-[14px] italic text-muted">Thinking…</div>
              </li>
            )}
          </ul>
        )}

        {/* Wizard / step bubbles injected by parent screen (Phase1Discovery). */}
        {extraBubbles && <div className="mt-6 space-y-5">{extraBubbles}</div>}

        {err && (
          <p
            role="alert"
            className="mt-4 border border-rust bg-paper px-2 py-1.5 font-mono text-[10px] uppercase tracking-eyebrow text-rust"
          >
            {err}
          </p>
        )}
      </div>

      {/* Composer — Claude-style: rounded box, send arrow inside */}
      <div className="px-4 pb-6 pt-2">
        {composerHint && (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-eyebrow text-sea">
            {composerHint}
          </p>
        )}

        {suggestions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void submit(s)}
                disabled={loading}
                className="rounded-full border border-rule bg-paper px-3 py-1 text-[11px] text-ink transition hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="relative">
          <textarea
            ref={taRef}
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              autoSize();
            }}
            rows={1}
            maxLength={2000}
            placeholder="Reply to ILMU…"
            aria-label="Reply to ILMU"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
            className="block w-full resize-none rounded-3xl border border-rule bg-paper px-5 py-4 pr-14 text-[14px] leading-relaxed text-ink placeholder:text-muted focus:border-ink focus:outline-none disabled:opacity-60"
            style={{ minHeight: 56, maxHeight: 240 }}
          />
          <button
            type="submit"
            disabled={loading || !msg.trim()}
            aria-label="Send"
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-rule disabled:text-muted"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-eyebrow text-muted">
          <span>{msg.length}/2000 · ↵ to send · ⇧↵ for newline</span>
          {showContinue && continueTo && profile.complete && (
            <button
              type="button"
              onClick={() => nav(continueTo)}
              className="border border-ink bg-ink px-3 py-1.5 text-[11px] font-semibold text-paper transition hover:bg-paper hover:text-ink"
            >
              {continueLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
