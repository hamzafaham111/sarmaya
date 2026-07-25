import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { createClient } from "@/lib/supabase/server";

import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already guards these routes; this is defense in depth.
  if (!user) redirect("/signin");

  return (
    <AppShell userEmail={user.email} signOut={signOut}>
      {children}
    </AppShell>
  );
}
