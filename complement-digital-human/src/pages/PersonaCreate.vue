<template>
  <div class="create-container">
    <div class="header">
      <button class="back-btn" @click="handleBack">← 返回</button>
      <h1 class="page-title">创建数字人</h1>
      <div class="spacer"></div>
    </div>

    <div class="steps-indicator">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <span class="step-text">选择类型</span>
      </div>
      <div class="step-line" :class="{ active: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <span class="step-text">命名</span>
      </div>
      <div class="step-line" :class="{ active: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep >= 3 }">
        <div class="step-number">3</div>
        <span class="step-text">完成</span>
      </div>
    </div>

    <!-- 步骤1：选择类型 -->
    <div class="step-content" v-if="currentStep === 1">
      <h2 class="step-title">选择人格类型</h2>
      <p class="step-desc">为你的数字人选择一种角色定位</p>

      <div class="type-list">
        <div
          v-for="type in personaStore.suggestedNameList"
          :key="type.name"
          class="type-card"
          :class="{ selected: selectedType?.name === type.name }"
          @click="selectedType = type"
        >
          <div class="type-icon">{{ getTypeIcon(type.name) }}</div>
          <div class="type-info">
            <span class="type-name">{{ type.name }}</span>
            <span class="type-desc">{{ type.description }}</span>
          </div>
          <div class="type-check" v-if="selectedType?.name === type.name">✓</div>
        </div>
      </div>
    </div>

    <!-- 步骤2：命名 -->
    <div class="step-content" v-if="currentStep === 2">
      <h2 class="step-title">为你的数字人起个名字</h2>
      <p class="step-desc">这个名字将显示在对话中</p>

      <div class="name-input-section">
        <input
          v-model="personaName"
          class="name-input"
          placeholder="输入名称"
          maxlength="10"
        />
        <div class="name-suggestions">
          <span class="suggestions-label">或选择推荐名称：</span>
          <div class="suggestion-tags">
            <span
              v-for="name in suggestionList"
              :key="name"
              class="suggestion-tag"
              @click="personaName = name"
            >{{ name }}</span>
          </div>
        </div>
      </div>

      <div class="preview-card" v-if="personaName && personaStore.userMbti">
        <div class="preview-icon">
          <span>{{ personaStore.userMbti.split('').reverse().join('') }}</span>
        </div>
        <span class="preview-name">{{ personaName }}</span>
        <span class="preview-mbti">互补类型：{{ personaStore.userMbti.split('').reverse().join('') }}</span>
      </div>
    </div>

    <!-- 步骤3：完成 -->
    <div class="step-content" v-if="currentStep === 3">
      <div class="success-icon">🎉</div>
      <h2 class="success-title">{{ personaName }} 创建成功！</h2>
      <p class="success-desc">你的互补数字人已经准备好了</p>

      <div class="complement-info">
        <div class="info-row">
          <span class="info-label">你的MBTI</span>
          <span class="info-value">{{ personaStore.userMbti }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">数字人MBTI</span>
          <span class="info-value highlight">{{ personaStore.userMbti?.split('').reverse().join('') }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">互补度</span>
          <span class="info-value">{{ selectedComplementLevel }}%</span>
        </div>
      </div>

      <div class="complement-slider">
        <span class="slider-label">调节互补度（每月限修改1次）</span>
        <input
          type="range"
          :value="selectedComplementLevel"
          :min="0"
          :max="100"
          :step="5"
          @input="handleSliderChange"
        />
        <div class="slider-labels">
          <span>像你</span>
          <span>{{ selectedComplementLevel }}%</span>
          <span>互补</span>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'

const router = useRouter()
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
  selectedComplementLevel.value = parseInt(e.target.value)
}

function handleBack() {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.push('/persona')
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
      
      router.push('/persona')
    }
  }
}
</script>

<style scoped>
.create-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 120px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.back-btn {
  font-size: 18px;
  color: #666666;
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

.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
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
  width: 40px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #999999;
  margin-bottom: 8px;
}

.step-text {
  font-size: 14px;
  color: #999999;
}

.step.active .step-text {
  color: #667eea;
}

.step-line {
  width: 60px;
  height: 4px;
  background: #e0e0e0;
  margin: 0 16px;
  margin-bottom: 30px;
}

.step-line.active {
  background: #667eea;
}

.step-content {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
}

.step-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12px;
}

.step-desc {
  font-size: 16px;
  color: #999999;
  margin-bottom: 32px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
}

.type-card.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.type-icon {
  width: 56px;
  height: 56px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
}

.type-info {
  flex: 1;
}

.type-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 6px;
}

.type-desc {
  display: block;
  font-size: 14px;
  color: #999999;
}

.type-check {
  width: 32px;
  height: 32px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
}

.name-input-section {
  margin-top: 24px;
}

.name-input {
  width: 100%;
  height: 56px;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 0 20px;
  font-size: 18px;
  margin-bottom: 24px;
}

.name-suggestions {
  margin-top: 16px;
}

.suggestions-label {
  display: block;
  font-size: 14px;
  color: #999999;
  margin-bottom: 12px;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.suggestion-tag {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
}

.suggestion-tag:active {
  background: #e0e0e0;
}

.preview-card {
  margin-top: 32px;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  text-align: center;
}

.preview-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
}

.preview-name {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8px;
}

.preview-mbti {
  display: block;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.success-icon {
  text-align: center;
  font-size: 64px;
  margin-bottom: 20px;
}

.success-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 12px;
}

.success-desc {
  font-size: 16px;
  color: #999999;
  text-align: center;
  margin-bottom: 32px;
}

.complement-info {
  background: #f5f5f5;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.info-label {
  font-size: 16px;
  color: #999999;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
}

.info-value.highlight {
  color: #667eea;
}

.complement-slider {
  margin-top: 16px;
}

.slider-label {
  display: block;
  font-size: 14px;
  color: #999999;
  margin-bottom: 16px;
}

.complement-slider input[type="range"] {
  width: 100%;
  margin-bottom: 12px;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999999;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 56px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 28px;
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

.action-btn.next:disabled {
  background: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
}
</style>
