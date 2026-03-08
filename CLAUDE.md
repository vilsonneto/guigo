# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (from root)
npm run dev:bot          # Bot with hot reload (tsx watch)
npm run dev:admin        # Next.js admin on port 3000
npm run build            # Build all packages via Turbo
npm run lint             # Type-check all packages
```

There are no test scripts configured yet. When added, use Vitest (same as tributos-br).

## Architecture

**Monorepo** using npm workspaces + Turborepo:

- `packages/shared` (`@guigo/shared`) — Core business logic: envelope calculation (`calcularLivre`), input validation (`validarEnvio`), TypeScript types. Consumed by both bot and admin.
- `apps/bot` (`@guigo/bot`) — Node.js process with cron jobs (21h daily earnings question, Sunday 20h weekly summary). Communicates via Evolution API (self-hosted WhatsApp bridge). **Still scaffolding — no webhook/HTTP server yet.**
- `apps/admin` (`@guigo/admin`) — Next.js 15 / React 19 dashboard for monitoring and corrections. Currently placeholder.
- `supabase/` — PostgreSQL schema (`migrations/`) and seed data. Tables: `obrigacoes`, `dias`, `envelopes`, `mensagens`, `admin_log`.

**Data flow:** Father reports earnings via WhatsApp → Bot receives via Evolution API → `calcularLivre()` computes daily breakdown → saves to Supabase → responds with available amount.

**Key business logic:** `calcularLivre(receitaBruta, obrigacoes[], gasolinaDiaria)` subtracts fixed gasoline estimate (R$120/day), then reserves each obligation's daily quota, returning the remainder as "livre" (free to spend).

## Financial Reference (post-June/2026)

These numbers are the source of truth. All docs, seed data, and code must be consistent with them.

- Daily cost: R$225 (obligations total)
- Free money: R$25/day (R$370 revenue - R$120 gas - R$225 obligations)
- Rounding rule: always round UP ("errar no mais" — better to over-reserve)
- Validation: suspicious if < R$200 or > R$600

## Code Conventions

- **Language:** All variable names, comments, and user-facing text are in Portuguese (Brazilian).
- **Commits:** `tipo(escopo): descrição em português` — ex: `feat(bot): adicionar webhook Evolution API`. **No** `Co-Authored-By`.
- **ESM throughout:** All packages use `type: "module"`. Import paths use `.js` extensions.
- **TypeScript strict mode**, target ES2022, moduleResolution "bundler".
- **Shared package:** Imported as `@guigo/shared` via workspace resolution. Next.js transpiles it via `transpilePackages` in `next.config.ts`.

## Infrastructure

- **Database:** Supabase (PostgreSQL free tier) with auto-exposed REST API.
- **WhatsApp:** Evolution API (self-hosted bridge), not official WhatsApp Business API.
- **Env vars:** Bot uses `SUPABASE_*` and `EVOLUTION_*` prefixes. Admin uses `NEXT_PUBLIC_SUPABASE_*`. See `.env.example`.
- **Deploy:** Bot + Evolution API on Railway (free tier). Admin on Vercel (free tier). Total cost: R$0/month.

## Docs

Product and technical docs live in `docs/`. These are the source of truth for business rules:
- `docs/produto.md` — what the system does and why
- `docs/plano-tecnico.md` — architecture, SQL schema, bot flow
- `docs/plano-fases.md` — phases 0-3 with timeline
