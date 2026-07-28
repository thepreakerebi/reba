"use client";

import type { Lang } from "@reba/core";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

/** Step one: one decision, two options, nothing else on the screen. */
export function ModeStep({
  lang,
  onChoose,
}: {
  lang: Lang;
  onChoose: (mode: "voice" | "questions") => void;
}) {
  const copy = t(lang);

  const options = [
    {
      mode: "voice" as const,
      icon: "🎙",
      title: copy.optionSpeak,
      hint: copy.optionSpeakHint,
    },
    {
      mode: "questions" as const,
      icon: "☑",
      title: copy.optionQuestions,
      hint: copy.optionQuestionsHint,
    },
  ];

  return (
    <section aria-labelledby="mode-heading">
      <h2 id="mode-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
        {copy.chooseHow}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{copy.chooseHowHint}</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <li key={option.mode}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onChoose(option.mode)}
              className="flex h-auto w-full flex-col items-start gap-1.5 whitespace-normal p-5 text-left"
            >
              <p className="text-2xl" aria-hidden="true">
                {option.icon}
              </p>
              <p className="text-base font-semibold">{option.title}</p>
              <p className="text-sm font-normal text-muted-foreground">{option.hint}</p>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
