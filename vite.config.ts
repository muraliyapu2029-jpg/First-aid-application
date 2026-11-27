import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

const SARVAM_BASE = 'https://api.sarvam.ai';

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function sarvamProxyPlugin(envKey: string): Plugin {
  return {
    name: 'sarvam-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url || !req.url.startsWith('/api/sarvam/')) {
          next();
          return;
        }

        const headerKey = typeof req.headers['x-sarvam-key'] === 'string'
          ? req.headers['x-sarvam-key'].trim()
          : '';
        const apiKey = headerKey || envKey;

        if (req.url === '/api/sarvam/status' && req.method === 'GET') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ configured: Boolean(apiKey) }));
          return;
        }

        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Sarvam API key not configured' }));
          return;
        }

        const targetMap: Record<string, string> = {
          '/api/sarvam/stt': `${SARVAM_BASE}/speech-to-text`,
          '/api/sarvam/tts': `${SARVAM_BASE}/text-to-speech`,
          '/api/sarvam/chat': `${SARVAM_BASE}/v1/chat/completions`,
          '/api/sarvam/text-lid': `${SARVAM_BASE}/text-lid`,
        };

        const targetUrl = targetMap[req.url];
        if (!targetUrl || req.method !== 'POST') {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Unknown Sarvam route' }));
          return;
        }

        try {
          const bodyBuffer = await readRawBody(req);
          const forwardHeaders: Record<string, string> = {
            'api-subscription-key': apiKey,
          };
          if (typeof req.headers['content-type'] === 'string') {
            forwardHeaders['Content-Type'] = req.headers['content-type'];
          }

          const upstream = await fetch(targetUrl, {
            method: 'POST',
            headers: forwardHeaders,
            body: new Uint8Array(bodyBuffer),
            signal: AbortSignal.timeout(25000),
          });

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(text);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Sarvam proxy error' }));
        }
      });
    },
  };
}

// Overpass proxy middleware — avoids browser CORS + rate-limit issues
function overpassProxyPlugin(): Plugin {
  const OVERPASS_TARGETS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
  ];

  return {
    name: 'overpass-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url || !req.url.startsWith('/api/overpass')) {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const bodyBuffer = await readRawBody(req);
          let lastError: Error | null = null;

          for (const target of OVERPASS_TARGETS) {
            try {
              const upstream = await fetch(target, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new Uint8Array(bodyBuffer),
                signal: AbortSignal.timeout(20000),
              });
              const text = await upstream.text();
              res.statusCode = upstream.status;
              res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(text);
              return;
            } catch (err) {
              lastError = err instanceof Error ? err : new Error('Overpass unreachable');
            }
          }

          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: lastError?.message ?? 'All Overpass endpoints failed' }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Overpass proxy error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const sarvamKey = (env.SARVAM_API_KEY || env.VITE_SARVAM_API_KEY || '').trim();

  return {
    plugins: [react(), sarvamProxyPlugin(sarvamKey), overpassProxyPlugin()],
    server: {
      port: 5173,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
