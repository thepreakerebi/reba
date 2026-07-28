/**
 * The triage engine.
 *
 * This file computes the verdict. No model output reaches it except as a list of sign IDs that
 * already had to exist in the protocol, and a presence value. Everything downstream of that is
 * deterministic, inspectable, and unit tested.
 *
 * Ordering matters and is deliberate:
 *   1. protocol floor   — the level each reported sign carries on its own
 *   2. combinations     — pairs that are more dangerous together than apart
 *   3. profile + window — escalation-only modifiers
 * A later stage can only ever raise the level a stage before it produced.
 */

import { escalate, raise, recheckHours, type Level } from "./levels";
import { getSign, type SignCategory } from "./protocol";
import {
  getRiskFactor,
  hoursSinceBirth,
  windowRaises,
  type MotherProfile,
} from "./profile";

/** `"unsure"` is treated as present. Uncertainty escalates. */
export type Presence = "yes" | "no" | "unsure";

export type Answer = { signId: string; presence: Presence };

export type Reason = {
  signId: string;
  label: string;
  category: SignCategory;
  because: string;
  /** Level this sign contributed after modifiers. */
  level: Level;
  /** True when the family answered "unsure" and we counted it as present. */
  assumedPresent: boolean;
};

export type Escalation = {
  /** `risk:<factorId>`, `window:<label>`, or `combination:<id>` */
  source: string;
  label: string;
  from: Level;
  to: Level;
  rationale: string;
};

export type Verdict = {
  level: Level;
  /** The level the protocol alone produced, before any personalization. Never above `level`. */
  protocolFloor: Level;
  reasons: Reason[];
  escalations: Escalation[];
  recheckInHours: number;
  hoursSinceBirth: number;
};

type Combination = {
  id: string;
  label: string;
  requires: string[];
  to: Level;
  rationale: string;
};

const COMBINATIONS: Combination[] = [
  {
    id: "sepsis",
    label: "Fever together with foul-smelling discharge",
    requires: ["fever", "foul_discharge"],
    to: "go_now",
    rationale: "Together these point to infection of the womb, which spreads fast.",
  },
  {
    id: "preeclampsia_progressing",
    label: "Severe headache together with swelling",
    requires: ["severe_headache", "new_swelling"],
    to: "go_now",
    rationale: "This pattern is pre-eclampsia until proven otherwise.",
  },
  {
    id: "hypovolaemia",
    label: "Bleeding together with dizziness",
    requires: ["bleeding_increasing", "fainting_or_dizzy"],
    to: "go_now",
    rationale: "Feeling faint alongside bleeding suggests more blood has been lost than is visible.",
  },
];

function isPresent(presence: Presence): boolean {
  return presence !== "no";
}

export function triage(answers: Answer[], profile: MotherProfile, now: Date = new Date()): Verdict {
  const hours = hoursSinceBirth(profile, now);
  const present = answers.filter((answer) => isPresent(answer.presence));
  const presentIds = new Set(present.map((answer) => answer.signId));

  const escalations: Escalation[] = [];
  const reasons: Reason[] = [];

  // Stage 1 — protocol floor, per sign.
  let protocolFloor: Level = "watch";
  for (const answer of present) {
    const sign = getSign(answer.signId);
    if (!sign) continue; // unknown IDs cannot enter the verdict
    protocolFloor = escalate(protocolFloor, sign.baseLevel);
    reasons.push({
      signId: sign.id,
      label: sign.label,
      category: sign.category,
      because: sign.because,
      level: sign.baseLevel,
      assumedPresent: answer.presence === "unsure",
    });
  }

  let level = protocolFloor;

  // Stage 2 — combinations.
  for (const combination of COMBINATIONS) {
    if (!combination.requires.every((id) => presentIds.has(id))) continue;
    const next = escalate(level, combination.to);
    if (next !== level) {
      escalations.push({
        source: `combination:${combination.id}`,
        label: combination.label,
        from: level,
        to: next,
        rationale: combination.rationale,
      });
      level = next;
    }
  }

  // Stage 3 — profile and time-window modifiers. Escalation only.
  const categories = new Set(reasons.map((reason) => reason.category));

  for (const factorId of profile.riskFactors) {
    const factor = getRiskFactor(factorId);
    if (!factor) continue;
    for (const [category, steps] of Object.entries(factor.raises)) {
      if (!categories.has(category as SignCategory)) continue;
      const next = escalate(level, raise(level, steps));
      if (next === level) continue;
      escalations.push({
        source: `risk:${factor.id}`,
        label: factor.label,
        from: level,
        to: next,
        rationale: factor.rationale,
      });
      level = next;
    }
  }

  const windowLabel = hours < 24 ? "First 24 hours after birth" : "First week after birth";
  for (const [category, steps] of Object.entries(windowRaises(hours))) {
    if (!categories.has(category as SignCategory)) continue;
    const next = escalate(level, raise(level, steps));
    if (next === level) continue;
    escalations.push({
      source: `window:${hours < 24 ? "first_24h" : "first_week"}`,
      label: windowLabel,
      from: level,
      to: next,
      rationale:
        hours < 24
          ? "Nearly half of postpartum deaths happen in the first 24 hours, so thresholds are tighter."
          : "Two thirds of postpartum deaths happen in the first week.",
    });
    level = next;
  }

  return {
    level,
    protocolFloor,
    reasons,
    escalations,
    recheckInHours: recheckHours(level, hours),
    hoursSinceBirth: Math.round(hours),
  };
}
