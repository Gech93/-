<template>
  <div class="conversation-container">
    <div class="nav-header">
      <button class="nav-left" @click="goBack">←</button>
      <div class="nav-center">
        <span class="persona-name">{{ personaName }}</span>
        <span class="persona-mode">{{ complementLevel }}% 互补</span>
      </div>
      <button class="nav-right" @click="showSettings">⋮</button>
    </div>

    <div class="message-list" ref="messageListRef">
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="welcome-avatar">
          <span>{{ personaMbti }}</span>
        </div>
        <div class="welcome-content">
          <p class="welcome-text">
            你好！我是{{ personaName }}，一个与你互补的AI伙伴。
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
          <span>{{ personaMbti }}</span>
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
      <div class="complement-slider">
        <span class="slider-label">互补度</span>
        <input
          type="range"
          v-model.number="complementLevel"
          min="0"
          max="100"
          step="10"
          @change="updateComplementLevel"
        />
        <span class="slider-value">{{ complementLevel }}%</span>
      </div>

      <div class="input-row">
        <input
          v-model="inputText"
          class="message-input"
          placeholder="输入你的想法..."
          @keydown.enter.prevent="handleSend"
        />
        <button 
          class="send-btn" 
          @click="handleSend"
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
const complementLevel = ref(50)
const personaName = ref('数字人')
const personaMbti = ref('AI')

onMounted(() => {
  // 初始化 persona 信息
  const activePersona = personaStore.activePersona
  if (activePersona) {
    personaName.value = activePersona.name
    personaMbti.value = activePersona.complementMbti
    complementLevel.value = activePersona.complementLevel
  }
  
  // 初始化对话
  if (!conversation.currentConversationId) {
    const personaId = activePersona?.id || 'default'
    conversation.createConversation(personaId)
  }
  
  loadMessages()
})

function loadMessages() {
  messages.value = conversation.getCurrentConversation()
  nextTick(() => {
    scrollToBottom()
  })
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
  handleSend()
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text) {
    return
  }

  // 清空输入
  inputText.value = ''
  
  // 添加用户消息
  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date(),
  }
  messages.value.push(userMsg)
  
  // 显示加载状态
  isTyping.value = true
  scrollToBottom()

  // 模拟 AI 回复
  setTimeout(() => {
    const aiResponse = generateResponse(text)
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    }
    messages.value.push(aiMsg)
    isTyping.value = false
    scrollToBottom()
  }, 1000)
}

function generateResponse(text: string): string {
  const isDecision = checkDecisionRequest(text)
  
  if (isDecision) {
    return `这是一个重要的决定，让我们从多个角度来分析：

【利弊分析】
• 优势：让我们看看这个选择的积极方面
• 劣势：也需要考虑潜在的风险

【关键问题】
1. 这个决定对你的长期目标有什么影响？
2. 最坏的情况是什么？你能接受吗？

【建议】
建议多方收集信息，谨慎考虑后再做决定。`
  }
  
  const responses = [
    '这是一个很有趣的想法！从另一个角度来看，或许我们可以考虑...',
    '我理解你的感受。让我从一个不同的视角来帮你分析一下。',
    '作为你的互补视角，我认为这个问题可以从多个方面来思考。',
    '很有意思的思路！让我补充一些你可能没有考虑到的角度。',
    '我注意到你似乎在纠结这个问题。让我们换个方式来看看。',
  ]
  
  const randomIndex = Math.floor(Math.random() * responses.length)
  return `${responses[randomIndex]}\n\n根据你说的情况，我建议你可以尝试从另一个角度看待这个问题。`
}

function checkDecisionRequest(text: string): boolean {
  const keywords = ['决定', '决策', '选择', '怎么办', '纠结', '建议', '迷茫', '帮我']
  return keywords.some(k => text.includes(k))
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

function updateComplementLevel() {
  if (personaStore.activePersona) {
    personaStore.updateComplementLevel(complementLevel.value)
  }
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
</style>
