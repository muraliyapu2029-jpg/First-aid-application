import { EmergencyCategory, type EmergencyDetectionResult } from '../types';

// ============================================================
// AI Service — Gemini API Integration (OPTIONAL)
// Only active when VITE_GEMINI_API_KEY is configured.
// AI classifies the emergency type only — never generates protocols.
// ============================================================

const API_KEY = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : undefined;
const API_BASE_URL = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const VALID_CATEGORIES = Object.values(EmergencyCategory).filter(
  c => c !== EmergencyCategory.UNKNOWN
);

function buildPrompt(text: string): string {
  return `You are an emergency detection system. Your ONLY job is to classify the emergency type from the user's description.

User's emergency description: "${text}"

Respond with ONLY a valid JSON object in this exact format, nothing else:
{
  "category": "<one of the valid categories below>",
  "confidence": <number between 0.0 and 1.0>
}

Valid categories: ${VALID_CATEGORIES.join(', ')}

Rules:
- Pick the BEST matching category from the list above
- If none match well, use "unknown"
- confidence should reflect how certain you are (0.0 = not at all, 1.0 = very certain)
- Do NOT add any explanations or medical advice
- Respond ONLY with the JSON object`;
}

function isValidResult(category: unknown, confidence: unknown): category is EmergencyCategory {
  const num = Number(confidence);
  return (
    typeof category === 'string' &&
    Object.values(EmergencyCategory).includes(category as EmergencyCategory) &&
    !isNaN(num) &&
    num >= 0 &&
    num <= 1
  );
}

async function detectViaBackendProxy(text: string): Promise<EmergencyDetectionResult | null> {
  if (!API_BASE_URL) return null;

  try {
    const base = API_BASE_URL.replace(/\/+$/, '');
    const response = await fetch(`${base}/api/emergency/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!isValidResult(data?.category, data?.confidence)) return null;

    return {
      category: data.category,
      confidence: Number(data.confidence),
      rawText: text,
      source: 'ai-enhanced',
    };
  } catch {
    return null;
  }
}

export async function detectWithAI(text: string): Promise<EmergencyDetectionResult | null> {
  // Prefer backend proxy so the Gemini API key is never exposed in the browser
  const proxyResult = await detectViaBackendProxy(text);
  if (proxyResult) return proxyResult;

  if (!API_KEY || API_KEY === 'optional_your_key_here') {
    return null;
  }

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text) }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!isValidResult(parsed.category, parsed.confidence)) return null;

    return {
      category: parsed.category,
      confidence: Number(parsed.confidence),
      rawText: text,
      source: 'ai-enhanced',
    };
  } catch {
    return null;
  }
}

export function isAIEnabled(): boolean {
  return Boolean(API_BASE_URL || (API_KEY && API_KEY !== 'optional_your_key_here'));
}
