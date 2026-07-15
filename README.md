# SquadQueue

A self-hosted game backlog and voting system for a friend group — a private "Personal Shelf" plus shared "Communal Rooms," real pricing from gg.deals, and a 5-emoji voting scale. See `mission statement.md` for the full product spec.

This is Milestone 1: a working vertical slice (auth, game intake with real pricing, rooms, voting) meant to run locally and be iterated on.

## Stack

Node/TypeScript monorepo — Fastify API, React (Vite) frontend, PostgreSQL via Prisma, Redis for caching/sessions. `packages/shared` holds types shared between server and web.

## Prerequisites

- Node.js 20+ and npm
- Docker Desktop (for Postgres + Redis locally, and for the production image)
- A free [gg.deals API key](https://gg.deals/api/) (account settings → API) — used for live Steam pricing
- A free IGDB app via [Twitch developer console](https://dev.twitch.tv/console/apps) (Category: "Application Integration") — used for game search/identity
- Optionally, an OIDC provider (Authelia, Keycloak, Authentik, Google, etc.) — or use the local dev bypass below while you build

## First-time setup

```sh
cp .env.example .env
# edit .env: set GGDEALS_API_KEY, IGDB_CLIENT_ID and IGDB_CLIENT_SECRET at minimum. Leave
# DEV_FAKE_AUTH=true and the OIDC_* vars blank to sign in as a hardcoded dev user until
# you've set up a real OIDC provider.

npm install

# start Postgres + Redis in Docker
docker compose --env-file .env --project-directory . -f docker/docker-compose.yml up -d

# create the database schema
npm run db:push

# start the API (port 3000) and the Vite dev server (port 5173) together
npm run dev
```

Open http://localhost:5173. With `DEV_FAKE_AUTH=true` you're signed in automatically as a dev user — no OIDC provider needed yet.

Useful commands:
- `npm run db:studio` — opens Prisma Studio, a GUI to browse/edit the database directly.
- `npm run build` — production build of all three packages (used by the Docker image too).

## Setting up a real OIDC provider

Once you're ready to move off the dev bypass, register SquadQueue as an OIDC client with your provider and fill in `.env`:

```
OIDC_ISSUER_URL=https://your-provider.example.com
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
OIDC_REDIRECT_URI=http://localhost:3000/auth/callback   # or your real domain in production
DEV_FAKE_AUTH=false
```

The redirect URI must exactly match what you register with the provider.

## Production deployment (Docker)

```sh
docker compose --env-file .env --project-directory . -f docker/docker-compose.prod.yml up -d --build
```

This builds and runs a single `server` container (serving both the API and the built frontend) alongside Postgres and Redis, all wired from the same `.env`. On first boot the container runs `prisma db push` automatically to create the schema.

## Backups

Postgres and Redis data are bind-mounted to `./data/postgres` and `./data/redis` (override the root with `DATA_DIR` in `.env`). Point Borg, or any backup tool, at that `data/` directory.

## What's in Milestone 1 (and what isn't)

See the "Explicitly OUT of scope for Milestone 1" section of the implementation plan for the full list. Notably: no comment/discussion feature (voting only, by design), no real-time push (the UI refetches after actions), and console-platform games (Xbox/PlayStation/Switch) show metadata but no live price or gg.deals link — gg.deals' price API only covers Steam.

Game search/identity (title, cover art, platforms, Steam App ID) comes from IGDB; live pricing and the gg.deals purchase link come from gg.deals' official Prices API once a Steam App ID is known. Nothing scrapes gg.deals' website directly.
