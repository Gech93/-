<template>
  <view class="chat-container">
    <view class="header">
      <text class="page-title">对话</text>
    </view>

    <view class="persona-switcher" v-if="personaStore.activePersona" @click="showPersonaPicker = true">
      <view class="persona-avatar">
        <text>{{ personaStore.activePersona.complementMbti }}</text>
      </view>
      <view class="persona-info">
        <text class="persona-name">{{ personaStore.activePersona.name }}</text>
        <text class="persona-mbti">互补度 {{ personaStore.activePersona.complementLevel }}%</text>
      </view>
      <text class="switch-icon">▼</text>
    </view>

    <view class="empty-state" v-if="!hasConversations">
      <text class="empty-icon">💬</text>
      <text class="empty-title">开始对话</text>
      <text class="empty-desc">
        {{ personaStore.activePersona ? '与' + personaStore.activePersona.name + '开始对话吧' : '请先创建数字人' }}
      </text>
      <button class="start-chat-btn" @click="startNewChat" v-if="personaStore.activePersona">
        开始对话
      </button>
      <button class="start-chat-btn" @click="goToPersona" v-else>
        去创建
      </button>
    </view>

    <view class="new-chat-section" v-if="personaStore.activePersona">
      <button class="new-chat-btn" @click="startNewChat">
        <text>+</text>
        <text>新建对话</text>
      </button>
    </view>

    <view class="persona-picker" v-if="showPersonaPicker" @click="showPersonaPicker = false">
      <view class="picker-content" @click.stop>
        <text class="picker-title">选择数字人</text>
        <view
          v-for="persona in personaStore.personas"
          :key="persona.id"
          class="picker-item"
          :class="{ active: persona.isActive }"
          @click="selectPersona(persona)"
        >
          <view class="picker-avatar">
            <text>{{ persona.complementMbti }}</text>
          </view>
          <view class="picker-info">
            <text class="picker-name">{{ persona.name }}</text>
            <text class="picker-desc">互补度 {{ persona.complementLevel }}%</text>
          </view>
          <text class="picker-check" v-if="persona.isActive">✓</text>
        </view>
        <button class="picker-close" @click="showPersonaPicker = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersonaStore } from '../../stores/persona'

const personaStore = usePersonaStore()

const showPersonaPicker = ref(false)
const hasConversations = ref(false)

function selectPersona(persona: any) {
  personaStore.switchPersona(persona.id)
  showPersonaPicker.value = false
}

function startNewChat() {
  if (!personaStore.activePersona) {
    uni.showToast({
      title: '请先创建数字人',
      icon: 'none'
    })
    return
  }
  uni.navigateTo({
    url: '/pages/chat-conversation/index'
  })
}

function goToPersona() {
  uni.navigateTo({
    url: '/pages/persona-list/index'
  })
}
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.header {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.persona-switcher {
  background: #ffffff;
  padding: 40rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.persona-avatar {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
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

.persona-mbti {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.switch-icon {
  font-size: 28rpx;
  color: #999999;
  margin-left: 32rpx;
}

.empty-state {
  text-align: center;
  padding: 240rpx 40rpx;
}

.empty-icon {
  display: block;
  font-size: 160rpx;
  margin-bottom: 48rpx;
}

.empty-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

.empty-desc {
  display: block;
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 64rpx;
}

.start-chat-btn {
  width: 400rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
}

.new-chat-section {
  position: fixed;
  bottom: 160rpx;
  left: 32rpx;
  right: 32rpx;
}

.new-chat-btn {
  width: 100%;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 36rpx;
  font-weight: bold;
  border-radius: 56rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.new-chat-btn text:first-child {
  font-size: 48rpx;
}

.persona-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.picker-content {
  width: 100%;
  background: #ffffff;
  border-radius: 48rpx 48rpx 0 0;
  padding: 64rpx 48rpx;
  max-height: 70vh;
}

.picker-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 48rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 32rpx;
  margin-bottom: 24rpx;
  border: 4rpx solid transparent;
}

.picker-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.picker-avatar {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.picker-info {
  flex: 1;
}

.picker-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.picker-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

.picker-check {
  width: 64rpx;
  height: 64rpx;
  background: #667eea;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.picker-close {
  width: 100%;
  height: 112rpx;
  background: #f5f5f5;
  color: #666666;
  font-size: 36rpx;
  border-radius: 56rpx;
  border: none;
  margin-top: 48rpx;
}
</style>
