"use client";

import { motion, useReducedMotion } from "motion/react";
import { SIGNS, type Lang, type Presence } from "@reba/core";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

/**
 * Step two, checklist path: one question per screen.
 *
 * Answering advances automatically, so a full check is nineteen taps and no scrolling. "Finish now"
 * is available from the first question because an unreported sign is simply absent — the protocol
 * scores what was said, never what was skipped.
 */
export function QuestionStep({
  index,
  lang,
  answers,
  onAnswer,
  onBack,
  onFinish,
}: {
  index: number;
  lang: Lang;
  answers: Record<string, Presence>;
  onAnswer: (signId: string, presence: Presence) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const copy = t(lang);
  const reduceMotion = useReducedMotion();
  const sign = SIGNS[index];
  const selected = answers[sign.id];

  const choices: { value: Presence; label: string; variant: "default" | "outline" }[] = [
    { value: "yes", label: copy.yes, variant: "default" },
    { value: "no", label: copy.no, variant: "outline" },
    { value: "unsure", label: copy.unsure, variant: "outline" },
  ];

  const progress = ((index + 1) / SIGNS.length) * 100;

  return (
    <section aria-labelledby="question-heading">
      <header>
        <p className="text-sm tabular-nums text-muted-foreground">
          {copy.question} {index + 1} {copy.of} {SIGNS.length}
        </p>
        <figure
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={SIGNS.length}
        >
          <motion.i
            className="block h-full rounded-full bg-foreground"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
          />
        </figure>
      </header>

      <motion.article
        key={sign.id}
        initial={reduceMotion ? false : { opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18 }}
        className="mt-8"
      >
        <h2 id="question-heading" className="text-2xl font-semibold leading-snug sm:text-3xl">
          {lang === "rw" ? sign.question.rw : sign.question.en}
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          {lang === "rw" ? sign.question.en : sign.question.rw}
        </p>

        <ul className="mt-8 space-y-3">
          {choices.map((choice) => (
            <li key={choice.value}>
              <Button
                type="button"
                variant={selected === choice.value ? "default" : choice.variant}
                aria-pressed={selected === choice.value}
                className="h-14 w-full text-lg"
                onClick={() => onAnswer(sign.id, choice.value)}
              >
                {choice.label}
              </Button>
            </li>
          ))}
        </ul>
      </motion.article>

      <footer className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← {copy.back}
        </Button>
        <Button type="button" variant="ghost" onClick={onFinish}>
          {copy.skipRest}
        </Button>
      </footer>
    </section>
  );
}
