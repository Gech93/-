<template>
  <view class="create-container">
    <!-- 步骤指示器 -->
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

    <!-- 步骤1：选择人格类型 -->
    <view class="step-content" v-if="currentStep === 1">
      <text class="step-title">选择人格类型</text>
      <text class="step-desc">为你的数字人选择一种角色定位</text>

      <view class="type-list">
        <view
          v-for="type in suggestedNames"
          :key="type.name"
          class="type-card"
          :class="{ selected: selectedType === type }"
          @click="selectedType = type"
        >
          <view class="type-icon">
            <text>{{ getTypeIcon(type.name) }}</text>
          </view>
          <view class="type-info">
            <text class="type-name">{{ type.name }}</text>
            <text class="type-desc">{{ type.description }}</text>
          </view>
          <view class="type-check" v-if="selectedType === type">
            <text>✓</text>
          </view>
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
        <view class="name-suggestions">
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

      <view class="preview-card" v-if="personaName">
        <view class="preview-icon">
          <text>{{ personaStore.userMbti?.split('').reverse().join('') }}</text>
        </view>
        <text class="preview-name">{{ personaName }}</text>
        <text class="preview-mbti">互补类型：{{ personaStore.userMbti?.split('').reverse().join('') }}</text>
      </view>
    </view>

    <!-- 步骤3：完成 -->
    <view class="step-content" v-if="currentStep === 3">
      <view class="success-icon">🎉</view>
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
          :min="0"
          :max="100"
          :step="5"
          activeColor="#667eea"
          block-size="24"
          @change="handleSliderChange"
        />
        <view class="slider-labels">
          <text>像你</text>
          <text>{{ selectedComplementLevel }}%</text>
          <text>互补</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
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
import { usePersonaStore, type Persona } from '@/stores/persona'

const personaStore = usePersonaStore()

const currentStep = ref(1)
const selectedType = ref<typeof personaStore.suggestedNameList.value[0] | null>(null)
const personaName = ref('')
const selectedComplementLevel = ref(50)

const suggestedNames = computed(() => personaStore.suggestedNameList)

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
    // 创建人格
    const newPersona = personaStore.createPersona(personaName.value, selectedType.value || undefined)
    
    if (newPersona) {
      // 设置初始互补度
      if (selectedComplementLevel.value !== 50) {
        personaStore.updateComplementLevel(selectedComplementLevel.value)
      }
      
      uni.showToast({
        title: '创建成功！',
        icon: 'success',
      })
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/persona/index',
        })
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.create-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx 30rpx;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60rpx;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.active .step-number {
    background: #667eea;
    color: #ffffff;
  }
  
  &.completed .step-number {
    background: #667eea;
    color: #ffffff;
  }
}

.step-number {
  width: 56rpx;
  height: 56rpx;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #999999;
  margin-bottom: 12rpx;
}

.step-text {
  font-size: 24rpx;
  color: #999999;
  
  .step.active & {
    color: #667eea;
  }
}

.step-line {
  width: 100rpx;
  height: 4rpx;
  background: #e0e0e0;
  margin: 0 20rpx;
  margin-bottom: 40rpx;
  
  &.active {
    background: #667eea;
  }
}

.step-content {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
}

.step-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.step-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.type-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  border: 2rpx solid transparent;
  
  &.selected {
    background: rgba(102, 126, 234, 0.1);
    border-color: #667eea;
  }
}

.type-icon {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 40rpx;
  }
}

.type-info {
  flex: 1;
}

.type-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.type-desc {
  display: block;
  font-size: 26rpx;
  color: #999999;
}

.type-check {
  width: 48rpx;
  height: 48rpx;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #ffffff;
    font-size: 28rpx;
  }
}

.name-input-section {
  margin-top: 40rpx;
}

.name-input {
  width: 100%;
  height: 96rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
}

.name-suggestions {
  margin-top: 20rpx;
}

.suggestions-label {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.suggestion-tag {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #666666;
  
  &:active {
    background: #e0e0e0;
  }
}

.preview-card {
  margin-top: 40rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  text-align: center;
}

.preview-icon {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
  
  text {
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.preview-name {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.preview-mbti {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.success-icon {
  text-align: center;
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.success-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 16rpx;
}

.success-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 40rpx;
}

.complement-info {
  background: #f5f5f5;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #e0e0e0;
  }
}

.info-label {
  font-size: 28rpx;
  color: #999999;
}

.info-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  
  &.highlight {
    color: #667eea;
  }
}

.complement-slider {
  margin-top: 20rpx;
}

.slider-label {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10rpx;
  
  text {
    font-size: 24rpx;
    color: #999999;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  background: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  
  &.back {
    background: #f5f5f5;
    color: #666666;
  }
  
  &.next {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    
    &:disabled {
      background: #e0e0e0;
      color: #999999;
    }
  }
}
</style>
