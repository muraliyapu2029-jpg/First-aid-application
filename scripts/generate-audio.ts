// ============================================================
// Pre-generate first-aid voice clips with Sarvam TTS
//
//   npm run tts:generate                 # Kannada (default)
//   npm run tts:generate -- --dry-run    # show clip count / cost, no API calls
//   npm run tts:generate -- --lang kn,hi
//   npm run tts:generate -- --limit 1    # generate just one clip (sanity check)
//
// Writes public/audio/<lang>/<hash>.mp3 and public/audio/manifest.json.
// The app plays these files first, so voice works offline and instantly.
// Only new or changed sentences are synthesized — re-running is cheap.
// Reads SARVAM_API_KEY from .env (project root) or server/.env.
// ============================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFirstAidProtocol } from '../src/services/firstAidService';
import { EmergencyCategory, type Language } from '../src/types';
import { textHash, normalizeSpeechText } from '../src/utils/textHash';
import { synthesizeSpeech, speakerFor, SARVAM_TTS_MODEL, TTS_PACE } from '../server/lib/sarvamTTS';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const MANIFEST_PATH = path.join(AUDIO_DIR, 'manifest.json');
const EST_COST_PER_10K_CHARS = { low: 10, high: 20 }; // ₹, bulbul:v4-flash — check sarvam.ai/api-pricing

interface Manifest {
  version: 1;
  model: string;
  pace: number;
  speakers: Partial<Record<Language, string>>;
  files: Partial<Record<Language, Record<string, string>>>;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const langs = (get('--lang') ?? 'kn').split(',').map(s => s.trim()) as Language[];
  for (const l of langs) {
    if (!['kn', 'hi', 'en'].includes(l)) throw new Error(`Unsupported --lang ${l}`);
  }
  const limit = get('--limit') ? Number(get('--limit')) : Infinity;
  return { langs, limit, dryRun: args.includes('--dry-run') };
}

function loadApiKey(): string | undefined {
  for (const file of [path.join(ROOT, '.env'), path.join(ROOT, 'server', '.env')]) {
    if (process.env.SARVAM_API_KEY) break;
    try {
      process.loadEnvFile(file);
    } catch {
      // not present
    }
  }
  return process.env.SARVAM_API_KEY?.trim() || undefined;
}

/** Every sentence the app speaks for a language: immediate action + each step. */
function collectSentences(language: Language): Map<string, string> {
  const sentences = new Map<string, string>(); // hash -> text
  for (const category of Object.values(EmergencyCategory)) {
    const protocol = getFirstAidProtocol(category, language);
    for (const text of [protocol.immediateAction, ...protocol.steps.map(s => s.instruction)]) {
      const clean = normalizeSpeechText(text);
      if (clean) sentences.set(textHash(clean), clean);
    }
  }
  return sentences;
}

function loadManifest(): Manifest {
  if (existsSync(MANIFEST_PATH)) {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
  }
  return { version: 1, model: SARVAM_TTS_MODEL, pace: TTS_PACE, speakers: {}, files: {} };
}

function saveManifest(manifest: Manifest) {
  mkdirSync(AUDIO_DIR, { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

async function main() {
  const { langs, limit, dryRun } = parseArgs();
  const apiKey = loadApiKey();
  if (!apiKey && !dryRun) {
    console.error('SARVAM_API_KEY not found in .env or server/.env');
    process.exit(1);
  }

  const manifest = loadManifest();
  let generated = 0;
  let charsSpent = 0;

  for (const language of langs) {
    const sentences = collectSentences(language);
    const speaker = speakerFor(language);
    const langDir = path.join(AUDIO_DIR, language);

    // Voice settings changed → regenerate everything for this language
    const voiceChanged =
      manifest.speakers[language] !== undefined &&
      (manifest.speakers[language] !== speaker || manifest.model !== SARVAM_TTS_MODEL || manifest.pace !== TTS_PACE);
    const files = voiceChanged ? {} : { ...(manifest.files[language] ?? {}) };

    const missing = [...sentences].filter(([hash]) => !files[hash] || !existsSync(path.join(AUDIO_DIR, files[hash])));
    const missingChars = missing.reduce((n, [, text]) => n + text.length, 0);
    const estLow = ((missingChars / 10_000) * EST_COST_PER_10K_CHARS.low).toFixed(2);
    const estHigh = ((missingChars / 10_000) * EST_COST_PER_10K_CHARS.high).toFixed(2);

    console.log(
      `[${language}] ${sentences.size} sentences, ${missing.length} to generate ` +
        `(${missingChars} chars, est. ₹${estLow}–₹${estHigh}), speaker=${speaker}`
    );
    if (dryRun) continue;

    mkdirSync(langDir, { recursive: true });
    for (const [hash, text] of missing) {
      if (generated >= limit) break;
      const audio = await synthesizeSpeech(text, language, apiKey!);
      const rel = `${language}/${hash}.mp3`;
      writeFileSync(path.join(AUDIO_DIR, rel), audio);
      files[hash] = rel;
      generated++;
      charsSpent += text.length;
      console.log(`  ✓ ${rel}  (${text.length} chars) ${text.slice(0, 50)}${text.length > 50 ? '…' : ''}`);

      // Save as we go so an interrupted run loses nothing
      manifest.files[language] = files;
      manifest.speakers[language] = speaker;
      manifest.model = SARVAM_TTS_MODEL;
      manifest.pace = TTS_PACE;
      saveManifest(manifest);
    }

    // Remove clips for sentences that no longer exist (only after a full run)
    if (generated < limit) {
      for (const hash of Object.keys(files)) {
        if (!sentences.has(hash)) delete files[hash];
      }
      const keep = new Set(Object.values(files).map(rel => path.basename(rel)));
      if (existsSync(langDir)) {
        for (const file of readdirSync(langDir)) {
          if (file.endsWith('.mp3') && !keep.has(file)) {
            unlinkSync(path.join(langDir, file));
            console.log(`  − removed stale ${language}/${file}`);
          }
        }
      }
      manifest.files[language] = files;
      manifest.speakers[language] = speaker;
      manifest.model = SARVAM_TTS_MODEL;
      manifest.pace = TTS_PACE;
      saveManifest(manifest);
    }
  }

  if (!dryRun) {
    const low = ((charsSpent / 10_000) * EST_COST_PER_10K_CHARS.low).toFixed(2);
    const high = ((charsSpent / 10_000) * EST_COST_PER_10K_CHARS.high).toFixed(2);
    console.log(`Done: ${generated} clips, ${charsSpent} chars (est. ₹${low}–₹${high}).`);
  }
}

main().catch(err => {
  console.error('Audio generation failed:', (err as Error).message);
  process.exit(1);
});
