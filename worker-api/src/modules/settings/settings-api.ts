import { Hono } from 'hono'
import { NotificationSettingsSchema } from '@bea-uptime/contracts'
import type { AppBindings } from '@/env'
import { authRequired } from '@/middlewares/auth-required'
import { getSettings, updateSettings } from './settings-repository'
import { jsonSuccess } from '@/lib/response'

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
