// ============================================================
// Sarvam AI text-to-speech client (bulbul:v4-flash)
// Shared by the /api/voice/speak route and scripts/generate-audio.ts
// so live and pre-generated clips use the same voice.
// Docs: https://docs.sarvam.ai/api-reference-docs/text-to-speech/convert
// ============================================================

export type TTSLanguage = 'kn' | 'hi' | 'en';

export const SARVAM_TTS_URL = 'https://api.sarvam.ai/text-to-speech';
export const SARVAM_TTS_MODEL = 'bulbul:v4-flash';
export const MAX_TTS_CHARS = 2500;
const TIMEOUT_MS = 15_000;

const LANGUAGE_CODE: Record<TTSLanguage, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

// Speakers are model-specific and lowercase. Override with
// SARVAM_TTS_SPEAKER_KN / _HI / _EN if you prefer another voice.
const DEFAULT_SPEAKER: Record<TTSLanguage, string> = {
  kn: 'chaitra_kn_conversation',
  hi: 'ritu_hi_customer',
  en: 'simran_en_customer',
};

// Slightly slower than normal: listeners are stressed and acting while listening
export const TTS_PACE = 0.9;

export function isTTSLanguage(value: unknown): value is TTSLanguage {
  return value === 'kn' || value === 'hi' || value === 'en';
}

export function speakerFor(language: TTSLanguage): string {
  return process.env[`SARVAM_TTS_SPEAKER_${language.toUpperCase()}`]?.trim() || DEFAULT_SPEAKER[language];
}

export class SarvamTTSError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Synthesize speech. Returns MP3 bytes. Throws SarvamTTSError on API failure. */
export async function synthesizeSpeech(text: string, language: TTSLanguage, apiKey: string): Promise<Buffer> {
  const response = await fetch(SARVAM_TTS_URL, {
    method: 'POST',
    headers: { 'api-subscription-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      language_code: LANGUAGE_CODE[language],
      speaker: speakerFor(language),
      model: SARVAM_TTS_MODEL,
      pace: TTS_PACE,
      output_audio_codec: 'mp3',
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = body?.error?.message ?? '';
    } catch {
      // non-JSON error body
    }
    throw new SarvamTTSError(response.status, `Sarvam TTS HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  const data = (await response.json()) as { audios?: string[] };
  if (!data.audios?.length) throw new SarvamTTSError(502, 'Sarvam TTS returned no audio');
  return Buffer.concat(data.audios.map(chunk => Buffer.from(chunk, 'base64')));
}
