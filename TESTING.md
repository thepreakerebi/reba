# Voice testing script

Say these **in Kinyarwanda**, into the 🎙 button on a mother's page. The English below is the
meaning to convey — not a script to read out. Say it the way a worried husband or sister actually
would, not the way a nurse would.

Each row lists what Reba should detect and what verdict should follow. Verdicts are computed from
the engine, not estimated.

**Before each test:** open the mother's page, hold the mic button, speak, release. Reba shows you a
transcript and the signs it heard. Check the transcript first — that is what you are testing.

Demo mothers:

| Mother | Postpartum | On her card |
|---|---|---|
| Uwase Claudine | day 30 | nothing |
| Umutoni Jeanne | day 30 | prior pre-eclampsia |
| Mukandayisenga Divine | 6 hours | caesarean, anaemia |
| Ingabire Solange | day 12 | little support at home |

---

## The core tests

| # | Say something meaning… | Should detect | Uwase | Umutoni | Divine | Solange |
|---|---|---|---|---|---|---|
| 1 | "She has been bleeding a lot — she has soaked through more than one cloth in the last hour." | heavy bleeding | **Go now** | Go now | Go now | Go now |
| 2 | "She has a very bad headache that will not go away, and her face and hands are swollen." | headache + swelling | **Go now** | Go now | Go now | Go now |
| 3 | "She has a bad headache that will not go away. Nothing else." | headache only | **Go today** | **Go now** ↑ | **Go now** ↑ | Go today |
| 4 | "She is hot to the touch, and what is coming out smells bad." | fever + foul discharge | **Go now** | Go now | Go now | Go now |
| 5 | "She feels warm. Nothing else is wrong." | fever only | **Go today** | Go today | **Go now** ↑ | Go today |
| 6 | "One of her legs is painful, red and swollen. The other leg is fine." | one-sided leg pain | **Go now** | Go now | Go now | Go now |
| 7 | "She has been crying most days this week and says she feels hopeless." | low mood | **Go today** | Go today | Go today | **Go now** ↑ |
| 8 | "She fainted this morning when she stood up." | fainting | **Go now** | Go now | Go now | Go now |
| 9 | "She is doing well today. She is eating and resting. Nothing is wrong." | nothing | **Watch** | Watch | Watch | Watch |

↑ = escalated above the protocol floor by something on her card or by how recently she gave birth.
The panel names which one.

---

## The three that prove the design

**Test 3 on Uwase, then test 3 on Umutoni.** Identical words, identical sign. Uwase gets *Go today*;
Umutoni gets *Go now*, and the panel says why: prior pre-eclampsia. This is the demo. Rehearse it.

**Test 5 on Uwase, then test 5 on Divine.** Same single fever. Divine is six hours postpartum, so
the window raises her. Nothing about her card changed — only the clock.

**Test 9 anywhere.** Reba says *Watch*, never "she is fine", and always gives a re-check time and
named signs. There is no all-clear in the product.

---

## Testing the honesty, not the accuracy

These matter as much as the ones above, because they are what a judge will probe.

| Say something meaning… | What should happen |
|---|---|
| "Maybe her face is a bit swollen, I am not sure." | Detected as **unsure**, and the verdict counts it as present. The badge says so on the card. |
| Mumble, or speak with the radio on. | Empty transcript, no signs. It should say it did not understand — not invent something. |
| "She has a fever and she has been sleeping badly and eating little." | Fever only. Sleep and appetite are **not** in the protocol and must not appear as signs. |
| Mix Kinyarwanda and English in one sentence. | Language detected as Kinyarwanda; the whole screen answers in Kinyarwanda. |
| Speak English on one mother, Kinyarwanda on the next. | Each page follows the language actually spoken. No menu, no setting. |

---

## What to write down

For each test, note three things:

1. **Was the transcript right?** This is the real unknown. Kinyarwanda speech recognition has not
   been measured here.
2. **Were the signs right?** Wrong signs from a right transcript is a different bug from wrong
   signs from a wrong transcript.
3. **Did the wording sound natural?** If a question or verdict reads stiff or clinical, flag the
   exact string. They live in `packages/core/src/protocol.ts` and `apps/web/lib/i18n.ts`.

If the transcript is wrong but you caught it at the confirmation step, that is the system working
as designed — say so in the demo rather than hiding it.
