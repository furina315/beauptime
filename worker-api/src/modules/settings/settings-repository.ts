import type { NotificationSettings } from '@bea-uptime/contracts'

export const getSettings = async (db: D1Database): Promise<NotificationSettings> => {
  const result = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>()
  const settings: Record<string, string> = {}
  
  if (result.results) {
    for (const row of result.results) {
      settings[row.key] = row.value
    }
  }

  return {
    smtpHost: settings.smtpHost || '',
    smtpPort: settings.smtpPort || '',
    smtpUser: settings.smtpUser || '',
    smtpPass: settings.smtpPass || '',
    smtpFrom: settings.smtpFrom || '',
    telegramBotToken: settings.telegramBotToken || '',
    telegramChatId: settings.telegramChatId || '',
    alertTemplateDown: settings.alertTemplateDown || '',
    alertTemplateUp: settings.alertTemplateUp || '',
    siteTitle: settings.siteTitle || '',
    siteLogo: settings.siteLogo || '',
    metaTitle: settings.metaTitle || '',
    metaIcon: settings.metaIcon || '',
    footerText: settings.footerText || '',
    tgTemplateDown: settings.tgTemplateDown || '',
    tgTemplateUp: settings.tgTemplateUp || '',
  }
}

export const updateSettings = async (db: D1Database, input: NotificationSettings): Promise<void> => {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
  
  const entries = [
    ['smtpHost', input.smtpHost || ''],
    ['smtpPort', input.smtpPort || ''],
    ['smtpUser', input.smtpUser || ''],
    ['smtpPass', input.smtpPass || ''],
    ['smtpFrom', input.smtpFrom || ''],
    ['telegramBotToken', input.telegramBotToken || ''],
    ['telegramChatId', input.telegramChatId || ''],
    ['alertTemplateDown', input.alertTemplateDown || ''],
    ['alertTemplateUp', input.alertTemplateUp || ''],
    ['siteTitle', input.siteTitle || ''],
    ['siteLogo', input.siteLogo || ''],
    ['metaTitle', input.metaTitle || ''],
    ['metaIcon', input.metaIcon || ''],
    ['footerText', input.footerText || ''],
    ['tgTemplateDown', input.tgTemplateDown || ''],
    ['tgTemplateUp', input.tgTemplateUp || '']
  ]
  
  const stmts = entries.map(([k, v]) => stmt.bind(k, v))
  await db.batch(stmts)
}
