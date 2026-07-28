import type { Level } from "@reba/core";

/**
 * Colour never carries the verdict alone — every level also has a word and a mark, so the screen
 * works in greyscale, in sunlight, and for a colour-blind reader.
 */
export const LEVEL_STYLE: Record<
  Level,
  { mark: string; word: string; card: string; badge: string }
> = {
  go_now: {
    mark: "▲",
    word: "Go now",
    card: "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-50",
    badge: "bg-red-600 text-white",
  },
  go_today: {
    mark: "●",
    word: "Go today",
    card: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-50",
    badge: "bg-amber-600 text-white",
  },
  watch: {
    mark: "—",
    word: "Watch",
    card: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50",
    badge: "bg-emerald-700 text-white",
  },
};

export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function postpartumLabel(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 24) return `${hours} hours after birth`;
  return `Day ${Math.floor(hours / 24)}`;
}
