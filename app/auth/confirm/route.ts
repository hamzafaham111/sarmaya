import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

// Completes magic-link sign-in; supports both Supabase link styles
// (token_hash template and PKCE ?code=).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) redirect(next);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  redirect("/signin?error=auth-failed");
}
