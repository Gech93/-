<template>
  <view class="index-container">
    <view class="hero-section">
      <view class="slime-scene">
        <view class="scene-platform"></view>

        <view class="connect-line conn-1"></view>
        <view class="connect-line conn-2"></view>
        <view class="connect-line conn-3"></view>
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

        <view class="mirror mirror-1">
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
          <view class="mirror-base"></view>
          <text class="mirror-tag">另一种思维</text>
        </view>

        <view class="mirror mirror-2">
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
          <view class="mirror-base"></view>
          <text class="mirror-tag">另一个声音</text>
        </view>

        <view class="mirror mirror-3">
          <view class="mirror-frame">
            <view class="mirror-glass">
              <view class="reflection-slime">
                <view class="reflection-body">
                  <view class="reflection-eye eye-l"></view>
                  <view class="reflection-eye eye-r"></view>
                  <view class="reflection-cheek ck-l"></view>
                  <view class="reflection-cheek ck-r"></view>
                  <view class="reflection-mouth"></view>
                  <view class="reflection-gloss"></view>
                </view>
              </view>
              <view class="mirror-shine"></view>
            </view>
          </view>
          <view class="mirror-base"></view>
          <text class="mirror-tag">另一个视角</text>
        </view>
      </view>

      <text class="hero-title">互补数字人</text>
      <text class="hero-subtitle">一个你 · 多面互补</text>
      <text class="hero-caption">每一面镜子，都照见一种互补的你 —— 源自你，却并非你</text>
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

/* ===== 一个主体 · 三面镜子场景 ===== */
.slime-scene {
  position: relative;
  width: 640rpx;
  height: 520rpx;
  margin-bottom: 32rpx;
}

.scene-platform {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 560rpx;
  height: 92rpx;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}

/* 连接线：本体 → 三面镜子 */
.connect-line {
  position: absolute;
  width: 0;
  border-left: 4rpx dashed rgba(255, 255, 255, 0.55);
  transform-origin: top center;
}

.conn-1 {
  left: 206rpx;
  top: 232rpx;
  height: 100rpx;
  transform: rotate(-36deg);
}

.conn-2 {
  left: 424rpx;
  top: 232rpx;
  height: 100rpx;
  transform: rotate(36deg);
}

.conn-3 {
  left: 318rpx;
  top: 196rpx;
  height: 56rpx;
}

.connect-dot {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: dot-twinkle 2.4s ease-in-out infinite;
}

.dot-1 {
  left: 138rpx;
  top: 118rpx;
}

.dot-2 {
  left: 490rpx;
  top: 118rpx;
  animation-delay: 0.8s;
}

.dot-3 {
  left: 314rpx;
  top: 178rpx;
  animation-delay: 1.6s;
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

/* 主体史莱姆：正面，居中的「一个你」 */
.slime-main {
  position: absolute;
  left: 50%;
  bottom: 40rpx;
  width: 224rpx;
  height: 224rpx;
  transform: translateX(-50%);
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
  top: 70rpx;
  width: 42rpx;
  height: 52rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 -4rpx 8rpx rgba(45, 42, 62, 0.08);
}

.eye-left {
  left: 50rpx;
}

.eye-right {
  right: 50rpx;
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
  top: 128rpx;
  width: 36rpx;
  height: 20rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.cheek-left {
  left: 26rpx;
}

.cheek-right {
  right: 26rpx;
}

.slime-mouth {
  position: absolute;
  left: 50%;
  bottom: 46rpx;
  width: 36rpx;
  height: 18rpx;
  border: 6rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 40rpx 40rpx;
  transform: translateX(-50%);
}

.slime-gloss {
  position: absolute;
  top: 32rpx;
  left: 56rpx;
  width: 64rpx;
  height: 30rpx;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  transform: rotate(-18deg);
}

/* 三面镜子：弧线排列在主体上方 */
.mirror {
  position: absolute;
}

.mirror-1 {
  left: 2%;
  top: 44rpx;
  width: 150rpx;
  height: 224rpx;
}

.mirror-2 {
  right: 2%;
  top: 44rpx;
  width: 150rpx;
  height: 224rpx;
}

.mirror-3 {
  left: 50%;
  top: 0;
  width: 128rpx;
  height: 188rpx;
  transform: translateX(-50%);
}

.mirror-frame {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 40rpx rgba(139, 92, 246, 0.32),
    inset 0 0 0 8rpx rgba(255, 255, 255, 0.28);
  animation: mirror-glow 3.2s ease-in-out infinite;
}

.mirror-1 .mirror-frame {
  background: linear-gradient(150deg, #d6c9ff 0%, var(--dopamine-purple) 55%, #8b5cf6 100%);
}

.mirror-2 .mirror-frame {
  background: linear-gradient(150deg, #ffd3e3 0%, var(--dopamine-primary) 55%, #f55c92 100%);
}

.mirror-3 .mirror-frame {
  background: linear-gradient(150deg, #ede4ff 0%, #c4b5fd 55%, #a78bfa 100%);
  animation-delay: 0.6s;
}

@keyframes mirror-glow {
  0%,
  100% {
    box-shadow: 0 20rpx 40rpx rgba(139, 92, 246, 0.32),
      inset 0 0 0 8rpx rgba(255, 255, 255, 0.28);
  }
  50% {
    box-shadow: 0 20rpx 40rpx rgba(167, 139, 250, 0.5),
      inset 0 0 0 8rpx rgba(255, 255, 255, 0.34);
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

.mirror-2 .mirror-glass {
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 224, 238, 0.9) 60%, rgba(255, 205, 228, 0.94) 100%);
}

.mirror-3 .mirror-glass {
  background: linear-gradient(175deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 235, 255, 0.92) 60%, rgba(226, 216, 255, 0.95) 100%);
}

.mirror-base {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 96rpx;
  height: 20rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20rpx;
}

.mirror-tag {
  position: absolute;
  left: 50%;
  bottom: -56rpx;
  transform: translateX(-50%);
  font-size: 20rpx;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.92);
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 24rpx;
  white-space: nowrap;
}

/* 镜中倒影：三种互补的「数字分身」 */
.reflection-slime {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.mirror-1 .reflection-slime,
.mirror-2 .reflection-slime {
  width: 96rpx;
  height: 104rpx;
}

.mirror-3 .reflection-slime {
  width: 74rpx;
  height: 80rpx;
}

.reflection-body {
  position: absolute;
  inset: 0;
  box-shadow: 0 0 24rpx rgba(167, 139, 250, 0.55);
  animation: reflect-breathe 3.2s ease-in-out infinite;
}

.reflection-body::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.mirror-1 .reflection-body {
  border-radius: 62% 38% 42% 58% / 58% 56% 44% 42%;
  background: linear-gradient(155deg, #ff9ec3 0%, var(--dopamine-purple) 100%);
}

.mirror-1 .reflection-body::after {
  background: repeating-linear-gradient(0deg, rgba(167, 139, 250, 0.16) 0 4rpx, transparent 4rpx 10rpx);
}

.mirror-2 .reflection-body {
  border-radius: 38% 62% 58% 42% / 58% 56% 44% 42%;
  background: linear-gradient(155deg, #ffc9dd 0%, var(--dopamine-primary) 100%);
}

.mirror-2 .reflection-body::after {
  background: repeating-linear-gradient(0deg, rgba(255, 107, 157, 0.18) 0 4rpx, transparent 4rpx 10rpx);
}

.mirror-3 .reflection-body {
  border-radius: 50% 50% 46% 46% / 56% 56% 44% 44%;
  background: linear-gradient(155deg, #e6d8ff 0%, var(--dopamine-purple) 100%);
}

.mirror-3 .reflection-body::after {
  background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.18) 0 3rpx, transparent 3rpx 8rpx);
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

/* 倒影五官 */
.reflection-eye {
  position: absolute;
  top: 34rpx;
  width: 30rpx;
  height: 38rpx;
  background: #fff;
  border-radius: 50%;
}

.reflection-eye::after {
  content: '';
  position: absolute;
  right: 6rpx;
  top: 50%;
  width: 15rpx;
  height: 17rpx;
  background: var(--dopamine-text);
  border-radius: 50%;
  transform: translateY(-50%);
}

.mirror-1 .reflection-eye {
  right: 12rpx;
}

.mirror-2 .reflection-eye {
  left: 12rpx;
}

.mirror-2 .reflection-eye::after {
  left: 6rpx;
  right: auto;
}

.mirror-3 .reflection-eye {
  top: 22rpx;
  width: 24rpx;
  height: 30rpx;
}

.mirror-3 .reflection-eye::after {
  width: 12rpx;
  height: 14rpx;
}

.mirror-3 .reflection-eye.eye-l {
  left: 12rpx;
}

.mirror-3 .reflection-eye.eye-r {
  right: 12rpx;
}

.reflection-cheek {
  position: absolute;
  top: 64rpx;
  width: 20rpx;
  height: 12rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.mirror-1 .reflection-cheek {
  right: 2rpx;
}

.mirror-2 .reflection-cheek {
  left: 2rpx;
}

.mirror-3 .reflection-cheek {
  top: 44rpx;
  width: 16rpx;
  height: 10rpx;
}

.mirror-3 .reflection-cheek.ck-l {
  left: 4rpx;
}

.mirror-3 .reflection-cheek.ck-r {
  right: 4rpx;
}

.reflection-mouth {
  position: absolute;
  bottom: 22rpx;
  width: 24rpx;
  height: 12rpx;
  border: 4rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 30rpx 30rpx;
}

.mirror-1 .reflection-mouth {
  right: 24rpx;
}

.mirror-2 .reflection-mouth {
  left: 24rpx;
  background: var(--dopamine-text);
  border: none;
  height: 14rpx;
  border-radius: 0 0 16rpx 16rpx;
}

.mirror-3 .reflection-mouth {
  left: 50%;
  bottom: 14rpx;
  width: 18rpx;
  height: 9rpx;
  border-width: 3rpx;
  transform: translateX(-50%);
}

.reflection-gloss {
  position: absolute;
  top: 14rpx;
  width: 28rpx;
  height: 14rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.mirror-1 .reflection-gloss {
  left: 18rpx;
}

.mirror-2 .reflection-gloss {
  right: 18rpx;
}

.mirror-3 .reflection-gloss {
  top: 10rpx;
  left: 12rpx;
  width: 22rpx;
  height: 12rpx;
}

.mirror-shine {
  position: absolute;
  top: 14rpx;
  left: 16rpx;
  width: 46rpx;
  height: 92rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.05));
  border-radius: 26rpx;
  transform: rotate(18deg);
}

.mirror-3 .mirror-shine {
  width: 36rpx;
  height: 70rpx;
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
