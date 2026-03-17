import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/server/db/prisma'
import { OptInSchema } from '@/lib/validations'
import { addSubscriberToKit } from '@/lib/kit'

// In-memory rate limiter: { normalizedEmail → timestamps[] }
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(email: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimitMap.get(email) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  )
  if (timestamps.length >= RATE_LIMIT_MAX) return true
  if (timestamps.length === 0 && rateLimitMap.has(email)) {
    rateLimitMap.delete(email)
  }
  rateLimitMap.set(email, [...timestamps, now])
  return false
}

export async function POST(req: Request) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.json(
        { error: 'VALIDATION_ERROR', fields: ['body'] },
        { status: 400 }
      )
    }

    // Validate
    const parsed = OptInSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'VALIDATION_ERROR',
          fields: parsed.error.issues.map((i) => i.path.join('.')),
        },
        { status: 400 }
      )
    }

    const { email: rawEmail, source, channel } = parsed.data
    const email = rawEmail.toLowerCase().trim()

    // Rate limit (keyed on normalized email)
    if (isRateLimited(email)) {
      return Response.json({ error: 'TOO_MANY_REQUESTS' }, { status: 429 })
    }

    // Persist consent record
    await prisma.optIn.create({
      data: {
        email,
        source,           // OptInSource enum value — Prisma validates at DB level
        channel,
        consent_status: 'active',
      },
    })

    // Kit integration — fire-and-forget, never fail the user on Kit errors
    try {
      await addSubscriberToKit({ email, source })
    } catch (kitError) {
      Sentry.captureException(kitError, {
        extra: { email: '[redacted]', source },
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    Sentry.captureException(error)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
