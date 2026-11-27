import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import emergencyRoutes from './routes/emergency';
import sarvamRoutes from './routes/sarvam';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000']
    : '*',
}));

// Keep multipart raw for /api/sarvam/stt while parsing JSON elsewhere
app.use((req, res, next) => {
  if (req.path === '/api/sarvam/stt') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'RakshaAI Backend', timestamp: new Date().toISOString() });
});

app.use('/api/emergency', emergencyRoutes);
app.use('/api/sarvam', sarvamRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`RakshaAI backend running on http://localhost:${PORT}`);
  console.log(`Sarvam AI: ${process.env.SARVAM_API_KEY ? 'Enabled' : 'Disabled (no API key)'}`);
});

export default app;
