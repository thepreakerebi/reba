import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";

import { triage, type Answer, type MotherProfile, type RiskFactorId } from "@reba/core";

import { db } from "../db/client";
import { checkins, mothers } from "../db/schema";
import { buildHandover } from "../lib/handover";
import { broadcastInvalidate } from "../lib/realtime";
import { extractSigns, geminiConfigured } from "../lib/gemini";

const router = new Hono();

const toProfile = (mother: typeof mothers.$inferSelect): MotherProfile => ({
  name: mother.name,
  birthAt: mother.birthAt.toISOString(),
  riskFactors: mother.riskFactors as RiskFactorId[],
});

router.get("/", async (c) => {
  const rows = await db.select().from(mothers).orderBy(desc(mothers.birthAt));
  const latest = await Promise.all(
    rows.map(async (mother) => {
      const [checkin] = await db
        .select()
        .from(checkins)
        .where(eq(checkins.motherId, mother.id))
        .orderBy(desc(checkins.createdAt))
        .limit(1);
      return { ...mother, latestCheckin: checkin ?? null };
    }),
  );
  return c.json(latest);
});

router.post("/", async (c) => {
  const body = await c.req.json();
  const [created] = await db
    .insert(mothers)
    .values({
      name: body.name,
      caregiverName: body.caregiverName,
      caregiverPhone: body.caregiverPhone ?? null,
      chwName: body.chwName ?? "Unassigned",
      facility: body.facility ?? "Unknown facility",
      deliveryType: body.deliveryType ?? "vaginal",
      birthAt: new Date(body.birthAt),
      riskFactors: body.riskFactors ?? [],
    })
    .returning();
  broadcastInvalidate([["mothers"]]);
  return c.json(created, 201);
});

router.get("/:id", async (c) => {
  const [mother] = await db.select().from(mothers).where(eq(mothers.id, c.req.param("id")));
  if (!mother) return c.json({ error: "Not found" }, 404);
  const history = await db
    .select()
    .from(checkins)
    .where(eq(checkins.motherId, mother.id))
    .orderBy(desc(checkins.createdAt));
  return c.json({ ...mother, checkins: history });
});

/**
 * The daily check.
 *
 * Two intake modes converge on the same triage call: a tap-through checklist, or free text that
 * Gemini maps onto protocol sign IDs. The verdict is computed here, in TypeScript, either way.
 */
router.post("/:id/checkins", async (c) => {
  const [mother] = await db.select().from(mothers).where(eq(mothers.id, c.req.param("id")));
  if (!mother) return c.json({ error: "Not found" }, 404);

  const body = (await c.req.json()) as { answers?: Answer[]; text?: string };

  let answers: Answer[] = body.answers ?? [];
  let intakeMode: "checklist" | "free_text" = "checklist";

  if (body.text?.trim()) {
    if (!geminiConfigured()) {
      return c.json(
        { error: "Free-text intake is unavailable. Use the checklist." },
        503,
      );
    }
    intakeMode = "free_text";
    answers = await extractSigns(body.text);
  }

  const verdict = triage(answers, toProfile(mother));
  const handover =
    verdict.level === "watch" ? null : buildHandover(mother, verdict);

  const [created] = await db
    .insert(checkins)
    .values({
      motherId: mother.id,
      intakeMode,
      rawText: body.text ?? null,
      answers,
      level: verdict.level,
      protocolFloor: verdict.protocolFloor,
      reasons: verdict.reasons,
      escalations: verdict.escalations,
      handover,
    })
    .returning();

  broadcastInvalidate([["mothers"], ["mother", mother.id]]);
  return c.json({ checkin: created, verdict }, 201);
});

/** The family confirms they are acting on it. Nothing resolves itself. */
router.post("/:id/checkins/:checkinId/acknowledge", async (c) => {
  const [updated] = await db
    .update(checkins)
    .set({ acknowledgedAt: new Date() })
    .where(eq(checkins.id, c.req.param("checkinId")))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  broadcastInvalidate([["mothers"], ["mother", c.req.param("id")]]);
  return c.json(updated);
});

export default router;
