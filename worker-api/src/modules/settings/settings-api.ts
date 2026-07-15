import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { NotificationSettingsSchema } from '@bea-uptime/contracts'
import type { AppBindings } from '@/env'
import { requireAuth } from '@/modules/auth/auth-middleware'
import { getSettings, updateSettings } from './settings-repository'
import { successResponse } from '@/lib/response'

export const settingsApi = new Hono<{ Bindings: AppBindings }>()

settingsApi.get('/', requireAuth(), async (c) => {
  const settings = await getSettings(c.env.DB)
  return c.json(successResponse(settings))
})

settingsApi.put('/', requireAuth(), zValidator('json', NotificationSettingsSchema), async (c) => {
  const input = c.req.valid('json')
  await updateSettings(c.env.DB, input)
  const settings = await getSettings(c.env.DB)
  return c.json(successResponse(settings))
})
