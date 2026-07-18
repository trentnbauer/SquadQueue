import { Writable } from 'node:stream';

// Enough recent history to be useful for troubleshooting (issue #192) without holding an
// unbounded amount of memory - Fastify/pino write one JSON line per request/log call, so a few
// thousand lines covers a good while of activity on a self-hosted, low-traffic instance.
const MAX_LINES = 5000;

const lines: string[] = [];

/** Fed as Fastify's pino `stream` option (see app.ts) - a duplicate of every log line pino would
 * otherwise only send to stdout, kept in memory so an admin can export it without needing shell/
 * Docker access to the running container. Still writes through to stdout so `docker logs` keeps
 * working exactly as before. */
export const logCaptureStream = new Writable({
  write(chunk: Buffer, _encoding, callback) {
    lines.push(chunk.toString());
    if (lines.length > MAX_LINES) lines.shift();
    process.stdout.write(chunk);
    callback();
  },
});

export function getRecentLogLines(): string[] {
  return [...lines];
}
