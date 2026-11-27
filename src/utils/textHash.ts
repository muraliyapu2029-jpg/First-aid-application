// ============================================================
// Stable short hash of a sentence, used to name pre-generated
// voice clips (public/audio/<lang>/<hash>.mp3). Shared by the
// browser and scripts/generate-audio.ts so both agree on names.
// If a sentence's text changes, its hash changes, so stale audio
// is never played for edited instructions.
// Not cryptographic — only needs to be collision-free across
// a few hundred sentences.
// ============================================================

export function normalizeSpeechText(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function textHash(text: string): string {
  const s = normalizeSpeechText(text);
  let h1 = 0x811c9dc5;
  let h2 = 0x9747b28c;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c;
    h2 = Math.imul(h2, 0x5bd1e995);
    h2 ^= h2 >>> 15;
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}
