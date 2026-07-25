"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const parsed = z.email().safeParse(formData.get("email"));
  if (!parsed.success) {
    redirect("/signin?error=invalid-email");
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm?next=/` },
  });

  if (error) {
    console.error("signInWithOtp failed:", error.status, error.message);
    const rateLimited =
      error.status === 429 || /seconds|rate/i.test(error.message);
    redirect(`/signin?error=${rateLimited ? "rate-limited" : "send-failed"}`);
  }
  redirect("/signin?sent=1");
}
