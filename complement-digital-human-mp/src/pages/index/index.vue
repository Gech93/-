<template>
  <view class="index-container">
    <view class="hero-section">
      <view class="slime-scene">
        <view class="scene-platform"></view>

        <view class="connect-arc"></view>
        <view class="connect-dot dot-1"></view>
        <view class="connect-dot dot-2"></view>
        <view class="connect-dot dot-3"></view>

        <view class="slime-main">
          <view class="slime-body">
            <view class="slime-eye eye-left"></view>
            <view class="slime-eye eye-right"></view>
            <view class="slime-cheek cheek-left"></view>
            <view class="slime-cheek cheek-right"></view>
            <view class="slime-mouth"></view>
            <view class="slime-gloss"></view>
          </view>
        </view>

        <view class="mirror">
          <view class="mirror-frame">
            <view class="mirror-glass">
              <view class="reflection-slime">
                <view class="reflection-body">
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                  <view class="reflection-gloss"></view>
                </view>
              </view>
              <view class="mirror-shine"></view>
            </view>
          </view>
          <view class="mirror-neck"></view>
          <view class="mirror-base"></view>
        </view>
      </view>

      <text class="hero-title">互补数字人</text>
      <text class="hero-subtitle">遇见另一个视角的你</text>
      <text class="hero-caption">镜子里的它，是侧身的你 —— 源自你，却并非你</text>
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
        {{ startBtnText }}
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
import { computed, onMounted } from 'vue'

const personaStore = usePersonaStore()

const features = [
  {
    icon: '🧠',
    title: '人格测评',
    description: 'MBTI + 大五双维探索',
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

const startBtnText = computed(() => {
  if (!personaStore.isTestCompleted) return '开始体验'
  return personaStore.isBigFiveTestCompleted ? '进入应用' : '继续大五测评'
})

function handleStart() {
  if (!personaStore.isTestCompleted) {
    uni.navigateTo({ url: '/pages/mbti-test/index' })
    return
  }
  if (!personaStore.isBigFiveTestCompleted) {
    uni.navigateTo({ url: '/pages/mbti-test/index?mode=bigfive' })
    return
  }
  uni.navigateTo({ url: '/pages/persona-list/index' })
}
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: var(--dopamine-gradient);
  padding: 32rpx 48rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24rpx;
}

/* ===== 史莱姆照镜子场景 ===== */
.slime-scene {
  position: relative;
  width: 600rpx;
  height: 450rpx;
  margin-bottom: 32rpx;
}

.scene-platform {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 540rpx;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

.connect-arc {
  position: absolute;
  top: 132rpx;
  left: 300rpx;
  width: 96rpx;
  height: 64rpx;
  border-top: 4rpx dashed rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: rotate(-14deg);
}

.connect-dot {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  animation: dot-twinkle 2.4s ease-in-out infinite;
}

.dot-1 {
  top: 168rpx;
  left: 50%;
}

.dot-2 {
  top: 218rpx;
  left: 54%;
  animation-delay: 0.6s;
}

.dot-3 {
  top: 268rpx;
  left: 50%;
  animation-delay: 1.2s;
}

@keyframes dot-twinkle {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* 本体史莱姆：正面，看向镜子 */
.slime-main {
  position: absolute;
  left: 5%;
  bottom: 56rpx;
  width: 240rpx;
  height: 240rpx;
}

.slime-body {
  position: absolute;
  inset: 0;
  border-radius: 50% 50% 46% 46% / 56% 56% 44% 44%;
  background: linear-gradient(160deg, #ff9dc0 0%, var(--dopamine-primary) 48%, #f55c92 100%);
  box-shadow: inset 0 -24rpx 48rpx rgba(214, 51, 108, 0.32),
    0 24rpx 48rpx rgba(255, 107, 157, 0.45), 0 0 0 6rpx rgba(255, 255, 255, 0.22);
  animation: slime-bounce 3s ease-in-out infinite;
}

@keyframes slime-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-16rpx) scale(0.97, 1.04);
  }
  50% {
    transform: translateY(0) scale(1.04, 0.94);
  }
  70% {
    transform: translateY(-8rpx) scale(0.99, 1.01);
  }
}

.slime-eye {
  position: absolute;
  top: 74rpx;
  width: 44rpx;
  height: 56rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 -4rpx 8rpx rgba(45, 42, 62, 0.08);
}

.eye-left {
  left: 54rpx;
}

.eye-right {
  right: 54rpx;
}

.slime-eye::after {
  content: '';
  position: absolute;
  left: 62%;
  top: 52%;
  width: 20rpx;
  height: 24rpx;
  background: var(--dopamine-text);
  border-radius: 50%;
  transform: translate(-62%, -52%);
}

.slime-cheek {
  position: absolute;
  top: 138rpx;
  width: 38rpx;
  height: 22rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.cheek-left {
  left: 28rpx;
}

.cheek-right {
  right: 28rpx;
}

.slime-mouth {
  position: absolute;
  left: 50%;
  bottom: 52rpx;
  width: 38rpx;
  height: 20rpx;
  border: 6rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 40rpx 40rpx;
  transform: translateX(-50%);
}

.slime-gloss {
  position: absolute;
  top: 34rpx;
  left: 60rpx;
  width: 68rpx;
  height: 32rpx;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  transform: rotate(-18deg);
}

/* 镜子 */
.mirror {
  position: absolute;
  right: 3%;
  bottom: 36rpx;
  width: 190rpx;
  height: 290rpx;
}

.mirror-frame {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(150deg, #d6c9ff 0%, var(--dopamine-purple) 55%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 24rpx 48rpx rgba(139, 92, 246, 0.45),
    inset 0 0 0 10rpx rgba(255, 255, 255, 0.28);
  animation: mirror-glow 3.2s ease-in-out infinite;
}

@keyframes mirror-glow {
  0%,
  100% {
    box-shadow: 0 24rpx 48rpx rgba(139, 92, 246, 0.4),
      inset 0 0 0 10rpx rgba(255, 255, 255, 0.28);
  }
  50% {
    box-shadow: 0 24rpx 48rpx rgba(139, 92, 246, 0.58),
      inset 0 0 0 10rpx rgba(255, 255, 255, 0.34);
  }
}

.mirror-glass {
  position: relative;
  width: 82%;
  height: 86%;
  border-radius: 50%;
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.94) 0%, rgba(237, 233, 254, 0.9) 60%, rgba(221, 214, 254, 0.94) 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mirror-neck {
  position: absolute;
  bottom: -44rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 34rpx;
  height: 38rpx;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 8rpx 8rpx 0 0;
}

.mirror-base {
  position: absolute;
  bottom: -28rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 116rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20rpx;
}

/* 镜中倒影：侧身的「数字分身」 */
.reflection-slime {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 112rpx;
  height: 124rpx;
  transform: translate(-50%, -52%);
}

.reflection-body {
  position: absolute;
  inset: 0;
  border-radius: 62% 38% 42% 58% / 58% 56% 44% 42%;
  background: linear-gradient(155deg, #ff9ec3 0%, var(--dopamine-purple) 100%);
  box-shadow: 0 0 24rpx rgba(167, 139, 250, 0.55);
  animation: reflect-breathe 3.2s ease-in-out infinite;
}

.reflection-body::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(0deg, rgba(167, 139, 250, 0.14) 0 4rpx, transparent 4rpx 10rpx);
}

@keyframes reflect-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}

.reflection-eye {
  position: absolute;
  right: 12rpx;
  top: 36rpx;
  width: 32rpx;
  height: 40rpx;
  background: #fff;
  border-radius: 50%;
}

.reflection-eye::after {
  content: '';
  position: absolute;
  right: 6rpx;
  top: 50%;
  width: 16rpx;
  height: 18rpx;
  background: var(--dopamine-text);
  border-radius: 50%;
  transform: translateY(-50%);
}

.reflection-cheek {
  position: absolute;
  right: 4rpx;
  top: 64rpx;
  width: 22rpx;
  height: 14rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.reflection-mouth {
  position: absolute;
  right: 28rpx;
  bottom: 26rpx;
  width: 26rpx;
  height: 14rpx;
  border: 4rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 30rpx 30rpx;
}

.reflection-gloss {
  position: absolute;
  top: 16rpx;
  left: 24rpx;
  width: 34rpx;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.mirror-shine {
  position: absolute;
  top: 16rpx;
  left: 20rpx;
  width: 56rpx;
  height: 112rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.05));
  border-radius: 30rpx;
  transform: rotate(18deg);
}

/* ===== 文案区 ===== */
.hero-title {
  display: block;
  font-size: 80rpx;
  font-weight: bold;
  color: var(--dopamine-card);
  letter-spacing: 6rpx;
  text-shadow: 0 8rpx 24rpx rgba(45, 42, 62, 0.25);
  margin-bottom: 16rpx;
}

.hero-subtitle {
  display: block;
  font-size: 38rpx;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 28rpx;
}

.hero-caption {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 40rpx;
}

.features-section {
  display: flex;
  justify-content: space-between;
  margin-top: 72rpx;
  margin-bottom: 72rpx;
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
  color: var(--dopamine-card);
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
  background: var(--dopamine-card);
  color: var(--dopamine-primary);
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

@media (prefers-reduced-motion: reduce) {
  .slime-body,
  .mirror-frame,
  .reflection-body,
  .connect-dot {
    animation: none !important;
  }
}
</style>
