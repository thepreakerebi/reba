"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Verdict } from "@reba/core";
import { SIGNS, getRiskFactor, type Presence, type RiskFactorId } from "@reba/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VerdictPanel } from "@/components/verdict-panel";
import { api } from "@/lib/api";
import { LEVEL_STYLE, postpartumLabel } from "@/lib/level-style";

type Answers = Record<string, Presence>;

const CHOICES: { value: Presence; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export default function MotherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const [answers, setAnswers] = useState<Answers>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [handover, setHandover] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: mother, isPending } = useQuery({
    queryKey: ["mother", id],
    queryFn: () => api.mother(id),
  });

  const submit = useMutation({
    mutationFn: () =>
      api.submitCheck(id, {
        answers: SIGNS.filter((sign) => answers[sign.id]).map((sign) => ({
          signId: sign.id,
          presence: answers[sign.id],
        })),
      }),
    onSuccess: (result) => {
      setVerdict(result.verdict);
      setCheckinId(result.checkin.id);
      setHandover(result.checkin.handover);
      setAcknowledged(false);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["mothers"] });
    },
    onError: () => setError("The check could not be saved. Try again."),
  });

  const acknowledge = useMutation({
    mutationFn: () => api.acknowledge(id, checkinId!),
    onSuccess: () => setAcknowledged(true),
    onError: () => setError("That could not be confirmed. Try again."),
  });

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

  const answered = Object.keys(answers).length;

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{mother.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {postpartumLabel(mother.birthAt)} ·{" "}
          {mother.deliveryType === "caesarean" ? "Caesarean section" : "Vaginal delivery"} ·{" "}
          {mother.facility}
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
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No risk factors on her card.</p>
        )}
      </header>

      {verdict ? (
        <VerdictPanel
          verdict={verdict}
          handover={handover}
          acknowledged={acknowledged}
          onAcknowledge={verdict.level === "watch" ? undefined : () => acknowledge.mutate()}
          isAcknowledging={acknowledge.isPending}
        />
      ) : null}

      <section aria-labelledby="check-heading">
        <h2 id="check-heading" className="text-lg font-semibold">
          Today&rsquo;s check
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Answer what you can see. If you are not sure, say so — Reba treats &ldquo;not sure&rdquo;
          exactly the same as &ldquo;yes&rdquo;.
        </p>

        <form
          className="mt-6 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit.mutate();
          }}
        >
          <ul className="space-y-5">
            {SIGNS.map((sign) => (
              <li key={sign.id}>
                <fieldset>
                  <legend className="text-base font-medium">{sign.question.en}</legend>
                  <p className="mt-0.5 text-sm text-muted-foreground">{sign.question.rw}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {CHOICES.map((choice) => {
                      const selected = answers[sign.id] === choice.value;
                      return (
                        <li key={choice.value}>
                          <Button
                            type="button"
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            aria-pressed={selected}
                            onClick={() =>
                              setAnswers((current) => ({ ...current, [sign.id]: choice.value }))
                            }
                          >
                            {choice.label}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              </li>
            ))}
          </ul>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <footer className="flex items-center gap-4">
            <Button type="submit" disabled={submit.isPending || answered === 0}>
              {submit.isPending ? "Checking…" : "Finish check"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {answered} of {SIGNS.length} answered
            </p>
          </footer>
        </form>
      </section>

      {mother.checkins.length > 0 ? (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="text-lg font-semibold">
            Earlier checks
          </h2>
          <ul className="mt-4 space-y-2">
            {mother.checkins.map((checkin) => (
              <li
                key={checkin.id}
                className="flex flex-wrap items-baseline justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
              >
                <time dateTime={checkin.createdAt}>
                  {new Date(checkin.createdAt).toLocaleString()}
                </time>
                <p className="text-muted-foreground">
                  {checkin.reasons.length === 0
                    ? "No signs reported"
                    : checkin.reasons.map((reason) => reason.label).join(" · ")}
                </p>
                <Badge className={LEVEL_STYLE[checkin.level].badge}>
                  {LEVEL_STYLE[checkin.level].word}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
