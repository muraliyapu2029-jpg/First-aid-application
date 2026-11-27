import type { Language } from '../types';

// ============================================================
// Cloud Speech-to-Text client (Sarvam, via our backend)
// The browser never sees the Sarvam key — it calls /api/voice/*,
// which the Vite dev server / nginx proxies to server/.
// ============================================================

const STATUS_URL = '/api/voice/status';
const TRANSCRIBE_URL = '/api/voice/transcribe';
const STATUS_TIMEOUT_MS = 2_500;
const TRANSCRIBE_TIMEOUT_MS = 12_000;
const STATUS_CACHE_MS = 60_000;

export interface CloudTranscription {
  transcript: string;
  /** Language Sarvam detected, or null if it wasn't kn/hi/en */
  language: Language | null;
  languageProbability: number | null;
}

export type CloudSTTErrorCode =
  | 'not_configured'
  | 'out_of_credits'
  | 'rate_limited'
  | 'timeout'
  | 'network'
  | 'failed';

export class CloudSTTError extends Error {
  readonly code: CloudSTTErrorCode;
  constructor(code: CloudSTTErrorCode) {
    super(code);
    this.code = code;
  }
}

interface VoiceStatus {
  cloudSTT: boolean;
  cloudTTS: boolean;
}

const OFF: VoiceStatus = { cloudSTT: false, cloudTTS: false };
let statusCache: { value: VoiceStatus; at: number } | null = null;
let inflight: Promise<VoiceStatus> | null = null;

/** Backend voice capabilities (Sarvam key configured + reachable). Cached for 60s. */
async function getVoiceStatus(): Promise<VoiceStatus> {
  if (statusCache && Date.now() - statusCache.at < STATUS_CACHE_MS) return statusCache.value;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return OFF;
  inflight ??= (async () => {
    let value = OFF;
    try {
      const res = await fetch(STATUS_URL, { signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = (await res.json()) as Partial<VoiceStatus>;
        value = { cloudSTT: data.cloudSTT === true, cloudTTS: data.cloudTTS === true };
      }
    } catch {
      value = OFF;
    }
    statusCache = { value, at: Date.now() };
    inflight = null;
    return value;
  })();
  return inflight;
}

/** Is cloud speech-to-text (Sarvam) available? */
export async function isCloudSTTAvailable(): Promise<boolean> {
  return (await getVoiceStatus()).cloudSTT;
}

/** Is cloud text-to-speech (Sarvam) available? */
export async function isCloudTTSAvailable(): Promise<boolean> {
  return (await getVoiceStatus()).cloudTTS;
}

/** Mark cloud voice unavailable for the cache window (e.g. after credits run out). */
export function markCloudSTTUnavailable(): void {
  statusCache = { value: OFF, at: Date.now() };
}

/**
 * Transcribe one recorded utterance.
 * Pass `forceLanguage` when the user explicitly picked a language;
 * otherwise Sarvam auto-detects Kannada / Hindi / English.
 */
export async function transcribeAudio(audio: Blob, forceLanguage?: Language): Promise<CloudTranscription> {
  const url = forceLanguage ? `${TRANSCRIBE_URL}?language=${forceLanguage}` : TRANSCRIBE_URL;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': audio.type || 'audio/webm' },
      body: audio,
      signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
    });
  } catch (err) {
    const name = (err as Error)?.name;
    throw new CloudSTTError(name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network');
  }

  if (!res.ok) {
    if (res.status === 503) throw new CloudSTTError('not_configured');
    if (res.status === 402) throw new CloudSTTError('out_of_credits');
    if (res.status === 429) throw new CloudSTTError('rate_limited');
    if (res.status === 504) throw new CloudSTTError('timeout');
    throw new CloudSTTError('failed');
  }

  const data = (await res.json()) as Partial<CloudTranscription>;
  const language = data.language === 'kn' || data.language === 'hi' || data.language === 'en' ? data.language : null;
  return {
    transcript: typeof data.transcript === 'string' ? data.transcript.trim() : '',
    language,
    languageProbability: typeof data.languageProbability === 'number' ? data.languageProbability : null,
  };
}
