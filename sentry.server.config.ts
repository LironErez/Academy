import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  // IMPORTANT: Never include raw email addresses in Sentry contexts.
  // Use buyerId or anonymized identifiers only.
})
