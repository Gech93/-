<template>
  <view class="chat-container">
    <!-- 人格切换器 -->
    <view class="persona-switcher" v-if="personaStore.activePersona" @click="showPersonaPicker">
      <view class="persona-avatar">
        <text>{{ personaStore.activePersona.complementMbti }}</text>
      </view>
      <view class="persona-info">
        <text class="persona-name">{{ personaStore.activePersona.name }}</text>
        <text class="persona-mbti">互补度 {{ personaStore.activePersona.complementLevel }}%</text>
      </view>
      <text class="switch-icon">▼</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!hasConversations">
      <view class="empty-illustration">
        <text>💬</text>
      </view>
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

    <!-- 对话列表 -->
    <view class="conversation-list" v-else>
      <view
        v-for="conv in conversationList"
        :key="conv.id"
        class="conversation-item"
        @click="openConversation(conv)"
      >
        <view class="conv-avatar">
          <text>{{ personaStore.activePersona?.complementMbti }}</text>
        </view>
        <view class="conv-content">
          <view class="conv-header">
            <text class="conv-title">{{ conv.title || '新对话' }}</text>
            <text class="conv-time">{{ formatTime(conv.updatedAt) }}</text>
          </view>
          <text class="conv-preview">{{ conv.lastMessage }}</text>
        </view>
        <view class="conv-actions">
          <button class="delete-btn" @click.stop="deleteConversation(conv)">删除</button>
        </view>
      </view>
    </view>

    <!-- 新建对话按钮 -->
    <view class="new-chat-section" v-if="hasConversations && personaStore.activePersona">
      <button class="new-chat-btn" @click="startNewChat">
        <text>+</text>
        <text>新建对话</text>
      </button>
    </view>

    <!-- 人格选择弹窗 -->
    <view class="persona-picker" v-if="showPicker" @click="showPicker = false">
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
          <view class="picker-check" v-if="persona.isActive">✓</view>
        </view>
        <button class="picker-close" @click="showPicker = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePersonaStore } from '@/stores/persona'
import { useConversation } from '@/stores/conversation'

const personaStore = usePersonaStore()
const conversation = useConversation()

const showPicker = ref(false)

// 模拟对话列表数据
const conversationList = ref([
  {
    id: '1',
    title: '关于职业选择',
    lastMessage: '我觉得应该多尝试一些不同的方向...',
    updatedAt: new Date(),
  },
])

const hasConversations = computed(() => conversationList.value.length > 0)

function showPersonaPicker() {
  showPicker.value = true
}

function selectPersona(persona: any) {
  personaStore.switchPersona(persona.id)
  showPicker.value = false
}

function startNewChat() {
  uni.navigateTo({
    url: '/pages/chat/conversation',
  })
}

function openConversation(conv: any) {
  uni.navigateTo({
    url: '/pages/chat/conversation?conversationId=' + conv.id,
  })
}

function deleteConversation(conv: any) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个对话吗？',
    success: (res) => {
      if (res.confirm) {
        const index = conversationList.value.findIndex(c => c.id === conv.id)
        if (index > -1) {
          conversationList.value.splice(index, 1)
        }
      }
    },
  })
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

function goToPersona() {
  uni.switchTab({
    url: '/pages/persona/index',
  })
}

onShow(() => {
  personaStore.loadFromStorage()
  conversation.loadFromStorage()
})
</script>

<style lang="scss" scoped>
.chat-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.persona-switcher {
  background: #ffffff;
  padding: 30rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.persona-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 28rpx;
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
  margin-bottom: 6rpx;
}

.persona-mbti {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.switch-icon {
  font-size: 24rpx;
  color: #999999;
  margin-left: 20rpx;
}

.empty-state {
  padding: 200rpx 40rpx;
  text-align: center;
}

.empty-illustration {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.empty-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.start-chat-btn {
  width: 300rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
}

.conversation-list {
  padding: 20rpx 30rpx;
}

.conversation-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.conv-avatar {
  width: 96rpx;
  height: 96rpx;
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

.conv-content {
  flex: 1;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.conv-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.conv-time {
  font-size: 22rpx;
  color: #999999;
}

.conv-preview {
  display: block;
  font-size: 26rpx;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-actions {
  margin-left: 20rpx;
}

.delete-btn {
  background: #f5f5f5;
  color: #999999;
  font-size: 22rpx;
  padding: 10rpx 16rpx;
  border-radius: 12rpx;
  border: none;
}

.new-chat-section {
  position: fixed;
  bottom: 30rpx;
  left: 30rpx;
  right: 30rpx;
}

.new-chat-btn {
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
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 30rpx;
  max-height: 70vh;
}

.picker-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 40rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f5f5f5;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  
  &.active {
    background: rgba(102, 126, 234, 0.1);
    border: 2rpx solid #667eea;
  }
}

.picker-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 28rpx;
    font-weight: bold;
    color: #ffffff;
  }
}

.picker-info {
  flex: 1;
}

.picker-name {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 6rpx;
}

.picker-desc {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.picker-check {
  width: 48rpx;
  height: 48rpx;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28rpx;
}

.picker-close {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  color: #666666;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  margin-top: 30rpx;
}
</style>
