<template>
  <view class="profile-container" v-if="persona">
    <view class="hero-card">
      <view class="hero-avatar">
        <text>{{ persona.complementMbti }}</text>
      </view>
      <text class="hero-name">{{ persona.name }}</text>
      <text class="hero-mbti">互补人格 · {{ persona.complementMbti }} · 互补度 {{ persona.complementLevel }}%</text>
      <view class="hero-tags" v-if="persona.tags && persona.tags.length">
        <text class="hero-tag" v-for="tag in persona.tags" :key="tag">{{ tag }}</text>
      </view>
      <view class="hero-meta">
        <text class="hero-meta-item">成长 Lv.{{ persona.growthLevel }}</text>
        <text class="hero-meta-item">对话 {{ persona.totalConversations }} 次</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">人格画像</text>
      <text class="section-desc">他是怎样看世界的：</text>
      <view class="dim-list">
        <view class="dim-item" v-for="d in mbtiDims" :key="d.letter">
          <text class="dim-letter">{{ d.letter }}</text>
          <text class="dim-name">{{ d.name }}</text>
          <text class="dim-desc">{{ d.description }}</text>
        </view>
      </view>
    </view>

    <view class="section-card" v-if="persona.complementBigFive">
      <text class="section-title">大五互补画像</text>
      <text class="section-desc">他在五个维度上的倾向（0=极低倾向，100=极高倾向）：</text>
      <view class="bigfive-list">
        <view class="bigfive-item" v-for="d in bigFiveDimList" :key="d">
          <view class="bigfive-head">
            <text class="bigfive-label">{{ bigFiveMeta[d].label }}</text>
            <text class="bigfive-value">{{ persona.complementBigFive[d] }}</text>
          </view>
          <view class="bigfive-track">
            <view class="bigfive-fill" :style="{ width: persona.complementBigFive[d] + '%' }"></view>
          </view>
          <text class="bigfive-meaning">{{ bigFiveMeaning(d) }}</text>
        </view>
      </view>
    </view>

    <view class="section-card" v-if="persona.communicationStyle">
      <text class="section-title">沟通风格</text>
      <view class="style-row">
        <text class="style-label">正式度</text>
        <text class="style-value">{{ formalityText }}</text>
      </view>
      <view class="style-row">
        <text class="style-label">语气</text>
        <text class="style-value">{{ persona.communicationStyle.tone.join('、') }}</text>
      </view>
      <view class="style-row">
        <text class="style-label">偏好</text>
        <text class="style-value">{{ persona.communicationStyle.signature }}</text>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">互补度使用指南</text>
      <view class="guide-list">
        <view class="guide-item" v-for="g in complementGuides" :key="g.range">
          <view class="guide-head">
            <text class="guide-range" :class="{ active: guideActive(g) }">{{ g.range }}</text>
            <text class="guide-name">{{ g.name }}</text>
          </view>
          <text class="guide-desc">{{ g.description }}</text>
        </view>
      </view>
      <text class="guide-tip">当前互补度 {{ persona.complementLevel }}%，可在对话中调整（每月限 1 次）。</text>
    </view>

    <view class="section-card">
      <text class="section-title">推荐使用场景</text>
      <view class="scene-list">
        <view class="scene-item" v-for="s in recommendedScenes" :key="s.title">
          <text class="scene-icon">{{ s.icon }}</text>
          <view class="scene-info">
            <text class="scene-title">{{ s.title }}</text>
            <text class="scene-desc">{{ s.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="section-title">使用成效</text>
      <text class="section-desc">给互补视角的每次回复点个赞或踩，这里会统计启发你的次数。</text>
      <view class="feedback-stats">
        <view class="stat-item">
          <text class="stat-icon">👍</text>
          <text class="stat-count">{{ persona.feedback.useful }}</text>
          <text class="stat-label">有帮助</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-icon">🤔</text>
          <text class="stat-count">{{ persona.feedback.miss }}</text>
          <text class="stat-label">没感觉</text>
        </view>
      </view>
      <view class="memory-list" v-if="persona.feedback.usefulSamples.length">
        <text class="memory-title">已记住的视角（会在后续对话中延续）</text>
        <view class="memory-item" v-for="(s, i) in persona.feedback.usefulSamples.slice(0, 3)" :key="i">
          <text class="memory-icon">👍</text>
          <text class="memory-text">{{ s.text }}</text>
          <text class="memory-count">×{{ s.count }}</text>
        </view>
      </view>
      <view class="memory-empty" v-else>
        <text>还没有点赞过的视角。去对话里给「有帮助」的回复点个👍，互补人格会记住并延续这种风格。</text>
      </view>
    </view>

    <view class="bottom-actions">
      <button class="action-btn chat" @click="startChat">开始对话</button>
      <button class="action-btn back" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePersonaStore, bigFiveMeta, bigFiveDims } from '../../stores/persona'

const personaStore = usePersonaStore()

const persona = ref<any>(null)

onLoad((options: any) => {
  personaStore.loadFromStorage()
  if (options?.id) {
    const found = personaStore.personas.find(p => p.id === options.id)
    if (found) {
      persona.value = found
      return
    }
  }
  persona.value = personaStore.activePersona
})

const bigFiveDimList = bigFiveDims

function bigFiveMeaning(d: keyof typeof bigFiveMeta): string {
  const meta = bigFiveMeta[d]
  const score = persona.value?.complementBigFive?.[d] ?? 50
  if (score >= 60) return meta.high
  if (score <= 40) return meta.low
  return '均衡'
}

const mbtiDims = computed(() => {
  const type = persona.value?.complementMbti || ''
  const dimMap: Record<string, { name: string; description: string }> = {
    E: { name: '外向', description: '从外界互动与表达中获得能量' },
    I: { name: '内向', description: '从独处思考与内省中获得能量' },
    S: { name: '感觉', description: '关注具体事实、细节与现实' },
    N: { name: '直觉', description: '关注可能性、模式与未来趋势' },
    T: { name: '思考', description: '以逻辑与利弊理性决策' },
    F: { name: '情感', description: '以价值观与关系温度决策' },
    J: { name: '判断', description: '偏好计划、结构与决断' },
    P: { name: '感知', description: '保持灵活、开放与即兴' },
  }
  return type.split('').map((letter: string) => ({
    letter,
    name: dimMap[letter]?.name || letter,
    description: dimMap[letter]?.description || '',
  }))
})

const formalityText = computed(() => {
  const map: Record<string, string> = { casual: '随和', neutral: '中性', formal: '正式' }
  return map[persona.value?.communicationStyle?.formality] || '中性'
})

const complementGuides = [
  { range: '20~40%', name: '温和互补', description: '差异轻微，像另一个你，适合日常倾诉与被理解。' },
  { range: '50~70%', name: '平衡互补', description: '差异适中，既给新视角又不颠覆认知，日常推荐。' },
  { range: '80%+', name: '强烈互补', description: '差异显著，观点冲击强，适合突破思维定式与重大决策。' },
]

function guideActive(g: any): boolean {
  const level = persona.value?.complementLevel ?? 50
  if (g.range === '20~40%') return level >= 20 && level <= 40
  if (g.range === '50~70%') return level >= 50 && level <= 70
  return level >= 80
}

const recommendedScenes = computed(() => {
  const userType = personaStore.userMbti || ''
  const type = persona.value?.complementMbti || ''
  const scenes: { icon: string; title: string; description: string }[] = []
  for (let i = 0; i < 4; i++) {
    if (userType[i] && type[i] && userType[i] !== type[i]) {
      const pair = [userType[i], type[i]].sort().join('')
      if (pair === 'NS') {
        scenes.push({ icon: '🔭', title: '视角拓展', description: '用直觉/感觉的差异，帮你看到细节之外的可能或落地路径。' })
      } else if (pair === 'FT') {
        scenes.push({ icon: '⚖️', title: '认知互补', description: '用思考/情感的差异，平衡理性与感性，适合重大抉择。' })
      } else if (pair === 'EI') {
        scenes.push({ icon: '🔋', title: '能量互补', description: '用内外向差异补能量，适合社交表达与自我复盘。' })
      } else if (pair === 'JP') {
        scenes.push({ icon: '🎯', title: '节奏互补', description: '用计划/灵活差异治拖延，适合目标拆解与执行规划。' })
      }
    }
  }
  if (!scenes.length) {
    scenes.push({ icon: '💬', title: '多面思考', description: '即使维度相同，也请它用不同角度帮你审视问题。' })
  }
  return scenes
})

function startChat() {
  if (persona.value) {
    personaStore.switchPersona(persona.value.id)
  }
  uni.navigateTo({ url: '/pages/chat-list/index' })
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
  padding-bottom: 240rpx;
}

.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  padding: 64rpx 48rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

.hero-avatar {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32rpx;
  font-size: 56rpx;
  font-weight: bold;
  color: #ffffff;
}

.hero-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.hero-mbti {
  display: block;
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24rpx;
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.hero-tag {
  padding: 8rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: 48rpx;
}

.hero-meta-item {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.section-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 48rpx;
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.section-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.dim-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.dim-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
}

.dim-letter {
  width: 72rpx;
  height: 72rpx;
  background: #667eea;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-right: 24rpx;
}

.dim-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 24rpx;
  width: 120rpx;
}

.dim-desc {
  flex: 1;
  font-size: 26rpx;
  color: #666666;
}

.bigfive-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.bigfive-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.bigfive-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.bigfive-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.bigfive-track {
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.bigfive-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 8rpx;
}

.bigfive-meaning {
  font-size: 24rpx;
  color: #999999;
}

.style-row {
  display: flex;
  padding: 20rpx 0;
}

.style-row:not(:last-child) {
  border-bottom: 2rpx solid #f0f0f0;
}

.style-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #999999;
}

.style-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.guide-item {
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
}

.guide-item.active {
  background: rgba(102, 126, 234, 0.08);
  border-color: #667eea;
}

.guide-head {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.guide-range {
  padding: 4rpx 16rpx;
  background: #e0e0e0;
  border-radius: 16rpx;
  font-size: 22rpx;
  font-weight: bold;
  color: #666666;
  margin-right: 16rpx;
}

.guide-range.active {
  background: #667eea;
  color: #ffffff;
}

.guide-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.guide-desc {
  display: block;
  font-size: 26rpx;
  color: #666666;
}

.guide-tip {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 24rpx;
}

.scene-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.scene-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
}

.scene-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.scene-info {
  flex: 1;
}

.scene-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.scene-desc {
  display: block;
  font-size: 26rpx;
  color: #666666;
}

.feedback-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 64rpx;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  display: block;
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.stat-count {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 2rpx;
  height: 80rpx;
  background: #e0e0e0;
}

.memory-list {
  margin-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 24rpx;
}

.memory-title {
  display: block;
  font-size: 26rpx;
  color: #764ba2;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.memory-item {
  display: flex;
  align-items: center;
  background: rgba(102, 126, 234, 0.06);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.memory-icon {
  font-size: 26rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.memory-text {
  flex: 1;
  font-size: 26rpx;
  color: #444444;
  line-height: 1.4;
}

.memory-count {
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.memory-empty {
  margin-top: 24rpx;
  padding: 24rpx;
  background: #f9f9f9;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #999999;
  line-height: 1.6;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 32rpx;
  padding: 40rpx;
  background: #ffffff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  height: 112rpx;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 56rpx;
  border: none;
}

.action-btn.chat {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.action-btn.back {
  background: #f5f5f5;
  color: #666666;
}
</style>
