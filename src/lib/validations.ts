import { z } from 'zod'

export const OptInSchema = z.object({
  email: z.string().email(),
  source: z.enum(['TIKTOK', 'INSTAGRAM', 'DISCORD', 'ORGANIC', 'OTHER']),
  channel: z.string().min(1),
})

export type OptInInput = z.infer<typeof OptInSchema>
