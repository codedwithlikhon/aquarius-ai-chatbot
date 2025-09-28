# Cron Job Configuration

Aquarius ships with an optional `/api/cron` endpoint that performs background maintenance when triggered with the `CRON_SECRET` bearer token. Deployments on the Vercel Hobby plan are limited to two scheduled cron jobs per team. Attempting to deploy this project with the cron configuration enabled will fail if your team already uses both slots.

## Deployment Options

Use one of the following strategies to stay within Vercel's cron limits:

1. **Keep the repo defaults (no scheduled cron)**
   - The checked-in [`vercel.json`](../vercel.json) file intentionally ships with an empty `crons` array.
   - Aquarius will deploy without scheduling a new cron job, so you avoid plan limit failures.
   - You can still invoke `/api/cron` manually or via an external scheduler when maintenance needs to run.

2. **Schedule a single consolidated cron job on Vercel**
   - Copy [`vercel.cron.example.json`](../vercel.cron.example.json) to `vercel.json` in your fork.
   - Update the `schedule` to the cadence you need and redeploy.
   - Ensure you have a `CRON_SECRET` environment variable configured so the scheduled request is authorized.
   - If you already run multiple maintenance tasks, route them all through `/api/cron` to stay within the single scheduled job.

3. **Use an external scheduler**
   - Trigger `https://<your-domain>/api/cron` from GitHub Actions, cron-job.org, or any preferred scheduler.
   - Pass `Authorization: Bearer $CRON_SECRET` in the request headers.
   - External schedulers let you keep Vercel within plan limits while still running recurring maintenance.

## Recommended Workflow

1. Decide whether Vercel should manage the cron or if an external service is preferred.
2. Set the `CRON_SECRET` environment variable in your deployment.
3. If you opt into Vercel scheduling, update `vercel.json` before running `vercel deploy`.
4. Verify the `/api/cron` endpoint responds with `{ "ok": true }` when called with the correct secret.

Following these steps keeps Aquarius deployable on the Hobby plan while providing a clear path to enable scheduled maintenance when you have capacity.
