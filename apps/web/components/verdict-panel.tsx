"use client";

import { useState } from "react";
import {
  LEVEL_COPY,
  getSign,
  levelDetail,
  levelWord,
  signLabel,
  type Lang,
  type Verdict,
} from "@reba/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEVEL_STYLE } from "@/lib/level-style";
import { t } from "@/lib/i18n";

/**
 * The result screen.
 *
 * Ordered by what a frightened person needs, not by what is interesting: the instruction and the
 * action come first and fill the screen, the evidence sits below it, and the clinician's handover
 * is folded away until it is actually needed at the facility.
 *
 * The derivation stays on screen rather than behind a toggle — being able to see why Reba said what
 * it said is the point, not a detail.
 */
export function VerdictPanel({
  verdict,
  lang,
  handover,
  acknowledged,
  onAcknowledge,
  isAcknowledging,
}: {
  verdict: Verdict;
  lang: Lang;
  handover?: string | null;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  isAcknowledging?: boolean;
}) {
  const style = LEVEL_STYLE[verdict.level];
  const strings = t(lang);
  const [copied, setCopied] = useState(false);
  const escalated = verdict.level !== verdict.protocolFloor;

  async function copyHandover() {
    if (!handover) return;
    await navigator.clipboard.writeText(handover);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section aria-labelledby="verdict-heading" aria-live="assertive" className="space-y-6">
      {/* The instruction and the action, together, above everything else. */}
      <header className={`rounded-2xl border p-6 sm:p-8 ${style.card}`}>
        <p className="text-sm font-semibold uppercase tracking-widest opacity-60">
          {lang === "rw" ? LEVEL_COPY[verdict.level].en : LEVEL_COPY[verdict.level].rw}
        </p>
        <h2
          id="verdict-heading"
          className="mt-1 flex items-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl"
        >
          <output aria-hidden="true">{style.mark}</output>
          <output>{levelWord(verdict.level, lang)}</output>
        </h2>
        <p className="mt-4 max-w-prose text-lg leading-snug">
          {levelDetail(verdict.level, lang)}
        </p>

        {verdict.level === "watch" ? (
          <p className="mt-4 text-base">
            {strings.recheckIn} <strong className="tabular-nums">{verdict.recheckInHours}</strong>{" "}
            {strings.hours}
          </p>
        ) : null}

        {onAcknowledge ? (
          <footer className="mt-6">
            {acknowledged ? (
              <p className="rounded-lg bg-background/70 px-4 py-3 text-sm font-medium">
                {strings.confirmed}
              </p>
            ) : (
              <Button
                onClick={onAcknowledge}
                disabled={isAcknowledging}
                className="h-14 w-full text-base sm:w-auto sm:px-10"
              >
                {isAcknowledging ? strings.confirming : strings.takingHer}
              </Button>
            )}
          </footer>
        ) : null}
      </header>

      {verdict.reasons.length > 0 ? (
        <details className="group rounded-2xl border" open>
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-sm font-semibold sm:p-6">
            {strings.whatReported}
            <span className="flex items-center gap-3 text-muted-foreground">
              <Badge variant="secondary" className="tabular-nums">
                {verdict.reasons.length}
              </Badge>
              <span className="transition-transform group-open:rotate-180">▾</span>
            </span>
          </summary>
          <ul className="divide-y border-t px-5 pb-5 sm:px-6 sm:pb-6">
            {verdict.reasons.map((reason) => {
              const sign = getSign(reason.signId);
              return (
                <li key={reason.signId} className="py-3">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <mark className={`size-2 rounded-full ${LEVEL_STYLE[reason.level].badge}`} />
                    {sign ? signLabel(sign, lang) : reason.label}
                    {reason.assumedPresent ? (
                      <Badge variant="outline" className="font-normal">
                        {strings.unsureBadge}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="mt-1 pl-4 text-sm text-muted-foreground">{reason.because}</p>
                </li>
              );
            })}
          </ul>
        </details>
      ) : null}

      <section aria-labelledby="decided-heading" className="rounded-2xl border p-5 sm:p-6">
        <h3
          id="decided-heading"
          className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {strings.howDecided}
        </h3>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <mark className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
            <p>
              <strong>{strings.protocolFloor}: {levelWord(verdict.protocolFloor, lang)}</strong>
              <br />
              <em className="text-muted-foreground">{strings.fromSignsAlone}</em>
            </p>
          </li>
          {verdict.escalations.map((escalation) => (
            <li key={`${escalation.source}-${escalation.to}`} className="flex gap-3">
              <mark className={`mt-1.5 size-1.5 shrink-0 rounded-full ${style.badge}`} />
              <p>
                <strong>
                  {strings.raisedTo} {levelWord(escalation.to, lang)} — {escalation.label}
                </strong>
                <br />
                <em className="text-muted-foreground">{escalation.rationale}</em>
              </p>
            </li>
          ))}
          {!escalated ? (
            <li className="flex gap-3">
              <mark className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted" />
              <p className="text-muted-foreground">{strings.nothingRaised}</p>
            </li>
          ) : null}
        </ol>
        <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">{strings.onlyRaise}</p>
      </section>

      {handover ? (
        <details className="group rounded-2xl border">
          <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 text-sm font-semibold sm:p-6">
            {strings.showAtFacility}
            <span className="text-muted-foreground transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <figure className="border-t px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
              {handover}
            </pre>
            <figcaption className="mt-3">
              <Button type="button" variant="outline" size="sm" onClick={copyHandover}>
                {copied ? "✓ Copied" : "Copy"}
              </Button>
            </figcaption>
          </figure>
        </details>
      ) : null}
    </section>
  );
}
