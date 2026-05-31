<template>
  <view class="persona-container">
    <view class="header">
      <text class="page-title">我的数字人</text>
      <view class="add-btn" @click="createPersona" v-if="personaStore.canCreateMore">
        <text>+ 添加</text>
      </view>
    </view>

    <view class="persona-list" v-if="personaStore.personas.length > 0">
      <view
        v-for="persona in personaStore.personas"
        :key="persona.id"
        class="persona-card"
        :class="{ active: persona.isActive }"
        @click="selectPersona(persona)"
      >
        <view class="persona-avatar">
          <text>{{ persona.complementMbti }}</text>
        </view>
        <view class="persona-info">
          <text class="persona-name">{{ persona.name }}</text>
          <text class="persona-type">互补类型：{{ persona.complementMbti }}</text>
          <text class="persona-level">互补度 {{ persona.complementLevel }}%</text>
        </view>
        <view class="persona-check" v-if="persona.isActive">✓</view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🤖</text>
      <text class="empty-text">还没有数字人</text>
      <button class="create-btn" @click="createPersona">创建第一个</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePersonaStore } from '../../stores/persona'
import { onMounted } from 'vue'

const personaStore = usePersonaStore()

onMounted(() => {
  personaStore.loadFromStorage()
})

function selectPersona(persona: any) {
  personaStore.switchPersona(persona.id)
  uni.navigateTo({
    url: '/pages/chat-list/index'
  })
}

function createPersona() {
  if (!personaStore.isTestCompleted) {
    uni.showModal({
      title: '提示',
      content: '请先完成MBTI测试',
      showCancel: false
    })
    uni.navigateTo({
      url: '/pages/mbti-test/index'
    })
    return
  }
  uni.navigateTo({
    url: '/pages/persona-create/index'
  })
}
</script>

<style scoped>
.persona-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.add-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 32rpx;
  font-size: 28rpx;
}

.persona-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.persona-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 32rpx;
  border: 4rpx solid transparent;
}

.persona-card.active {
  border-color: #667eea;
}

.persona-avatar {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.persona-info {
  flex: 1;
}

.persona-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.persona-type {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.persona-level {
  display: block;
  font-size: 24rpx;
  color: #667eea;
}

.persona-check {
  width: 64rpx;
  height: 64rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.empty-state {
  text-align: center;
  padding: 200rpx 0;
}

.empty-icon {
  display: block;
  font-size: 160rpx;
  margin-bottom: 48rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 48rpx;
}

.create-btn {
  width: 400rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
}
</style>
