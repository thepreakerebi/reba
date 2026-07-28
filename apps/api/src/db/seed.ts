/**
 * Demo data.
 *
 * The two Nyirahabimana entries are the demo pair: identical reported signs, different histories.
 * Do not "tidy" them into one — the whole personalization argument is shown by their difference.
 */

import { db } from "./client";
import { checkins, mothers } from "./schema";

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000);

async function seed() {
  await db.delete(checkins);
  await db.delete(mothers);

  await db.insert(mothers).values([
    {
      name: "Uwase Claudine",
      caregiverName: "Mukamana Alice (sister)",
      caregiverPhone: "+250 78 000 0001",
      chwName: "Nyiraneza Beatrice",
      facility: "Muhima District Hospital",
      deliveryType: "vaginal",
      birthAt: hoursAgo(24 * 30),
      riskFactors: [],
    },
    {
      name: "Umutoni Jeanne",
      caregiverName: "Habimana Eric (husband)",
      caregiverPhone: "+250 78 000 0002",
      chwName: "Nyiraneza Beatrice",
      facility: "Muhima District Hospital",
      deliveryType: "vaginal",
      birthAt: hoursAgo(24 * 30),
      riskFactors: ["prior_preeclampsia"],
    },
    {
      name: "Mukandayisenga Divine",
      caregiverName: "Uwimana Grace (mother)",
      caregiverPhone: "+250 78 000 0003",
      chwName: "Nyiraneza Beatrice",
      facility: "Kibagabaga Hospital",
      deliveryType: "caesarean",
      birthAt: hoursAgo(6),
      riskFactors: ["caesarean", "anaemia"],
    },
    {
      name: "Ingabire Solange",
      caregiverName: "Niyonsaba Chantal (sister)",
      chwName: "Uwamahoro Josiane",
      facility: "Kibagabaga Hospital",
      deliveryType: "vaginal",
      birthAt: hoursAgo(24 * 12),
      riskFactors: ["poor_partner_support"],
    },
  ]);

  const count = await db.select().from(mothers);
  console.log(`Seeded ${count.length} mothers.`);
}

await seed();
