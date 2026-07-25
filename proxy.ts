import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next 16 proxy convention: refresh the auth session and guard private
// routes on every matched request.
export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Everything except static assets and machine endpoints (/api/health for
  // uptime monitors, /api/cron guarded by CRON_SECRET).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/health|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
