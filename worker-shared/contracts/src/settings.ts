import { z } from 'zod'

export const NotificationSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpFrom: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  alertTemplateDown: z.string().optional(),
  alertTemplateUp: z.string().optional(),
  siteTitle: z.string().optional(),
  siteLogo: z.string().optional(),
  metaTitle: z.string().optional(),
  metaIcon: z.string().optional(),
  footerText: z.string().optional(),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
