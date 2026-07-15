import { Hono } from 'hono'
import { NotificationSettingsSchema } from '@bea-uptime/contracts'
import type { AppBindings } from '@/env'
import { authRequired } from '@/middlewares/auth-required'
import { getSettings, updateSettings } from './settings-repository'
import { jsonSuccess, jsonError } from '@/lib/response'
import { getRuntimeConfig } from '@/lib/runtime-config'
import { sendTelegramAlert, sendSmtpAlert } from '@/modules/monitor/monitor-service'

export const settingsApi = new Hono<{ Bindings: AppBindings }>()

settingsApi.get('/', authRequired(), async (c) => {
  const settings = await getSettings(c.env.DB)
  return jsonSuccess(c, settings)
})

settingsApi.put('/', authRequired(), async (c) => {
  const input = NotificationSettingsSchema.parse(await c.req.json())
  await updateSettings(c.env.DB, input)
  const settings = await getSettings(c.env.DB)
  return jsonSuccess(c, settings)
})

settingsApi.post('/test-telegram', authRequired(), async (c) => {
  const body = await c.req.json()
  const { telegramBotToken, telegramChatId } = body
  if (!telegramBotToken || !telegramChatId) {
    return jsonError(c, 'missing_parameters', 'Telegram Bot Token and Chat ID are required.')
  }
  
  try {
    await sendTelegramAlert(
      telegramBotToken,
      telegramChatId,
      'BeaUptime Test Connection',
      'This is a <b>test notification</b> from your BeaUptime monitor!',
    )
    return jsonSuccess(c, { success: true })
  } catch (error) {
    return jsonError(c, 'telegram_error', error instanceof Error ? error.message : 'Unknown Telegram error')
  }
})

settingsApi.post('/test-smtp', authRequired(), async (c) => {
  const body = await c.req.json()
  const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = body
  if (!smtpHost || !smtpPort || !smtpFrom) {
    return jsonError(c, 'missing_parameters', 'SMTP Host, Port, and From address are required.')
  }
  
  const config = getRuntimeConfig(c.env)
  const toEmail = config.alertToEmail
  if (!toEmail) {
    return jsonError(c, 'missing_to_email', 'Recipient email (ALERT_TO_EMAIL) is not configured in environment variables.')
  }
  
  try {
    await sendSmtpAlert(
      {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser || '',
        pass: smtpPass || '',
        from: smtpFrom,
      },
      toEmail,
      'BeaUptime Test Connection',
      'This is a test email from your BeaUptime monitor!',
      'This is a <b>test email</b> from your BeaUptime monitor!',
    )
    return jsonSuccess(c, { success: true })
  } catch (error) {
    return jsonError(c, 'smtp_error', error instanceof Error ? error.message : 'Unknown SMTP error')
  }
})
