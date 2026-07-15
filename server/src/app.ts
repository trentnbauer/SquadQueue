import Fastify from 'fastify';
import cors from '@fastify/cors';
import sessionPlugin from './plugins/session.js';
import authPlugin from './plugins/auth.js';
import staticPlugin from './plugins/static.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import gameRoutes from './routes/games.js';
import { env } from './config/env.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: env.APP_BASE_URL, credentials: true });
  await app.register(sessionPlugin);
  await app.register(authPlugin);

  await app.register(authRoutes);
  await app.register(roomRoutes);
  await app.register(gameRoutes);

  if (process.env.NODE_ENV === 'production') {
    await app.register(staticPlugin);
  }

  return app;
}
