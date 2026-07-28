"use client";

import { useRef, useState } from "react";
import type { Lang } from "@reba/core";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { t } from "@/lib/i18n";
import { blobToWav } from "@/lib/wav";

export type Interpretation = {
  transcript: string;
  language: Lang;
  answers: { signId: string; presence: "yes" | "unsure"; quote: string }[];
};

/**
 * Step two, voice path: record, then confirm.
 *
 * Nothing is scored until the family has read the transcript back. Kinyarwanda speech recognition
 * is the least reliable link in the chain, so it is the one place a person must check the machine.
 */
export function VoiceStep({
  motherId,
  lang,
  onLanguageDetected,
  onAccept,
  onBack,
}: {
  motherId: string;
  lang: Lang;
  onLanguageDetected: (lang: Lang) => void;
  onAccept: (interpretation: Interpretation) => void;
  onBack: () => void;
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

  // --- Confirmation screen -------------------------------------------------
  if (result) {
    return (
      <section aria-labelledby="confirm-heading">
        <h2 id="confirm-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          {copy.heard}
        </h2>
        <blockquote className="mt-4 border-l-4 pl-4 text-lg italic">
          {result.transcript || "—"}
        </blockquote>
        <p className="mt-2 text-sm text-muted-foreground">{copy.heardNote}</p>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.signsFound}
        </h3>
        {result.answers.length === 0 ? (
          <p className="mt-2 text-base">{copy.noSigns}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {result.answers.map((answer) => (
              <li key={answer.signId} className="flex flex-wrap items-baseline gap-2">
                <Badge variant={answer.presence === "unsure" ? "outline" : "secondary"}>
                  {answer.presence === "unsure" ? copy.unsure : copy.yes}
                </Badge>
                <q className="text-sm opacity-80">{answer.quote}</q>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            className="h-12 flex-1 text-base"
            onClick={() => onAccept(result)}
          >
            {copy.useThese}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={() => {
              setResult(null);
              setText("");
            }}
          >
            {copy.discard}
          </Button>
        </footer>
      </section>
    );
  }

  // --- Recording screen ----------------------------------------------------
  return (
    <section aria-labelledby="voice-heading">
      <h2 id="voice-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
        {copy.optionSpeak}
      </h2>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">{copy.speakIntro}</p>

      <Button
        type="button"
        variant={isRecording ? "destructive" : "secondary"}
        className="mt-6 h-28 w-full text-lg"
        disabled={isBusy}
        aria-pressed={isRecording}
        // Tap to start, tap to stop. Hold-to-talk drops the recording the moment a finger slides
        // off the button, which is exactly what happens on a phone in a hurry.
        onClick={() => (isRecording ? stopRecording() : void startRecording())}
      >
        {isRecording ? `⏹ ${copy.recording}` : isBusy ? copy.listening : `🎙 ${copy.record}`}
      </Button>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
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

      <output aria-live="polite">
        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      </output>

      <footer className="mt-8">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← {copy.back}
        </Button>
      </footer>
    </section>
  );
}
