import { prisma } from './client.js';

/** Prisma's schema DSL has no CHECK constraint support, and this project uses `db push` (no
 * migration history) rather than Migrate, so there's no natural place to hang raw SQL DDL -
 * this runs it directly at boot instead. Idempotent (checks pg_constraint first) so it's safe
 * to run on every startup. Only defense-in-depth: the API layer already validates 1-5 on every
 * write, this just protects against anything that writes to the table directly.
 *
 * Wrapped in try/catch and only logged, not thrown - a constraint that fails to apply (e.g.
 * because pre-existing data already violates it) shouldn't block the whole app from starting. */
export async function ensureDbConstraints(logger: { warn: (msg: string) => void }): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'votes_value_range') THEN
          ALTER TABLE votes ADD CONSTRAINT votes_value_range CHECK (value >= 1 AND value <= 5);
        END IF;
      END $$;
    `);
  } catch (err) {
    logger.warn(
      `Could not ensure votes.value CHECK constraint (non-fatal, API-layer validation still applies): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
