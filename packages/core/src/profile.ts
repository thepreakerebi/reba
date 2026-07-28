/**
 * Her risk profile, taken from the ANC card at discharge.
 *
 * Every entry here is a one-way ratchet: a risk factor raises the urgency of the sign categories it
 * bears on, and it can do nothing else. There is no factor that lowers a level, and the type does
 * not permit one — `steps` is a positive count of escalation steps, never a direction.
 */

import type { SignCategory } from "./protocol";

export type RiskFactorId =
  | "prior_preeclampsia"
  | "prior_pph"
  | "caesarean"
  | "anaemia"
  | "multiple_birth"
  | "grand_multipara"
  | "prolonged_labour"
  | "hiv_positive"
  | "poor_partner_support";

export type RiskFactor = {
  id: RiskFactorId;
  label: string;
  /** Which sign categories this factor makes more urgent, and by how many steps. */
  raises: Partial<Record<SignCategory, number>>;
  rationale: string;
};

export const RISK_FACTORS: RiskFactor[] = [
  {
    id: "prior_preeclampsia",
    label: "Pre-eclampsia in this or a previous pregnancy",
    raises: { hypertensive: 1 },
    rationale: "Pre-eclampsia can recur and can present up to six weeks after birth.",
  },
  {
    id: "prior_pph",
    label: "Heavy bleeding after a previous birth",
    raises: { bleeding: 1 },
    rationale: "Previous postpartum haemorrhage is the strongest predictor of another one.",
  },
  {
    id: "caesarean",
    label: "Delivered by caesarean",
    raises: { wound: 1, infection: 1 },
    rationale: "A surgical wound raises the risk of infection and of it spreading.",
  },
  {
    id: "anaemia",
    label: "Anaemia recorded during pregnancy",
    raises: { bleeding: 1 },
    rationale: "She has less reserve, so the same blood loss is more dangerous for her.",
  },
  {
    id: "multiple_birth",
    label: "Twins or more",
    raises: { bleeding: 1 },
    rationale: "An over-stretched womb contracts down less well after birth.",
  },
  {
    id: "grand_multipara",
    label: "Five or more previous births",
    raises: { bleeding: 1 },
    rationale: "Repeated pregnancies weaken the womb's ability to contract.",
  },
  {
    id: "prolonged_labour",
    label: "Long or obstructed labour",
    raises: { bleeding: 1, infection: 1 },
    rationale: "Prolonged labour raises the risk of both bleeding and infection.",
  },
  {
    id: "hiv_positive",
    label: "Living with HIV",
    raises: { infection: 1, wound: 1 },
    rationale: "Infections can progress faster and need to be seen sooner.",
  },
  {
    id: "poor_partner_support",
    label: "Little support at home",
    raises: { mental_health: 1 },
    rationale:
      "Poor partner support is the strongest predictor of postnatal depression in Rwandan cohort data.",
  },
];

const BY_ID = new Map(RISK_FACTORS.map((factor) => [factor.id, factor]));

export function getRiskFactor(id: RiskFactorId): RiskFactor | undefined {
  return BY_ID.get(id);
}

export type MotherProfile = {
  name: string;
  /** ISO timestamp of delivery. Drives the time-window modifiers. */
  birthAt: string;
  riskFactors: RiskFactorId[];
};

export function hoursSinceBirth(profile: MotherProfile, now: Date = new Date()): number {
  return (now.getTime() - new Date(profile.birthAt).getTime()) / 3_600_000;
}

/**
 * Time-window modifiers. The first 24 hours after birth is when nearly half of postpartum deaths
 * occur, so bleeding and hypertensive signs carry an extra step during that window.
 */
export function windowRaises(hours: number): Partial<Record<SignCategory, number>> {
  if (hours < 24) return { bleeding: 1, hypertensive: 1 };
  if (hours < 24 * 7) return { bleeding: 1 };
  return {};
}
