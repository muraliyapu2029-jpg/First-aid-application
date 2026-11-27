import { Router, Request, Response } from 'express';

const router = Router();

// ============================================================
// Emergency API Routes
// Skeleton for future server-side integrations:
// - API key proxying (Gemini)
// - Ambulance dispatch APIs
// - Hospital database queries
// - Emergency logging / analytics
// ============================================================

/**
 * POST /api/emergency/detect
 * Server-side emergency detection using Gemini API
 * Proxies the API key so it is never exposed to the frontend
 */
router.post('/detect', async (req: Request, res: Response) => {
  const { text } = req.body as { text?: string; language?: string };

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI detection not configured',
      message: 'Set GEMINI_API_KEY environment variable to enable AI detection',
    });
  }

  try {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `Classify this emergency description into one category. Description: "${text}". Respond ONLY with valid JSON: {"category": "<category>", "confidence": <0.0-1.0>}. Categories: snakebite, heart_attack, stroke, unconsciousness, road_accident, heavy_bleeding, burns, electric_shock, choking, breathing_difficulty, seizure, fainting, unknown`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI response');
    const parsed = JSON.parse(jsonMatch[0]);

    return res.json({
      category: parsed.category,
      confidence: parsed.confidence,
      source: 'ai-enhanced',
      rawText: text,
    });
  } catch (err: unknown) {
    console.error('AI detection error:', err);
    return res.status(500).json({ error: 'AI detection failed', fallback: 'rule-based' });
  }
});

/**
 * GET /api/emergency/protocols
 * Returns all available emergency protocol categories
 * (Protocols are stored in frontend — this is for future server-side use)
 */
router.get('/protocols', (_req: Request, res: Response) => {
  const categories = [
    'snakebite', 'heart_attack', 'stroke', 'unconsciousness', 'road_accident',
    'heavy_bleeding', 'burns', 'electric_shock', 'choking', 'breathing_difficulty',
    'seizure', 'fainting', 'unknown',
  ];
  res.json({ categories, count: categories.length });
});

/**
 * POST /api/emergency/log
 * Log emergency events for analytics (privacy-preserving — no PII)
 */
router.post('/log', (req: Request, res: Response) => {
  const { category, language, timestamp } = req.body as {
    category?: string;
    language?: string;
    timestamp?: string;
  };
  // TODO: Store to database when backend DB is configured
  console.log('Emergency log:', { category, language, timestamp });
  res.json({ status: 'logged' });
});

export default router;
