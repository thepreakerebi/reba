/**
 * The handover summary the family shows at the facility.
 *
 * Deliberately built by template, not by a model. It is read by a clinician under time pressure and
 * must be identical in structure every time, with no room for a generated sentence to soften or
 * reorder what was reported.
 */

import { LEVEL_COPY, type Verdict } from "@reba/core";

import type { Mother } from "../db/schema";

const DELIVERY: Record<string, string> = {
  vaginal: "vaginal delivery",
  caesarean: "caesarean section",
};

export function buildHandover(mother: Mother, verdict: Verdict, at: Date = new Date()): string {
  const days = Math.floor(verdict.hoursSinceBirth / 24);
  const dayLabel = days < 1 ? `${verdict.hoursSinceBirth} hours` : `day ${days}`;

  const lines = [
    `REBA HANDOVER — ${LEVEL_COPY[verdict.level].en.toUpperCase()}`,
    "",
    `Mother: ${mother.name}`,
    `Postpartum: ${dayLabel} (${DELIVERY[mother.deliveryType] ?? mother.deliveryType})`,
    `Reported by: ${mother.caregiverName}${mother.caregiverPhone ? ` · ${mother.caregiverPhone}` : ""}`,
    `Reported at: ${at.toISOString()}`,
    "",
    "SIGNS REPORTED",
  ];

  if (verdict.reasons.length === 0) {
    lines.push("  (none)");
  } else {
    for (const reason of verdict.reasons) {
      lines.push(`  · ${reason.label}${reason.assumedPresent ? "  [family was unsure]" : ""}`);
    }
  }

  if (mother.riskFactors.length > 0) {
    lines.push("", "RISK FACTORS ON RECORD", `  ${mother.riskFactors.join(", ")}`);
  }

  if (verdict.escalations.length > 0) {
    lines.push("", "WHY THIS WAS RAISED");
    for (const escalation of verdict.escalations) {
      lines.push(`  · ${escalation.label} (${escalation.from} → ${escalation.to})`);
    }
  }

  lines.push(
    "",
    `Protocol floor from signs alone: ${verdict.protocolFloor}`,
    "Reba is a triage prompt built on the WHO postnatal danger-sign protocol. It is not a diagnosis.",
  );

  return lines.join("\n");
}
