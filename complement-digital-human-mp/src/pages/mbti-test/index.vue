<template>
  <view class="test-container">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">← 返回</view>
      <view class="progress-info">{{ isBigFiveMode ? '大五测评' : 'MBTI测评' }} · 第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</view>
    </view>

    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressWidth }"></view>
    </view>

    <view class="question-card">
      <text class="question-icon">💡</text>
      <text class="dimension-tag" v-if="isBigFiveMode">{{ currentQuestion.label }}</text>
      <text class="question-text">{{ currentQuestion.question }}</text>
    </view>

    <view class="options-list">
      <view
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        class="option-item"
        :class="{ active: currentAnswer === index }"
        @click="selectOption(index)"
      >
        <view class="option-content">
          <text class="option-text">{{ option }}</text>
          <text class="option-check" v-if="currentAnswer === index">✓</text>
        </view>
      </view>
    </view>

    <view class="bottom-actions">
      <button
        class="next-btn"
        :disabled="currentAnswer === null"
        @click="handleNext"
      >
        {{ isLastQuestion ? '完成测试' : '下一题' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePersonaStore } from '../../stores/persona'
import type { BigFiveScores } from '../../stores/persona'

const personaStore = usePersonaStore()

const isBigFiveMode = ref(false)

onLoad((options) => {
  isBigFiveMode.value = options?.mode === 'bigfive'
})

const questions = computed<Array<{ id: number; dimension: string; question: string; options: string[]; label?: string }>>(() =>
  isBigFiveMode.value ? personaStore.bigFiveQuestionsList : personaStore.questions
)
const progressId = computed(() =>
  isBigFiveMode.value ? personaStore.bigFiveTestProgress : personaStore.mbtiTestProgress
)
const currentQuestionIndex = computed(() => {
  const idx = questions.value.findIndex(q => q.id === progressId.value)
  return idx >= 0 ? idx : 0
})
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const currentAnswer = computed(() => {
  const question = currentQuestion.value
  if (!question) return null
  return isBigFiveMode.value ? personaStore.bigFiveAnswers[question.id] : personaStore.answers[question.id]
})
const progressWidth = computed(() => {
  return `${((currentQuestionIndex.value + 1) / questions.value.length) * 100}%`
})
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

function selectOption(index: number) {
  if (isBigFiveMode.value) {
    personaStore.setBigFiveAnswer(currentQuestion.value.id, index)
  } else {
    personaStore.setAnswer(currentQuestion.value.id, index)
  }
}

function describeMbtiProfile(): string {
  const profile = personaStore.mbtiProfile
  if (!profile || !profile.scores) return ''
  const s = profile.scores
  const dims = [
    { name: 'E/I', value: s.E, pos: '外向', neg: '内向' },
    { name: 'S/N', value: s.S, pos: '感觉', neg: '直觉' },
    { name: 'T/F', value: s.T, pos: '思考', neg: '情感' },
    { name: 'J/P', value: s.J, pos: '判断', neg: '感知' },
  ]
  return dims.map(d => `${d.value >= 50 ? d.pos : d.neg}(${d.value}%)`).join('，')
}

function describeBigFiveProfile(): string {
  const profile = personaStore.bigFiveProfile
  if (!profile || !profile.scores) return ''
  const keyMap: { label: string; key: keyof BigFiveScores }[] = [
    { label: '开放性', key: 'O' },
    { label: '尽责性', key: 'C' },
    { label: '外向性', key: 'E' },
    { label: '宜人性', key: 'A' },
    { label: '神经质', key: 'N' },
  ]
  return keyMap.map(d => `${d.label} ${profile.descriptions[d.key]}`).join('，')
}

function handleNext() {
  if (isLastQuestion.value) {
    if (isBigFiveMode.value) {
      personaStore.completeBigFiveTest()
      uni.showModal({
        title: '大五测评完成',
        content: `你的大五人格画像：\n${describeBigFiveProfile()}\n画像置信度：${personaStore.bigFiveProfile?.confidence || 0}%\n\n现在创建你的第一个互补数字人吗？`,
        confirmText: '创建',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/persona-create/index'
            })
          } else {
            uni.navigateTo({
              url: '/pages/persona-list/index'
            })
          }
        }
      })
    } else {
      personaStore.completeMbtiTest()
      uni.showModal({
        title: '测试完成',
        content: `你的MBTI类型是：${personaStore.userMbti}\n维度强度：${describeMbtiProfile()}\n测试置信度：${personaStore.mbtiProfile?.confidence || 0}%\n\n继续完成大五人格测评，可以更精准地构建互补人格。`,
        confirmText: '继续大五测评',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/mbti-test/index?mode=bigfive'
            })
          } else {
            uni.navigateTo({
              url: '/pages/persona-list/index'
            })
          }
        }
      })
    }
  } else {
    const nextId = questions.value[currentQuestionIndex.value + 1].id
    if (isBigFiveMode.value) {
      personaStore.bigFiveTestProgress = nextId
    } else {
      personaStore.mbtiTestProgress = nextId
    }
  }
}

function goBack() {
  if (currentQuestionIndex.value > 0) {
    const prevId = questions.value[currentQuestionIndex.value - 1].id
    if (isBigFiveMode.value) {
      personaStore.bigFiveTestProgress = prevId
    } else {
      personaStore.mbtiTestProgress = prevId
    }
  } else {
    uni.navigateBack()
  }
}
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background: var(--dopamine-gradient);
  padding: 48rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.back-btn {
  font-size: 36rpx;
  color: var(--dopamine-card);
}

.progress-info {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4rpx;
  margin-bottom: 48rpx;
}

.progress-fill {
  height: 100%;
  background: var(--dopamine-card);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.question-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question-icon {
  display: block;
  font-size: 64rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.dimension-tag {
  display: inline-block;
  align-self: center;
  text-align: center;
  padding: 8rpx 32rpx;
  background: rgba(255, 107, 157, 0.12);
  color: var(--dopamine-primary);
  border-radius: 32rpx;
  font-size: 26rpx;
  margin-bottom: 16rpx;
}

.question-text {
  display: block;
  font-size: 36rpx;
  color: var(--dopamine-text);
  line-height: 1.6;
  text-align: center;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.option-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  border: 4rpx solid transparent;
}

.option-item.active {
  border-color: #ffffff;
  background: rgba(255, 255, 255, 1);
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-text {
  font-size: 32rpx;
  color: var(--dopamine-text);
  flex: 1;
}

.option-check {
  width: 48rpx;
  height: 48rpx;
  background: var(--dopamine-primary);
  color: var(--dopamine-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.bottom-actions {
  margin-top: 48rpx;
}

.next-btn {
  width: 100%;
  height: 96rpx;
  background: var(--dopamine-card);
  color: var(--dopamine-primary);
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
}

.next-btn[disabled] {
  background: rgba(255, 255, 255, 0.5);
  color: rgba(255, 107, 157, 0.5);
}
</style>
