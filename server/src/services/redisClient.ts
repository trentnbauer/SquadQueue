import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redis = new Redis(env.REDIS_URL);

// ioredis logs an unhandled rejection warning if nothing listens for 'error' —
// this just routes connection issues to stderr as a plain log line instead.
redis.on('error', (err) => {
  console.error('[redis]', err.message);
});
