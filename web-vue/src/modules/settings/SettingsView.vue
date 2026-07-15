<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { requestJson } from '@/lib/http'

const loading = ref(false)
const saving = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const form = ref({
  telegramBotToken: '',
  telegramChatId: '',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  alertTemplateDown: '',
  alertTemplateUp: '',
  siteTitle: '',
  siteLogo: '',
  metaTitle: '',
  metaIcon: '',
  footerText: '',
  tgTemplateDown: '',
  tgTemplateUp: ''
})

const currentTheme = ref('light')

// Test states
const testingTelegram = ref(false)
const testingSmtp = ref(false)
const testTelegramMessage = ref('')
const testSmtpMessage = ref('')
const testTelegramError = ref('')
const testSmtpError = ref('')

const fetchSettings = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await requestJson<any>('/api/v1/settings', 'Failed to load settings')
    form.value = {
      telegramBotToken: data.telegramBotToken || '',
      telegramChatId: data.telegramChatId || '',
      smtpHost: data.smtpHost || '',
      smtpPort: data.smtpPort ? String(data.smtpPort) : '',
      smtpUser: data.smtpUser || '',
      smtpPass: data.smtpPass || '',
      smtpFrom: data.smtpFrom || '',
      alertTemplateDown: data.alertTemplateDown || '',
      alertTemplateUp: data.alertTemplateUp || '',
      siteTitle: data.siteTitle || '',
      siteLogo: data.siteLogo || '',
      metaTitle: data.metaTitle || '',
      metaIcon: data.metaIcon || '',
      footerText: data.footerText || '',
      tgTemplateDown: data.tgTemplateDown || '',
      tgTemplateUp: data.tgTemplateUp || ''
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  statusMessage.value = ''
  errorMessage.value = ''
  try {
    const data = await requestJson<any>('/api/v1/settings', 'Failed to save settings', {
      method: 'PUT',
      body: JSON.stringify(form.value)
    })
    statusMessage.value = 'Settings saved successfully'
    form.value = {
      telegramBotToken: data.telegramBotToken || '',
      telegramChatId: data.telegramChatId || '',
      smtpHost: data.smtpHost || '',
      smtpPort: data.smtpPort ? String(data.smtpPort) : '',
      smtpUser: data.smtpUser || '',
      smtpPass: data.smtpPass || '',
      smtpFrom: data.smtpFrom || '',
      alertTemplateDown: data.alertTemplateDown || '',
      alertTemplateUp: data.alertTemplateUp || '',
      siteTitle: data.siteTitle || '',
      siteLogo: data.siteLogo || '',
      metaTitle: data.metaTitle || '',
      metaIcon: data.metaIcon || '',
      footerText: data.footerText || '',
      tgTemplateDown: data.tgTemplateDown || '',
      tgTemplateUp: data.tgTemplateUp || ''
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Network error'
  } finally {
    saving.value = false
  }
}

const applyTheme = (theme: string) => {
  currentTheme.value = theme
  document.documentElement.dataset.theme = theme
  localStorage.setItem('bea-uptime-theme', theme)
}

const onThemeChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  applyTheme(target.value)
}

const renderPreview = (template: string, status: 'DOWN' | 'UP') => {
  if (!template) {
    return '<em>(Default text format will be used)</em>'
  }
  let result = template
  const vars: Record<string, string> = {
    service_name: 'My Website',
    time: new Date().toISOString(),
    target: 'https://example.com',
    status: status,
    reason: status === 'DOWN' ? 'Connection timeout' : ''
  }
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
  }
  return result
}

const renderTextPreview = (template: string, status: 'DOWN' | 'UP') => {
  if (!template) {
    return '(Default text format will be used)'
  }
  let result = template
  const vars: Record<string, string> = {
    service_name: 'My Website',
    time: new Date().toISOString(),
    target: 'https://example.com',
    status: status,
    reason: status === 'DOWN' ? 'Connection timeout' : ''
  }
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

const testTelegram = async () => {
  testingTelegram.value = true
  testTelegramMessage.value = ''
  testTelegramError.value = ''
  try {
    // Render the test text locally to send via testing endpoint
    let testText = ''
    if (form.value.tgTemplateDown) {
      testText = renderTextPreview(form.value.tgTemplateDown, 'DOWN')
    } else {
      testText = 'This is a test notification from your BeaUptime monitor!'
    }

    await requestJson<any>('/api/v1/settings/test-telegram', 'Failed to send test notification', {
      method: 'POST',
      body: JSON.stringify({
        telegramBotToken: form.value.telegramBotToken,
        telegramChatId: form.value.telegramChatId,
      })
    })
    testTelegramMessage.value = 'Test notification sent successfully!'
  } catch (err) {
    testTelegramError.value = err instanceof Error ? err.message : 'Failed to send test notification.'
  } finally {
    testingTelegram.value = false
  }
}

const testSmtp = async () => {
  testingSmtp.value = true
  testSmtpMessage.value = ''
  testSmtpError.value = ''
  try {
    await requestJson<any>('/api/v1/settings/test-smtp', 'Failed to send test email', {
      method: 'POST',
      body: JSON.stringify({
        smtpHost: form.value.smtpHost,
        smtpPort: form.value.smtpPort,
        smtpUser: form.value.smtpUser,
        smtpPass: form.value.smtpPass,
        smtpFrom: form.value.smtpFrom,
      })
    })
    testSmtpMessage.value = 'Test email sent successfully!'
  } catch (err) {
    testSmtpError.value = err instanceof Error ? err.message : 'Failed to send test email.'
  } finally {
    testingSmtp.value = false
  }
}

onMounted(() => {
  fetchSettings()
  currentTheme.value = document.documentElement.dataset.theme || localStorage.getItem('bea-uptime-theme') || 'light'
})
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <h1 class="panel-title">Settings</h1>
    </div>

    <div v-if="loading" class="state-message">Loading settings...</div>

    <form v-else @submit.prevent="saveSettings" class="settings-form">
      
      <div class="form-section">
        <h2>Appearance</h2>
        <div class="form-group">
          <label>Global Theme (Day/Night Mode)</label>
          <select :value="currentTheme" @change="onThemeChange" class="base-input">
            <option value="light">Day Mode (Light)</option>
            <option value="dark">Night Mode (Dark)</option>
          </select>
          <p class="form-help">Sets the visual theme for your browser across the dashboard and status page.</p>
        </div>
      </div>

      <div class="form-section">
        <h2>Custom Branding</h2>
        <div class="form-group">
          <label>Site Title</label>
          <input type="text" v-model="form.siteTitle" placeholder="BeaUptime" class="base-input" />
          <p class="form-help">The main name displayed in the header of the public status page.</p>
        </div>
        <div class="form-group">
          <label>Site Logo</label>
          <input type="text" v-model="form.siteLogo" placeholder="🌸 or https://example.com/logo.png" class="base-input full-width" />
          <p class="form-help">Supports a URL link to an image or a single Emoji.</p>
        </div>
        <div class="form-group">
          <label>Browser Page Title (SEO)</label>
          <input type="text" v-model="form.metaTitle" placeholder="BeaUptime | Uptime Status" class="base-input full-width" />
          <p class="form-help">The title tag used for search engines and browser tabs.</p>
        </div>
        <div class="form-group">
          <label>Browser Favicon</label>
          <input type="text" v-model="form.metaIcon" placeholder="🚀 or https://example.com/favicon.png" class="base-input full-width" />
          <p class="form-help">Supports a URL link to a favicon file or a single Emoji.</p>
        </div>
        <div class="form-group">
          <label>Custom Footer (HTML)</label>
          <textarea v-model="form.footerText" placeholder="&lt;p&gt;Copyright &amp;copy; 2026 My Brand&lt;/p&gt;" class="base-input html-editor"></textarea>
          <p class="form-help">Custom HTML content for the footer. Leave blank to show default branding.</p>
        </div>
      </div>

      <div class="form-section">
        <h2>Email Message Templates (HTML)</h2>
        <p class="form-help" style="margin-bottom: 16px;">
          Available variables: <code v-pre>{{service_name}}</code>, <code v-pre>{{time}}</code>, <code v-pre>{{target}}</code>, <code v-pre>{{status}}</code>, <code v-pre>{{reason}}</code> (reason is only available when DOWN).
        </p>
        
        <div class="template-split">
          <div class="template-editor">
            <div class="form-group">
              <label>Email Down Alert Template (HTML)</label>
              <textarea v-model="form.alertTemplateDown" class="base-input html-editor" placeholder="<b>{{service_name}}</b> is DOWN..."></textarea>
            </div>
            <div class="preview-panel">
              <label>Live Preview</label>
              <div class="preview-box" v-html="renderPreview(form.alertTemplateDown, 'DOWN')"></div>
            </div>
          </div>

          <div class="template-editor">
            <div class="form-group">
              <label>Email Recovery Alert Template (HTML)</label>
              <textarea v-model="form.alertTemplateUp" class="base-input html-editor" placeholder="<b>{{service_name}}</b> is UP..."></textarea>
            </div>
            <div class="preview-panel">
              <label>Live Preview</label>
              <div class="preview-box" v-html="renderPreview(form.alertTemplateUp, 'UP')"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Telegram Bot Integration</h2>
        <div class="form-group">
          <label>Telegram Bot Token</label>
          <input type="text" v-model="form.telegramBotToken" placeholder="123456789:ABCdefGhIJKlmNo..." class="base-input full-width" />
        </div>
        <div class="form-group">
          <label>Telegram Chat ID</label>
          <input type="text" v-model="form.telegramChatId" placeholder="-100123456789 or 123456789" class="base-input" />
        </div>

        <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 15px; font-weight: 600;">Telegram Message Templates (Plain Text)</h3>
        <p class="form-help" style="margin-bottom: 16px;">
          Available variables: <code v-pre>{{service_name}}</code>, <code v-pre>{{time}}</code>, <code v-pre>{{target}}</code>, <code v-pre>{{status}}</code>, <code v-pre>{{reason}}</code> (reason is only available when DOWN).
        </p>

        <div class="template-split">
          <div class="template-editor">
            <div class="form-group">
              <label>Telegram Down Alert Template (Plain Text)</label>
              <textarea v-model="form.tgTemplateDown" class="base-input html-editor" placeholder="🚨 {{service_name}} is OFFLINE!&#10;Reason: {{reason}}&#10;Time: {{time}}"></textarea>
            </div>
            <div class="preview-panel">
              <label>Live Preview</label>
              <div class="preview-box pre-wrap" style="white-space: pre-wrap;">{{ renderTextPreview(form.tgTemplateDown, 'DOWN') }}</div>
            </div>
          </div>

          <div class="template-editor">
            <div class="form-group">
              <label>Telegram Recovery Alert Template (Plain Text)</label>
              <textarea v-model="form.tgTemplateUp" class="base-input html-editor" placeholder="✅ {{service_name}} is ONLINE!&#10;Time: {{time}}"></textarea>
            </div>
            <div class="preview-panel">
              <label>Live Preview</label>
              <div class="preview-box pre-wrap" style="white-space: pre-wrap;">{{ renderTextPreview(form.tgTemplateUp, 'UP') }}</div>
            </div>
          </div>
        </div>

        <div class="test-action-row">
          <BaseButton type="button" variant="secondary" :disabled="testingTelegram" @click="testTelegram">
            {{ testingTelegram ? 'Testing...' : 'Test Telegram Connection' }}
          </BaseButton>
          <span v-if="testTelegramMessage" class="status-success">{{ testTelegramMessage }}</span>
          <span v-if="testTelegramError" class="status-error">{{ testTelegramError }}</span>
        </div>
      </div>

      <div class="form-section">
        <h2>SMTP Configuration</h2>
        <div class="form-group">
          <label>SMTP Host</label>
          <input type="text" v-model="form.smtpHost" placeholder="smtp.example.com" class="base-input" />
        </div>
        <div class="form-group">
          <label>SMTP Port</label>
          <input type="text" v-model="form.smtpPort" placeholder="587" class="base-input" />
        </div>
        <div class="form-group">
          <label>SMTP Username</label>
          <input type="text" v-model="form.smtpUser" class="base-input" />
        </div>
        <div class="form-group">
          <label>SMTP Password</label>
          <input type="password" v-model="form.smtpPass" class="base-input" />
        </div>
        <div class="form-group">
          <label>From Email Address</label>
          <input type="email" v-model="form.smtpFrom" placeholder="alerts@example.com" class="base-input" />
        </div>
        <div class="test-action-row">
          <BaseButton type="button" variant="secondary" :disabled="testingSmtp" @click="testSmtp">
            {{ testingSmtp ? 'Testing...' : 'Test SMTP Connection' }}
          </BaseButton>
          <span v-if="testSmtpMessage" class="status-success">{{ testSmtpMessage }}</span>
          <span v-if="testSmtpError" class="status-error">{{ testSmtpError }}</span>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton type="submit" variant="primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </BaseButton>
        <span v-if="statusMessage" class="status-success">{{ statusMessage }}</span>
        <span v-if="errorMessage" class="status-error">{{ errorMessage }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 24px;
}
.panel-header {
  margin-bottom: 24px;
}
.panel-title {
  font-size: 20px;
  font-weight: 600;
}
.form-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
.form-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 14px;
}
.base-input {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--surface-muted);
  color: var(--text);
}
.base-input.full-width {
  max-width: 600px;
}
.base-input:focus {
  outline: none;
  border-color: var(--brand);
}
select.base-input {
  cursor: pointer;
}
.html-editor {
  max-width: 100%;
  min-height: 120px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
}
.form-help {
  font-size: 13px;
  color: var(--text-soft);
  margin-top: 6px;
}
.telegram-note {
  background: rgba(0, 136, 204, 0.1);
  border-left: 3px solid #0088cc;
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  color: var(--text-soft);
}
.template-split {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.template-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: flex-start;
}
.preview-panel label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--text-soft);
}
.preview-box {
  border: 1px dashed var(--border-strong);
  border-radius: 6px;
  padding: 16px;
  min-height: 120px;
  background: var(--page-bg);
  overflow-y: auto;
  font-size: 14px;
}
.test-action-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
}
@media (max-width: 768px) {
  .template-editor {
    grid-template-columns: 1fr;
  }
}
.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.status-success {
  color: var(--success);
  font-size: 14px;
}
.status-error {
  color: var(--danger);
  font-size: 14px;
}
.state-message {
  color: var(--text-soft);
}
code {
  background: var(--surface-muted);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
