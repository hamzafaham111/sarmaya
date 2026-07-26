import * as Sentry from "@sentry/nextjs";

// Server/edge Sentry init, inlined (Turbopack dev cannot resolve dynamic
// imports of root-level config files). No-op when SENTRY_DSN is unset.
export async function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: Boolean(process.env.SENTRY_DSN),
    tracesSampleRate: 0, // errors only — stay well inside the free tier
  });
}
