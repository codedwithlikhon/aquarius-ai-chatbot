import { ChatSDKError } from "@/lib/errors";

export function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!expectedSecret) {
    return new ChatSDKError(
      "bad_request:api",
      "CRON_SECRET must be configured before scheduling cron jobs."
    ).toResponse();
  }

  if (authorization !== `Bearer ${expectedSecret}`) {
    return new ChatSDKError("unauthorized:api").toResponse();
  }

  return Response.json({ ok: true });
}
