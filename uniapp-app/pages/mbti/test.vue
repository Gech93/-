<template>
  <view class="test-container">
    <!-- 顶部进度 -->
    <view class="progress-header">
      <view class="back-btn" @click="goBack">
        <text>← 返回</text>
      </view>
      <view class="progress-info">
        <text>第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</text>
      </view>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressWidth }"></view>
    </view>

    <!-- 问题卡片 -->
    <view class="question-card">
      <view class="question-icon">
        <text>💡</text>
      </view>
      <text class="question-text">{{ currentQuestion.question }}</text>
    </view>

    <!-- 选项列表 -->
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
          <view class="option-check" v-if="currentAnswer === index">
            <text>✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
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
import { usePersonaStore } from '@/stores/persona'

const personaStore = usePersonaStore()

const questions = computed(() => personaStore.questions)

const currentQuestionIndex = computed(() => personaStore.mbtiTestProgress)

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

const currentAnswer = computed(() => {
  return personaStore.answers[currentQuestion.value.id] ?? null
})

const progressWidth = computed(() => {
  return `${((currentQuestionIndex.value + 1) / questions.value.length) * 100}%`
})

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === questions.value.length - 1
})

function selectOption(index: number) {
  personaStore.setAnswer(currentQuestion.value.id, index)
}

function handleNext() {
  if (isLastQuestion.value) {
    // 完成测试
    personaStore.completeMbtiTest()
    
    uni.showModal({
      title: '测试完成',
      content: `你的MBTI类型是：${personaStore.userMbti}\n\n现在创建你的第一个互补数字人吧！`,
      showCancel: true,
      cancelText: '稍后',
      confirmText: '立即创建',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/persona/create',
          })
        } else {
          uni.switchTab({
            url: '/pages/persona/index',
          })
        }
      },
    })
  } else {
    // 下一题
    personaStore.setAnswer(
      currentQuestion.value.id,
      currentAnswer.value !== null ? currentAnswer.value : 0
    )
  }
}

function goBack() {
  if (currentQuestionIndex.value > 0) {
    personaStore.mbtiTestProgress--
  } else {
    uni.navigateBack()
  }
}
</script>

<style lang="scss" scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  color: #ffffff;
}

.back-btn {
  font-size: 28rpx;
  opacity: 0.8;
  
  &:active {
    opacity: 0.5;
  }
}

.progress-info {
  font-size: 28rpx;
}

.progress-bar {
  height: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 40rpx;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  transition: width 0.3s ease;
}

.question-card {
  margin: 60rpx 40rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  backdrop-filter: blur(10px);
}

.question-icon {
  text-align: center;
  margin-bottom: 30rpx;
  
  text {
    font-size: 64rpx;
  }
}

.question-text {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  line-height: 1.5;
}

.options-list {
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.option-item {
  background: rgba(255, 255, 255, 0.1);
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 32rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.25);
    border-color: #ffffff;
  }
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-text {
  font-size: 30rpx;
  color: #ffffff;
  flex: 1;
  line-height: 1.4;
}

.option-check {
  width: 48rpx;
  height: 48rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  
  text {
    color: #667eea;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx;
  background: linear-gradient(to top, rgba(102, 126, 234, 0.9) 0%, transparent 100%);
}

.next-btn {
  width: 100%;
  height: 96rpx;
  background: #ffffff;
  color: #667eea;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  
  &:disabled {
    background: rgba(255, 255, 255, 0.5);
    color: rgba(102, 126, 234, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
}
</style>
