import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import emergencyRoutes from './routes/emergency';
import voiceRoutes from './routes/voice';

// Load env vars for local dev: server/.env first, then the project-root .env.
// In Docker, env vars come from docker-compose instead.
for (const envFile of ['.env', '../.env']) {
  try {
    process.loadEnvFile(envFile);
    break;
  } catch {
    // file not present — try the next one
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000']
    : '*',
}));
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'RakshaAI Backend', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/emergency', emergencyRoutes);
app.use('/api/voice', voiceRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'audio_too_large' });
    return;
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RakshaAI backend running on http://localhost:${PORT}`);
  console.log(`Cloud STT: ${process.env.SARVAM_API_KEY ? 'Enabled (Sarvam)' : 'Disabled (no SARVAM_API_KEY)'}`);
  console.log(`AI Detection: ${process.env.GEMINI_API_KEY ? 'Enabled (Gemini)' : 'Disabled (no API key)'}`);
});

export default app;
