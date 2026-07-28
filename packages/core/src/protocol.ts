/**
 * The postnatal danger-sign protocol.
 *
 * Derived from WHO recommendations on maternal and newborn care for a positive postnatal
 * experience (2022) and the WHO/UNICEF postnatal danger-sign counselling list. Every sign here is
 * observable by a family member without training or equipment — nothing in this list requires a
 * blood-pressure cuff, a scale, or a clinical judgement.
 *
 * This array is the single source of truth for what Reba can recognise. The Gemini intake step is
 * given `SIGN_IDS` as a closed enum, so a sign outside this list cannot be produced.
 */

import type { Level } from "./levels";

export type SignCategory =
  | "bleeding"
  | "hypertensive"
  | "infection"
  | "thrombosis"
  | "breast"
  | "wound"
  | "mental_health"
  | "general";

export type Sign = {
  id: string;
  category: SignCategory;
  /** What the family is asked, in plain observable terms. */
  question: { en: string; rw: string };
  /** Short label for the handover summary and the CHW view. */
  label: string;
  /** Level this sign carries on its own, before any profile or window modifiers. */
  baseLevel: Level;
  /** Why it matters — shown to the family so the tool teaches as it triages. */
  because: string;
};

export const SIGNS: Sign[] = [
  {
    id: "heavy_bleeding",
    category: "bleeding",
    question: {
      en: "Has she soaked more than one pad or cloth right through in the last hour?",
      rw: "Yaba yarahanaguye ipadi cyangwa igitambaro kirenze kimwe mu isaha ishize?",
    },
    label: "Soaking more than one pad per hour",
    baseLevel: "go_now",
    because:
      "Heavy bleeding after birth can become life-threatening within two to three hours. This is the single most urgent sign.",
  },
  {
    id: "passing_large_clots",
    category: "bleeding",
    question: {
      en: "Is she passing blood clots larger than a plum?",
      rw: "Haba hari amaraso yafatanye manini kurusha ipurumu?",
    },
    label: "Large clots",
    baseLevel: "go_today",
    because: "Large clots can mean the womb is not closing down as it should.",
  },
  {
    id: "bleeding_increasing",
    category: "bleeding",
    question: {
      en: "Is the bleeding getting heavier instead of lighter, or has it turned bright red again?",
      rw: "Amaraso yaba yariyongereye aho kugabanuka, cyangwa yaba yasubiye gutukura cyane?",
    },
    label: "Bleeding increasing or turned bright red",
    baseLevel: "go_today",
    because: "Bleeding should get lighter and darker each day. Going backwards is a warning.",
  },
  {
    id: "fainting_or_dizzy",
    category: "bleeding",
    question: {
      en: "Has she fainted, or does she feel dizzy when she stands up?",
      rw: "Yaba yaratakaje ubwenge, cyangwa agira isereri iyo ahagurutse?",
    },
    label: "Fainting or dizzy on standing",
    baseLevel: "go_now",
    because: "This can mean she has lost more blood than is visible.",
  },
  {
    id: "severe_headache",
    category: "hypertensive",
    question: {
      en: "Does she have a bad headache that will not go away?",
      rw: "Yaba afite umutwe umubabaza cyane kandi utagenda?",
    },
    label: "Severe persistent headache",
    baseLevel: "go_today",
    because:
      "A severe headache after birth can be a sign of dangerously high blood pressure, which can start up to six weeks after delivery.",
  },
  {
    id: "blurred_vision",
    category: "hypertensive",
    question: {
      en: "Is her vision blurred, or is she seeing flashing lights or spots?",
      rw: "Amaso ye yaba areba ibicu, cyangwa abona imirabyo cyangwa uduce?",
    },
    label: "Blurred vision or flashing lights",
    baseLevel: "go_now",
    because: "Vision changes with high blood pressure can come shortly before a seizure.",
  },
  {
    id: "new_swelling",
    category: "hypertensive",
    question: {
      en: "Is there new swelling in her face or hands?",
      rw: "Haba hari kubyimba gushya mu maso cyangwa mu ntoki?",
    },
    label: "New swelling of face or hands",
    baseLevel: "go_today",
    because: "Swelling of the face and hands is different from swollen feet, and can signal pre-eclampsia.",
  },
  {
    id: "convulsion",
    category: "hypertensive",
    question: {
      en: "Has she had a fit, a seizure, or gone stiff and shaking?",
      rw: "Yaba yaragize igicuri, cyangwa akagagara akanadandabirana?",
    },
    label: "Seizure or fit",
    baseLevel: "go_now",
    because: "This is an emergency. She needs a health facility now.",
  },
  {
    id: "difficulty_breathing",
    category: "hypertensive",
    question: {
      en: "Is she struggling to breathe, or breathing very fast at rest?",
      rw: "Yaba agorwa no guhumeka, cyangwa ahumeka cyane arimo aruhuka?",
    },
    label: "Difficulty breathing",
    baseLevel: "go_now",
    because: "Trouble breathing after birth is always an emergency.",
  },
  {
    id: "fever",
    category: "infection",
    question: {
      en: "Does she feel hot to touch, or has she had chills or shivering?",
      rw: "Yaba ashyushye iyo umukoze, cyangwa yaragize imbeho n'ubuhehesi?",
    },
    label: "Fever or chills",
    baseLevel: "go_today",
    because: "Fever after birth usually means infection, which spreads quickly if untreated.",
  },
  {
    id: "foul_discharge",
    category: "infection",
    question: {
      en: "Does the discharge from her birth canal smell bad?",
      rw: "Ibisohoka mu gitsina byaba binuka nabi?",
    },
    label: "Foul-smelling discharge",
    baseLevel: "go_today",
    because: "A bad smell is a sign of infection inside the womb.",
  },
  {
    id: "severe_abdominal_pain",
    category: "infection",
    question: {
      en: "Does she have severe pain in her lower belly, worse than normal after-pains?",
      rw: "Yaba afite ububabare bukaze mu nda yo hasi, burenze ubusanzwe nyuma yo kubyara?",
    },
    label: "Severe lower abdominal pain",
    baseLevel: "go_today",
    because: "Severe belly pain can mean infection or a problem with the womb.",
  },
  {
    id: "calf_pain",
    category: "thrombosis",
    question: {
      en: "Is one of her legs painful, red, hot or swollen — but not the other?",
      rw: "Ukuguru kumwe kwaba kubabaza, gutukura, gushyuha cyangwa kubyimba — undi ntabwo?",
    },
    label: "Pain or swelling in one leg",
    baseLevel: "go_now",
    because: "A clot in one leg can move to the lungs. One leg only is the warning.",
  },
  {
    id: "chest_pain",
    category: "thrombosis",
    question: {
      en: "Does she have chest pain, or pain when she takes a deep breath?",
      rw: "Yaba afite ububabare mu gatuza, cyangwa iyo ahumetse cyane?",
    },
    label: "Chest pain",
    baseLevel: "go_now",
    because: "Chest pain after birth needs to be seen immediately.",
  },
  {
    id: "breast_infection",
    category: "breast",
    question: {
      en: "Is one breast red, hot and painful?",
      rw: "Ibere rimwe ryaba ritukura, rishyushye kandi ribabaza?",
    },
    label: "Red, hot, painful breast",
    baseLevel: "go_today",
    because: "This is usually mastitis. It is treatable, but it needs treatment.",
  },
  {
    id: "wound_problem",
    category: "wound",
    question: {
      en: "Is her caesarean wound or her tear red, opening, or leaking pus?",
      rw: "Igisebe cyo kubagwa cyangwa aho yacitse haba hatukuye, hafunguka cyangwa hasohora amashyira?",
    },
    label: "Wound red, open or draining",
    baseLevel: "go_today",
    because: "An infected wound needs to be cleaned and treated at a facility.",
  },
  {
    id: "cannot_care_for_baby",
    category: "mental_health",
    question: {
      en: "Does she feel unable to care for the baby, or has she had thoughts of harming herself or the baby?",
      rw: "Yaba yumva adashobora kwita ku mwana, cyangwa yaragize ibitekerezo byo kwiyangiza cyangwa kwangiza umwana?",
    },
    label: "Unable to cope, or thoughts of harm",
    baseLevel: "go_now",
    because: "This is an emergency and she should not be left alone. Help exists and it works.",
  },
  {
    id: "persistent_low_mood",
    category: "mental_health",
    question: {
      en: "Has she been sad, crying or hopeless most of the day, most days this week?",
      rw: "Yaba yaramaze icyumweru ababaye, arira cyangwa yacitse intege igihe kinini?",
    },
    label: "Persistent low mood",
    baseLevel: "go_today",
    because:
      "About one in five mothers in Rwanda has depression after birth. It is common, it is not her fault, and it is treatable.",
  },
  {
    id: "not_passing_urine",
    category: "general",
    question: {
      en: "Has she been unable to pass urine, or does it burn badly when she does?",
      rw: "Yaba adashobora kwihagarika, cyangwa bimubabaza cyane iyo yihagaritse?",
    },
    label: "Cannot pass urine, or burning",
    baseLevel: "go_today",
    because: "This can be a bladder infection or a problem after delivery.",
  },
];

/**
 * Kinyarwanda short labels, kept as a side map rather than a field on `Sign` so the protocol table
 * above stays readable. Every id in SIGNS must appear here — asserted by test.
 *
 * These were not written by a first-language speaker. They need a review pass before real use.
 */
export const SIGN_LABEL_RW: Record<string, string> = {
  heavy_bleeding: "Ava amaraso menshi (ipadi irenze imwe mu isaha)",
  passing_large_clots: "Asohora amaraso yafatanye manini",
  bleeding_increasing: "Amaraso ariyongera cyangwa yasubiye gutukura",
  fainting_or_dizzy: "Ataye ubwenge cyangwa agira isereri",
  severe_headache: "Umutwe umubabaza cyane kandi ntugende",
  blurred_vision: "Amaso areba ibicu cyangwa abona imirabyo",
  new_swelling: "Kubyimba gushya mu maso cyangwa mu ntoki",
  convulsion: "Yagize igicuri",
  difficulty_breathing: "Agorwa no guhumeka",
  fever: "Umuriro cyangwa imbeho n'ubuhehesi",
  foul_discharge: "Ibimusohokamo binuka nabi",
  severe_abdominal_pain: "Ububabare bukaze mu nda yo hasi",
  calf_pain: "Ukuguru kumwe kubabaza, gutukura cyangwa kubyimba",
  chest_pain: "Ububabare mu gatuza",
  breast_infection: "Ibere ritukura, rishyushye kandi ribabaza",
  wound_problem: "Igisebe gitukuye, gifunguka cyangwa gisohora amashyira",
  cannot_care_for_baby: "Ntashobora kwita ku mwana, cyangwa afite ibitekerezo byo kwiyangiza",
  persistent_low_mood: "Kubabara no kurira igihe kinini",
  not_passing_urine: "Ntashobora kwihagarika cyangwa birababaza",
};

export function signLabel(sign: Sign, lang: "en" | "rw"): string {
  return lang === "rw" ? (SIGN_LABEL_RW[sign.id] ?? sign.label) : sign.label;
}

export const SIGN_IDS = SIGNS.map((sign) => sign.id);

const BY_ID = new Map(SIGNS.map((sign) => [sign.id, sign]));

export function getSign(id: string): Sign | undefined {
  return BY_ID.get(id);
}

export function isKnownSign(id: string): boolean {
  return BY_ID.has(id);
}
