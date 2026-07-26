import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The terminal is private: everything requires auth except these.
const PUBLIC_PREFIXES = ["/signin", "/auth", "/styleguide"];

/**
 * Headers carrying the identity this middleware has ALREADY verified with
 * the auth server, so the render doesn't pay for a second round trip.
 *
 * Safe because the middleware runs on every matched request and always
 * writes both headers — deleting them first means a client cannot inject
 * its own. Anything not matched by the proxy falls back to a real
 * getUser() call (see current-user.ts).
 */
export const VERIFIED_USER_ID = "x-sarmaya-user-id";
export const VERIFIED_USER_EMAIL = "x-sarmaya-user-email";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // No code between client creation and getUser() (Supabase SSR guidance).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Strip first, then set — an inbound header of the same name must never
  // survive into the render.
  const headers = new Headers(request.headers);
  headers.delete(VERIFIED_USER_ID);
  headers.delete(VERIFIED_USER_EMAIL);
  if (user) {
    headers.set(VERIFIED_USER_ID, user.id);
    if (user.email) {
      headers.set(VERIFIED_USER_EMAIL, encodeURIComponent(user.email));
    }
  }

  const response = NextResponse.next({ request: { headers } });
  // Carry over any refreshed auth cookies Supabase just set.
  for (const cookie of supabaseResponse.cookies.getAll()) {
    response.cookies.set(cookie);
  }
  return response;
}
