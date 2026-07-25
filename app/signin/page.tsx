import { Button } from "@/components/ui/button";

import { sendMagicLink } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-email": "That doesn't look like a valid email address.",
  "send-failed": "Couldn't send the sign-in link. Please try again.",
  "rate-limited":
    "Too many requests — wait a minute, then request one new link (and use the newest email).",
  "auth-failed":
    "That sign-in link is invalid or expired — request a fresh one and click only the newest email.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-md border border-line bg-surface p-8">
        <h1 className="font-display text-2xl font-medium text-ink">
          Sign in to Sarmaya
        </h1>
        <p className="mt-1 mb-6 text-sm text-ink-muted">
          No password — we email you a one-time link.
        </p>

        {sent ? (
          <p className="rounded-sm bg-brand-soft px-3 py-2 text-sm text-brand">
            Check your email — we sent you a sign-in link. You can close this
            tab.
          </p>
        ) : (
          <form action={sendMagicLink} className="flex flex-col gap-3">
            <label className="sr-only" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-sm border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
            />
            <Button type="submit">Email me a sign-in link</Button>
            {error ? (
              <p className="text-sm text-neg" role="alert">
                {ERROR_MESSAGES[error] ?? "Something went wrong. Try again."}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </main>
  );
}
