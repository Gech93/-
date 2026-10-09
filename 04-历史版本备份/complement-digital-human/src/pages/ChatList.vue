<template>
  <div class="chat-container">
    <div class="header">
      <h1 class="page-title">对话</h1>
    </div>

    <div class="persona-switcher" v-if="personaStore.activePersona" @click="showPersonaPicker = true">
      <div class="persona-avatar">
        <span>{{ personaStore.activePersona.complementMbti }}</span>
      </div>
      <div class="persona-info">
        <span class="persona-name">{{ personaStore.activePersona.name }}</span>
        <span class="persona-mbti">互补度 {{ personaStore.activePersona.complementLevel }}%</span>
      </div>
      <span class="switch-icon">▼</span>
    </div>

    <div class="empty-state" v-if="!hasConversations">
      <div class="empty-illustration">💬</div>
      <p class="empty-title">开始对话</p>
      <p class="empty-desc">
        {{ personaStore.activePersona ? '与' + personaStore.activePersona.name + '开始对话吧' : '请先创建数字人' }}
      </p>
      <button class="start-chat-btn" @click="startNewChat" v-if="personaStore.activePersona">
        开始对话
      </button>
      <button class="start-chat-btn" @click="goToPersona" v-else>
        去创建
      </button>
    </div>

    <div class="conversation-list" v-else>
      <div
        v-for="conv in conversationList"
        :key="conv.id"
        class="conversation-item"
        @click="openConversation(conv)"
      >
        <div class="conv-avatar">
          <span>{{ personaStore.activePersona?.complementMbti }}</span>
        </div>
        <div class="conv-content">
          <div class="conv-header">
            <span class="conv-title">{{ conv.title || '新对话' }}</span>
            <span class="conv-time">{{ formatTime(conv.updatedAt) }}</span>
          </div>
          <span class="conv-preview">{{ conv.lastMessage }}</span>
        </div>
        <div class="conv-actions">
          <button class="delete-btn" @click.stop="deleteConversation(conv)">删除</button>
        </div>
      </div>
    </div>

    <div class="new-chat-section" v-if="hasConversations && personaStore.activePersona">
      <button class="new-chat-btn" @click="startNewChat">
        <span>+</span>
        <span>新建对话</span>
      </button>
    </div>

    <div class="persona-picker" v-if="showPersonaPicker" @click="showPersonaPicker = false">
      <div class="picker-content" @click.stop>
        <p class="picker-title">选择数字人</p>
        <div
          v-for="persona in personaStore.personas"
          :key="persona.id"
          class="picker-item"
          :class="{ active: persona.isActive }"
          @click="selectPersona(persona)"
        >
          <div class="picker-avatar">
            <span>{{ persona.complementMbti }}</span>
          </div>
          <div class="picker-info">
            <span class="picker-name">{{ persona.name }}</span>
            <span class="picker-desc">互补度 {{ persona.complementLevel }}%</span>
          </div>
          <div class="picker-check" v-if="persona.isActive">✓</div>
        </div>
        <button class="picker-close" @click="showPersonaPicker = false">关闭</button>
      </div>
    </div>

    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'
import { useConversation } from '../stores/conversation'
import TabBar from '../components/TabBar.vue'

const router = useRouter()
const personaStore = usePersonaStore()
const conversation = useConversation()

const showPersonaPicker = ref(false)
const conversationList = ref([
  {
    id: '1',
    title: '关于职业选择',
    lastMessage: '我觉得应该多尝试一些不同的方向...',
    updatedAt: new Date(),
  },
])

const hasConversations = computed(() => conversationList.value.length > 0)

function selectPersona(persona: any) {
  personaStore.switchPersona(persona.id)
  showPersonaPicker.value = false
}

function startNewChat() {
  router.push('/chat/conversation')
}

function openConversation(conv: any) {
  router.push('/chat/conversation')
}

function deleteConversation(conv: any) {
  if (confirm('确定要删除这个对话吗？')) {
    const index = conversationList.value.findIndex(c => c.id === conv.id)
    if (index > -1) {
      conversationList.value.splice(index, 1)
    }
  }
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
  router.push('/persona')
}
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  padding-bottom: 100px;
}

.header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #333333;
}

.persona-switcher {
  background: #ffffff;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.persona-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.persona-info {
  flex: 1;
}

.persona-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.persona-mbti {
  display: block;
  font-size: 14px;
  color: #999999;
}

.switch-icon {
  font-size: 14px;
  color: #999999;
  margin-left: 16px;
}

.empty-state {
  text-align: center;
  padding: 120px 20px;
}

.empty-illustration {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 16px;
  color: #999999;
  margin-bottom: 32px;
}

.start-chat-btn {
  padding: 16px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border-radius: 28px;
  border: none;
}

.conversation-list {
  margin-bottom: 20px;
}

.conversation-item {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.conv-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 22px;
  font-weight: bold;
  color: #ffffff;
}

.conv-content {
  flex: 1;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conv-title {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
}

.conv-time {
  font-size: 12px;
  color: #999999;
}

.conv-preview {
  display: block;
  font-size: 14px;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-actions {
  margin-left: 16px;
}

.delete-btn {
  background: #f5f5f5;
  color: #999999;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  border: none;
}

.new-chat-section {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
}

.new-chat-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border-radius: 28px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.new-chat-btn span:first-child {
  font-size: 24px;
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
  border-radius: 24px 24px 0 0;
  padding: 32px 24px;
  max-height: 70vh;
}

.picker-title {
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 24px;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 2px solid transparent;
}

.picker-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.picker-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.picker-info {
  flex: 1;
}

.picker-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4px;
}

.picker-desc {
  display: block;
  font-size: 14px;
  color: #999999;
}

.picker-check {
  width: 32px;
  height: 32px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
}

.picker-close {
  width: 100%;
  height: 56px;
  background: #f5f5f5;
  color: #666666;
  font-size: 18px;
  border-radius: 28px;
  border: none;
  margin-top: 24px;
}
</style>
