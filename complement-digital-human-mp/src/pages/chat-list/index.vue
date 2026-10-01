<template>
  <view class="chat-container">
    <view class="header">
      <text class="page-title">对话</text>
    </view>

    <view class="persona-switcher" v-if="personaStore.activePersona" @click="showPersonaPicker = true">
      <view class="persona-avatar">
        <text>{{ personaStore.activePersona?.complementMbti || '' }}</text>
      </view>
      <view class="persona-info">
        <text class="persona-name">{{ personaStore.activePersona?.name || '' }}</text>
        <text class="persona-mbti">互补度 {{ personaStore.activePersona?.complementLevel || 0 }}%</text>
      </view>
      <text class="switch-icon">▼</text>
    </view>

    <view class="empty-state" v-if="sessionList.length === 0">
      <text class="empty-icon">💬</text>
      <text class="empty-title">开始对话</text>
      <text class="empty-desc">
        {{ personaStore.activePersona ? '与' + personaStore.activePersona.name + '开启第一段对话吧' : '请先创建数字人' }}
      </text>
      <button class="start-chat-btn" @click="startNewChat" v-if="personaStore.activePersona">
        开始对话
      </button>
      <button class="start-chat-btn" @click="goToPersona" v-else>
        去创建
      </button>
    </view>

    <view class="session-list" v-if="sessionList.length > 0">
      <view
        v-for="session in sessionList"
        :key="session.id"
        class="session-item"
        @click="openSession(session)"
      >
        <view class="session-avatar">
          <text>{{ session.title.slice(0, 1) }}</text>
        </view>
        <view class="session-info">
          <view class="session-title-row">
            <text class="session-title">{{ session.title }}</text>
            <text class="session-time">{{ formatSessionTime(session.updatedAt) }}</text>
          </view>
          <text class="session-preview">{{ session.preview || '暂无消息' }}</text>
        </view>
        <text class="session-delete" @click.stop="deleteSession(session)">🗑</text>
      </view>
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
            <text>{{ persona?.complementMbti || '' }}</text>
          </view>
          <view class="picker-info">
            <text class="picker-name">{{ persona?.name || '' }}</text>
            <text class="picker-desc">互补度 {{ persona?.complementLevel || 0 }}%</text>
          </view>
          <text class="picker-check" v-if="persona?.isActive">✓</text>
        </view>
        <button class="picker-close" @click="showPersonaPicker = false">关闭</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePersonaStore } from '../../stores/persona'
import { ensureSessions, loadSessions, removeSession, type ChatSessionMeta } from '../../utils/chatSessions'

const personaStore = usePersonaStore()

const showPersonaPicker = ref(false)
const sessionList = ref<ChatSessionMeta[]>([])

function refreshSessions() {
  const persona = personaStore.activePersona
  sessionList.value = persona ? loadSessions(persona.id) : []
}

onShow(() => {
  refreshSessions()
})

function selectPersona(persona: any) {
  personaStore.switchPersona(persona.id)
  showPersonaPicker.value = false
  refreshSessions()
}

function startNewChat() {
  const persona = personaStore.activePersona
  if (!persona) {
    uni.showToast({
      title: '请先创建数字人',
      icon: 'none'
    })
    return
  }
  ensureSessions(persona.id)
  uni.navigateTo({
    url: '/pages/chat-conversation/index?newSession=1'
  })
}

function openSession(session: ChatSessionMeta) {
  uni.navigateTo({
    url: `/pages/chat-conversation/index?sessionId=${session.id}`
  })
}

function deleteSession(session: ChatSessionMeta) {
  const persona = personaStore.activePersona
  if (!persona) return
  uni.showModal({
    title: '删除会话',
    content: `确定删除「${session.title}」吗？删除后不可恢复。`,
    confirmText: '删除',
    confirmColor: '#e74c3c',
    success: (res) => {
      if (res.confirm) {
        removeSession(persona.id, session.id)
        refreshSessions()
        uni.showToast({
          title: '已删除',
          icon: 'none'
        })
      }
    }
  })
}

function formatSessionTime(timeStr: string): string {
  const d = new Date(timeStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays <= 0) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
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
  padding-bottom: 240rpx;
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
  padding: 200rpx 40rpx;
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

.session-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.session-item {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.session-avatar {
  width: 88rpx;
  height: 88rpx;
  background: rgba(102, 126, 234, 0.12);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.session-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 16rpx;
}

.session-time {
  font-size: 24rpx;
  color: #bbbbbb;
  flex-shrink: 0;
}

.session-preview {
  display: block;
  font-size: 28rpx;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-delete {
  font-size: 36rpx;
  margin-left: 24rpx;
  padding: 16rpx;
  flex-shrink: 0;
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