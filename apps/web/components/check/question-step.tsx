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
  onContinue,
  onFinish,
}: {
  index: number;
  lang: Lang;
  answers: Record<string, Presence>;
  onAnswer: (signId: string, presence: Presence) => void;
  onBack: () => void;
  onContinue: () => void;
  onFinish: () => void;
}) {
  const copy = t(lang);
  const reduceMotion = useReducedMotion();
  const sign = SIGNS[index];
  const selected = answers[sign.id];

  // All three are equal choices, so all three are outlined. Filling one would read as already
  // selected, which is exactly the wrong signal on a question about heavy bleeding.
  const choices: { value: Presence; label: string }[] = [
    { value: "yes", label: copy.yes },
    { value: "no", label: copy.no },
    { value: "unsure", label: copy.unsure },
  ];

  const progress = ((index + 1) / SIGNS.length) * 100;
  const isLast = index + 1 === SIGNS.length;

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
                variant={selected === choice.value ? "default" : "outline"}
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

      <footer className="mt-8 space-y-4">
        <nav className="flex items-center justify-between gap-3" aria-label="Question navigation">
          <Button type="button" variant="ghost" onClick={onBack}>
            ← {copy.back}
          </Button>
          {/* Answering already advances; Continue is for moving past a question the family cannot
              judge, and for stepping forward again after going Back. */}
          <Button type="button" variant="secondary" onClick={onContinue}>
            {isLast ? copy.seeResult : copy.continue} →
          </Button>
        </nav>
        <p className="text-center">
          <Button type="button" variant="link" className="text-muted-foreground" onClick={onFinish}>
            {copy.skipRest}
          </Button>
        </p>
      </footer>
    </section>
  );
}
