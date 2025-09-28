# Edge Runtime Authentication Hardening

Ensure password flows remain fast, secure, and Edge-compatible for both guest and credentialed sign-ins.

## Technical Analysis
- `bcrypt-ts` relied on Node-only APIs (`process.nextTick`, `setImmediate`), blocking Edge deployments.
- The Edge runtime forbids Node-specific primitives (e.g., `setImmediate`, `process.nextTick`), so hashing must rely on browser-safe modules.
- Dummy credential hashes were regenerated per request, wasting CPU and risking inconsistent test results.
- Configuration lacked a documented way to tune bcrypt cost factors across environments.

## Implementation Highlights
- Runtime-aware loader selects `@node-rs/bcrypt` on Node runtimes and falls back to the pure-JS `bcryptjs` implementation on Edge to avoid unsupported WASI APIs.
- A cached dummy password hash is generated once per instance, keeping credential timing behaviour consistent.
- Input validation ensures non-empty password payloads before hashing or verification.
- `BCRYPT_COST` environment variable (optional) centralises cost-factor tuning with safe defaults and bounds.

```ts
import { hashPassword, verifyPassword } from "@/lib/security/bcrypt";

const hashed = await hashPassword("sup3r-secret-passphrase");
const isValid = await verifyPassword("sup3r-secret-passphrase", hashed);
```

## Rollout Checklist
- [ ] Run `pnpm install` to ensure `@node-rs/bcrypt` and `bcryptjs` are available locally and in CI caches.
- [ ] Set `BCRYPT_COST` (integer between 4 and 31) if a higher work factor is required for production.
- [ ] Redeploy to Vercel Edge runtime and confirm `/api/auth/*` routes complete successfully.
- [ ] Exercise guest and password sign-ins in staging (Playwright or manual smoke test).

## Monitoring & Recovery Checklist
- [ ] Track authentication latency in APM dashboards to catch misconfigured cost factors.
- [ ] Alert on repeated `bad_request:auth` responses from `/api/auth/*` to detect hashing failures.
- [ ] Document the remediation path (rollback or adjust `BCRYPT_COST`) in the on-call playbook.

## Startup Advantages
- Edge-safe hashing keeps cold starts low while retaining strong password security.
- Centralised configuration and documentation make onboarding new engineers easier.
- Cached dummy hashes avoid redundant work, improving throughput under load.
- Checklists above provide a repeatable operational runbook that scales with the team.
