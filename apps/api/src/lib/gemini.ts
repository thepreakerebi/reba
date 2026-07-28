/**
 * Free-text intake.
 *
 * The family describes how she is in their own words; Gemini returns which protocol signs those
 * words correspond to. The `sign_id` field is an enum generated from `SIGN_IDS` at request time, so
 * a sign outside the protocol is not merely discouraged — it is unrepresentable in the output.
 *
 * This is the only place a model touches the pipeline. It never sees the levels, the risk profile,
 * or the verdict.
 */

import { GoogleGenAI } from "@google/genai";

import { SIGN_IDS, SIGNS, type Answer, type Presence } from "@reba/core";

const MODEL = "gemini-3.6-flash";

const SYSTEM = `You convert a family member's plain description of how a mother is doing after
childbirth into a structured list of danger signs.

Rules:
- Only report a sign if the description actually supports it. Do not infer, do not diagnose, do not
  add signs the person did not describe.
- If the description touches on a sign but is ambiguous or hedged ("maybe", "a little", "I think"),
  mark presence as "unsure". Never resolve ambiguity yourself.
- You are not deciding urgency. You are only reading what was said.
- The description may be in English, Kinyarwanda, or a mix of both.`;

function schema() {
  return {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            sign_id: { type: "string", enum: SIGN_IDS },
            presence: { type: "string", enum: ["yes", "unsure"] },
            quote: {
              type: "string",
              description: "The words from the description that support this sign.",
            },
          },
          required: ["sign_id", "presence", "quote"],
        },
      },
    },
    required: ["answers"],
  };
}

export type ExtractedAnswer = Answer & { quote: string };

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function extractSigns(text: string): Promise<ExtractedAnswer[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const catalogue = SIGNS.map((sign) => `${sign.id}: ${sign.label}`).join("\n");

  const result = await ai.interactions.create({
    model: MODEL,
    input: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Signs you may report:\n${catalogue}\n\nDescription:\n${text}`,
      },
    ],
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: schema(),
    },
  });

  const parsed = JSON.parse(result.output_text ?? "{}") as {
    answers?: { sign_id: string; presence: Presence; quote: string }[];
  };

  // Belt and braces: the enum makes this impossible, so we also assert it.
  return (parsed.answers ?? [])
    .filter((answer) => SIGN_IDS.includes(answer.sign_id))
    .map((answer) => ({
      signId: answer.sign_id,
      presence: answer.presence === "unsure" ? "unsure" : "yes",
      quote: answer.quote,
    }));
}
