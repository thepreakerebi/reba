# Reba — team brief

**Frontiers GenAI Hackathon · ALX Kigali · 28 July 2026**
Build freeze 15:30 · Demo 17:00

---

## The one line

> **The six weeks after birth are when mothers die and nobody is watching. This puts a trained eye in the room — the family's.**

**Reba** is Kinyarwanda for *look / watch*. It is what the product asks the family to do.

---

## The problem

A woman gives birth in a Rwandan health facility. WHO recommends a minimum 24-hour stay after an
uncomplicated vaginal birth; she is discharged and goes home. From that moment until her postnatal
check — if she gets one — nobody is monitoring her.

That gap is where the deaths are.

| Fact | Number | Source |
|---|---|---|
| Maternal deaths that occur in the postpartum period | **more than 60%** | Scoping review, LMIC data, PMC10659187 |
| Of those, share occurring in the **first 24 hours** | **45%** | same |
| Of those, share occurring in the **first week** | **66%** | same |
| Mother–baby pairs in LMICs receiving postnatal care **within 2 days** | **9%** | WHO PNC guidance / PMC10659187 |
| Mothers and babies with no access to life-saving postnatal interventions | **1 in 5** | same |

Read those two rows together: **45% of postpartum deaths happen inside the first 24 hours, and 9% of
mother–baby pairs are seen inside the first two days.** Coverage is at its lowest exactly where risk
is at its highest. That inversion is the entire product thesis.

### What is actually killing them

| Cause | Share of maternal deaths |
|---|---|
| Haemorrhage | **27% globally, 28% in sub-Saharan Africa** |
| Indirect obstetric causes | 23% |
| Hypertensive disorders (incl. pre-eclampsia) | 16% |

Source: *Global and regional causes of maternal deaths 2009–20: a WHO systematic analysis*,
**The Lancet Global Health** (2024).

Two timing facts that shape the whole design:

- **Most PPH deaths occur within 2–3 hours of vaginal birth**, and massive haemorrhage (≥1500 mL)
  usually inside the first hour. (E-MOTIVE nested study, *Lancet Global Health*, 2025)
- **Blood loss is assessed by visual estimation, which systematically underestimates it.** In
  E-MOTIVE, moving to an objective threshold cut median time-to-diagnosis from 30 minutes to 15–17,
  and the full bundle produced a **60% relative reduction in severe bleeding outcomes**. (NEJM, 2023)

And the one everybody forgets: **pre-eclampsia can present up to six weeks after delivery** — long
after the household has stopped thinking of her as a patient.

### Why the family can't catch it

The family is standing right there. They cannot tell "normal" from "emergency", because every danger
sign is also something a new mother is *expected* to have: bleeding, headache, swelling, fever,
feeling low. So they wait. They wait for morning. They wait for the next scheduled visit. They wait
to be sure.

**It is not a lack of care-seeking. It is not a lack of facilities. It is a recognition problem, held
by untrained people, on a clock measured in hours.**

### And there is a second, quieter problem

| Fact | Number | Source |
|---|---|---|
| Rwandan postnatal women with elevated depressive symptoms (EPDS ≥12) | **20.9%** | Frontiers Glob Womens Health, 2023 (Rwanda cohort) |
| Strongest predictor | **poor partner support** | same |

Roughly **one in five** Rwandan mothers. The only people positioned to notice are the same family
members Reba is already talking to every day.

---

## Why now, and why not the obvious version

We ran an adversarial prior-art check before committing. It killed the first version of this idea,
and everyone should know why so nobody re-proposes it on stage.

**Killed — the pregnancy lifestyle diary.** "The family logs what she eats, how she sleeps, whether
she walks, and shares it with the doctor." Three reasons it fails:

1. **The evidence says it doesn't work.** In a scoping review of **39 RCTs** of app-supported
   lifestyle interventions in pregnancy, only 7 of 18 moved gestational weight gain, and **0 of 5
   trials that measured gestational diabetes found any effect on it.** This is the most-studied
   version of the product category and it does not prevent complications.
2. **Wrong clock.** A logbook reviewed at the next clinic visit runs on weeks. PPH runs on hours.
3. **Rwanda already built it, in 2013.** **RapidSMS-MCH** is national: CHWs track every pregnancy,
   receive SMS reminders for ANC, delivery and PNC dates, and fire a "RED alert" on danger signs.
   The published evaluation found it **did not increase uptake of the services studied — largely
   because of a ceiling effect**: coverage was already too high to improve.

That last point matters enormously in this room. **Rwanda's maternal mortality ratio fell from 210
per 100,000 live births in 2017 to 149 in the 2025 RDHS.** Pitching "track the pregnant woman and
alert the system" to a Kigali panel is pitching a solved problem.

**Survived — the postnatal window.** Rwanda closed the antenatal gap. The 42 days after discharge is
the gap still open, and no national system watches it daily from inside the home.

---

## The product

A postpartum danger-sign companion the **family** uses for the 42 days after discharge.

**Setup, once, at discharge (60 seconds).** Her name, delivery date, delivery type, and the risk
flags off her ANC card: prior pre-eclampsia, caesarean, anaemia, twins, long labour, little support
at home.

**The daily check (30 seconds).** Concrete, observable questions only — nothing requiring a cuff, a
scale, or a judgement call:

- Has she soaked more than one pad or cloth right through in the last hour?
- Is her vision blurred, or is she seeing flashing lights?
- Is there new swelling in her face or hands?
- Is one leg painful, red or swollen — but not the other?
- Does the discharge smell bad? Is she hot to touch?
- Has she had thoughts of harming herself or the baby?

The family can also just describe it in their own words, in Kinyarwanda or English. Gemini converts
that into structured signs — **choosing only from a closed list of protocol sign IDs**. It cannot
invent a sign.

**The verdict — three outcomes, and only ever three:**

> 🔴 **GO NOW** — nearest facility, immediately. Do not wait for morning.
> 🟠 **GO TODAY** — she needs to be seen today, not at her next appointment.
> 🟢 **WATCH** — re-check in N hours, and here is specifically what to watch for.

**The handover.** On GO NOW or GO TODAY, Reba produces a short structured summary — which signs, when
reported, her risk profile — so the family isn't explaining themselves at the desk and the clinician
isn't starting from zero.

**The CHW view.** Her community health worker sees her card go red **live, with no refresh**.

---

## The three invariants (this is the pitch)

1. **The model never decides.** Gemini only turns plain language into structured sign IDs. The
   verdict is computed by pure, unit-tested TypeScript from the WHO postnatal danger-sign protocol.
   There is no code path where a model output becomes a verdict.
2. **Personalization can only escalate.** Her risk profile can raise her urgency level. It can never
   lower it below the protocol floor. Enforced by a monotonic max — **there is no de-escalation
   function anywhere in the codebase**, and a test brute-forces every sign against every risk factor
   to prove it.
3. **Uncertainty escalates.** "Not sure" is scored exactly as "yes". Also enforced by test.

And: **there is no "you are fine" verdict.** The lowest level is WATCH, which always carries a
re-check time and named signs. Reba never tells anyone not to seek care.

---

## How this scores the bonus criteria

| Criterion | How Reba meets it |
|---|---|
| **Human approval step** | Nothing escalates or resolves itself. The family confirms; the CHW sees it; the app never closes a case on its own. And the model's output is a *proposal of signs*, ratified by the protocol before it becomes anything. |
| **Evaluation metrics** | A golden set of clinical vignettes, scored live at `/eval`. Headline metric is **recall on emergency cases** — because a false negative here is a death. Currently **100% (all `go_now` cases caught), 0 invariant violations**. |
| **Personalization with constraints** | The escalation-only ratchet above. Demonstrated live: two women, identical reported signs, and the one with prior pre-eclampsia is raised a level — while the reverse is structurally impossible. |

---

## Market

Be careful here. These are global numbers for adjacent categories, and they are **not** our
serviceable market. Use them to show the category is real and funded, not to claim the TAM.

| Market | 2024 | 2030 | CAGR |
|---|---|---|---|
| Global FemTech | **$39.29B** | **$97.25B** | 16.4% |
| Global Maternal Health | **$25.37B** | **$41.21B** | 8.6% |

Source: Grand View Research (FemTech); Research and Markets (Maternal Health).

**The honest bottom-up number for Rwanda:** at a crude birth rate of 28.7 per 1,000 against a
population of ~14.6 million, Rwanda has **roughly 413,000 live births a year** *(derived, not a
published figure — say "roughly 400,000" on stage)*. Every one of them is a 42-day episode with a
family attached. The buyer is not the family — it is the Ministry of Health, RSSB/Mutuelle, or a
CHW-programme funder, because avoided emergency admissions and avoided deaths are their line item.

**The real market signal is regional, not Rwandan.** Sub-Saharan Africa carries **70% of all global
maternal deaths**, and the postnatal coverage gap (9% seen within 2 days) is an LMIC-wide number,
not a Rwandan one. Rwanda is the right *first* market precisely because its CHW infrastructure is
the strongest — it is where the tool can be proven, not where the burden is worst.

---

## Do NOT put these on a slide

Rigour matters more than a big number, and a judge who catches one soft figure discounts everything
else you said.

- **Do not quote a Rwanda-specific postpartum death breakdown.** We have the global and LMIC figures;
  we did not verify a Rwandan split of postpartum vs intrapartum deaths.
- **The 413,000 births figure is derived by us**, not published. Say "roughly 400,000".
- **Do not say Reba prevents deaths.** We have no outcome data. Say it closes a recognition gap, and
  point to E-MOTIVE as evidence that *earlier detection* changes outcomes — that is a claim about the
  mechanism, not about our app.
- **Do not call it a medical device or a diagnostic.** It is a triage prompt built on a published
  protocol. Say that out loud; it converts our biggest risk into a credibility point.
- **The 63.6% postpartum depression figure** that appears in some Rwandan literature is a
  *possible-depression* screening threshold, not a diagnosis rate. **Use 20.9% (EPDS ≥12).**

---

## Build status

| Piece | State |
|---|---|
| Triage engine + WHO protocol (19 signs, 9 risk factors, combination rules) | **Done, 25 tests green** |
| Escalation-only invariant, brute-force proven | **Done** |
| Golden set (16 vignettes) + eval scoring | **Done, 100% emergency recall** |
| Neon database + Drizzle schema | In progress |
| Hono API + SSE realtime | In progress |
| Next.js UI — daily check, verdict, CHW view, `/eval` | In progress |
| Gemini free-text intake (enum-constrained) | Next |

Stack: Bun + Hono · Next.js + TanStack Query + shadcn · Neon + Drizzle · Gemini `gemini-3.6-flash`.

**Cut order if we run out of time:** Kinyarwanda strings → motion polish → Gemini free-text intake
(the tap-through checklist works without it).
**Never cut:** the triage engine, the escalation invariant, the three-verdict screen, `/eval`.

---

## What we need from each other

1. **Someone owns the demo script.** Two mothers, identical signs, different histories — that is the
   moment that wins the room. Rehearse it until it is 90 seconds.
2. **A Kinyarwanda speaker checks every question string.** The questions are the product; if they
   read as clinical rather than as something you'd actually ask your sister, the whole thing fails.
3. **Someone reads this brief's "Do NOT put these on a slide" section before writing any slide.**
4. **Whoever presents must be able to say the three invariants from memory.** That is the pitch.

---

## Sources

- [Global and regional causes of maternal deaths 2009–20: a WHO systematic analysis — *Lancet Global Health*](https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(24)00560-6/fulltext)
- [WHO recommendations on maternal and newborn care for a positive postnatal experience](https://www.ncbi.nlm.nih.gov/books/NBK579653/)
- [Proximate and distant determinants of maternal and neonatal mortality in the postnatal period — LMIC scoping review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10659187/)
- [When are postpartum haemorrhages diagnosed? Nested study within E-MOTIVE — *Lancet Global Health*](https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(25)00302-X/fulltext)
- [Randomized Trial of Early Detection and Treatment of Postpartum Hemorrhage — *NEJM*](https://www.nejm.org/doi/full/10.1056/NEJMoa2303966)
- [App-Supported Lifestyle Interventions in Pregnancy: Scoping Review of 39 RCTs](https://pmc.ncbi.nlm.nih.gov/articles/PMC10674147/)
- [Effect of a community health worker mHealth monitoring system (RapidSMS) on uptake of maternal and newborn health services in Rwanda](https://ghrp.biomedcentral.com/articles/10.1186/s41256-019-0098-y)
- [Stunting reduced, maternal-child health improved: RDHS 2025](https://www.ncda.gov.rw/updates/news-detail/stunting-reduced-maternal-child-health-improved-rdhs-2025-reveals)
- [Predicting postnatal depressive symptoms in a prospective cohort study in Rwanda](https://pmc.ncbi.nlm.nih.gov/articles/PMC10402918/)
- [Maternal mortality rates and statistics — UNICEF Data](https://data.unicef.org/topic/maternal-health/maternal-mortality/)
- [FemTech Market Size, Share & Trends — Grand View Research](https://www.grandviewresearch.com/industry-analysis/femtech-market-report)
- [Maternal Health Market Outlook 2030 — Research and Markets](https://www.researchandmarkets.com/reports/6169219/maternal-health-market-outlook)
