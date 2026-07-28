"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SIGNS, getRiskFactor, type Lang, type Presence, type RiskFactorId, type Verdict } from "@reba/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VerdictPanel } from "@/components/verdict-panel";
import { ModeStep } from "@/components/check/mode-step";
import { QuestionStep } from "@/components/check/question-step";
import { VoiceStep, type Interpretation } from "@/components/check/voice-step";
import { api } from "@/lib/api";
import { postpartumLabel } from "@/lib/level-style";
import { t } from "@/lib/i18n";

/**
 * The daily check, as a flow.
 *
 * One decision per screen: how to answer → answer → what to do. The family is worried and on a
 * phone; a single page holding nineteen questions and a verdict at once is the wrong shape for that.
 */
type Step =
  | { name: "mode" }
  | { name: "voice" }
  | { name: "questions"; index: number }
  | { name: "result" };

export default function MotherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>({ name: "mode" });
  const [lang, setLang] = useState<Lang>("en");
  const [answers, setAnswers] = useState<Record<string, Presence>>({});
  const [intakeMode, setIntakeMode] = useState<"checklist" | "free_text">("checklist");
  const [rawText, setRawText] = useState<string | null>(null);

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [handover, setHandover] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strings = t(lang);

  const { data: mother, isPending } = useQuery({
    queryKey: ["mother", id],
    queryFn: () => api.mother(id),
  });

  const submit = useMutation({
    mutationFn: (finalAnswers: Record<string, Presence>) =>
      api.submitCheck(id, {
        intakeMode,
        rawText: rawText ?? undefined,
        answers: SIGNS.filter((sign) => finalAnswers[sign.id]).map((sign) => ({
          signId: sign.id,
          presence: finalAnswers[sign.id],
        })),
      }),
    onSuccess: (result) => {
      setVerdict(result.verdict);
      setCheckinId(result.checkin.id);
      setHandover(result.checkin.handover);
      setAcknowledged(false);
      setError(null);
      setStep({ name: "result" });
      void queryClient.invalidateQueries({ queryKey: ["mothers"] });
      void queryClient.invalidateQueries({ queryKey: ["mother", id] });
    },
    onError: () => setError("The check could not be saved. Try again."),
  });

  const acknowledge = useMutation({
    mutationFn: () => api.acknowledge(id, checkinId!),
    onSuccess: () => setAcknowledged(true),
    onError: () => setError("That could not be confirmed. Try again."),
  });

  /** Records the answer only. Moving on is always a deliberate press of Continue. */
  function answerQuestion(signId: string, presence: Presence) {
    setAnswers((current) => ({ ...current, [signId]: presence }));
  }

  function acceptInterpretation(interpretation: Interpretation) {
    const next = { ...answers };
    for (const answer of interpretation.answers) next[answer.signId] = answer.presence;
    setAnswers(next);
    setIntakeMode("free_text");
    setRawText(interpretation.transcript);
    submit.mutate(next);
  }

  function restart() {
    setAnswers({});
    setVerdict(null);
    setCheckinId(null);
    setHandover(null);
    setAcknowledged(false);
    setIntakeMode("checklist");
    setRawText(null);
    setStep({ name: "mode" });
  }

  if (isPending) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </section>
    );
  }

  if (!mother) {
    return <p className="text-sm text-muted-foreground">This mother could not be found.</p>;
  }

  return (
    <article className="space-y-8">
      <header className="border-b pb-5">
        <nav aria-label="Back to board">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            ← Watch board
          </Link>
        </nav>
        <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{mother.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {postpartumLabel(mother.birthAt)} ·{" "}
          {mother.deliveryType === "caesarean" ? "Caesarean section" : "Vaginal delivery"}
        </p>
        {mother.riskFactors.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {mother.riskFactors.map((factorId) => (
              <li key={factorId}>
                <Badge variant="secondary">
                  {getRiskFactor(factorId as RiskFactorId)?.label ?? factorId}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        {step.name === "mode" ? (
          <ul className="mt-4 flex gap-1 text-sm" aria-label="Language">
            {(["en", "rw"] as Lang[]).map((option) => (
              <li key={option}>
                <Button
                  type="button"
                  size="sm"
                  variant={lang === option ? "secondary" : "ghost"}
                  aria-pressed={lang === option}
                  onClick={() => setLang(option)}
                >
                  {option === "en" ? "English" : "Kinyarwanda"}
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      {submit.isPending ? (
        <section className="space-y-3">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </section>
      ) : step.name === "mode" ? (
        <ModeStep
          lang={lang}
          onChoose={(mode) =>
            setStep(mode === "voice" ? { name: "voice" } : { name: "questions", index: 0 })
          }
        />
      ) : step.name === "voice" ? (
        <VoiceStep
          motherId={id}
          lang={lang}
          onLanguageDetected={setLang}
          onAccept={acceptInterpretation}
          onBack={() => setStep({ name: "mode" })}
        />
      ) : step.name === "questions" ? (
        <QuestionStep
          index={step.index}
          lang={lang}
          answers={answers}
          onAnswer={answerQuestion}
          onBack={() =>
            setStep(step.index === 0 ? { name: "mode" } : { name: "questions", index: step.index - 1 })
          }
          onContinue={() =>
            step.index + 1 < SIGNS.length
              ? setStep({ name: "questions", index: step.index + 1 })
              : submit.mutate(answers)
          }
          onFinish={() => submit.mutate(answers)}
        />
      ) : verdict ? (
        <section className="space-y-6">
          <VerdictPanel
            verdict={verdict}
            lang={lang}
            handover={handover}
            acknowledged={acknowledged}
            onAcknowledge={verdict.level === "watch" ? undefined : () => acknowledge.mutate()}
            isAcknowledging={acknowledge.isPending}
            onRestart={restart}
          />
          <footer className="flex flex-col gap-2 sm:flex-row">
            {intakeMode === "free_text" ? (
              <Button
                type="button"
                variant="ghost"
                className="h-12"
                onClick={() => setStep({ name: "questions", index: 0 })}
              >
                {strings.reviewAnswers}
              </Button>
            ) : null}
          </footer>
        </section>
      ) : null}
    </article>
  );
}
