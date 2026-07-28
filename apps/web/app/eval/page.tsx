"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { LEVEL_STYLE } from "@/lib/level-style";

const percent = (value: number) => `${Math.round(value * 100)}%`;

export default function EvalPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["eval"],
    queryFn: api.evaluation,
  });

  if (isPending) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        The evaluation could not load. Check the API is running, then reload.
      </p>
    );
  }

  return (
    <section aria-labelledby="eval-heading">
      <header className="mb-6">
        <h1 id="eval-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          Evaluation
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Scored live against a golden set of clinical vignettes, recomputed on every page load.
          Recall on emergency cases is reported first because a false negative here is a death.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <section className="col-span-2 rounded-xl border-2 border-emerald-700 bg-emerald-50 p-4 dark:bg-emerald-950/40 lg:col-span-1">
          <dt className="text-sm font-medium">Emergency recall</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums">
            <output>{percent(data.emergencyRecall)}</output>
          </dd>
          <dd className="mt-1 text-xs opacity-80">
            {data.emergencyCaught} of {data.emergencyTotal} <em>go now</em> cases caught
          </dd>
        </section>
        <section className="rounded-xl border p-4">
          <dt className="text-sm font-medium">Exact-level accuracy</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums">
            <output>{percent(data.accuracy)}</output>
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">
            {data.passed} of {data.total} cases
          </dd>
        </section>
        <section className="rounded-xl border p-4">
          <dt className="text-sm font-medium">Over-escalations</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums">
            <output>{data.overEscalations}</output>
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">Costly, not dangerous</dd>
        </section>
        <section className="rounded-xl border p-4">
          <dt className="text-sm font-medium">Invariant violations</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums">
            <output>{data.invariantViolations}</output>
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground">Verdicts below the protocol floor</dd>
        </section>
      </dl>

      <figure className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <caption className="mb-3 text-left text-sm text-muted-foreground">
            Golden set — {data.total} vignettes covering haemorrhage, hypertensive disorders, sepsis,
            thrombosis, wound infection, mental health, and the guards against over-escalation.
          </caption>
          <thead>
            <tr className="border-b text-left">
              <th scope="col" className="py-2 pr-4 font-medium">
                Case
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Expected
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Reba
              </th>
              <th scope="col" className="py-2 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result) => (
              <tr key={result.case.id} className="border-b align-top">
                <td className="py-3 pr-4">
                  <p className="font-medium">{result.case.narrative}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{result.case.tests}</p>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  {LEVEL_STYLE[result.case.expected].word}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <Badge className={LEVEL_STYLE[result.verdict.level].badge}>
                    {LEVEL_STYLE[result.verdict.level].word}
                  </Badge>
                </td>
                <td className="py-3 whitespace-nowrap">
                  {result.missedEmergency
                    ? "✕ missed emergency"
                    : result.pass
                      ? "✓ pass"
                      : "△ over-escalated"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </section>
  );
}
