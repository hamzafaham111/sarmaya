import * as Sentry from "@sentry/nextjs";

// Client-side Sentry; DSNs are public identifiers, so the browser uses the
// NEXT_PUBLIC_ variant. No-op when unset.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
