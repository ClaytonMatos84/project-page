import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? '0.0.0.0';

const app = createApp();

const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : PORT;
  console.log(`[uol-api] listening on http://localhost:${port} (contract v1)`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`[uol-api] ${signal} received, shutting down`);
    server.close(() => process.exit(0));
  });
}
