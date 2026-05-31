<template>
  <view class="privacy-container">
    <view class="privacy-section">
      <text class="section-title">数据存储模式</text>
      <text class="section-desc">选择你的数据存储方式</text>

      <view class="storage-options">
        <view
          class="storage-option"
          :class="{ active: currentMode === 'local' }"
          @click="setStorageMode('local')"
        >
          <view class="option-header">
            <text class="option-icon">💾</text>
            <text class="option-title">本地存储</text>
            <view class="option-check" v-if="currentMode === 'local'">✓</view>
          </view>
          <text class="option-desc">数据仅保存在你的设备中，不会上传到服务器</text>
          <view class="option-badge high">最高隐私</view>
        </view>

        <view
          class="storage-option"
          :class="{ active: currentMode === 'cloud' }"
          @click="setStorageMode('cloud')"
        >
          <view class="option-header">
            <text class="option-icon">☁️</text>
            <text class="option-title">云端加密存储</text>
            <view class="option-check" v-if="currentMode === 'cloud'">✓</view>
          </view>
          <text class="option-desc">数据加密后保存在服务器，支持多设备同步</text>
          <view class="option-badge">便捷同步</view>
        </view>

        <view
          class="storage-option"
          :class="{ active: currentMode === 'hybrid' }"
          @click="setStorageMode('hybrid')"
        >
          <view class="option-header">
            <text class="option-icon">🔄</text>
            <text class="option-title">混合模式</text>
            <view class="option-check" v-if="currentMode === 'hybrid'">✓</view>
          </view>
          <text class="option-desc">基础数据本地，偏好设置云端</text>
          <view class="option-badge">平衡之选</view>
        </view>
      </view>
    </view>

    <view class="privacy-section">
      <text class="section-title">数据使用</text>

      <view class="toggle-item">
        <view class="toggle-info">
          <text class="toggle-title">保存对话历史</text>
          <text class="toggle-desc">用于人格学习和对话延续</text>
        </view>
        <switch
          :checked="settings.storeConversationHistory"
          @change="(e: any) => updateSetting('storeConversationHistory', e.detail.value)"
          activeColor="#667eea"
        />
      </view>

      <view class="toggle-item">
        <view class="toggle-info">
          <text class="toggle-title">允许人格学习</text>
          <text class="toggle-desc">从对话中分析你的偏好和特点</text>
        </view>
        <switch
          :checked="settings.allowPersonalityLearning"
          @change="(e: any) => updateSetting('allowPersonalityLearning', e.detail.value)"
          activeColor="#667eea"
        />
      </view>
    </view>

    <view class="privacy-section">
      <text class="section-title">数据保留</text>

      <view class="retention-selector">
        <text class="selector-label">自动删除超过以下时间的对话</text>
        <picker
          mode="selector"
          :range="retentionOptions"
          :value="retentionIndex"
          @change="handleRetentionChange"
        >
          <view class="picker-display">
            <text>{{ retentionOptions[retentionIndex] }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="info-card">
      <text class="info-icon">🔒</text>
      <text class="info-title">你的数据由你掌控</text>
      <text class="info-text">
        我们严格保护你的隐私。所有数据处理都遵循最小化原则，
        不会用于任何第三方营销或广告推荐。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore, type PrivacySettings } from '@/stores/settings'

const settingsStore = useSettingsStore()

const settings = ref<PrivacySettings>({
  storageMode: 'local',
  storeConversationHistory: true,
  allowPersonalityLearning: true,
  dataRetentionDays: 365,
})

const currentMode = computed(() => settings.value.storageMode)

const retentionOptions = [
  '30天',
  '90天',
  '180天',
  '365天',
  '永久保留',
]

const retentionIndex = computed(() => {
  const map: Record<number, number> = {
    30: 0,
    90: 1,
    180: 2,
    365: 3,
    9999: 4,
  }
  return map[settings.value.dataRetentionDays] ?? 3
})

onMounted(() => {
  settingsStore.loadFromStorage()
  settings.value = { ...settingsStore.privacySettings }
})

function setStorageMode(mode: 'local' | 'cloud' | 'hybrid') {
  settings.value.storageMode = mode
  settingsStore.updatePrivacySettings({ storageMode: mode })
}

function updateSetting(key: keyof PrivacySettings, value: any) {
  (settings.value as any)[key] = value
  settingsStore.updatePrivacySettings({ [key]: value })
}

function handleRetentionChange(e: any) {
  const daysMap = [30, 90, 180, 365, 9999]
  const days = daysMap[e.detail.value]
  settings.value.dataRetentionDays = days
  settingsStore.updatePrivacySettings({ dataRetentionDays: days })
}
</script>

<style lang="scss" scoped>
.privacy-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 30rpx;
}

.privacy-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.section-desc {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.storage-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.storage-option {
  background: #f5f5f5;
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid transparent;
  
  &.active {
    background: rgba(102, 126, 234, 0.1);
    border-color: #667eea;
  }
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.option-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.option-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.option-check {
  width: 40rpx;
  height: 40rpx;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
}

.option-desc {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.option-badge {
  display: inline-block;
  background: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  color: #999999;
  
  &.high {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f0f0f0;
  }
}

.toggle-info {
  flex: 1;
  margin-right: 20rpx;
}

.toggle-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 6rpx;
}

.toggle-desc {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.retention-selector {
  padding: 20rpx 0;
}

.selector-label {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 24rpx 30rpx;
  border-radius: 16rpx;
  
  text {
    font-size: 28rpx;
    color: #333333;
  }
}

.picker-arrow {
  font-size: 36rpx;
  color: #999999;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  text-align: center;
}

.info-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.info-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.info-text {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}
</style>
