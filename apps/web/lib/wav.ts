/**
 * Recording to something Gemini will accept.
 *
 * Chrome's MediaRecorder only produces a WebM container, and the API rejects `audio/webm` outright.
 * So we decode whatever was recorded, downmix to mono, resample to 16 kHz, and re-encode as WAV —
 * which every browser can decode and the API accepts everywhere.
 *
 * 16 kHz mono is also what speech models want, and it keeps a 20-second clip well under a megabyte.
 */

const TARGET_SAMPLE_RATE = 16_000;

export type EncodedAudio = { data: string; mimeType: string };

async function decode(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const context = new AudioContext();
  try {
    return await context.decodeAudioData(arrayBuffer);
  } finally {
    void context.close();
  }
}

/** Downmix to mono and resample, so the WAV is small and the sample rate is predictable. */
async function toMono16k(buffer: AudioBuffer): Promise<Float32Array> {
  const frames = Math.ceil((buffer.duration * TARGET_SAMPLE_RATE) / 1);
  const offline = new OfflineAudioContext(1, frames, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytes = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(bytes);

  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return bytes;
}

function toBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  // Chunked so a long recording does not blow the argument limit on String.fromCharCode.
  const chunkSize = 0x8000;
  let binary = "";
  for (let index = 0; index < view.length; index += chunkSize) {
    binary += String.fromCharCode(...view.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

/** How short a clip we refuse to send, so an accidental tap does not become a request. */
export const MIN_DURATION_SECONDS = 0.4;

export async function blobToWav(blob: Blob): Promise<EncodedAudio | null> {
  const buffer = await decode(blob);
  if (buffer.duration < MIN_DURATION_SECONDS) return null;

  const samples = await toMono16k(buffer);
  return { data: toBase64(encodeWav(samples, TARGET_SAMPLE_RATE)), mimeType: "audio/wav" };
}
