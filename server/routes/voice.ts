import { Router, raw, Request, Response } from 'express';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  synthesizeSpeech,
  isTTSLanguage,
  speakerFor,
  SarvamTTSError,
  SARVAM_TTS_MODEL,
  MAX_TTS_CHARS,
  TTS_PACE,
} from '../lib/sarvamTTS';

// ============================================================
// Voice Routes — Sarvam AI speech-to-text proxy
// Keeps SARVAM_API_KEY on the server. Audio and transcripts are
// never stored or logged.
// Docs: https://docs.sarvam.ai/api-reference-docs/speech-to-text/transcribe
// ============================================================

const router = Router();

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';
const SARVAM_MODEL = 'saaras:v4';
const SARVAM_TIMEOUT_MS = 10_000;
const MAX_AUDIO_BYTES = '2mb'; // ~15s of opus audio is far below this

type AppLanguage = 'kn' | 'hi' | 'en';

// Sarvam BCP-47 code -> app language
const FROM_SARVAM: Record<string, AppLanguage> = {
  'kn-IN': 'kn',
  'hi-IN': 'hi',
  'en-IN': 'en',
};

// App language -> Sarvam code (used when the user forces a language)
const TO_SARVAM: Record<AppLanguage, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

const EXTENSION_FOR_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};

interface SarvamSTTResponse {
  request_id?: string | null;
  transcript?: string;
  language_code?: string | null;
  language_probability?: number | null;
}

function getApiKey(): string | undefined {
  const key = process.env.SARVAM_API_KEY?.trim();
  return key ? key : undefined;
}

/**
 * GET /api/voice/status
 * Lets the frontend decide between cloud STT and the browser recognizer.
 */
router.get('/status', (_req: Request, res: Response) => {
  const configured = Boolean(getApiKey());
  res.json({
    cloudSTT: configured,
    cloudTTS: configured,
    provider: 'sarvam',
    model: SARVAM_MODEL,
    ttsModel: SARVAM_TTS_MODEL,
  });
});

// ------------------------------------------------------------
// Text-to-speech
// ------------------------------------------------------------

// Every synthesized sentence is cached on disk, so each one is paid for once.
const TTS_CACHE_DIR = path.resolve(process.env.TTS_CACHE_DIR || path.join(process.cwd(), '.cache', 'tts'));

// Light per-IP limit so a public backend can't drain the Sarvam credit.
const TTS_RATE_WINDOW_MS = 10 * 60_000;
const TTS_RATE_MAX_UNCACHED = 60;
const ttsRequests = new Map<string, number[]>();

function allowUncachedTTS(ip: string): boolean {
  const now = Date.now();
  const recent = (ttsRequests.get(ip) ?? []).filter(t => now - t < TTS_RATE_WINDOW_MS);
  if (recent.length >= TTS_RATE_MAX_UNCACHED) {
    ttsRequests.set(ip, recent);
    return false;
  }
  recent.push(now);
  ttsRequests.set(ip, recent);
  return true;
}

/**
 * POST /api/voice/speak
 * Body: { text: string, language: 'kn'|'hi'|'en' }
 * Response: audio/mpeg
 */
router.post('/speak', async (req: Request, res: Response) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'cloud_tts_not_configured' });
  }

  const { text, language } = (req.body ?? {}) as { text?: unknown; language?: unknown };
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text_required' });
  }
  if (!isTTSLanguage(language)) {
    return res.status(400).json({ error: 'unsupported_language' });
  }
  const cleanText = text.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (cleanText.length > MAX_TTS_CHARS) {
    return res.status(413).json({ error: 'text_too_long', max: MAX_TTS_CHARS });
  }

  // Cache key includes voice settings so changing the speaker re-synthesizes
  const cacheKey = createHash('sha256')
    .update([SARVAM_TTS_MODEL, speakerFor(language), TTS_PACE, language, cleanText].join('\u0000'))
    .digest('hex');
  const cacheFile = path.join(TTS_CACHE_DIR, language, `${cacheKey}.mp3`);

  const sendAudio = (audio: Buffer, cacheStatus: 'HIT' | 'MISS') => {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-TTS-Cache', cacheStatus);
    res.send(audio);
  };

  try {
    return sendAudio(await readFile(cacheFile), 'HIT');
  } catch {
    // not cached yet
  }

  if (!allowUncachedTTS(req.ip ?? 'unknown')) {
    return res.status(429).json({ error: 'cloud_tts_rate_limited' });
  }

  try {
    const audio = await synthesizeSpeech(cleanText, language, apiKey);
    try {
      await mkdir(path.dirname(cacheFile), { recursive: true });
      await writeFile(cacheFile, audio);
    } catch (err) {
      console.error('TTS cache write failed:', (err as Error).message);
    }
    return sendAudio(audio, 'MISS');
  } catch (err) {
    if (err instanceof SarvamTTSError) {
      console.error(`Sarvam TTS error: HTTP ${err.status}`);
      if (err.status === 402) return res.status(402).json({ error: 'cloud_tts_out_of_credits' });
      if (err.status === 429) return res.status(429).json({ error: 'cloud_tts_rate_limited' });
      return res.status(502).json({ error: 'cloud_tts_failed' });
    }
    const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    console.error(`Sarvam TTS request failed: ${isTimeout ? 'timeout' : (err as Error)?.message}`);
    return res.status(isTimeout ? 504 : 502).json({ error: isTimeout ? 'cloud_tts_timeout' : 'cloud_tts_failed' });
  }
});

/**
 * POST /api/voice/transcribe[?language=kn|hi|en]
 * Body: raw audio bytes (Content-Type: audio/webm, audio/mp4, ...)
 * Response: { transcript, language: 'kn'|'hi'|'en'|null, languageProbability }
 * Without ?language, Sarvam auto-detects the spoken language.
 */
router.post(
  '/transcribe',
  raw({ type: ['audio/*', 'application/octet-stream'], limit: MAX_AUDIO_BYTES }),
  async (req: Request, res: Response) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(503).json({
        error: 'cloud_stt_not_configured',
        message: 'Set SARVAM_API_KEY to enable cloud speech-to-text',
      });
    }

    const audio = req.body as unknown;
    if (!Buffer.isBuffer(audio) || audio.length === 0) {
      return res.status(400).json({ error: 'audio_required' });
    }

    const mimeType = (req.headers['content-type'] ?? 'audio/webm').split(';')[0].trim().toLowerCase();
    const extension = EXTENSION_FOR_MIME[mimeType] ?? 'webm';

    const forced = typeof req.query.language === 'string' ? req.query.language : undefined;
    const languageCode = forced && forced in TO_SARVAM ? TO_SARVAM[forced as AppLanguage] : 'unknown';

    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(audio)], { type: mimeType }), `speech.${extension}`);
    form.append('model', SARVAM_MODEL);
    form.append('mode', 'transcribe');
    form.append('language_code', languageCode);

    try {
      const response = await fetch(SARVAM_STT_URL, {
        method: 'POST',
        headers: { 'api-subscription-key': apiKey },
        body: form,
        signal: AbortSignal.timeout(SARVAM_TIMEOUT_MS),
      });

      if (!response.ok) {
        // Log status only — never the audio or transcript
        console.error(`Sarvam STT error: HTTP ${response.status}`);
        if (response.status === 402) {
          return res.status(402).json({ error: 'cloud_stt_out_of_credits' });
        }
        if (response.status === 429) {
          return res.status(429).json({ error: 'cloud_stt_rate_limited' });
        }
        if (response.status === 401 || response.status === 403) {
          return res.status(502).json({ error: 'cloud_stt_auth_failed' });
        }
        return res.status(502).json({ error: 'cloud_stt_failed' });
      }

      const data = (await response.json()) as SarvamSTTResponse;
      const detected = data.language_code ? FROM_SARVAM[data.language_code] ?? null : null;

      return res.json({
        transcript: (data.transcript ?? '').trim(),
        language: detected,
        languageProbability: data.language_probability ?? null,
      });
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      console.error(`Sarvam STT request failed: ${isTimeout ? 'timeout' : (err as Error)?.message}`);
      return res.status(isTimeout ? 504 : 502).json({ error: isTimeout ? 'cloud_stt_timeout' : 'cloud_stt_failed' });
    }
  }
);

export default router;
