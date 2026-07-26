import { headers } from "next/headers";
import { cache } from "react";

import { VERIFIED_USER_EMAIL, VERIFIED_USER_ID } from "./middleware";
import { createClient } from "./server";

export interface AppUser {
  id: string;
  email: string | null;
}

/**
 * The signed-in user — at most one auth round trip per request, usually
 * none.
 *
 * `supabase.auth.getUser()` is a network call to the auth server (~400ms
 * from here). The proxy already makes that call on every request to guard
 * the route, so it forwards the verified id and email as request headers
 * and we read those. React's `cache` dedupes the fallback within a render
 * pass, since the layout and the page both need the user.
 *
 * The fallback matters: any path the proxy does not match gets a real,
 * verified lookup rather than trusting an absent header.
 */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const headerList = await headers();
  const verifiedId = headerList.get(VERIFIED_USER_ID);
  if (verifiedId) {
    const email = headerList.get(VERIFIED_USER_EMAIL);
    return { id: verifiedId, email: email ? decodeURIComponent(email) : null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
});
