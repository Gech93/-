<template>
  <div class="test-container">
    <div class="progress-header">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <div class="progress-info">
        第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressWidth }"></div>
    </div>

    <div class="question-card">
      <div class="question-icon">💡</div>
      <h2 class="question-text">{{ currentQuestion.question }}</h2>
    </div>

    <div class="options-list">
      <div
        v-for="(option, index) in currentQuestion.options"
        :key="index"
        class="option-item"
        :class="{ active: currentAnswer === index }"
        @click="selectOption(index)"
      >
        <div class="option-content">
          <span class="option-text">{{ option }}</span>
          <div class="option-check" v-if="currentAnswer === index">✓</div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <button
        class="next-btn"
        :disabled="currentAnswer === null"
        @click="handleNext"
      >
        {{ isLastQuestion ? '完成测试' : '下一题' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'

const router = useRouter()
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
    if (confirm(`你的MBTI类型是：${personaStore.userMbti}\n\n现在创建你的第一个互补数字人吗？`)) {
      router.push('/persona/create')
    } else {
      router.push('/persona')
    }
  } else {
    personaStore.mbtiTestProgress = questions.value[currentQuestionIndex.value + 1].id
  }
}

function goBack() {
  if (currentQuestionIndex.value > 0) {
    personaStore.mbtiTestProgress = questions.value[currentQuestionIndex.value - 1].id
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #ffffff;
}

.back-btn {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  background: none;
}

.progress-info {
  font-size: 16px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 40px;
}

.progress-fill {
  height: 100%;
  background: #ffffff;
  transition: width 0.3s ease;
}

.question-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px 30px;
  text-align: center;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
}

.question-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.question-text {
  font-size: 22px;
  font-weight: bold;
  color: #ffffff;
  line-height: 1.5;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 100px;
}

.option-item {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.active {
  background: rgba(255, 255, 255, 0.25);
  border-color: #ffffff;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-text {
  font-size: 18px;
  color: #ffffff;
  flex: 1;
  line-height: 1.4;
}

.option-check {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  color: #667eea;
  font-size: 20px;
  font-weight: bold;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, rgba(102, 126, 234, 0.9) 0%, transparent 100%);
}

.next-btn {
  width: 100%;
  height: 60px;
  background: #ffffff;
  color: #667eea;
  font-size: 20px;
  font-weight: bold;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.next-btn:disabled {
  background: rgba(255, 255, 255, 0.5);
  color: rgba(102, 126, 234, 0.5);
  cursor: not-allowed;
}

.next-btn:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
