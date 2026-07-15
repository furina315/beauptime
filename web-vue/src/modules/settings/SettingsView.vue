<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  smtpFrom: ''
})

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/v1/settings')
    const json = await res.json()
    if (json.ok) {
      form.value = json.data
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
    if (json.ok) {
      statusMessage.value = 'Settings saved successfully'
      form.value = json.data
    } else {
      errorMessage.value = json.error?.message || 'Failed to save settings'
    }
  } catch (err) {
    errorMessage.value = 'Network error'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <h1 class="panel-title">Notifications Settings</h1>
    </div>

    <div v-if="loading" class="state-message">Loading settings...</div>

    <form v-else @submit.prevent="saveSettings" class="settings-form">
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
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
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
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
}
.form-help {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.status-success {
  color: var(--color-success);
  font-size: 14px;
}
.status-error {
  color: var(--color-danger);
  font-size: 14px;
}
.state-message {
  color: var(--text-secondary);
}
</style>
