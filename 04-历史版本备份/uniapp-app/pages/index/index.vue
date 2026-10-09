<template>
  <view class="index-container">
    <!-- 顶部区域 -->
    <view class="header-section">
      <view class="logo-container">
        <view class="logo">
          <text class="logo-icon">🤖</text>
        </view>
      </view>
      <text class="title">互补数字人</text>
      <text class="subtitle">遇见另一个视角的你</text>
    </view>

    <!-- 功能介绍 -->
    <view class="features-section">
      <view class="feature-card" v-for="(feature, index) in features" :key="index">
        <text class="feature-icon">{{ feature.icon }}</text>
        <text class="feature-title">{{ feature.title }}</text>
        <text class="feature-desc">{{ feature.description }}</text>
      </view>
    </view>

    <!-- 开始按钮 -->
    <view class="action-section">
      <button class="start-btn" @click="handleStart">
        {{ personaStore.isTestCompleted ? '进入应用' : '开始体验' }}
      </button>
      <text class="tips">无需注册 · 免费体验 · 随时开始</text>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>v1.0.0 - 模拟AI版本</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePersonaStore } from '@/stores/persona'

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
    // 已有MBTI档案，跳转到人格页面
    uni.switchTab({
      url: '/pages/persona/index',
    })
  } else {
    // 进行MBTI测试
    uni.navigateTo({
      url: '/pages/mbti/test',
    })
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo-container {
  margin-bottom: 40rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 80rpx;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
}

.features-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 80rpx;
  width: 100%;
}

.feature-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24rpx;
  padding: 40rpx 20rpx;
  text-align: center;
  backdrop-filter: blur(10px);
}

.feature-icon {
  display: block;
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.feature-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.feature-desc {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-section {
  width: 100%;
  text-align: center;
}

.start-btn {
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
  margin-bottom: 24rpx;
  border: none;
  
  &:active {
    opacity: 0.8;
    transform: scale(0.98);
  }
}

.tips {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.version-info {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
  
  text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
