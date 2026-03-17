import 'server-only'

const KIT_API_BASE = 'https://api.kit.com/v4'

/**
 * Add a subscriber to Kit and trigger the lead nurture sequence.
 * Tags the subscriber with `source_{source}` for attribution tracking.
 * Throws on network/API failure — callers must catch and handle.
 */
export async function addSubscriberToKit({
  email,
  source,
}: {
  email: string
  source: string
}): Promise<void> {
  const KIT_API_KEY = process.env.KIT_API_KEY
  if (!KIT_API_KEY) {
    throw new Error('KIT_API_KEY environment variable is not set')
  }

  // Step 1: Create or update subscriber
  const subscriberRes = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': KIT_API_KEY,
    },
    body: JSON.stringify({ email_address: email }),
  })

  if (!subscriberRes.ok) {
    const body = await subscriberRes.text()
    throw new Error(`Kit subscriber creation failed: ${subscriberRes.status} ${body}`)
  }

  const subscriberData = await subscriberRes.json()
  const subscriberId: number = subscriberData.subscriber?.id

  if (!subscriberId) {
    throw new Error('Kit API response missing subscriber.id')
  }

  // Step 2: Add to lead nurture sequence
  const sequenceId = process.env.KIT_LEAD_SEQUENCE_ID
  if (!sequenceId) {
    throw new Error('KIT_LEAD_SEQUENCE_ID environment variable is not set')
  }
  const sequenceRes = await fetch(
    `${KIT_API_BASE}/sequences/${sequenceId}/subscribers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': KIT_API_KEY,
      },
      body: JSON.stringify({ subscriber_id: subscriberId }),
    }
  )

  if (!sequenceRes.ok) {
    const body = await sequenceRes.text()
    throw new Error(`Kit sequence subscription failed: ${sequenceRes.status} ${body}`)
  }

  // Step 3: Tag with source
  const tagName = `source_${source.toLowerCase()}`
  const tagRes = await fetch(`${KIT_API_BASE}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': KIT_API_KEY,
    },
    body: JSON.stringify({ name: tagName }),
  })

  if (tagRes.ok) {
    const tagData = await tagRes.json()
    const tagId: number = tagData.tag?.id
    if (tagId) {
      await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': KIT_API_KEY,
        },
        body: JSON.stringify({ subscriber_id: subscriberId }),
      })
    }
  }
  // Tag failures are non-fatal — subscriber and sequence are more important
}
