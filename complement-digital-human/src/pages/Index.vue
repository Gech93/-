<template>
  <div class="index-container">
    <div class="header-section">
      <div class="logo-container">
        <div class="logo">
          <span class="logo-icon">🤖</span>
        </div>
      </div>
      <h1 class="title">互补数字人</h1>
      <p class="subtitle">遇见另一个视角的你</p>
    </div>

    <div class="features-section">
      <div class="feature-card" v-for="feature in features" :key="feature.icon">
        <span class="feature-icon">{{ feature.icon }}</span>
        <span class="feature-title">{{ feature.title }}</span>
        <span class="feature-desc">{{ feature.description }}</span>
      </div>
    </div>

    <div class="action-section">
      <button class="start-btn" @click="handleStart">
        {{ personaStore.isTestCompleted ? '进入应用' : '开始体验' }}
      </button>
      <p class="tips">无需注册 · 免费体验 · 随时开始</p>
    </div>

    <div class="version-info">
      <span>v1.0.0 - 模拟AI版本</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'

const router = useRouter()
const personaStore = usePersonaStore()

const features = [
  {
    icon: '🧠',
    title: 'MBTI测试',
    description: '发现你的人格类型',
  },
  {
    icon: '💬',
    title: '互补对话',
    description: '与另一个视角交流',
  },
  {
    icon: '🎯',
    title: '决策参考',
    description: '获得不同角度的建议',
  },
]

function handleStart() {
  if (personaStore.isTestCompleted) {
    router.push('/persona')
  } else {
    router.push('/mbti')
  }
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.logo-container {
  margin-bottom: 24px;
}

.logo {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 64px;
}

.title {
  font-size: 40px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.features-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 60px;
  width: 100%;
  max-width: 600px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 24px 16px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.feature-icon {
  display: block;
  font-size: 40px;
  margin-bottom: 12px;
}

.feature-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 6px;
}

.feature-desc {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.action-section {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.start-btn {
  width: 100%;
  height: 60px;
  background: #ffffff;
  color: #667eea;
  font-size: 20px;
  font-weight: bold;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.start-btn:active {
  transform: scale(0.98);
}

.tips {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
}

.version-info {
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
