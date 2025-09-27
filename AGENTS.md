# Aquarius AI Chatbot – Agent Guidelines

- Use pnpm for dependency management and scripts (`pnpm dev`, `pnpm lint`, `pnpm test`).
- Prefer TypeScript App Router conventions: server routes in `app/**/route.ts`, client components marked with `"use client"`.
- Database interactions go through Drizzle helpers in `lib/db/queries.ts`; avoid raw SQL.
- Chat flows rely on `components/chat.tsx` and `app/(chat)/api/chat/route.ts`; keep message shapes aligned with `lib/types.ts`.
- Authentication/session helpers live under `app/(auth)` and `lib/auth`; reuse them rather than recreating auth logic.
- For streaming and UI data, leverage providers in `components/data-stream-provider.tsx` and message utilities in `components/data-stream-handler.tsx`.
- When adding background jobs, secure cron endpoints with the `CRON_SECRET` bearer check and schedule jobs in `vercel.json`.
- Analytics are handled with `@vercel/analytics`; render the `<Analytics />` component in `app/layout.tsx` and avoid duplicating telemetry setups.
- Keep documentation for AI collaborators in `.github/copilot-instructions.md` in sync with architectural changes.
- This project integrates with Vercel’s Computer-Using Agent (CUA) workflows; ensure automated agents follow the existing patterns for streaming, auth, and deployment configuration.
