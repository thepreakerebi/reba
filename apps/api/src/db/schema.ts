import { createId } from "@paralleldrive/cuid2";
import { index, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { Escalation, Reason, Answer } from "@reba/core";

export const levelEnum = pgEnum("level", ["watch", "go_today", "go_now"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["vaginal", "caesarean"]);
export const intakeModeEnum = pgEnum("intake_mode", ["checklist", "free_text"]);

export const mothers = pgTable(
  "mothers",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    /** The family member doing the daily checks. */
    caregiverName: text("caregiver_name").notNull(),
    caregiverPhone: text("caregiver_phone"),
    chwName: text("chw_name").notNull(),
    facility: text("facility").notNull(),
    deliveryType: deliveryTypeEnum("delivery_type").notNull(),
    birthAt: timestamp("birth_at", { withTimezone: true }).notNull(),
    riskFactors: jsonb("risk_factors").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("mothers_birth_at_idx").on(table.birthAt)],
);

export const checkins = pgTable(
  "checkins",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    motherId: text("mother_id")
      .notNull()
      .references(() => mothers.id, { onDelete: "cascade" }),
    intakeMode: intakeModeEnum("intake_mode").notNull().default("checklist"),
    /** Verbatim words the family typed, when they described it themselves. */
    rawText: text("raw_text"),
    answers: jsonb("answers").$type<Answer[]>().notNull(),
    /** The verdict, and the protocol floor it was never allowed to fall below. */
    level: levelEnum("level").notNull(),
    protocolFloor: levelEnum("protocol_floor").notNull(),
    reasons: jsonb("reasons").$type<Reason[]>().notNull(),
    escalations: jsonb("escalations").$type<Escalation[]>().notNull(),
    handover: text("handover"),
    /** Set when the family confirms they are going. Nothing auto-resolves. */
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("checkins_mother_created_idx").on(table.motherId, table.createdAt),
    index("checkins_level_idx").on(table.level),
  ],
);

export type Mother = typeof mothers.$inferSelect;
export type Checkin = typeof checkins.$inferSelect;
