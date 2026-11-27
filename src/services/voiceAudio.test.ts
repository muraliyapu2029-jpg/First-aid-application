import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { textHash } from '../utils/textHash';

const KN_TEXT = 'ವ್ಯಕ್ತಿಯನ್ನು ಶಾಂತವಾಗಿ ಇರಿಸಿ.';

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

// voiceAudio keeps module-level caches — load a fresh copy per test
async function loadVoiceAudio() {
  vi.resetModules();
  return import('./voiceAudio');
}

describe('textHash', () => {
  it('is stable and ignores whitespace differences', () => {
    expect(textHash(KN_TEXT)).toBe(textHash(`  ${KN_TEXT}  `));
    expect(textHash('a  b')).toBe(textHash('a b'));
    expect(textHash(KN_TEXT)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('changes when the sentence changes', () => {
    expect(textHash(KN_TEXT)).not.toBe(textHash(KN_TEXT + ' 112'));
  });
});

describe('voiceAudio', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('only uses Sarvam audio for Kannada', async () => {
    const { usesAudioVoice, getAudioUrl } = await loadVoiceAudio();
    expect(usesAudioVoice('kn')).toBe(true);
    expect(usesAudioVoice('hi')).toBe(false);
    expect(usesAudioVoice('en')).toBe(false);
    expect(await getAudioUrl('hello', 'en')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prefers the pre-generated clip from the manifest', async () => {
    const hash = textHash(KN_TEXT);
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/audio/manifest.json') return jsonResponse({ files: { kn: { [hash]: `kn/${hash}.mp3` } } });
      throw new Error(`unexpected fetch ${url}`);
    });
    const { getAudioUrl, isAudioVoiceAvailable } = await loadVoiceAudio();
    expect(await isAudioVoiceAvailable('kn')).toBe(true);
    expect(await getAudioUrl(KN_TEXT, 'kn')).toBe(`/audio/kn/${hash}.mp3`);
  });

  it('falls back to live synthesis when the sentence is not pre-generated', async () => {
    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === '/audio/manifest.json') return jsonResponse({ files: { kn: {} } });
      if (url === '/api/voice/status') return jsonResponse({ cloudSTT: true, cloudTTS: true });
      if (url === '/api/voice/speak') {
        expect(JSON.parse(String(init?.body))).toEqual({ text: KN_TEXT, language: 'kn' });
        return new Response(new Blob([new Uint8Array([0xff, 0xf3])]), {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    const { getAudioUrl } = await loadVoiceAudio();
    expect(await getAudioUrl(KN_TEXT, 'kn')).toMatch(/^blob:/);
  });

  it('returns null when there is no clip and no backend (so the caller can fall back)', async () => {
    fetchMock.mockImplementation(async () => {
      throw new TypeError('network down');
    });
    const { getAudioUrl, isAudioVoiceAvailable } = await loadVoiceAudio();
    expect(await isAudioVoiceAvailable('kn')).toBe(false);
    expect(await getAudioUrl(KN_TEXT, 'kn')).toBeNull();
  });

  it('ignores an HTML response for the manifest (SPA fallback)', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === '/audio/manifest.json') {
        return new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
      }
      if (url === '/api/voice/status') return jsonResponse({ cloudSTT: false, cloudTTS: false });
      throw new Error(`unexpected fetch ${url}`);
    });
    const { isAudioVoiceAvailable } = await loadVoiceAudio();
    expect(await isAudioVoiceAvailable('kn')).toBe(false);
  });
});
