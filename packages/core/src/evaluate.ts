/**
 * Scoring the golden set. Shared by `bun test` and the `/eval` page.
 *
 * `emergencyRecall` is reported first and deliberately: a missed `go_now` is the failure mode that
 * costs a life, and it is the only metric here that may not regress.
 */

import { GOLDEN_CASES, caseProfile, type GoldenCase } from "./golden";
import { triage, type Verdict } from "./triage";
import { rank, type Level } from "./levels";

export type CaseResult = {
  case: GoldenCase;
  verdict: Verdict;
  pass: boolean;
  /** True when the true level was `go_now` and Reba said something less. The dangerous error. */
  missedEmergency: boolean;
  /** True when Reba called it more urgent than the golden level. Costly, not dangerous. */
  overEscalated: boolean;
};

export type EvalReport = {
  results: CaseResult[];
  total: number;
  passed: number;
  accuracy: number;
  emergencyTotal: number;
  emergencyCaught: number;
  emergencyRecall: number;
  overEscalations: number;
  /** Cases where the final level was below the protocol floor. Must always be 0. */
  invariantViolations: number;
};

export function runEvaluation(now: Date = new Date()): EvalReport {
  const results: CaseResult[] = GOLDEN_CASES.map((goldenCase) => {
    const verdict = triage(goldenCase.answers, caseProfile(goldenCase, now), now);
    const expected: Level = goldenCase.expected;
    return {
      case: goldenCase,
      verdict,
      pass: verdict.level === expected,
      missedEmergency: expected === "go_now" && verdict.level !== "go_now",
      overEscalated: rank(verdict.level) > rank(expected),
    };
  });

  const emergencies = results.filter((result) => result.case.expected === "go_now");
  const emergencyCaught = emergencies.filter((result) => !result.missedEmergency).length;
  const passed = results.filter((result) => result.pass).length;

  return {
    results,
    total: results.length,
    passed,
    accuracy: results.length === 0 ? 1 : passed / results.length,
    emergencyTotal: emergencies.length,
    emergencyCaught,
    emergencyRecall: emergencies.length === 0 ? 1 : emergencyCaught / emergencies.length,
    overEscalations: results.filter((result) => result.overEscalated).length,
    invariantViolations: results.filter(
      (result) => rank(result.verdict.level) < rank(result.verdict.protocolFloor),
    ).length,
  };
}
