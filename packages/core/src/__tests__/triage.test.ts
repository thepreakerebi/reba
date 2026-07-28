import { describe, expect, test } from "bun:test";

import { escalate, raise, LEVELS, rank, levelDetail, levelWord } from "../levels";
import { SIGNS, SIGN_IDS, SIGN_LABEL_RW, signLabel } from "../protocol";
import { RISK_FACTORS, type MotherProfile } from "../profile";
import { triage, type Answer } from "../triage";
import { GOLDEN_CASES, caseProfile } from "../golden";
import { runEvaluation } from "../evaluate";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const profile = (riskFactors: MotherProfile["riskFactors"], hours: number): MotherProfile => ({
  name: "Test",
  birthAt: hoursAgo(hours),
  riskFactors,
});

describe("escalation-only invariant", () => {
  test("escalate never returns below any input", () => {
    for (const a of LEVELS) {
      for (const b of LEVELS) {
        const result = escalate(a, b);
        expect(rank(result)).toBeGreaterThanOrEqual(rank(a));
        expect(rank(result)).toBeGreaterThanOrEqual(rank(b));
      }
    }
  });

  test("raise never goes down and saturates at go_now", () => {
    for (const level of LEVELS) {
      expect(rank(raise(level, 1))).toBeGreaterThanOrEqual(rank(level));
      expect(raise(level, 99)).toBe("go_now");
      expect(raise(level, 0)).toBe(level);
    }
  });

  test("no risk factor can lower a verdict below the protocol floor", () => {
    const everyFactor = RISK_FACTORS.map((factor) => factor.id);
    for (const sign of SIGNS) {
      const answers: Answer[] = [{ signId: sign.id, presence: "yes" }];
      const withNone = triage(answers, profile([], 24 * 30));
      const withAll = triage(answers, profile(everyFactor, 24 * 30));
      expect(rank(withAll.level)).toBeGreaterThanOrEqual(rank(withNone.level));
      expect(rank(withAll.level)).toBeGreaterThanOrEqual(rank(withAll.protocolFloor));
    }
  });
});

describe("uncertainty escalates", () => {
  test("'unsure' scores identically to 'yes'", () => {
    for (const sign of SIGNS) {
      const asYes = triage([{ signId: sign.id, presence: "yes" }], profile([], 48));
      const asUnsure = triage([{ signId: sign.id, presence: "unsure" }], profile([], 48));
      expect(asUnsure.level).toBe(asYes.level);
    }
  });

  test("'no' contributes nothing", () => {
    const verdict = triage(
      SIGNS.map((sign) => ({ signId: sign.id, presence: "no" as const })),
      profile([], 48),
    );
    expect(verdict.level).toBe("watch");
    expect(verdict.reasons).toHaveLength(0);
  });
});

describe("off-protocol input cannot reach the verdict", () => {
  test("an unknown sign id is ignored entirely", () => {
    const verdict = triage([{ signId: "hallucinated_sign", presence: "yes" }], profile([], 48));
    expect(verdict.level).toBe("watch");
    expect(verdict.reasons).toHaveLength(0);
  });

  test("SIGN_IDS matches SIGNS and has no duplicates", () => {
    expect(new Set(SIGN_IDS).size).toBe(SIGNS.length);
  });
});

describe("both languages are complete", () => {
  test("every sign has a Kinyarwanda label and question", () => {
    for (const sign of SIGNS) {
      expect(SIGN_LABEL_RW[sign.id]).toBeTruthy();
      expect(sign.question.rw).toBeTruthy();
      expect(signLabel(sign, "rw")).not.toBe(sign.label);
    }
  });

  test("every level has Kinyarwanda copy", () => {
    for (const level of LEVELS) {
      expect(levelWord(level, "rw")).toBeTruthy();
      expect(levelDetail(level, "rw")).toBeTruthy();
      expect(levelDetail(level, "rw")).not.toBe(levelDetail(level, "en"));
    }
  });
});

describe("there is no 'you are fine' verdict", () => {
  test("an empty check still returns watch with a re-check time", () => {
    const verdict = triage([], profile([], 24 * 21));
    expect(verdict.level).toBe("watch");
    expect(verdict.recheckInHours).toBeGreaterThan(0);
  });
});

describe("golden set", () => {
  for (const goldenCase of GOLDEN_CASES) {
    test(`${goldenCase.id} — ${goldenCase.tests}`, () => {
      const verdict = triage(goldenCase.answers, caseProfile(goldenCase));
      expect(verdict.level).toBe(goldenCase.expected);
    });
  }

  test("emergency recall is 100%", () => {
    const report = runEvaluation();
    expect(report.emergencyRecall).toBe(1);
    expect(report.invariantViolations).toBe(0);
  });
});
