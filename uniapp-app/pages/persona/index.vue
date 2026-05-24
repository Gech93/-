<template>
  <view class="persona-container">
    <!-- 顶部提示 -->
    <view class="tips-section" v-if="!personaStore.isTestCompleted">
      <text>完成MBTI测试，创建你的互补数字人</text>
      <button class="tips-btn" @click="goToTest">去测试</button>
    </view>

    <!-- MBTI档案卡片 -->
    <view class="mbti-card" v-if="personaStore.userMbti">
      <view class="mbti-header">
        <view class="mbti-icon">🧠</view>
        <view class="mbti-info">
          <text class="mbti-label">你的MBTI</text>
          <text class="mbti-type">{{ personaStore.userMbti }}</text>
        </view>
        <button class="retest-btn" @click="handleRetest">重新测试</button>
      </view>
    </view>

    <!-- 人格档案列表 -->
    <view class="persona-list">
      <view class="section-header">
        <text class="section-title">我的数字人</text>
        <text class="persona-count">{{ personaStore.personaCount }} / 5</text>
      </view>

      <!-- 人格卡片 -->
      <view
        v-for="persona in personaStore.personas"
        :key="persona.id"
        class="persona-card"
        :class="{ active: persona.isActive }"
        @click="handleSelect(persona)"
      >
        <view class="persona-header">
          <view class="persona-avatar">
            <text>{{ persona.complementMbti }}</text>
          </view>
          <view class="persona-info">
            <text class="persona-name">{{ persona.name }}</text>
            <text class="persona-mbti">互补类型：{{ persona.complementMbti }}</text>
          </view>
          <view class="persona-badge" v-if="persona.isActive">
            <text>使用中</text>
          </view>
        </view>

        <view class="persona-stats">
          <view class="stat-item">
            <text class="stat-value">{{ persona.complementLevel }}%</text>
            <text class="stat-label">互补度</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ persona.totalConversations }}</text>
            <text class="stat-label">对话次数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">Lv.{{ persona.growthLevel }}</text>
            <text class="stat-label">成长等级</text>
          </view>
        </view>

        <view class="persona-actions">
          <button class="action-btn" @click.stop="handleChat(persona)">开始对话</button>
          <button class="action-btn secondary" @click.stop="handleDelete(persona)">删除</button>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="personaStore.personas.length === 0 && personaStore.isTestCompleted">
        <text class="empty-icon">🤖</text>
        <text class="empty-text">还没有创建数字人</text>
        <text class="empty-hint">创建一个与你互补的数字人伴侣</text>
      </view>
    </view>

    <!-- 创建新人格按钮 -->
    <view class="create-section" v-if="personaStore.canCreateMore && personaStore.isTestCompleted">
      <button class="create-btn" @click="goToCreate">
        <text>＋</text>
        <text>创建新人格</text>
      </button>
    </view>

    <!-- 提示信息 -->
    <view class="info-tip" v-if="personaStore.personaCount > 0">
      <text>💡 最多可创建5个人格，适用于不同场景</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePersonaStore, type Persona } from '@/stores/persona'

const personaStore = usePersonaStore()

function goToTest() {
  uni.navigateTo({
    url: '/pages/mbti/test',
  })
}

function goToCreate() {
  uni.navigateTo({
    url: '/pages/persona/create',
  })
}

function handleSelect(persona: Persona) {
  personaStore.switchPersona(persona.id)
  uni.showToast({
    title: '已切换为 ' + persona.name,
    icon: 'success',
  })
}

function handleChat(persona: Persona) {
  personaStore.switchPersona(persona.id)
  uni.switchTab({
    url: '/pages/chat/index',
  })
}

function handleDelete(persona: Persona) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${persona.name}"吗？`,
    success: (res) => {
      if (res.confirm) {
        personaStore.deletePersona(persona.id)
        uni.showToast({
          title: '已删除',
          icon: 'success',
        })
      }
    },
  })
}

function handleRetest() {
  uni.showModal({
    title: '重新测试',
    content: '重新测试会清空当前的人格档案，确定要继续吗？',
    success: (res) => {
      if (res.confirm) {
        personaStore.resetTest()
        uni.navigateTo({
          url: '/pages/mbti/test',
        })
      }
    },
  })
}

onShow(() => {
  personaStore.loadFromStorage()
})
</script>

<style lang="scss" scoped>
.persona-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.tips-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  
  text {
    font-size: 28rpx;
  }
}

.tips-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 26rpx;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  border: none;
}

.mbti-card {
  background: #ffffff;
  margin: 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.mbti-header {
  display: flex;
  align-items: center;
}

.mbti-icon {
  width: 80rpx;
  height: 80rpx;
  background: #667eea;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 40rpx;
  }
}

.mbti-info {
  flex: 1;
}

.mbti-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.mbti-type {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.retest-btn {
  background: #f5f5f5;
  color: #667eea;
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  border: none;
}

.persona-list {
  padding: 0 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.persona-count {
  font-size: 24rpx;
  color: #999999;
}

.persona-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  &.active {
    border: 2rpx solid #667eea;
  }
}

.persona-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.persona-avatar {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.persona-info {
  flex: 1;
}

.persona-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.persona-mbti {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.persona-badge {
  background: #667eea;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  
  text {
    font-size: 22rpx;
    color: #ffffff;
  }
}

.persona-stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 24rpx;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: #999999;
}

.persona-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  height: 72rpx;
  background: #667eea;
  color: #ffffff;
  font-size: 28rpx;
  border-radius: 36rpx;
  border: none;
  
  &.secondary {
    background: #f5f5f5;
    color: #666666;
  }
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  display: block;
  font-size: 80rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-hint {
  display: block;
  font-size: 26rpx;
  color: #999999;
}

.create-section {
  padding: 30rpx;
}

.create-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  
  text:first-child {
    font-size: 40rpx;
  }
}

.info-tip {
  text-align: center;
  padding: 20rpx;
  
  text {
    font-size: 24rpx;
    color: #999999;
  }
}
</style>
