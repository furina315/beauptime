import { z } from 'zod'

export const NotificationSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFrom: z.string().optional(),
  appriseUrl: z.string().optional(),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
