"use client";

import { LEVEL_COPY, type Verdict } from "@reba/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LEVEL_STYLE } from "@/lib/level-style";

/**
 * The verdict, with its full derivation shown.
 *
 * Everything below the headline is the "show your work" trail: which signs were reported, what the
 * protocol alone said, and every step that raised it — each with the reason it was raised. Nothing
 * here is generated prose; it is the actual structure the engine returned.
 */
export function VerdictPanel({
  verdict,
  handover,
  acknowledged,
  onAcknowledge,
  isAcknowledging,
}: {
  verdict: Verdict;
  handover?: string | null;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  isAcknowledging?: boolean;
}) {
  const style = LEVEL_STYLE[verdict.level];
  const copy = LEVEL_COPY[verdict.level];
  const escalated = verdict.level !== verdict.protocolFloor;

  return (
    <section
      aria-labelledby="verdict-heading"
      aria-live="assertive"
      className={`rounded-xl border-2 p-6 ${style.card}`}
    >
      <h2 id="verdict-heading" className="text-3xl font-bold tracking-tight">
        <output>
          {style.mark} {copy.en}
        </output>
      </h2>
      <p className="mt-1 text-sm font-medium opacity-80">{copy.rw}</p>
      <p className="mt-3 max-w-prose text-base">{copy.detail}</p>

      {verdict.level === "watch" ? (
        <p className="mt-3 text-sm">
          Check her again in <strong>{verdict.recheckInHours} hours</strong>.
        </p>
      ) : null}

      {verdict.reasons.length > 0 ? (
        <>
          <Separator className="my-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
            What was reported
          </h3>
          <ul className="mt-3 space-y-3">
            {verdict.reasons.map((reason) => (
              <li key={reason.signId}>
                <p className="font-medium">
                  {reason.label}
                  {reason.assumedPresent ? (
                    <Badge variant="outline" className="ml-2 align-middle">
                      counted as present — family was unsure
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-0.5 max-w-prose text-sm opacity-80">{reason.because}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <Separator className="my-5" />
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
        How this was decided
      </h3>
      <ol className="mt-3 space-y-2 text-sm">
        <li>
          <strong>Protocol floor:</strong> {LEVEL_COPY[verdict.protocolFloor].en} — from the reported
          signs alone, before anything about her was applied.
        </li>
        {verdict.escalations.map((escalation) => (
          <li key={`${escalation.source}-${escalation.to}`}>
            <strong>Raised to {LEVEL_COPY[escalation.to].en}:</strong> {escalation.label}.{" "}
            <em className="opacity-80">{escalation.rationale}</em>
          </li>
        ))}
        {!escalated ? <li className="opacity-70">Nothing raised it above the protocol floor.</li> : null}
      </ol>
      <p className="mt-4 text-xs opacity-70">
        Her history can only raise this level. There is no path in Reba that lowers it.
      </p>

      {handover ? (
        <>
          <Separator className="my-5" />
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
            Show this at the facility
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-background/70 p-4 text-xs leading-relaxed">
            {handover}
          </pre>
        </>
      ) : null}

      {onAcknowledge ? (
        <footer className="mt-6">
          {acknowledged ? (
            <p className="text-sm font-medium">
              ✓ The family confirmed they are taking her. Her health worker has been notified.
            </p>
          ) : (
            <Button onClick={onAcknowledge} disabled={isAcknowledging}>
              {isAcknowledging ? "Confirming…" : "We are taking her now"}
            </Button>
          )}
        </footer>
      ) : null}
    </section>
  );
}
