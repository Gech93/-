<template>
  <view class="create-container">
    <view class="nav-bar">
      <view class="back-btn" @click="handleBack">← 返回</view>
      <text class="page-title">创建数字人</text>
      <view class="spacer"></view>
    </view>

    <view class="steps-indicator">
      <view class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <view class="step-number">1</view>
        <text class="step-text">选择类型</text>
      </view>
      <view class="step-line" :class="{ active: currentStep > 1 }"></view>
      <view class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <view class="step-number">2</view>
        <text class="step-text">命名</text>
      </view>
      <view class="step-line" :class="{ active: currentStep > 2 }"></view>
      <view class="step" :class="{ active: currentStep >= 3 }">
        <view class="step-number">3</view>
        <text class="step-text">完成</text>
      </view>
    </view>

    <!-- 步骤1：选择类型 -->
    <view class="step-content" v-if="currentStep === 1">
      <text class="step-title">选择人格类型</text>
      <text class="step-desc">为你的数字人选择一种角色定位</text>

      <view class="type-list">
        <view
          v-for="type in personaStore.suggestedNameList"
          :key="type.name"
          class="type-card"
          :class="{ selected: selectedType?.name === type.name }"
          @click="selectedType = type"
        >
          <text class="type-icon">{{ getTypeIcon(type.name) }}</text>
          <view class="type-info">
            <text class="type-name">{{ type.name }}</text>
            <text class="type-desc">{{ type.description }}</text>
          </view>
          <text class="type-check" v-if="selectedType?.name === type.name">✓</text>
        </view>
      </view>
    </view>

    <!-- 步骤2：命名 -->
    <view class="step-content" v-if="currentStep === 2">
      <text class="step-title">为你的数字人起个名字</text>
      <text class="step-desc">这个名字将显示在对话中</text>

      <view class="name-input-section">
        <input
          v-model="personaName"
          class="name-input"
          placeholder="输入名称"
          maxlength="10"
        />
        <view class="name-suggestions" v-if="suggestionList.length > 0">
          <text class="suggestions-label">或选择推荐名称：</text>
          <view class="suggestion-tags">
            <text
              v-for="name in suggestionList"
              :key="name"
              class="suggestion-tag"
              @click="personaName = name"
            >{{ name }}</text>
          </view>
        </view>
      </view>

      <view class="preview-card" v-if="personaName && personaStore.userMbti">
        <text class="preview-icon">{{ personaStore.userMbti.split('').reverse().join('') }}</text>
        <text class="preview-name">{{ personaName }}</text>
        <text class="preview-mbti">互补类型：{{ personaStore.userMbti.split('').reverse().join('') }}</text>
      </view>
    </view>

    <!-- 步骤3：完成 -->
    <view class="step-content" v-if="currentStep === 3">
      <text class="success-icon">🎉</text>
      <text class="success-title">{{ personaName }} 创建成功！</text>
      <text class="success-desc">你的互补数字人已经准备好了</text>

      <view class="complement-info">
        <view class="info-row">
          <text class="info-label">你的MBTI</text>
          <text class="info-value">{{ personaStore.userMbti }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">数字人MBTI</text>
          <text class="info-value highlight">{{ personaStore.userMbti?.split('').reverse().join('') }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">互补度</text>
          <text class="info-value">{{ selectedComplementLevel }}%</text>
        </view>
      </view>

      <view class="complement-slider">
        <text class="slider-label">调节互补度（每月限修改1次）</text>
        <slider
          :value="selectedComplementLevel"
          min="0"
          max="100"
          step="5"
          @change="handleSliderChange"
          activeColor="#667eea"
        />
        <view class="slider-labels">
          <text>像你</text>
          <text>{{ selectedComplementLevel }}%</text>
          <text>互补</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="action-btn back" @click="handleBack" v-if="currentStep > 1">
        上一步
      </button>
      <button
        class="action-btn next"
        :disabled="!canNext"
        @click="handleNext"
      >
        {{ currentStep === 3 ? '完成' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersonaStore } from '../../stores/persona'

const personaStore = usePersonaStore()

const currentStep = ref(1)
const selectedType = ref<any>(null)
const personaName = ref('')
const selectedComplementLevel = ref(50)

const suggestionList = computed(() => {
  if (selectedType.value) {
    return [selectedType.value.name, selectedType.value.name + '伙伴', selectedType.value.name + '助手']
  }
  return []
})

const canNext = computed(() => {
  if (currentStep.value === 1) return !!selectedType.value
  if (currentStep.value === 2) return !!personaName.value.trim()
  return true
})

function getTypeIcon(name: string): string {
  const icons: Record<string, string> = {
    '分析师': '📊',
    '倾听者': '👂',
    '创意伙伴': '💡',
    '规划师': '📋',
    '探险家': '🌟',
  }
  return icons[name] || '🤖'
}

function handleSliderChange(e: any) {
  selectedComplementLevel.value = e.detail.value
}

function handleBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    uni.navigateBack()
  }
}

function handleNext() {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    const newPersona = personaStore.createPersona(personaName.value, selectedType.value)
    
    if (newPersona) {
      if (selectedComplementLevel.value !== 50) {
        personaStore.updateComplementLevel(selectedComplementLevel.value)
      }
      
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/persona-list/index'
        })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.create-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
}

.back-btn {
  font-size: 36rpx;
  color: #666666;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.spacer {
  width: 80rpx;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 64rpx;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step.active .step-number {
  background: #667eea;
  color: #ffffff;
}

.step.completed .step-number {
  background: #667eea;
  color: #ffffff;
}

.step-number {
  width: 80rpx;
  height: 80rpx;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #999999;
  margin-bottom: 16rpx;
}

.step-text {
  font-size: 28rpx;
  color: #999999;
}

.step.active .step-text {
  color: #667eea;
}

.step-line {
  width: 120rpx;
  height: 8rpx;
  background: #e0e0e0;
  margin: 0 32rpx;
  margin-bottom: 60rpx;
}

.step-line.active {
  background: #667eea;
}

.step-content {
  background: #ffffff;
  border-radius: 40rpx;
  padding: 64rpx;
  margin-bottom: 48rpx;
}

.step-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

.step-desc {
  display: block;
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 64rpx;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.type-card {
  display: flex;
  align-items: center;
  padding: 40rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  border: 4rpx solid transparent;
}

.type-card.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.type-icon {
  width: 112rpx;
  height: 112rpx;
  background: #ffffff;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin-right: 32rpx;
}

.type-info {
  flex: 1;
}

.type-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.type-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.type-check {
  width: 64rpx;
  height: 64rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.name-input-section {
  margin-top: 48rpx;
}

.name-input {
  width: 100%;
  height: 112rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 0 40rpx;
  font-size: 36rpx;
  margin-bottom: 48rpx;
}

.name-suggestions {
  margin-top: 32rpx;
}

.suggestions-label {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 24rpx;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.suggestion-tag {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #666666;
}

.preview-card {
  margin-top: 64rpx;
  padding: 64rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  text-align: center;
}

.preview-icon {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  font-size: 64rpx;
  font-weight: bold;
  color: #ffffff;
}

.preview-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.preview-mbti {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
}

.success-icon {
  display: block;
  text-align: center;
  font-size: 128rpx;
  margin-bottom: 40rpx;
}

.success-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 24rpx;
}

.success-desc {
  display: block;
  font-size: 32rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 64rpx;
}

.complement-info {
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 48rpx;
  margin-bottom: 48rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
}

.info-row:not(:last-child) {
  border-bottom: 2rpx solid #e0e0e0;
}

.info-label {
  font-size: 32rpx;
  color: #999999;
}

.info-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.info-value.highlight {
  color: #667eea;
}

.complement-slider {
  margin-top: 32rpx;
}

.slider-label {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #999999;
  margin-top: 16rpx;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 32rpx;
  padding: 40rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 112rpx;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 56rpx;
  border: none;
}

.action-btn.back {
  background: #f5f5f5;
  color: #666666;
}

.action-btn.next {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.action-btn.next[disabled] {
  background: #e0e0e0;
  color: #999999;
}
</style>
