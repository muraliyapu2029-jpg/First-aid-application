import type { Language } from '../types';

// ============================================================
// Language Detection (offline)
// Works out whether text is Kannada, Hindi or English so the
// app can reply in the same language the user used.
//
// 1. Script: Kannada (U+0C80–0CFF) and Devanagari (U+0900–097F)
//    are unambiguous. Any native-script text wins over Latin,
//    since speakers often mix in English words ("heart attack").
// 2. Latin-only text: look for common romanized Hindi/Kannada
//    words ("saap ne kaata", "haavu kachchitu").
// 3. Otherwise English. Empty / digits-only text keeps `fallback`.
// ============================================================

// Whole-word romanized hints. Keep these distinctive — avoid words
// that are also common English (e.g. "dil" is fine, "man" is not).
const ROMANIZED_HINTS: Record<'hi' | 'kn', string[]> = {
  hi: [
    'saap', 'saanp', 'sanp', 'kaata', 'kata', 'kaat', 'kaati', 'dard', 'seene', 'chhati', 'chati',
    'dil', 'behosh', 'khoon', 'khun', 'jal', 'gaya', 'gayi', 'saans', 'sans', 'madad', 'bachao', 'bachaao',
    'mere', 'meri', 'mera', 'hai', 'hain', 'nahi', 'nahin', 'ho', 'raha', 'rahi', 'kya', 'karo', 'jaldi',
    'papa', 'pitaji', 'bhai', 'chot', 'ghayal', 'gir', 'gira', 'giri', 'bukhar', 'ulti', 'chakkar',
    'durghatna', 'hadsa', 'bijli', 'karant', 'jhatka', 'daura', 'mirgi',
  ],
  kn: [
    'haavu', 'havu', 'kachchitu', 'kachitu', 'kachhitu', 'kachide', 'novu', 'edhe', 'ede', 'hrudaya',
    'raktha', 'rakta', 'prajne', 'usiru', 'sahaya', 'kapadi', 'kaapadi', 'beku', 'illa', 'ide',
    'nanna', 'nange', 'avaru', 'appa', 'amma', 'anna', 'akka', 'thale', 'suttu', 'suttide', 'bidda',
    'biddaru', 'apaghata', 'vidyut', 'shock', 'hodeyitu', 'jvara', 'vanti', 'moorchhe', 'murche', 'beega',
    'bega', 'hogide', 'aagide', 'agide', 'maadi', 'madi',
  ],
};

// "shock" is common English; only count it alongside other Kannada words.
const WEAK_HINTS = new Set(['shock', 'mere', 'sans', 'kata', 'ede', 'ho', 'hai', 'ide', 'gaya', 'jal', 'gir', 'papa', 'appa', 'amma', 'anna', 'bhai']);

function countScripts(text: string) {
  let kn = 0;
  let hi = 0;
  let latin = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0c80 && c <= 0x0cff) kn++;
    else if (c >= 0x0900 && c <= 0x097f) hi++;
    else if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) latin++;
  }
  return { kn, hi, latin };
}

function scoreRomanized(text: string): { hi: number; kn: number } {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const score = { hi: 0, kn: 0 };
  for (const lang of ['hi', 'kn'] as const) {
    const hints = ROMANIZED_HINTS[lang];
    for (const w of words) {
      if (hints.includes(w)) score[lang] += WEAK_HINTS.has(w) ? 0.5 : 1;
    }
  }
  return score;
}

export function detectLanguage(text: string, fallback: Language): Language {
  const { kn, hi, latin } = countScripts(text);

  if (kn > 0 || hi > 0) return kn >= hi ? 'kn' : 'hi';
  if (latin === 0) return fallback;

  const romanized = scoreRomanized(text);
  const best = romanized.kn > romanized.hi ? 'kn' : 'hi';
  const bestScore = romanized[best];
  // Require at least one strong hint (score ≥ 1) and a clear winner
  if (bestScore >= 1 && romanized.kn !== romanized.hi) return best;

  return 'en';
}
