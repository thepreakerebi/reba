# Reba

**The six weeks after birth are when mothers die and nobody is watching. This puts a trained eye in the room — the family's.**

Reba (Kinyarwanda: *look, watch*) is a postpartum danger-sign companion for the family, covering the
42 days after discharge. A family member answers a short daily check — by tapping, typing, or
speaking in Kinyarwanda or English — and Reba returns one of three things: **Go now**, **Go today**,
or **Watch**.

Built by **Overfit & Chill** for the Frontiers GenAI Hackathon, ALX Kigali, 28 July 2026.

---

## Why

| | |
|---|---|
| Maternal deaths occurring postpartum | **more than 60%** |
| Of those, within the first 24 hours | **45%** |
| Mother–baby pairs in LMICs seen within 2 days | **9%** |
| Leading cause of maternal death (sub-Saharan Africa) | **haemorrhage, 28%** |

Coverage is at its lowest exactly where risk is at its highest. Rwanda has closed the *antenatal*
gap — its national CHW alert system found no room left to improve on it, and maternal mortality fell
from 210 per 100,000 live births in 2017 to 149 in the 2025 RDHS. The postnatal window is the one
still open.

The family is standing right there. They just cannot tell "normal" from "emergency", because every
danger sign is also something a new mother is expected to have. **It is a recognition problem, held
by untrained people, on a clock measured in hours.**

Full sourcing, market figures, and the prior-art audit that killed the first version of this idea
are in [`BRIEF.md`](./BRIEF.md).

---

## The three invariants

These are not style preferences. They are the product.

1. **The model never decides.** Gemini converts speech or plain language into structured sign IDs
   drawn from a fixed protocol list. The verdict is computed by pure TypeScript in `@reba/core` from
   the WHO postnatal danger-sign protocol. There is no code path where a model output becomes a
   verdict.
2. **Personalization can only escalate.** A woman's risk profile may raise her urgency level. It can
   never lower it below the protocol floor. Enforced by a monotonic max — **there is no
   de-escalation function in the codebase** — and proven by a test that brute-forces all 19 signs
   against all 9 risk factors.
3. **Uncertainty escalates.** An unclear or unknown answer counts as the sign being present.

There is no "you are fine" verdict. The lowest level is **Watch**, which always carries a re-check
time and named signs. Reba never tells anyone not to seek care.

---

## How it works

```
Family speaks or types            ─┐
  (Kinyarwanda or English)         │
                                   ├─► Gemini ──► transcript + proposed signs
Or taps through 19 questions      ─┘              (sign IDs enum-constrained
                                                   to the protocol)
                                          │
                                          ▼
                              FAMILY CONFIRMS what was heard
                                          │
                                          ▼
                        Triage engine (pure TypeScript, no model)
                          1. protocol floor, per reported sign
                          2. combination rules (e.g. fever + foul discharge)
                          3. risk profile + time window — escalation only
                                          │
                                          ▼
                        GO NOW  ·  GO TODAY  ·  WATCH
                        + full derivation shown
                        + handover summary for the facility
                                          │
                                          ▼
                        CHW watch board updates live (SSE)
```

Speech recognition in Kinyarwanda is the least reliable link in the chain, so it is the one place
Reba insists a person checks the machine's work before anything is scored.

---

## Stack

| Layer | Choice |
|---|---|
| Domain logic | `@reba/core` — pure TypeScript, zero I/O, 27 unit tests |
| API | Bun + Hono, SSE realtime |
| Database | Neon Postgres + Drizzle |
| Web | Next.js (App Router), TanStack Query, shadcn/ui, motion |
| Model | Gemini `gemini-3.6-flash` via `@google/genai` |

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.3+
- A Neon Postgres database
- A Gemini API key from [Google AI Studio](https://aistudio.google.com) (free tier is enough)

### Install

```bash
git clone https://github.com/thepreakerebi/reba.git
cd reba
bun install
```

### Configure

```bash
cp .env.example .env
```

Fill in:

```dotenv
DATABASE_URL="postgresql://…"
GEMINI_API_KEY="…"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Set up the database

```bash
cd apps/api
bun run db:push     # create tables
bun run db:seed     # load the demo mothers
```

### Run

```bash
# terminal 1 — API on :3001
cd apps/api && bun run dev

# terminal 2 — web on :3000
cd apps/web && bun run dev
```

Open <http://localhost:3000>.

### Test

```bash
bun test packages/core
```

---

## Project layout

```
reba/
├── apps/
│   ├── api/                  Bun + Hono
│   │   └── src/
│   │       ├── db/           Drizzle schema, lazy client, seed
│   │       ├── lib/          SSE fan-out, Gemini interpretation, handover
│   │       └── routes/       mothers, check-ins, protocol, eval, realtime
│   └── web/                  Next.js App Router
│       ├── app/              watch board · /m/[id] daily check · /eval
│       ├── components/       verdict panel, voice intake, shadcn/ui
│       └── lib/              API client, SSE bridge, i18n, level styling
├── packages/
│   └── core/                 the triage engine — pure and testable
│       └── src/
│           ├── protocol.ts   19 WHO danger signs, EN + RW
│           ├── levels.ts     escalation-only level algebra
│           ├── profile.ts    9 risk factors, each a one-way ratchet
│           ├── triage.ts     the engine
│           ├── golden.ts     16 clinical vignettes
│           └── evaluate.ts   scoring, led by emergency recall
├── BRIEF.md                  sourced problem statement and market
└── CLAUDE.md                 engineering rules for this repo
```

---

## Evaluation

`/eval` scores a golden set of clinical vignettes live, on every page load. The headline metric is
**recall on emergency cases** — the share of true `go_now` cases Reba also calls `go_now` — because
a false negative here is a death.

| Metric | Current |
|---|---|
| Emergency recall | **100%** (all `go_now` cases caught) |
| Exact-level accuracy | **100%** (16/16) |
| Invariant violations | **0** |

---

## Demo

1. Open `/` — the watch board, sorted by urgency. Leave it visible.
2. Open **Uwase Claudine** (day 30, no risk factors). Report *severe headache*. → **Go today**.
3. Open **Umutoni Jeanne** — same day, same single sign, but prior pre-eclampsia. → **Go now**, and
   the panel names why.
4. The watch board has already re-sorted, with no refresh.
5. Open `/eval`.

Step 3 is personalization-with-constraints demonstrated rather than claimed: the escalation happens,
and the reverse is structurally impossible.

---

## Known limitations

Stated plainly, because the honest version is the credible one.

- **Reba has no outcome data.** It closes a recognition gap. It is not shown to prevent deaths.
- **It is not a medical device or a diagnostic.** It is a triage prompt built on a published
  protocol.
- **The Kinyarwanda strings were not written by a first-language speaker** and need a review pass
  before any real use.
- **Kinyarwanda speech recognition is unproven here.** The pipeline is verified end-to-end on English
  audio and on Kinyarwanda text; Kinyarwanda *audio* quality has not been measured. This is exactly
  why the transcript is shown for confirmation rather than scored directly.
- **Authentication is out of scope** for the hackathon build.

---

## Licence

MIT
