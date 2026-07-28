"use client";

import { useRef, useState } from "react";
import type { Lang } from "@reba/core";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/api";
import { t } from "@/lib/i18n";
import { blobToWav } from "@/lib/wav";

export type Interpretation = {
  transcript: string;
  language: Lang;
  answers: { signId: string; presence: "yes" | "unsure"; quote: string }[];
};

/**
 * Speech and free text in, a proposal out.
 *
 * The browser's own speech recognition has no Kinyarwanda, so the recording goes to Gemini, which
 * transcribes and reads the signs in one pass. Nothing is scored until the family has seen the
 * transcript and pressed confirm — speech recognition in Kinyarwanda is the least reliable link in
 * the chain, and it is the one place we insist a person checks the machine's work.
 */
export function VoiceIntake({
  motherId,
  lang,
  onLanguageDetected,
  onAccept,
}: {
  motherId: string;
  lang: Lang;
  onLanguageDetected: (lang: Lang) => void;
  onAccept: (interpretation: Interpretation) => void;
}) {
  const copy = t(lang);

  const [text, setText] = useState("");
  const [isRecording, setRecording] = useState(false);
  const [isBusy, setBusy] = useState(false);
  const [result, setResult] = useState<Interpretation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function send(payload: { text?: string; audio?: { data: string; mimeType: string } }) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/mothers/${motherId}/interpret`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("interpret failed");
      const interpretation = (await response.json()) as Interpretation;
      setResult(interpretation);
      onLanguageDetected(interpretation.language);
    } catch {
      setError(copy.interpretFailed);
    } finally {
      setBusy(false);
    }
  }

  async function startRecording() {
    if (typeof MediaRecorder === "undefined") {
      setError(copy.micUnsupported);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        for (const track of stream.getTracks()) track.stop();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        try {
          // Re-encoded to WAV because the API rejects the WebM container browsers record into.
          const audio = await blobToWav(blob);
          if (!audio) {
            setError(copy.tooShort);
            return;
          }
          await send({ audio });
        } catch {
          setError(copy.interpretFailed);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError(copy.micDenied);
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  return (
    <section aria-labelledby="voice-heading" className="rounded-xl border p-4 sm:p-6">
      <h2 id="voice-heading" className="text-lg font-semibold">
        {copy.speak}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">{copy.speakIntro}</p>

      <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <Button
          type="button"
          variant={isRecording ? "destructive" : "secondary"}
          className="h-12 w-full text-base sm:w-52"
          disabled={isBusy}
          aria-pressed={isRecording}
          // Tap to start, tap to stop. Hold-to-talk drops the recording the moment a finger slides
          // off the button, which is exactly what happens on a phone in a hurry.
          onClick={() => (isRecording ? stopRecording() : void startRecording())}
        >
          {isRecording ? `⏹ ${copy.recording}` : isBusy ? copy.listening : `🎙 ${copy.record}`}
        </Button>

        <form
          className="flex flex-1 flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim()) void send({ text });
          }}
        >
          <label htmlFor="description" className="sr-only">
            {copy.speakIntro}
          </label>
          <textarea
            id="description"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            className="min-h-12 flex-1 rounded-md border bg-transparent px-3 py-2 text-base"
          />
          <Button type="submit" variant="outline" className="h-12" disabled={isBusy || !text.trim()}>
            →
          </Button>
        </form>
      </section>

      <output aria-live="polite">
        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

        {result ? (
          <section className="mt-5 rounded-lg border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">
              {copy.heard}
            </h3>
            <blockquote className="mt-2 border-l-2 pl-3 text-base italic">
              {result.transcript || "—"}
            </blockquote>
            <p className="mt-2 text-sm text-muted-foreground">{copy.heardNote}</p>

            <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide opacity-70">
              {copy.signsFound}
            </h4>
            {result.answers.length === 0 ? (
              <p className="mt-2 text-sm">{copy.noSigns}</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {result.answers.map((answer) => (
                  <li key={answer.signId} className="flex flex-wrap items-baseline gap-2 text-sm">
                    <Badge variant={answer.presence === "unsure" ? "outline" : "secondary"}>
                      {answer.presence === "unsure" ? copy.unsure : copy.yes}
                    </Badge>
                    <q className="opacity-80">{answer.quote}</q>
                  </li>
                ))}
              </ul>
            )}

            <footer className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="h-12 text-base"
                onClick={() => {
                  onAccept(result);
                  setResult(null);
                  setText("");
                }}
              >
                {copy.useThese}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-12"
                onClick={() => setResult(null)}
              >
                {copy.discard}
              </Button>
            </footer>
          </section>
        ) : null}
      </output>
    </section>
  );
}
