"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type MotherRow } from "@/lib/api";
import { LEVEL_STYLE, postpartumLabel } from "@/lib/level-style";

const ORDER = { go_now: 0, go_today: 1, watch: 2 } as const;

function sortRows(rows: MotherRow[]): MotherRow[] {
  return [...rows].sort((a, b) => {
    const levelA = a.latestCheckin ? ORDER[a.latestCheckin.level] : 3;
    const levelB = b.latestCheckin ? ORDER[b.latestCheckin.level] : 3;
    if (levelA !== levelB) return levelA - levelB;
    return new Date(b.birthAt).getTime() - new Date(a.birthAt).getTime();
  });
}

export default function WatchBoard() {
  const reduceMotion = useReducedMotion();
  const { data, isPending, isError } = useQuery({
    queryKey: ["mothers"],
    queryFn: api.mothers,
  });

  return (
    <section aria-labelledby="board-heading">
      <header className="mb-6">
        <h1 id="board-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          Watch board
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every mother in her first 42 days after discharge. Cards move to the top the moment a
          family reports a danger sign — no refresh.
        </p>
      </header>

      {isPending ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <li key={key}>
              <Skeleton className="h-40 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          The board could not load. Check the API is running, then reload.
        </p>
      ) : data && data.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {sortRows(data).map((mother) => {
              const level = mother.latestCheckin?.level;
              const style = level ? LEVEL_STYLE[level] : null;
              return (
                <motion.li
                  key={mother.id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/m/${mother.id}`} className="block h-full rounded-xl">
                    <Card className={`h-full ${style ? style.card : ""}`}>
                      <CardHeader>
                        <CardTitle className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
                          {mother.name}
                          {style ? (
                            <Badge className={style.badge}>
                              <output aria-label={`Current level: ${style.word}`}>
                                {style.mark} {style.word}
                              </output>
                            </Badge>
                          ) : (
                            <Badge variant="outline">No check yet</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                          <dt className="text-muted-foreground">Postpartum</dt>
                          <dd>{postpartumLabel(mother.birthAt)}</dd>
                          <dt className="text-muted-foreground">Watching</dt>
                          <dd>{mother.caregiverName}</dd>
                          <dt className="text-muted-foreground">Facility</dt>
                          <dd>{mother.facility}</dd>
                        </dl>
                        {mother.latestCheckin && mother.latestCheckin.reasons.length > 0 ? (
                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {mother.latestCheckin.reasons.map((reason) => (
                              <li key={reason.signId}>
                                <Badge variant="secondary">{reason.label}</Badge>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      ) : (
        <section className="py-16 text-center">
          <p className="text-4xl" aria-hidden="true">
            👀
          </p>
          <h2 className="mt-4 text-base font-medium">Nobody to watch yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Mothers appear here when they are registered at discharge.
          </p>
        </section>
      )}
    </section>
  );
}
