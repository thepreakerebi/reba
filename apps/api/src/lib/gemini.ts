/**
 * Interpretation — the only place a model touches the pipeline.
 *
 * The family speaks or types how she is, in Kinyarwanda or English. Gemini returns a transcript and
 * the protocol signs those words correspond to. The `sign_id` field is an enum generated from
 * `SIGN_IDS` at request time, so a sign outside the protocol is not merely discouraged — it is
 * unrepresentable in the output.
 *
 * What comes back is a *proposal*. It is shown to the family for confirmation before it is scored,
 * because speech recognition in Kinyarwanda is the least reliable link in this chain and we would
 * rather show our working than quietly guess.
 *
 * The model never sees the levels, the risk profile, or the verdict.
 */

import { GoogleGenAI } from "@google/genai";

import { SIGN_IDS, SIGNS, type Answer, type Lang, type Presence } from "@reba/core";

const MODEL = "gemini-3.6-flash";

const INSTRUCTIONS = `You read a family member's description of how a mother is doing after
childbirth, and report which danger signs it describes.

Rules:
- Only report a sign the description actually supports. Do not infer, do not diagnose, do not add
  signs the person did not describe.
- If the description touches on a sign but is hedged or ambiguous ("maybe", "a little", "I think",
  "ahari", "nkeka"), mark presence as "unsure". Never resolve ambiguity yourself.
- You are not deciding urgency. You are only reading what was said.
- The speaker may use Kinyarwanda, English, French, or a mix. Transcribe in the language spoken —
  do not translate the transcript.
- If the audio is unclear or you cannot make out the words, return an empty transcript and no signs
  rather than guessing.`;

type AudioInput = { data: string; mimeType: string };

export type Interpretation = {
  transcript: string;
  /** The language the family actually used. Reba answers in this one. */
  language: Lang;
  answers: (Answer & { quote: string })[];
};

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function responseSchema() {
  return {
    type: "object",
    properties: {
      transcript: {
        type: "string",
        description: "Verbatim transcript in the language spoken. Empty if unintelligible.",
      },
      language: {
        type: "string",
        enum: ["rw", "en"],
        description:
          "The language the speaker actually used. Use 'rw' for Kinyarwanda, including a Kinyarwanda-English mix.",
      },
      answers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sign_id: { type: "string", enum: SIGN_IDS },
            presence: { type: "string", enum: ["yes", "unsure"] },
            quote: { type: "string", description: "The words that support this sign." },
          },
          required: ["sign_id", "presence", "quote"],
        },
      },
    },
    required: ["transcript", "language", "answers"],
  };
}

function catalogue(): string {
  return SIGNS.map((sign) => `${sign.id}: ${sign.label}`).join("\n");
}

/**
 * `interactions.create` on this API version takes a flat content list. A role-wrapped turn list is
 * rejected, so the instructions are the first text part.
 */
async function interpret(parts: unknown[]): Promise<Interpretation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  // The SDK's published types still describe the older role-based turn list; the live API takes a
  // flat content list. Verified against the endpoint, so the call is cast rather than reshaped.
  const params = {
    model: MODEL,
    input: [
      { type: "text", text: `${INSTRUCTIONS}\n\nSigns you may report:\n${catalogue()}` },
      ...parts,
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: responseSchema(),
    },
  };

  const result = await ai.interactions.create(
    params as unknown as Parameters<typeof ai.interactions.create>[0],
  );

  const { output_text: outputText } = result as unknown as { output_text?: string };

  const parsed = JSON.parse(outputText ?? "{}") as {
    transcript?: string;
    language?: string;
    answers?: { sign_id: string; presence: Presence; quote: string }[];
  };

  return {
    transcript: parsed.transcript ?? "",
    language: parsed.language === "rw" ? "rw" : "en",
    // The enum makes an off-protocol sign impossible; we assert it anyway rather than trust it.
    answers: (parsed.answers ?? [])
      .filter((answer) => SIGN_IDS.includes(answer.sign_id))
      .map((answer) => ({
        signId: answer.sign_id,
        presence: answer.presence === "unsure" ? "unsure" : "yes",
        quote: answer.quote,
      })),
  };
}

export function interpretText(text: string): Promise<Interpretation> {
  return interpret([{ type: "text", text: `Description:\n${text}` }]);
}

export function interpretAudio(audio: AudioInput): Promise<Interpretation> {
  return interpret([
    { type: "text", text: "Transcribe this recording, then report the signs it describes." },
    { type: "audio", data: audio.data, mime_type: audio.mimeType },
  ]);
}
