<template>
  <view class="index-container">
    <view class="header-section">
      <view class="logo-container">
        <view class="logo">
          <text class="logo-icon">🤖</text>
        </view>
      </view>
      <text class="title">互补数字人</text>
      <text class="subtitle">遇见另一个视角的你</text>
    </view>

    <view class="features-section">
      <view class="feature-card" v-for="feature in features" :key="feature.icon">
        <text class="feature-icon">{{ feature.icon }}</text>
        <text class="feature-title">{{ feature.title }}</text>
        <text class="feature-desc">{{ feature.description }}</text>
      </view>
    </view>

    <view class="action-section">
      <button class="start-btn" @click="handleStart">
        {{ personaStore.isTestCompleted ? '进入应用' : '开始体验' }}
      </button>
      <text class="tips">无需注册 · 免费体验 · 随时开始</text>
    </view>

    <view class="version-info">
      <text>v1.0.0 - 微信小程序版</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePersonaStore } from '../../stores/persona'
import { onMounted } from 'vue'

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

onMounted(() => {
  personaStore.loadFromStorage()
})

function handleStart() {
  if (personaStore.isTestCompleted) {
    uni.navigateTo({
      url: '/pages/persona-list/index'
    })
  } else {
    uni.navigateTo({
      url: '/pages/mbti-test/index'
    })
  }
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-section {
  text-align: center;
  margin-bottom: 120rpx;
}

.logo-container {
  margin-bottom: 48rpx;
}

.logo {
  width: 240rpx;
  height: 240rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.logo-icon {
  font-size: 128rpx;
}

.title {
  display: block;
  font-size: 80rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 24rpx;
}

.subtitle {
  display: block;
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.9);
}

.features-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 120rpx;
  width: 100%;
}

.feature-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 40rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  margin: 0 16rpx;
}

.feature-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.feature-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12rpx;
}

.feature-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-section {
  width: 100%;
  max-width: 800rpx;
  text-align: center;
}

.start-btn {
  width: 100%;
  height: 120rpx;
  background: #ffffff;
  color: #667eea;
  font-size: 40rpx;
  font-weight: bold;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.tips {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 32rpx;
}

.version-info {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
}
</style>
