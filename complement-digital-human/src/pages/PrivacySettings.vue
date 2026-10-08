<template>
  <div class="privacy-container">
    <div class="header">
      <button class="back-btn" @click="router.push('/settings')">← 返回</button>
      <h1 class="page-title">隐私设置</h1>
      <div class="spacer"></div>
    </div>

    <div class="privacy-section">
      <p class="section-title">数据存储模式</p>
      <p class="section-desc">选择你的数据存储方式</p>

      <div class="storage-options">
        <div
          class="storage-option"
          :class="{ active: settings.storageMode === 'local' }"
          @click="setStorageMode('local')"
        >
          <div class="option-header">
            <span class="option-icon">💾</span>
            <span class="option-title">本地存储</span>
            <div class="option-check" v-if="settings.storageMode === 'local'">✓</div>
          </div>
          <p class="option-desc">数据仅保存在你的设备中，不会上传到服务器</p>
          <div class="option-badge high">最高隐私</div>
        </div>

        <div
          class="storage-option"
          :class="{ active: settings.storageMode === 'cloud' }"
          @click="setStorageMode('cloud')"
        >
          <div class="option-header">
            <span class="option-icon">☁️</span>
            <span class="option-title">云端加密存储</span>
            <div class="option-check" v-if="settings.storageMode === 'cloud'">✓</div>
          </div>
          <p class="option-desc">数据加密后保存在服务器，支持多设备同步</p>
          <div class="option-badge">便捷同步</div>
        </div>

        <div
          class="storage-option"
          :class="{ active: settings.storageMode === 'hybrid' }"
          @click="setStorageMode('hybrid')"
        >
          <div class="option-header">
            <span class="option-icon">🔄</span>
            <span class="option-title">混合模式</span>
            <div class="option-check" v-if="settings.storageMode === 'hybrid'">✓</div>
          </div>
          <p class="option-desc">基础数据本地，偏好设置云端</p>
          <div class="option-badge">平衡之选</div>
        </div>
      </div>
    </div>

    <div class="privacy-section">
      <p class="section-title">数据使用</p>

      <div class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-title">保存对话历史</span>
          <span class="toggle-desc">用于人格学习和对话延续</span>
        </div>
        <input
          type="checkbox"
          :checked="settings.storeConversationHistory"
          @change="updateSetting('storeConversationHistory', $event.target.checked)"
        />
      </div>

      <div class="toggle-item">
        <div class="toggle-info">
          <span class="toggle-title">允许人格学习</span>
          <span class="toggle-desc">从对话中分析你的偏好和特点</span>
        </div>
        <input
          type="checkbox"
          :checked="settings.allowPersonalityLearning"
          @change="updateSetting('allowPersonalityLearning', $event.target.checked)"
        />
      </div>
    </div>

    <div class="privacy-section">
      <p class="section-title">数据保留</p>

      <div class="retention-selector">
        <span class="selector-label">自动删除超过以下时间的对话</span>
        <select
          :value="retentionIndex"
          @change="handleRetentionChange"
        >
          <option v-for="(opt, idx) in retentionOptions" :key="idx" :value="idx">{{ opt }}</option>
        </select>
      </div>
    </div>

    <div class="info-card">
      <span class="info-icon">🔒</span>
      <p class="info-title">你的数据由你掌控</p>
      <p class="info-text">
        我们严格保护你的隐私。所有数据处理都遵循最小化原则，
        不会用于任何第三方营销或广告推荐。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, type PrivacySettings } from '../stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const settings = ref<PrivacySettings>({
  storageMode: 'local',
  storeConversationHistory: true,
  allowPersonalityLearning: true,
  dataRetentionDays: 365,
})

const retentionOptions = [
  '30天',
  '90天',
  '180天',
  '365天',
  '永久保留',
]

const retentionDaysMap = [30, 90, 180, 365, 9999]

const retentionIndex = computed(() => {
  const idx = retentionDaysMap.indexOf(settings.value.dataRetentionDays)
  return idx !== -1 ? idx : 3
})

onMounted(() => {
  settingsStore.loadFromStorage()
  settings.value = { ...settingsStore.privacySettings }
})

function setStorageMode(mode: PrivacySettings['storageMode']) {
  settings.value.storageMode = mode
  settingsStore.updatePrivacySettings({ storageMode: mode })
}

function updateSetting(key: keyof PrivacySettings, value: any) {
  (settings.value as any)[key] = value
  settingsStore.updatePrivacySettings({ [key]: value })
}

function handleRetentionChange(e: any) {
  const idx = parseInt(e.target.value)
  const days = retentionDaysMap[idx]
  settings.value.dataRetentionDays = days
  settingsStore.updatePrivacySettings({ dataRetentionDays: days })
}
</script>

<style scoped>
.privacy-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  font-size: 18px;
  color: #666666;
  background: none;
  border: none;
  padding: 10px;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #333333;
}

.spacer {
  width: 40px;
}

.privacy-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: #999999;
  margin-bottom: 24px;
}

.storage-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-option {
  background: #f5f5f5;
  border-radius: 16px;
  padding: 20px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.storage-option.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.option-icon {
  font-size: 32px;
  margin-right: 12px;
}

.option-title {
  flex: 1;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}

.option-check {
  width: 28px;
  height: 28px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
}

.option-desc {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.option-badge {
  display: inline-block;
  background: #e0e0e0;
  color: #666666;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
}

.option-badge.high {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.toggle-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.toggle-info {
  flex: 1;
}

.toggle-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.toggle-desc {
  display: block;
  font-size: 14px;
  color: #999999;
}

.toggle-item input[type="checkbox"] {
  width: 24px;
  height: 24px;
}

.retention-selector {
  padding: 8px 0;
}

.selector-label {
  display: block;
  font-size: 14px;
  color: #999999;
  margin-bottom: 12px;
}

.retention-selector select {
  width: 100%;
  height: 48px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  border: none;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-top: 20px;
}

.info-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.info-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.info-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}
</style>
