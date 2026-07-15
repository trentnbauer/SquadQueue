import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Loads the repo-root .env for local dev. In Docker, real env vars are already
// set by compose, and dotenv silently no-ops when it finds no file to load.
config({ path: path.resolve(__dirname, '../../.env') });

await import('./index.js');
