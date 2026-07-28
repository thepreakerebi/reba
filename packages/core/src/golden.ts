/**
 * The golden set.
 *
 * These vignettes are the evaluation data for `/eval` and the assertions for `bun test` — written
 * once, rendered twice. The headline metric is **recall on emergency cases**: the share of cases
 * whose true level is `go_now` that Reba also calls `go_now`. A false negative here is a death, so
 * that number is reported before accuracy and is the only one that may not regress.
 */

import type { Answer } from "./triage";
import type { Level } from "./levels";
import type { MotherProfile, RiskFactorId } from "./profile";

export type GoldenCase = {
  id: string;
  narrative: string;
  hoursAgo: number;
  riskFactors: RiskFactorId[];
  answers: Answer[];
  expected: Level;
  /** Why this case is in the set — what it is testing. */
  tests: string;
};

const yes = (signId: string): Answer => ({ signId, presence: "yes" });
const unsure = (signId: string): Answer => ({ signId, presence: "unsure" });

export const GOLDEN_CASES: GoldenCase[] = [
  {
    id: "pph-first-hour",
    narrative: "Two hours after a normal delivery, she has soaked two cloths right through.",
    hoursAgo: 2,
    riskFactors: [],
    answers: [yes("heavy_bleeding")],
    expected: "go_now",
    tests: "The single most urgent sign, alone, in the window where it kills.",
  },
  {
    id: "pph-anaemic",
    narrative: "Day three. Bleeding has gone bright red again. She was anaemic in pregnancy.",
    hoursAgo: 72,
    riskFactors: ["anaemia"],
    answers: [yes("bleeding_increasing")],
    expected: "go_now",
    tests: "Anaemia plus the first-week window escalates a go_today sign to go_now.",
  },
  {
    id: "pph-no-risk",
    narrative: "Day three. Bleeding has gone bright red again. No risk factors on her card.",
    hoursAgo: 72,
    riskFactors: [],
    answers: [yes("bleeding_increasing")],
    expected: "go_now",
    tests: "The paired case above — same sign, and the window alone still raises it.",
  },
  {
    id: "eclampsia",
    narrative: "Day six. She had a fit this morning.",
    hoursAgo: 24 * 6,
    riskFactors: [],
    answers: [yes("convulsion")],
    expected: "go_now",
    tests: "Unambiguous emergency, well outside the delivery window.",
  },
  {
    id: "preeclampsia-late",
    narrative: "Day 30. Bad headache that will not go away, and her face looks puffy.",
    hoursAgo: 24 * 30,
    riskFactors: [],
    answers: [yes("severe_headache"), yes("new_swelling")],
    expected: "go_now",
    tests: "Late-onset pre-eclampsia — the combination rule, long after anyone is watching.",
  },
  {
    id: "preeclampsia-headache-only",
    narrative: "Day 30. Bad headache that will not go away. Nothing else.",
    hoursAgo: 24 * 30,
    riskFactors: [],
    answers: [yes("severe_headache")],
    expected: "go_today",
    tests: "The same headache without the second sign must NOT be called an emergency.",
  },
  {
    id: "preeclampsia-headache-prior-history",
    narrative: "Day 30. Bad headache only — but she had pre-eclampsia in this pregnancy.",
    hoursAgo: 24 * 30,
    riskFactors: ["prior_preeclampsia"],
    answers: [yes("severe_headache")],
    expected: "go_now",
    tests: "The demo pair: identical signs, her history raises her a level. The reverse is impossible.",
  },
  {
    id: "sepsis",
    narrative: "Day four. She is hot to touch and the discharge smells bad.",
    hoursAgo: 24 * 4,
    riskFactors: [],
    answers: [yes("fever"), yes("foul_discharge")],
    expected: "go_now",
    tests: "Two go_today signs that are an emergency together.",
  },
  {
    id: "fever-alone",
    narrative: "Day four. She feels warm. Nothing else.",
    hoursAgo: 24 * 4,
    riskFactors: [],
    answers: [yes("fever")],
    expected: "go_today",
    tests: "Fever alone is same-day, not an emergency. Guards against over-escalation.",
  },
  {
    id: "wound-caesarean",
    narrative: "Day eight after a caesarean. The wound is red and leaking.",
    hoursAgo: 24 * 8,
    riskFactors: ["caesarean"],
    answers: [yes("wound_problem")],
    expected: "go_now",
    tests: "Caesarean raises wound signs a step.",
  },
  {
    id: "dvt",
    narrative: "Day ten. Her right calf is hot, red and painful. The left is fine.",
    hoursAgo: 24 * 10,
    riskFactors: [],
    answers: [yes("calf_pain")],
    expected: "go_now",
    tests: "One-sided leg signs are an emergency regardless of profile.",
  },
  {
    id: "mastitis",
    narrative: "Day 12. One breast is red, hot and sore.",
    hoursAgo: 24 * 12,
    riskFactors: [],
    answers: [yes("breast_infection")],
    expected: "go_today",
    tests: "Treatable, needs care today, must not be called an emergency.",
  },
  {
    id: "ppd-screen",
    narrative: "Day 14. She has been crying most days this week. Little support at home.",
    hoursAgo: 24 * 14,
    riskFactors: ["poor_partner_support"],
    answers: [yes("persistent_low_mood")],
    expected: "go_now",
    tests: "Mental health routes to a human, and poor support raises it.",
  },
  {
    id: "self-harm",
    narrative: "Day 20. She said she has had thoughts of harming herself.",
    hoursAgo: 24 * 20,
    riskFactors: [],
    answers: [yes("cannot_care_for_baby")],
    expected: "go_now",
    tests: "Always an emergency, never advice.",
  },
  {
    id: "unsure-counts-as-present",
    narrative: "Day two. The family is not sure whether the bleeding is getting heavier.",
    hoursAgo: 48,
    riskFactors: [],
    answers: [unsure("bleeding_increasing")],
    expected: "go_now",
    tests: "Uncertainty escalates — 'unsure' is scored exactly as 'yes'.",
  },
  {
    id: "all-clear",
    narrative: "Day 21. Nothing reported.",
    hoursAgo: 24 * 21,
    riskFactors: ["caesarean", "anaemia"],
    answers: [],
    expected: "watch",
    tests: "No signs means WATCH — never 'you are fine'. Risk factors alone escalate nothing.",
  },
];

export function caseProfile(goldenCase: GoldenCase, now: Date = new Date()): MotherProfile {
  return {
    name: "Test case",
    birthAt: new Date(now.getTime() - goldenCase.hoursAgo * 3_600_000).toISOString(),
    riskFactors: goldenCase.riskFactors,
  };
}
