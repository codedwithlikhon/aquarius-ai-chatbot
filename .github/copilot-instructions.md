# Aquarius AI Copilot Onboarding

## Architecture & Routing
- Next.js App Router drives the UX: `app/(chat)/page.tsx` gates guest auth then renders `<Chat />` plus `<DataStreamHandler />`.
- `components/chat.tsx` wraps `useChat` with a `DefaultChatTransport` that injects `selectedChatModel` and visibility into `/api/chat` payloads.
- `app/(chat)/api/chat/route.ts` orchestrates streams via `streamText`, TokenLens usage merge, resumable contexts (`createStreamId`, `getStreamContext`), and registered tools.
- Message shapes must align with `lib/types.ts` and `convertToUIMessages`/`generateUUID` in `lib/utils.ts`; update both sides together.
- History endpoints (`app/(chat)/api/history`, `components/sidebar-history.tsx`) rely on cursor params `starting_after`/`ending_before`; preserve pagination helpers.

## Streaming & Artifacts
- UI streaming flows through `components/data-stream-provider.tsx` and `DataStreamHandler`, which expect `data-*` deltas to manage artifact metadata and completion state.
- Artifact tool calls (`createDocument`, `updateDocument`, `requestSuggestions`, `getWeather`) are defined in `lib/ai/tools/*` and wired in the chat route; reuse schemas + `documentHandlersByArtifactKind` for persistence.
- Artifact persistence and suggestion storage go through `lib/artifacts/server.ts` and `lib/db/queries.ts` (`saveDocument`, `saveSuggestions`); avoid bypassing these helpers.
- Resumable playback depends on Redis (`REDIS_URL`) but the route already degrades gracefully—mirror the existing guard when extending.
- `lib/ai/prompts.ts` controls system messaging (artifacts guidance, geo hints); keep prompt edits in sync with token usage tracking.

## Persistence & Auth
- Drizzle schema lives in `lib/db/schema.ts`; every write/read should use the typed helpers in `lib/db/queries.ts` so `ChatSDKError` handling stays consistent.
- `app/(auth)/auth.ts` layers two Credentials providers (guest + password) and augments the session token with `user.type`; reuse this when adding auth flows.
- `middleware.ts` auto-enrolls guests via `/api/auth/guest` and blocks authenticated users from `/login` or `/register`; new routes must respect these redirects.
- Entitlements and rate limits derive from `lib/ai/entitlements.ts` + `getMessageCountByUserId`; consult them before exposing new message surfaces.
- Document APIs (`app/(chat)/api/document`, `/api/suggestions`) enforce ownership; ensure any new mutations keep the same authorization pattern.

## Ops, Testing & Tooling
- Package scripts use pnpm: `pnpm dev`, `pnpm build` (runs `tsx lib/db/migrate` requiring `POSTGRES_URL`), `pnpm lint` (`npx ultracite check`), and `pnpm test` (Playwright with `PLAYWRIGHT=True`).
- Tests under `tests/` spin up mocked providers via `lib/ai/models.mock.ts` when `isTestEnvironment` is true; extend mocks instead of hitting live gateways.
- Cron automation lives at `app/api/cron/route.ts` secured with `CRON_SECRET` and is scheduled through `vercel.json` (`/api/cron`); keep auth checks intact.
- Deployment metadata: `microfrontends.json` configures the Vercel group and `app/layout.tsx` must continue rendering `<Analytics />` for @vercel/analytics.
- Observability hooks (`instrumentation.ts`, `@vercel/otel`) assume the service name `ai-chatbot`; reuse tracing setup for new spans/logs.

## Automation & Safety
- Follow `docs/computer-use-guide.md` for Computer-Using Agent loops (sandboxing, screenshot feedback, safety acknowledgements) whenever updating automation flows.
- Model catalog + usage: `lib/ai/providers.ts` routes through Vercel AI Gateway and TokenLens caching; register new model IDs there and in `lib/ai/models.ts`.
- Error responses should always throw/return `ChatSDKError` so `fetchWithErrorHandlers` and toast messaging behave; avoid naked `Response.json` for failures.
- Sidebar/chat clients assume optimistic SWR invalidation via `unstable_serialize(getChatHistoryPaginationKey)` and `updateChatVisibility`; keep these mutation hooks wired.
- Suggestions streaming emits `data-suggestion` events that `DataStreamHandler` forwards to artifact UIs; preserve event names when expanding metadata.
- Middleware-friendly `/ping` endpoint is required for Playwright bootstrapping—leave it untouched when adjusting middleware matchers.
