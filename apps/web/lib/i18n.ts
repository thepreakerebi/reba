import type { Lang } from "@reba/core";

/**
 * UI strings in both languages.
 *
 * Reba answers in whatever language the family used — detected from what they said, not chosen from
 * a menu. The header switch exists only to correct the detection when it gets it wrong.
 *
 * The Kinyarwanda here was not written by a first-language speaker and needs a review pass.
 */
export const T = {
  en: {
    todaysCheck: "Today's check",
    checkIntro:
      "Answer what you can see. If you are not sure, say so — Reba treats “not sure” exactly the same as “yes”.",
    yes: "Yes",
    no: "No",
    unsure: "Not sure",
    finish: "Finish check",
    checking: "Checking…",
    answered: "answered",
    speak: "Speak or type instead",
    speakIntro:
      "Describe how she is in your own words, in Kinyarwanda or English. Reba will show you what it heard before anything is decided.",
    record: "Tap to speak",
    recording: "Listening… tap to stop",
    listening: "Reading what you said…",
    heard: "This is what Reba heard",
    heardNote: "Check this is right before continuing. Correct anything wrong in the questions below.",
    signsFound: "Signs Reba found",
    noSigns: "Reba did not hear any danger signs. Go through the questions to be sure.",
    useThese: "Use these answers",
    discard: "Start again",
    recheckIn: "Check her again in",
    hours: "hours",
    whatReported: "What was reported",
    howDecided: "How this was decided",
    protocolFloor: "Protocol floor",
    fromSignsAlone: "from the reported signs alone, before anything about her was applied.",
    raisedTo: "Raised to",
    nothingRaised: "Nothing raised it above the protocol floor.",
    onlyRaise: "Her history can only raise this level. There is no path in Reba that lowers it.",
    showAtFacility: "Show this at the facility",
    takingHer: "We are taking her now",
    confirming: "Confirming…",
    confirmed:
      "✓ The family confirmed they are taking her. Her health worker has been notified.",
    unsureBadge: "counted as present — family was unsure",
    earlierChecks: "Earlier checks",
    noSignsReported: "No signs reported",
    micDenied: "Reba needs permission to use the microphone. Type instead, or allow it and try again.",
    micUnsupported: "This phone cannot record here. Type instead.",
    interpretFailed: "That could not be understood. Try again, or use the questions.",
    tooShort: "That was too short to hear. Speak for a little longer.",
    chooseHow: "How do you want to answer?",
    chooseHowHint: "Both take about a minute. You can change your mind at any point.",
    optionSpeak: "Say it in your own words",
    optionSpeakHint: "Speak or type. Reba shows you what it heard before deciding anything.",
    optionQuestions: "Answer the questions",
    optionQuestionsHint: "One question at a time. Nineteen short questions.",
    question: "Question",
    of: "of",
    back: "Back",
    continue: "Continue",
    skipRest: "Nothing else is wrong — finish now",
    seeResult: "See the result",
    startOver: "Start a new check",
    reviewAnswers: "Check the questions too",
    stepIntake: "What is happening",
    stepConfirm: "Check what we heard",
    stepResult: "What to do",
  },
  rw: {
    todaysCheck: "Isuzuma ry'uyu munsi",
    checkIntro:
      "Subiza ibyo ubona. Niba utabyizeye, bivuge — Reba ifata “sinabyizeye” kimwe na “yego”.",
    yes: "Yego",
    no: "Oya",
    unsure: "Sinabizeye",
    finish: "Soza isuzuma",
    checking: "Turimo gusuzuma…",
    answered: "byasubijwe",
    speak: "Vuga cyangwa wandike",
    speakIntro:
      "Sobanura uko amerewe mu magambo yawe, mu Kinyarwanda cyangwa mu Cyongereza. Reba izakwereka ibyo yumvise mbere y'uko hafatwa icyemezo.",
    record: "Kanda uvuge",
    recording: "Turimo kumva… kanda urangije",
    listening: "Turimo gusoma ibyo wavuze…",
    heard: "Ibi ni byo Reba yumvise",
    heardNote:
      "Reba niba ari byo mbere yo gukomeza. Ibitari byo ubikosore mu bibazo bikurikira.",
    signsFound: "Ibimenyetso Reba yabonye",
    noSigns:
      "Reba ntiyumvise ikimenyetso cy'akaga. Nyura mu bibazo kugira ngo wemeze neza.",
    useThese: "Koresha ibi bisubizo",
    discard: "Ongera utangire",
    recheckIn: "Ongera umusuzume nyuma y'amasaha",
    hours: "",
    whatReported: "Ibyatanzwe",
    howDecided: "Uko ibi byemejwe",
    protocolFloor: "Urwego rw'ibanze",
    fromSignsAlone: "biturutse ku bimenyetso gusa, mbere y'uko amateka ye ashyirwamo.",
    raisedTo: "Byazamuwe kugera kuri",
    nothingRaised: "Nta kintu cyazamuye urwego hejuru y'urwego rw'ibanze.",
    onlyRaise:
      "Amateka ye ashobora kuzamura urwego gusa. Nta nzira iri muri Reba imanura urwego.",
    showAtFacility: "Ibi ubyereke ku kigo nderabuzima",
    takingHer: "Turimo kumujyana ubu",
    confirming: "Turimo kwemeza…",
    confirmed: "✓ Umuryango wemeje ko bamujyanye. Umujyanama w'ubuzima yamenyeshejwe.",
    unsureBadge: "byafashwe nk'ibihari — umuryango ntiyabyizeye",
    earlierChecks: "Amasuzuma yabanje",
    noSignsReported: "Nta kimenyetso cyatanzwe",
    micDenied:
      "Reba ikeneye uruhushya rwo gukoresha mikoro. Andika, cyangwa utange uruhushya wongere ugerageze.",
    micUnsupported: "Iyi telefone ntishobora gufata amajwi hano. Andika ahubwo.",
    interpretFailed: "Ntibyumvikanye. Ongera ugerageze, cyangwa ukoreshe ibibazo.",
    tooShort: "Byari bigufi cyane ntibyumvikane. Ongera uvuge igihe kirekire gato.",
    chooseHow: "Wifuza gusubiza ute?",
    chooseHowHint: "Byombi bifata nk'umunota. Ushobora guhindura igihe cyose.",
    optionSpeak: "Bivuge mu magambo yawe",
    optionSpeakHint: "Vuga cyangwa wandike. Reba izakwereka ibyo yumvise mbere yo gufata icyemezo.",
    optionQuestions: "Subiza ibibazo",
    optionQuestionsHint: "Ikibazo kimwe icyarimwe. Ibibazo bigufi cumi n'icyenda.",
    question: "Ikibazo",
    of: "kuri",
    back: "Subira inyuma",
    continue: "Komeza",
    skipRest: "Nta kindi kibi — soza ubu",
    seeResult: "Reba igisubizo",
    startOver: "Tangira isuzuma rishya",
    reviewAnswers: "Nyura no mu bibazo",
    stepIntake: "Ibiriho",
    stepConfirm: "Reba ibyo twumvise",
    stepResult: "Icyo gukora",
  },
} satisfies Record<Lang, Record<string, string>>;

export type Strings = (typeof T)["en"];

export function t(lang: Lang): Strings {
  return T[lang];
}
