# Cron Job Configuration

Keep Aquarius deployable on every Vercel plan while still running background automation when you need it.

## Quick Start Checklist
- [ ] Confirm how many Vercel cron slots your team is already using (`vercel projects list` → `cronJobsUsed`).
- [ ] Decide whether Aquarius should consume one of the two Hobby cron slots or rely on an external scheduler.
- [ ] Set the `CRON_SECRET` environment variable in every environment that can call `/api/cron`.
- [ ] Document the chosen scheduler in your runbook so on-call engineers know where jobs originate.

## Deployment Options

### ✅ Option 1: Keep the repository defaults (no scheduled cron)
- Aquarius ships with an empty `crons` array in [`vercel.json`](../vercel.json).
- Deployments succeed on all plans because no additional cron slot is consumed.
- Trigger maintenance manually (`vercel env pull`, curl, etc.) or wire an external scheduler when ready.

```jsonc
{
  "crons": []
}
```

### ✅ Option 2: Consolidate tasks behind a single Vercel cron
- Copy [`vercel.cron.example.json`](../vercel.cron.example.json) to `vercel.json` in your fork.
- Update the schedule to the cadence you need and redeploy.
- Route all recurring maintenance through `/api/cron` so you stay within one scheduled job.

```jsonc
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 * * * *"
    }
  ]
}
```

### ✅ Option 3: Use an external scheduler
- Call `https://<your-domain>/api/cron` from GitHub Actions, cron-job.org, or your platform of choice.
- Always pass `Authorization: Bearer $CRON_SECRET`.
- External schedulers let you keep Vercel under the plan limit while still running recurring work.

## Validation Checklist
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron` returns `{ "ok": true }`.
- [ ] Observability dashboards or alerts confirm the cron task ran at the expected cadence.
- [ ] Runbooks reference how to rotate `CRON_SECRET` and what to monitor for failures.

Following these checklists keeps Aquarius deployable on the Hobby plan while leaving a clear path to scale maintenance workloads as your startup grows.
