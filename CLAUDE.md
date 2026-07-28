# Reba

Postpartum danger-sign companion for the family, covering the 42 days after discharge.

Kinyarwanda: *reba* — "look / watch".

## The three invariants

These are not style preferences. They are the product.

1. **The model never decides.** Gemini converts plain language into structured sign IDs drawn from
   a fixed protocol list. The triage verdict is computed by pure TypeScript in `@reba/core` from the
   WHO postnatal danger-sign protocol. There is no code path where a model output becomes a verdict.
2. **Personalization can only escalate.** A woman's risk profile may raise her urgency level. It can
   never lower it below the protocol floor. Enforced by `escalate()` in `packages/core/src/levels.ts`,
   which is a monotonic max — there is no de-escalation function in the codebase.
3. **Uncertainty escalates.** An unclear or unknown answer counts as the sign being present.

Reba never tells anyone not to seek care. There is no "you are fine" verdict — the lowest level is
WATCH, which always carries a re-check time and named signs to watch for.

## Stack

- Backend: Bun + Hono (`apps/api`)
- Frontend: Next.js app router + TanStack Query + shadcn/ui (`apps/web`)
- DB: Neon + Drizzle
- Domain logic: `packages/core` — pure, zero I/O, fully unit tested
- Model: Gemini `gemini-3.6-flash` via `@google/genai`, `ai.interactions.create`.
  Do NOT pass `temperature`, `top_p` or `top_k` — deprecated 2026-07-21.
  Structured output via `response_format: { type: "text", mime_type: "application/json", schema }`.
  Sign IDs are an **enum generated from the protocol at request time**, so an off-protocol sign is
  structurally impossible.

## Code rules

- KISS, DRY. No file over 1,000 lines.
- `packages/core` has no imports from `apps/*` and performs no I/O.
- Drizzle: `pgTable("snake_case_plural", { camelCaseProp: text("snake_case_col") })`,
  `text("id").primaryKey().$defaultFn(createId)`,
  `timestamp(..., { withTimezone: true }).notNull().defaultNow()`, `pgEnum` at top of owning file.
- Commit at every milestone.

## Markup and accessibility rules

- **No `<div>` or `<span>` in authored markup.** Use `main, section, article, header, footer, nav,
  ul/li, dl/dt/dd, table, figure/figcaption, form, fieldset, legend, output`.
  (shadcn primitives render divs internally — that is out of scope; the rule governs what we write.)
- shadcn uses **Base UI render-prop triggers, not Radix `asChild`**.
- Loading → shadcn `Skeleton`. Never "Loading…" text, never a bare spinner.
- Empty → shared `EmptyState`. No background, no border.
- **No placeholders on labeled fields** — helper text sits between label and control.
- Mount/unmount/reflow animated with `motion/react`, respecting `useReducedMotion`.
- Errors concise and actionable; never leak a raw backend error.
- The verdict is announced in a single `aria-live="assertive"` region. Colour never carries the
  verdict alone — every level has a word and an icon.

## Realtime

SSE via Hono's native `streamSSE` from `hono/streaming` (**not** `better-sse`, which 500s on Bun).
In-memory `Map<chwId, Set<RealtimeClient>>`; `broadcastInvalidate(id, keys)` serialises once and
sends per client in try/catch; 25s ping heartbeat; `stream.onAbort(unregister)`.
Client `useRealtime()` opens an `EventSource` against absolute `NEXT_PUBLIC_API_URL` and calls
`queryClient.invalidateQueries({ queryKey: key })`. Broadcast coarse top-level keys and rely on
TanStack Query prefix semantics.

## Cut order if time runs short

1. Kinyarwanda strings
2. Motion polish
3. Gemini free-text intake (the tap-through checklist still works without it)

**Never cut:** the triage engine, the escalation-only invariant, the three-verdict UI, `/eval`.
