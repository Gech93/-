<template>
  <div class="conversation-container">
    <div class="nav-header">
      <button class="nav-left" @click="goBack">←</button>
      <div class="nav-center">
        <span class="persona-name">{{ activePersonaName }}</span>
        <span class="persona-mode">{{ currentComplementLevel }}% 互补</span>
      </div>
      <button class="nav-right" @click="showSettings">⋮</button>
    </div>

    <div class="message-list" ref="messageListRef">
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="welcome-avatar">
          <span>{{ activePersonaMbti }}</span>
        </div>
        <div class="welcome-content">
          <p class="welcome-text">
            你好！我是{{ activePersonaName }}，一个与你互补的AI伙伴。
          </p>
          <p class="welcome-subtitle">
            今天想聊点什么？或者我可以帮你从不同角度思考问题。
          </p>
          <div class="suggestion-chips">
            <span class="suggestion-chip" @click="quickSend('我最近工作压力有点大，想聊聊')">工作压力</span>
            <span class="suggestion-chip" @click="quickSend('我需要做一个重要决定')">重要决定</span>
            <span class="suggestion-chip" @click="quickSend('分享一下今天的心情')">今天心情</span>
            <span class="suggestion-chip" @click="quickSend('帮我从另一个角度思考问题')">换个角度</span>
          </div>
        </div>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="msg.role"
      >
        <div class="message-avatar" v-if="msg.role === 'assistant'">
          <span>{{ activePersonaMbti }}</span>
        </div>
        <div class="message-content">
          <p class="message-text">{{ msg.content }}</p>
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>

      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>

    <div class="input-section">
      <div class="complement-slider" v-if="persona">
        <span class="slider-label">互补度</span>
        <input
          type="range"
          v-model.number="currentComplementLevel"
          :min="0"
          :max="100"
          :step="10"
          @change="updateComplement"
        />
        <span class="slider-value">{{ currentComplementLevel }}%</span>
      </div>

      <div class="input-row">
        <input
          v-model="inputText"
          class="message-input"
          placeholder="输入你的想法..."
        />
        <button 
          class="send-btn" 
          :disabled="!inputText || isTyping" 
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'
import { useConversation } from '../stores/conversation'
import type { Message } from '../stores/conversation'

const router = useRouter()
const personaStore = usePersonaStore()
const conversation = useConversation()

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

const persona = computed(() => personaStore.activePersona)
const activePersonaName = computed(() => persona.value?.name || '数字人')
const activePersonaMbti = computed(() => persona.value?.complementMbti || 'AI')
const currentComplementLevel = ref(50)

onMounted(() => {
  if (!persona.value) {
    router.push('/chat')
    return
  }
  
  currentComplementLevel.value = persona.value.complementLevel
  
  if (!conversation.currentConversationId) {
    conversation.createConversation(persona.value.id)
  }
  
  loadMessages()
})

function loadMessages() {
  const conv = conversation.getCurrentConversation()
  messages.value = [...conv]
  scrollToBottom()
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function showSettings() {
  router.push('/settings')
}

function quickSend(text: string) {
  inputText.value = text
  sendMessage()
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  inputText.value = ''
  isTyping.value = true

  const isDecision = checkDecisionRequest(text)
  
  conversation.sendMessage(text, isDecision).then(() => {
    loadMessages()
  }).catch((error) => {
    console.error('发送失败:', error)
    inputText.value = text
  }).finally(() => {
    isTyping.value = false
  })
}

function checkDecisionRequest(text: string): boolean {
  const keywords = ['决定', '决策', '选择', '怎么办', '纠结', '建议', '迷茫']
  return keywords.some(k => text.includes(k))
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

function updateComplement() {
  if (!persona.value) return
  personaStore.updateComplementLevel(currentComplementLevel.value)
}

function goBack() {
  router.push('/chat')
}
</script>

<style scoped>
.conversation-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-header {
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #ffffff;
}

.nav-left, .nav-right {
  font-size: 28px;
  color: #ffffff;
  background: none;
  border: none;
  padding: 10px;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.persona-name {
  display: block;
  font-size: 18px;
  font-weight: bold;
}

.persona-mode {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.welcome-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.welcome-content {
  flex: 1;
}

.welcome-text {
  font-size: 16px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  color: #999999;
  margin: 0 0 16px 0;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-chip:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-item.user .message-text {
  color: #ffffff;
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.message-content {
  max-width: 70%;
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
}

.message-text {
  font-size: 16px;
  color: #333333;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.message-time {
  font-size: 12px;
  color: #999999;
  margin-top: 8px;
  text-align: right;
  display: block;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.typing-dots {
  display: flex;
  gap: 6px;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
}

.typing-dot {
  width: 10px;
  height: 10px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.input-section {
  background: #ffffff;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.complement-slider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.slider-label {
  font-size: 14px;
  color: #999999;
  margin-right: 12px;
}

.complement-slider input[type="range"] {
  flex: 1;
  margin-right: 12px;
}

.slider-value {
  font-size: 14px;
  color: #667eea;
  font-weight: bold;
  min-width: 50px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  height: 48px;
  background: #f5f5f5;
  border-radius: 24px;
  padding: 0 20px;
  font-size: 16px;
  border: none;
}

.send-btn {
  width: 100px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
  border-radius: 24px;
  border: none;
}

.send-btn:disabled {
  background: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
}
</style>
