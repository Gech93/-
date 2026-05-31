<template>
  <view class="test-container">
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">← 返回</view>
      <view class="progress-info">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</view>
    </view>

    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressWidth }"></view>
    </view>

    <view class="question-card">
      <text class="question-icon">💡</text>
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
import { computed } from 'vue'
import { usePersonaStore } from '../../stores/persona'

const personaStore = usePersonaStore()

const questions = computed(() => personaStore.questions)
const currentQuestionIndex = computed(() => {
  const currentId = personaStore.mbtiTestProgress
  const idx = questions.value.findIndex(q => q.id === currentId)
  return idx >= 0 ? idx : 0
})
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const currentAnswer = computed(() => personaStore.answers[currentQuestion.value.id])
const progressWidth = computed(() => {
  return `${((currentQuestionIndex.value + 1) / questions.value.length) * 100}%`
})
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

function selectOption(index: number) {
  personaStore.setAnswer(currentQuestion.value.id, index)
}

function handleNext() {
  if (isLastQuestion.value) {
    personaStore.completeMbtiTest()
    uni.showModal({
      title: '测试完成',
      content: `你的MBTI类型是：${personaStore.userMbti}\n\n现在创建你的第一个互补数字人吗？`,
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
    personaStore.mbtiTestProgress = questions.value[currentQuestionIndex.value + 1].id
  }
}

function goBack() {
  if (currentQuestionIndex.value > 0) {
    personaStore.mbtiTestProgress = questions.value[currentQuestionIndex.value - 1].id
  } else {
    uni.navigateBack()
  }
}
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.back-btn {
  font-size: 36rpx;
  color: #ffffff;
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
  background: #ffffff;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.question-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
}

.question-icon {
  display: block;
  font-size: 64rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.question-text {
  display: block;
  font-size: 36rpx;
  color: #333333;
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
  color: #333333;
  flex: 1;
}

.option-check {
  width: 48rpx;
  height: 48rpx;
  background: #667eea;
  color: #ffffff;
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
  background: #ffffff;
  color: #667eea;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
}

.next-btn[disabled] {
  background: rgba(255, 255, 255, 0.5);
  color: rgba(102, 126, 234, 0.5);
}
</style>
