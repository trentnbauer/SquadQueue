#!/bin/sh
set -e

# Syncs Postgres to match schema.prisma. Using `db push` rather than migrations for M1 —
# no migration history yet, and this applies the schema directly without hand-written SQL.
npx prisma db push --schema src/db/prisma/schema.prisma --skip-generate --accept-data-loss

exec node dist/bootstrap.js
