import { AppShell } from "@/components/shell/app-shell";
import { LearnNav } from "@/components/learn/learn-nav";
import { SECTIONS } from "@/lib/learn";
import { getCurrentUser } from "@/lib/supabase/current-user";

import { signOut } from "../(app)/actions";

// Learn sits outside the authed route group on purpose: it holds no user
// data, so it should be readable before you have an account. The shell is
// the same, and signs you in as normal if you already are.
export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell
      userEmail={user?.email ?? undefined}
      signOut={user ? signOut : undefined}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="lg:h-fit">
            <LearnNav sections={SECTIONS} />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </AppShell>
  );
}
