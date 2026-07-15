<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const loading = ref(false)
const saving = ref(false)
const statusMessage = ref('')
const errorMessage = ref('')

const form = ref({
  appriseUrl: '',
  smtpHost: '',
  smtpPort: '',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  alertTemplateDown: '',
  alertTemplateUp: ''
})

const currentTheme = ref('light')

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/settings')
    const json = await res.json()
    if (json.success) {
      form.value = {
        appriseUrl: json.data.appriseUrl || '',
        smtpHost: json.data.smtpHost || '',
        smtpPort: json.data.smtpPort || '',
        smtpUser: json.data.smtpUser || '',
        smtpPass: json.data.smtpPass || '',
        smtpFrom: json.data.smtpFrom || '',
        alertTemplateDown: json.data.alertTemplateDown || '',
        alertTemplateUp: json.data.alertTemplateUp || ''
      }
    }
  } catch (err) {
    errorMessage.value = 'Failed to load settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  statusMessage.value = ''
  errorMessage.value = ''
  try {
    const res = await fetch('/api/v1/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const json = await res.json()
    if (json.success) {
      statusMessage.value = 'Settings saved successfully'
      form.value = {
        appriseUrl: json.data.appriseUrl || '',
        smtpHost: json.data.smtpHost || '',
        smtpPort: json.data.smtpPort || '',
        smtpUser: json.data.smtpUser || '',
        smtpPass: json.data.smtpPass || '',
        smtpFrom: json.data.smtpFrom || '',
        alertTemplateDown: json.data.alertTemplateDown || '',
        alertTemplateUp: json.data.alertTemplateUp || ''
      }
    } else {
      errorMessage.value = json.error?.message || 'Failed to save settings'
    }
  } catch (err) {
    errorMessage.value = 'Network error'
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
        <h2>Message Templates (HTML)</h2>
        <p class="form-help" style="margin-bottom: 16px;">
          Available variables: <code v-pre>{{service_name}}</code>, <code v-pre>{{time}}</code>, <code v-pre>{{target}}</code>, <code v-pre>{{status}}</code>, <code v-pre>{{reason}}</code> (reason is only available when DOWN).
        </p>
        
        <div class="template-split">
          <div class="template-editor">
            <div class="form-group">
              <label>Down Alert Template (HTML)</label>
              <textarea v-model="form.alertTemplateDown" class="base-input html-editor" placeholder="<b>{{service_name}}</b> is DOWN..."></textarea>
            </div>
            <div class="preview-panel">
              <label>Live Preview</label>
              <div class="preview-box" v-html="renderPreview(form.alertTemplateDown, 'DOWN')"></div>
            </div>
          </div>

          <div class="template-editor">
            <div class="form-group">
              <label>Recovery Alert Template (HTML)</label>
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
        <h2>Apprise Integration</h2>
        <div class="form-group">
          <label>Apprise URL</label>
          <input type="url" v-model="form.appriseUrl" placeholder="http://apprise-server:8000/notify/apprise" class="base-input" />
          <p class="form-help">Leave blank to disable. Used to send notifications via Apprise.</p>
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
          <input type="number" v-model="form.smtpPort" placeholder="587" class="base-input" />
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
