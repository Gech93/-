<template>
  <view class="index-container">
    <view class="hero-section">
      <view class="mascot-scene">
        <view class="scene-platform"></view>

        <view class="connect-line conn-1"></view>
        <view class="connect-line conn-2"></view>
        <view class="connect-line conn-3"></view>
        <view class="connect-dot dot-1"></view>
        <view class="connect-dot dot-2"></view>
        <view class="connect-dot dot-3"></view>

        <view class="hero-mascot">
          <!-- 麻薯团子：圆润团子 + 奶油顶 -->
          <view v-if="mascot === 'mochi'" class="mochi-body">
            <view class="mochi-cream"></view>
            <view class="mochi-eye eye-left"></view>
            <view class="mochi-eye eye-right"></view>
            <view class="mochi-cheek cheek-left"></view>
            <view class="mochi-cheek cheek-right"></view>
            <view class="mochi-mouth"></view>
          </view>
          <!-- 果冻布丁：杯体 + 焦糖顶 + 樱桃 -->
          <view v-else-if="mascot === 'pudding'" class="pudding-body">
            <view class="pudding-caramel"></view>
            <view class="pudding-cherry"></view>
            <view class="pudding-eye eye-left"></view>
            <view class="pudding-eye eye-right"></view>
            <view class="pudding-cheek cheek-left"></view>
            <view class="pudding-cheek cheek-right"></view>
            <view class="pudding-mouth"></view>
            <view class="pudding-gloss"></view>
          </view>
          <!-- 小水母：半透明伞盖 + 触手 -->
          <view v-else class="jellyfish-body">
            <view class="jellyfish-eye eye-left"></view>
            <view class="jellyfish-eye eye-right"></view>
            <view class="jellyfish-cheek cheek-left"></view>
            <view class="jellyfish-cheek cheek-right"></view>
            <view class="jellyfish-mouth"></view>
          </view>
          <view v-if="mascot === 'jellyfish'" class="jellyfish-tentacle t-1"></view>
          <view v-if="mascot === 'jellyfish'" class="jellyfish-tentacle t-2"></view>
          <view v-if="mascot === 'jellyfish'" class="jellyfish-tentacle t-3"></view>
        </view>

        <view class="mirror mirror-1">
          <view class="mirror-frame">
            <view class="mirror-glass">
              <view class="reflection-slime">
                <view v-if="mascot === 'mochi'" class="reflection-body rm-mochi">
                  <view class="reflection-cream"></view>
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else-if="mascot === 'pudding'" class="reflection-body rm-pudding">
                  <view class="reflection-caramel"></view>
                  <view class="reflection-cherry"></view>
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else class="reflection-body rm-jellyfish">
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                  <view class="reflection-tentacle rt-1"></view>
                  <view class="reflection-tentacle rt-2"></view>
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
                <view v-if="mascot === 'mochi'" class="reflection-body rm-mochi">
                  <view class="reflection-cream"></view>
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else-if="mascot === 'pudding'" class="reflection-body rm-pudding">
                  <view class="reflection-caramel"></view>
                  <view class="reflection-cherry"></view>
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else class="reflection-body rm-jellyfish">
                  <view class="reflection-eye"></view>
                  <view class="reflection-cheek"></view>
                  <view class="reflection-mouth"></view>
                  <view class="reflection-tentacle rt-1"></view>
                  <view class="reflection-tentacle rt-2"></view>
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
                <view v-if="mascot === 'mochi'" class="reflection-body rm-mochi">
                  <view class="reflection-cream"></view>
                  <view class="reflection-eye eye-l"></view>
                  <view class="reflection-eye eye-r"></view>
                  <view class="reflection-cheek ck-l"></view>
                  <view class="reflection-cheek ck-r"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else-if="mascot === 'pudding'" class="reflection-body rm-pudding">
                  <view class="reflection-caramel"></view>
                  <view class="reflection-cherry"></view>
                  <view class="reflection-eye eye-l"></view>
                  <view class="reflection-eye eye-r"></view>
                  <view class="reflection-cheek ck-l"></view>
                  <view class="reflection-cheek ck-r"></view>
                  <view class="reflection-mouth"></view>
                </view>
                <view v-else class="reflection-body rm-jellyfish">
                  <view class="reflection-eye eye-l"></view>
                  <view class="reflection-eye eye-r"></view>
                  <view class="reflection-cheek ck-l"></view>
                  <view class="reflection-cheek ck-r"></view>
                  <view class="reflection-mouth"></view>
                  <view class="reflection-tentacle rt-1"></view>
                  <view class="reflection-tentacle rt-2"></view>
                  <view class="reflection-tentacle rt-3"></view>
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

      <text class="mascot-name">{{ mascotLabel }}</text>
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
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const personaStore = usePersonaStore()

const MASCOT_NAMES: Record<string, string> = {
  mochi: '麻薯团子',
  pudding: '果冻布丁',
  jellyfish: '小水母',
}

const mascot = ref('mochi')

const mascotLabel = computed(() => MASCOT_NAMES[mascot.value] || MASCOT_NAMES.mochi)

onLoad((options) => {
  const key = options && options.mascot
  if (typeof key === 'string' && key in MASCOT_NAMES) {
    mascot.value = key
  }
})

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
.mascot-scene {
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

/* 主体容器：居中的「一个你」 */
.hero-mascot {
  position: absolute;
  left: 50%;
  bottom: 40rpx;
  width: 224rpx;
  height: 224rpx;
  transform: translateX(-50%);
}

/* ===== 形象一：麻薯团子 ===== */
.mochi-body {
  position: absolute;
  inset: 0;
  border-radius: 50% 50% 46% 46% / 56% 56% 44% 44%;
  background: linear-gradient(160deg, #fffdf7 0%, #ffe9f1 55%, #ffc7da 100%);
  box-shadow: inset 0 -24rpx 48rpx rgba(255, 122, 165, 0.28),
    0 24rpx 48rpx rgba(255, 107, 157, 0.4), 0 0 0 6rpx rgba(255, 255, 255, 0.28);
  animation: mochi-bounce 3s ease-in-out infinite;
}

@keyframes mochi-bounce {
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

.mochi-cream {
  position: absolute;
  top: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 128rpx;
  height: 50rpx;
  z-index: 2;
  border-radius: 50% 50% 46% 46% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, #ff9dc4 0%, #f55c92 100%);
  box-shadow: inset 0 6rpx 12rpx rgba(255, 255, 255, 0.35),
    inset 0 -8rpx 14rpx rgba(255, 255, 255, 0.25),
    0 8rpx 16rpx rgba(245, 92, 146, 0.25);
}

.mochi-cream::before {
  content: '';
  position: absolute;
  top: -16rpx;
  left: 2rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50% 50% 46% 46% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, #ff9dc4 0%, #f55c92 100%);
  box-shadow: inset 0 4rpx 8rpx rgba(255, 255, 255, 0.3);
}

.mochi-cream::after {
  content: '';
  position: absolute;
  top: -16rpx;
  right: 2rpx;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50% 50% 46% 46% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, #ff9dc4 0%, #f55c92 100%);
  box-shadow: inset 0 4rpx 8rpx rgba(255, 255, 255, 0.3);
}

/* ===== 形象二：果冻布丁 ===== */
.pudding-body {
  position: absolute;
  inset: 0;
  border-radius: 34% 34% 48% 48% / 18% 18% 42% 42%;
  background: linear-gradient(160deg, #fff3f7 0%, #ffd3e2 55%, #f6a6c8 100%);
  box-shadow: inset 0 -20rpx 40rpx rgba(246, 166, 200, 0.35),
    0 24rpx 48rpx rgba(255, 107, 157, 0.4), 0 0 0 6rpx rgba(255, 255, 255, 0.28);
  animation: pudding-wiggle 3.2s ease-in-out infinite;
}

@keyframes pudding-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  60% {
    transform: rotate(3deg) translateY(-4rpx);
  }
}

.pudding-caramel {
  position: absolute;
  top: -8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 210rpx;
  height: 44rpx;
  z-index: 3;
  border-radius: 50% 50% 30% 30% / 72% 72% 28% 28%;
  background: linear-gradient(180deg, #ffc268 0%, #ec8f3b 100%);
  box-shadow: inset 0 -6rpx 10rpx rgba(255, 255, 255, 0.35),
    0 6rpx 12rpx rgba(210, 120, 40, 0.3);
}

.pudding-caramel::after {
  content: '';
  position: absolute;
  right: 34rpx;
  bottom: -8rpx;
  width: 14rpx;
  height: 18rpx;
  background: #ec8f3b;
  border-radius: 0 0 12rpx 12rpx;
}

.pudding-cherry {
  position: absolute;
  top: -14rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  width: 30rpx;
  height: 30rpx;
  background: #ff4d6d;
  border-radius: 50%;
  box-shadow: inset -4rpx -6rpx 8rpx rgba(160, 30, 60, 0.35);
}

.pudding-cherry::before {
  content: '';
  position: absolute;
  top: 5rpx;
  left: 6rpx;
  width: 8rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.pudding-cherry::after {
  content: '';
  position: absolute;
  top: -18rpx;
  left: 22rpx;
  width: 4rpx;
  height: 16rpx;
  background: rgba(120, 80, 40, 0.85);
  border-radius: 2rpx;
  transform: rotate(24deg);
}

.pudding-gloss {
  position: absolute;
  top: 64rpx;
  left: 26rpx;
  width: 56rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: rotate(-18deg);
}

/* ===== 形象三：小水母 ===== */
.jellyfish-body {
  position: absolute;
  top: 0;
  left: 50%;
  width: 200rpx;
  height: 132rpx;
  border-radius: 50% 50% 42% 42% / 68% 68% 32% 32%;
  background: linear-gradient(170deg, rgba(255, 255, 255, 0.5) 0%,
      rgba(196, 181, 253, 0.55) 55%, rgba(167, 139, 250, 0.72) 100%);
  box-shadow: inset 0 -14rpx 22rpx rgba(255, 255, 255, 0.28),
    0 20rpx 36rpx rgba(167, 139, 250, 0.3);
  animation: jellyfish-float 3.6s ease-in-out infinite;
}

@keyframes jellyfish-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-14rpx) scale(1.03, 0.96);
  }
}

.jellyfish-body::after {
  content: '';
  position: absolute;
  top: 20rpx;
  left: 30rpx;
  width: 120rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: rotate(-8deg);
}

.jellyfish-tentacle {
  position: absolute;
  top: 118rpx;
  width: 12rpx;
  height: 80rpx;
  background: linear-gradient(180deg, rgba(167, 139, 250, 0.55), rgba(139, 92, 246, 0.65));
  border-radius: 0 0 16rpx 16rpx;
  transform-origin: top center;
  animation: tentacle-wave 3.6s ease-in-out infinite;
}

.jellyfish-tentacle::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6rpx;
  transform: translateX(-50%);
  width: 16rpx;
  height: 16rpx;
  background: rgba(139, 92, 246, 0.75);
  border-radius: 50%;
}

.t-1 {
  left: 58rpx;
  height: 68rpx;
}

.t-2 {
  left: 106rpx;
  height: 84rpx;
  animation-delay: 0.4s;
}

.t-3 {
  right: 58rpx;
  height: 72rpx;
  animation-delay: 0.8s;
}

@keyframes tentacle-wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  30% {
    transform: rotate(4deg);
  }
  70% {
    transform: rotate(-4deg);
  }
}

/* 五官（三形象共用基础样式） */
.mochi-eye,
.pudding-eye,
.jellyfish-eye {
  position: absolute;
  width: 42rpx;
  height: 52rpx;
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 -4rpx 8rpx rgba(45, 42, 62, 0.08);
}

.mochi-eye::after,
.pudding-eye::after,
.jellyfish-eye::after {
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

.mochi-eye {
  top: 104rpx;
}

.pudding-eye {
  top: 86rpx;
}

.jellyfish-eye {
  top: 38rpx;
}

.eye-left {
  left: 50rpx;
}

.eye-right {
  right: 50rpx;
}

.mochi-cheek,
.pudding-cheek,
.jellyfish-cheek {
  position: absolute;
  width: 36rpx;
  height: 20rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.mochi-cheek {
  top: 152rpx;
}

.pudding-cheek {
  top: 138rpx;
}

.jellyfish-cheek {
  top: 92rpx;
}

.cheek-left {
  left: 26rpx;
}

.cheek-right {
  right: 26rpx;
}

.mochi-mouth,
.pudding-mouth,
.jellyfish-mouth {
  position: absolute;
  left: 50%;
  width: 36rpx;
  height: 18rpx;
  border: 6rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 40rpx 40rpx;
  transform: translateX(-50%);
}

.mochi-mouth {
  bottom: 30rpx;
}

.pudding-mouth {
  bottom: 44rpx;
}

.jellyfish-mouth {
  bottom: 16rpx;
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
  background: linear-gradient(150deg, #93c5fd 0%, #60a5fa 55%, #2563eb 100%);
  animation-delay: 0.6s;
}

@keyframes mirror-glow {
  0%,
  100% {
    box-shadow: 0 20rpx 40rpx rgba(139, 92, 246, 0.32),
      inset 0 0 0 8rpx rgba(255, 255, 255, 0.28);
  }
  50% {
    box-shadow: 0 24rpx 48rpx rgba(139, 92, 246, 0.5),
      inset 0 0 0 10rpx rgba(255, 255, 255, 0.5);
  }
}

.mirror-glass {
  position: absolute;
  inset: 10rpx;
  border-radius: 50%;
  background: linear-gradient(170deg, rgba(255, 255, 255, 0.92) 0%,
      rgba(255, 255, 255, 0.6) 60%, rgba(230, 225, 255, 0.75) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mirror-1 .mirror-glass {
  background: linear-gradient(170deg, #e9e1ff 0%, #d6c9ff 60%, #b9a6ff 100%);
}

.mirror-2 .mirror-glass {
  background: linear-gradient(170deg, #ffe4ee 0%, #ffd3e3 60%, #ffb8d2 100%);
}

.mirror-3 .mirror-glass {
  background: linear-gradient(170deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%);
}

.mirror-base {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 22rpx;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  box-shadow: 0 6rpx 12rpx rgba(139, 92, 246, 0.25);
}

.mirror-3 .mirror-base {
  bottom: 12rpx;
  width: 78rpx;
  height: 18rpx;
}

.mirror-tag {
  position: absolute;
  bottom: -30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 150rpx;
  text-align: center;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 2rpx;
  white-space: nowrap;
}

.mirror-shine {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 46rpx;
  height: 92rpx;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 40rpx;
  transform: rotate(24deg);
}

.mirror-3 .mirror-shine {
  top: 18rpx;
  right: 16rpx;
  width: 34rpx;
  height: 70rpx;
}

/* ===== 镜中反射：源自主体，却并非主体 ===== */
.reflection-slime {
  position: absolute;
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
  border-radius: 50% 50% 46% 46% / 56% 56% 44% 44%;
  animation: reflect-breathe 3s ease-in-out infinite;
}

@keyframes reflect-breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.94);
  }
}

/* 团子反射：三镜不同配色 + 侧身轮廓 */
.rm-mochi {
  background: linear-gradient(160deg, #fffdf7 0%, #ffe9f1 55%, #ffc7da 100%);
  box-shadow: inset 0 -14rpx 28rpx rgba(255, 122, 165, 0.25),
    0 10rpx 20rpx rgba(139, 92, 246, 0.2);
}

.mirror-1 .rm-mochi {
  border-radius: 62% 38% 52% 48% / 58% 58% 42% 42%;
  background: linear-gradient(160deg, #f4efff 0%, #d6c9ff 55%, #b39cff 100%);
}

.mirror-2 .rm-mochi {
  border-radius: 38% 62% 48% 52% / 58% 58% 42% 42%;
  background: linear-gradient(160deg, #fff0f6 0%, #ffd3e3 55%, #ffaeca 100%);
}

.mirror-3 .rm-mochi {
  background: linear-gradient(160deg, #f0f7ff 0%, #dbeafe 55%, #93c5fd 100%);
}

/* 布丁反射：杯体 + 侧面轮廓 */
.rm-pudding {
  border-radius: 34% 34% 48% 48% / 18% 18% 42% 42%;
  background: linear-gradient(160deg, #fff3f7 0%, #ffd3e2 55%, #f6a6c8 100%);
  box-shadow: inset 0 -12rpx 24rpx rgba(246, 166, 200, 0.3),
    0 10rpx 20rpx rgba(139, 92, 246, 0.2);
}

.mirror-1 .rm-pudding {
  border-radius: 42% 34% 50% 46% / 18% 18% 42% 42%;
  background: linear-gradient(160deg, #f3edff 0%, #d6c9ff 55%, #b39cff 100%);
}

.mirror-2 .rm-pudding {
  border-radius: 34% 42% 46% 50% / 18% 18% 42% 42%;
  background: linear-gradient(160deg, #fff0f6 0%, #ffd3e3 55%, #f6a6c8 100%);
}

.mirror-3 .rm-pudding {
  background: linear-gradient(160deg, #f0f7ff 0%, #dbeafe 55%, #93c5fd 100%);
}

/* 水母反射：半透明伞盖（触手单独绘制） */
.rm-jellyfish {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 58%;
  border-radius: 50% 50% 42% 42% / 68% 68% 32% 32%;
  background: linear-gradient(170deg, rgba(255, 255, 255, 0.5) 0%,
      rgba(196, 181, 253, 0.6) 55%, rgba(167, 139, 250, 0.78) 100%);
  box-shadow: inset 0 -8rpx 14rpx rgba(255, 255, 255, 0.25);
  transform: translateX(-50%);
}

.mirror-1 .rm-jellyfish {
  background: linear-gradient(170deg, rgba(244, 239, 255, 0.75) 0%,
      rgba(185, 166, 255, 0.8) 55%, rgba(139, 92, 246, 0.82) 100%);
}

.mirror-2 .rm-jellyfish {
  background: linear-gradient(170deg, rgba(255, 240, 246, 0.75) 0%,
      rgba(255, 166, 202, 0.8) 55%, rgba(245, 92, 146, 0.82) 100%);
}

.mirror-3 .rm-jellyfish {
  background: linear-gradient(170deg, rgba(239, 246, 255, 0.8) 0%,
      rgba(147, 197, 253, 0.82) 55%, rgba(59, 130, 246, 0.88) 100%);
}

/* 反射：团子奶油顶 */
.reflection-cream {
  position: absolute;
  top: -4rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 62rpx;
  height: 36rpx;
  z-index: 2;
  border-radius: 50% 50% 46% 46% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, #d6c9ff 0%, #8b5cf6 100%);
  box-shadow: inset 0 -5rpx 8rpx rgba(255, 255, 255, 0.25);
}

.reflection-cream::before,
.reflection-cream::after {
  content: '';
  position: absolute;
  top: -12rpx;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50% 50% 46% 46% / 60% 60% 40% 40%;
  background: linear-gradient(180deg, #d6c9ff 0%, #8b5cf6 100%);
  box-shadow: inset 0 3rpx 6rpx rgba(255, 255, 255, 0.3);
}

.reflection-cream::before {
  left: 1rpx;
}

.reflection-cream::after {
  right: 1rpx;
}

.mirror-2 .reflection-cream,
.mirror-2 .reflection-cream::before,
.mirror-2 .reflection-cream::after {
  background: linear-gradient(180deg, #ff9dc4 0%, #f55c92 100%);
}

.mirror-3 .reflection-cream,
.mirror-3 .reflection-cream::before,
.mirror-3 .reflection-cream::after {
  background: linear-gradient(180deg, #93c5fd 0%, #3b82f6 100%);
}

/* 反射：布丁焦糖层 + 樱桃 */
.reflection-caramel {
  position: absolute;
  top: -6rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90rpx;
  height: 20rpx;
  z-index: 3;
  border-radius: 50% 50% 30% 30% / 72% 72% 28% 28%;
  background: linear-gradient(180deg, #ffc268 0%, #ec8f3b 100%);
  box-shadow: inset 0 -3rpx 5rpx rgba(255, 255, 255, 0.35);
}

.reflection-caramel::after {
  content: '';
  position: absolute;
  right: 14rpx;
  bottom: -4rpx;
  width: 6rpx;
  height: 8rpx;
  background: #ec8f3b;
  border-radius: 0 0 6rpx 6rpx;
}

.reflection-cherry {
  position: absolute;
  top: -12rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  width: 14rpx;
  height: 14rpx;
  background: #ff4d6d;
  border-radius: 50%;
  box-shadow: inset -2rpx -3rpx 4rpx rgba(160, 30, 60, 0.35);
}

.reflection-cherry::after {
  content: '';
  position: absolute;
  top: -10rpx;
  left: 10rpx;
  width: 2rpx;
  height: 8rpx;
  background: rgba(120, 80, 40, 0.85);
  border-radius: 1rpx;
  transform: rotate(24deg);
}

/* 反射：水母触手 */
.reflection-tentacle {
  position: absolute;
  top: 52%;
  width: 5rpx;
  height: 36rpx;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(139, 92, 246, 0.72));
  border-radius: 0 0 8rpx 8rpx;
  transform-origin: top center;
  animation: tentacle-wave 3.6s ease-in-out infinite;
}

.mirror-2 .reflection-tentacle {
  background: linear-gradient(180deg, rgba(245, 92, 146, 0.5), rgba(245, 92, 146, 0.72));
}

.mirror-3 .reflection-tentacle {
  background: linear-gradient(180deg, rgba(96, 165, 250, 0.5), rgba(37, 99, 235, 0.75));
}

.reflection-tentacle::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -3rpx;
  transform: translateX(-50%);
  width: 7rpx;
  height: 7rpx;
  background: rgba(139, 92, 246, 0.78);
  border-radius: 50%;
}

.mirror-2 .reflection-tentacle::after {
  background: rgba(245, 92, 146, 0.78);
}

.mirror-3 .reflection-tentacle::after {
  background: rgba(59, 130, 246, 0.78);
}

.rt-1 {
  left: 24rpx;
  height: 28rpx;
}

.rt-2 {
  left: 44rpx;
  height: 38rpx;
  animation-delay: 0.4s;
}

.rt-3 {
  right: 22rpx;
  height: 32rpx;
  animation-delay: 0.8s;
}

/* 反射：五官（侧身镜为单眼，正身镜为双眼） */
.reflection-eye {
  position: absolute;
  top: 40%;
  width: 16rpx;
  height: 20rpx;
  background: #fff;
  border-radius: 50%;
}

.reflection-eye::after {
  content: '';
  position: absolute;
  left: 60%;
  top: 55%;
  width: 7rpx;
  height: 9rpx;
  background: var(--dopamine-text);
  border-radius: 50%;
  transform: translate(-60%, -55%);
}

.mirror-1 .reflection-eye {
  left: 58%;
}

.mirror-1 .reflection-eye::before {
  content: '';
  position: absolute;
  left: -20rpx;
  top: 55%;
  width: 11rpx;
  height: 5rpx;
  border: 3rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 10rpx 10rpx;
  transform: translate(-50%, -55%);
}

.mirror-2 .reflection-eye {
  right: 58%;
}

.mirror-3 .reflection-eye.eye-l {
  left: 20rpx;
}

.mirror-3 .reflection-eye.eye-r {
  right: 20rpx;
}

.reflection-cheek {
  position: absolute;
  top: 58%;
  width: 14rpx;
  height: 8rpx;
  background: rgba(224, 49, 105, 0.35);
  border-radius: 50%;
}

.mirror-1 .reflection-cheek {
  left: 68%;
}

.mirror-2 .reflection-cheek {
  right: 68%;
}

.mirror-3 .reflection-cheek.ck-l {
  left: 12rpx;
}

.mirror-3 .reflection-cheek.ck-r {
  right: 12rpx;
}

.reflection-mouth {
  position: absolute;
  left: 50%;
  bottom: 24%;
  width: 16rpx;
  height: 8rpx;
  border: 3rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 20rpx 20rpx;
  transform: translateX(-50%);
}

.mirror-1 .reflection-mouth {
  width: 14rpx;
  height: 5rpx;
  bottom: 25%;
  border: 3rpx solid var(--dopamine-text);
  border-top: none;
  border-radius: 0 0 12rpx 12rpx;
  transform: translateX(-50%) rotate(14deg);
}

.mirror-2 .reflection-mouth {
  width: 20rpx;
  height: 10rpx;
  border-radius: 0 0 22rpx 22rpx;
  border: 3rpx solid var(--dopamine-text);
  border-top: none;
}

.reflection-gloss {
  position: absolute;
  top: 12%;
  left: 16%;
  width: 48rpx;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: rotate(-8deg);
}

/* 形象名称胶囊 */
.mascot-name {
  font-size: 30rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
  padding: 8rpx 28rpx;
  border-radius: 40rpx;
  margin-bottom: 18rpx;
  letter-spacing: 2rpx;
}

/* 主标题区 */
.hero-title {
  font-size: 80rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 6rpx;
  text-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.35);
}

.hero-subtitle {
  margin-top: 16rpx;
  font-size: 34rpx;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 4rpx;
}

.hero-caption {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  line-height: 1.6;
  padding: 0 24rpx;
}

/* 功能卡片 */
.features-section {
  width: 100%;
  margin-top: 48rpx;
  display: flex;
  justify-content: space-between;
}

.feature-card {
  flex: 1;
  background: var(--dopamine-card);
  border-radius: 24rpx;
  padding: 28rpx 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 12rpx 24rpx rgba(139, 92, 246, 0.18);
}

.feature-card + .feature-card {
  margin-left: 20rpx;
}

.feature-icon {
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.feature-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--dopamine-text);
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 20rpx;
  color: #9a93b5;
  text-align: center;
}

/* 行动区 */
.action-section {
  width: 100%;
  margin-top: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 120rpx;
}

.start-btn {
  width: 100%;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #ff9dc4 0%, #a78bfa 100%);
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  border: none;
  box-shadow: 0 16rpx 32rpx rgba(139, 92, 246, 0.35);
}

.start-btn::after {
  border: none;
}

.tips {
  margin-top: 20rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
}

.version-info {
  position: fixed;
  bottom: 32rpx;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .mochi-body,
  .pudding-body,
  .jellyfish-body,
  .jellyfish-tentacle,
  .reflection-body,
  .reflection-tentacle,
  .mirror-frame,
  .connect-dot {
    animation: none;
  }
}
</style>