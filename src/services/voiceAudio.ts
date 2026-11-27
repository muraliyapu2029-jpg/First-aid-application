import type { Language } from '../types';
import { textHash, normalizeSpeechText } from '../utils/textHash';
import { isCloudTTSAvailable } from './cloudSTT';

// ============================================================
// Sarvam voice audio for languages most devices can't speak.
// Source order for each sentence:
//   1. Pre-generated clip in public/audio (offline, instant)
//   2. Live synthesis via backend /api/voice/speak (cached)
// If neither is available, the caller falls back to the
// device's own speechSynthesis voice.
// ============================================================

/** Languages that use Sarvam audio instead of the device voice. */
export const AUDIO_VOICE_LANGUAGES: readonly Language[] = ['kn'];

const MANIFEST_URL = '/audio/manifest.json';
const SPEAK_URL = '/api/voice/speak';
const SPEAK_TIMEOUT_MS = 12_000;
const MAX_CACHED_URLS = 40;

interface AudioManifest {
  files?: Partial<Record<Language, Record<string, string>>>;
}

let manifestPromise: Promise<AudioManifest | null> | null = null;
// key `${lang}:${hash}` -> resolved URL (static path or blob: URL)
const urlCache = new Map<string, Promise<string | null>>();

export function usesAudioVoice(language: Language): boolean {
  return AUDIO_VOICE_LANGUAGES.includes(language);
}

function loadManifest(): Promise<AudioManifest | null> {
  manifestPromise ??= fetch(MANIFEST_URL)
    .then(res =>
      // SPA fallbacks can return index.html with 200 — only trust real JSON
      res.ok && res.headers.get('content-type')?.includes('json') ? (res.json() as Promise<AudioManifest>) : null
    )
    .catch(() => {
      manifestPromise = null; // allow retry later (e.g. came back online)
      return null;
    });
  return manifestPromise;
}

async function hasPregenerated(language: Language): Promise<boolean> {
  const files = (await loadManifest())?.files?.[language];
  return Boolean(files && Object.keys(files).length > 0);
}

/** Can we play Sarvam audio for this language right now? */
export async function isAudioVoiceAvailable(language: Language): Promise<boolean> {
  if (!usesAudioVoice(language)) return false;
  if (await hasPregenerated(language)) return true;
  return isCloudTTSAvailable();
}

async function resolveUrl(text: string, language: Language): Promise<string | null> {
  const hash = textHash(text);

  const file = (await loadManifest())?.files?.[language]?.[hash];
  if (file) return `/audio/${file}`;

  if (navigator.onLine === false || !(await isCloudTTSAvailable())) return null;

  const res = await fetch(SPEAK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: normalizeSpeechText(text), language }),
    signal: AbortSignal.timeout(SPEAK_TIMEOUT_MS),
  });
  if (!res.ok || !res.headers.get('content-type')?.startsWith('audio/')) return null;
  return URL.createObjectURL(await res.blob());
}

/** URL of Sarvam audio for this sentence, or null if unavailable. */
export function getAudioUrl(text: string, language: Language): Promise<string | null> {
  if (!usesAudioVoice(language) || !text.trim()) return Promise.resolve(null);

  const key = `${language}:${textHash(text)}`;
  const cached = urlCache.get(key);
  if (cached) return cached;

  const pending = resolveUrl(text, language).catch(() => null);
  urlCache.set(key, pending);
  pending.then(url => {
    if (!url) urlCache.delete(key); // don't cache failures — retry next time
  });

  // Bound memory: drop the oldest entry (revoking blob URLs)
  if (urlCache.size > MAX_CACHED_URLS) {
    const [oldestKey, oldest] = urlCache.entries().next().value!;
    urlCache.delete(oldestKey);
    oldest.then(url => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }
  return pending;
}

/** Warm the cache for a sentence that's likely to be spoken next. */
export function prefetchAudio(text: string, language: Language): void {
  void getAudioUrl(text, language);
}
