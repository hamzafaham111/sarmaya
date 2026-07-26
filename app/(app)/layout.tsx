import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { signOut } from "./actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // The proxy already guards these routes; this is defense in depth.
  if (!user) redirect("/signin");

  return (
    <AppShell userEmail={user.email} signOut={signOut}>
      {children}
    </AppShell>
  );
}
