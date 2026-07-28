/**
 * Urgency levels and the escalation-only invariant.
 *
 * There is deliberately no `deEscalate` function in this codebase. Every operation that combines
 * levels is a monotonic maximum, so no risk profile, no model output and no rule can ever move a
 * woman below the protocol floor her reported signs placed her on.
 */

export const LEVELS = ["watch", "go_today", "go_now"] as const;

export type Level = (typeof LEVELS)[number];

const RANK: Record<Level, number> = { watch: 0, go_today: 1, go_now: 2 };

export function rank(level: Level): number {
  return RANK[level];
}

/** Monotonic max. The only way levels are ever combined. */
export function escalate(...levels: Level[]): Level {
  let highest: Level = "watch";
  for (const level of levels) {
    if (RANK[level] > RANK[highest]) highest = level;
  }
  return highest;
}

/** Raise by `steps`, saturating at `go_now`. Never returns a level below `from`. */
export function raise(from: Level, steps = 1): Level {
  const next = Math.min(RANK[from] + Math.max(0, steps), RANK.go_now);
  return LEVELS[next];
}

/** The two languages Reba answers in. It replies in whichever one the family used. */
export type Lang = "en" | "rw";

export const LEVEL_COPY: Record<
  Level,
  { en: string; rw: string; detail: string; detailRw: string }
> = {
  go_now: {
    en: "Go now",
    rw: "Jya ubu",
    detail: "Take her to the nearest health facility immediately. Do not wait for morning.",
    detailRw:
      "Mujyane ku kigo nderabuzima cyegereye ako kanya. Ntimutegereze ko bucya.",
  },
  go_today: {
    en: "Go today",
    rw: "Jya uyu munsi",
    detail: "She needs to be seen by a health worker today. Do not wait for her next appointment.",
    detailRw:
      "Akeneye kubonana n'umuganga uyu munsi. Ntimutegereze itariki yo gusubira mu kigo nderabuzima.",
  },
  watch: {
    en: "Watch",
    rw: "Komeza umurebe",
    detail: "Nothing needs a visit right now. Check her again and watch for the signs listed below.",
    detailRw:
      "Nta kimwihutirwa ubu. Ongera umusuzume, kandi witegereze ibimenyetso bikurikira.",
  },
};

export function levelWord(level: Level, lang: Lang): string {
  return lang === "rw" ? LEVEL_COPY[level].rw : LEVEL_COPY[level].en;
}

export function levelDetail(level: Level, lang: Lang): string {
  return lang === "rw" ? LEVEL_COPY[level].detailRw : LEVEL_COPY[level].detail;
}

/** Hours until the next check-in prompt. Tighter early, tighter when urgency is higher. */
export function recheckHours(level: Level, hoursSinceBirth: number): number {
  if (level !== "watch") return 4;
  if (hoursSinceBirth < 24) return 4;
  if (hoursSinceBirth < 24 * 7) return 12;
  return 24;
}
