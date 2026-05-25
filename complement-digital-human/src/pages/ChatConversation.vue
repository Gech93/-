<template>
  <div class="conversation-container">
    <div class="nav-header">
      <button class="nav-left" @click="goBack">←</button>
      <div class="nav-center" @click="showDecisionInfo = true">
        <span class="persona-name">{{ personaStore.activePersona?.name || '数字人' }}</span>
        <span class="persona-mode">{{ isDecisionMode ? '决策模式' : '普通模式' }}</span>
      </div>
      <button class="nav-right" @click="showSettings">⋮</button>
    </div>

    <div class="message-list" ref="messageListRef">
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="welcome-avatar">
          <span>{{ personaStore.activePersona?.complementMbti || 'AI' }}</span>
        </div>
        <p class="welcome-text">
          你好！我是{{ personaStore.activePersona?.name || '你的数字人' }}，一个与你互补的AI伙伴。
          有什么想聊的，或者需要我做决策参考吗？
        </p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :id="'msg-' + msg.id"
        class="message-item"
        :class="msg.role"
      >
        <div class="message-avatar" v-if="msg.role === 'assistant'">
          <span>{{ personaStore.activePersona?.complementMbti || 'AI' }}</span>
        </div>
        <div class="message-content">
          <p class="message-text">{{ msg.content }}</p>
          <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
        </div>
      </div>

      <div class="typing-indicator" v-if="isTyping">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>

    <div class="mode-info-modal" v-if="showDecisionInfo" @click="showDecisionInfo = false">
      <div class="modal-content" @click.stop>
        <p class="modal-title">🎯 决策模式说明</p>
        <div class="modal-section">
          <p class="section-title">目的</p>
          <p class="section-text">帮助分析重要决策，提供多角度视角</p>
        </div>
        <div class="modal-section">
          <p class="section-title">特点</p>
          <p class="section-text">• 更结构化的分析框架<br/>• 主动提问关键问题<br/>• 明确区分用户倾向和互补视角</p>
        </div>
        <div class="modal-section">
          <p class="section-title">适用场景</p>
          <p class="section-text">• 职业选择和发展规划<br/>• 人生重大决定<br/>• 重要人际关系问题</p>
        </div>
        <div class="modal-section">
          <p class="section-title disclaimer">⚠️ 免责声明</p>
          <p class="section-text">最终决策权在您，我们提供视角而非答案</p>
        </div>
        <button class="modal-close" @click="showDecisionInfo = false">我知道了</button>
      </div>
    </div>

    <div class="input-section">
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ active: !isDecisionMode }"
          @click="isDecisionMode = false"
        >
          💬 普通
        </button>
        <button
          class="mode-btn decision"
          :class="{ active: isDecisionMode }"
          @click="toggleDecisionMode"
        >
          🎯 决策
        </button>
      </div>

      <div class="complement-slider" v-if="personaStore.activePersona">
        <span class="slider-label">互补度</span>
        <input
          type="range"
          :value="personaStore.activePersona.complementLevel"
          :min="0"
          :max="100"
          :step="10"
          @input="handleComplementChange"
        />
        <span class="slider-value">{{ personaStore.activePersona.complementLevel }}%</span>
      </div>

      <div class="input-row">
        <input
          v-model="inputText"
          class="message-input"
          placeholder="输入你的想法..."
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'
import { useConversation } from '../stores/conversation'

const router = useRouter()
const personaStore = usePersonaStore()
const conversation = useConversation()

const messages = ref<any[]>([])
const inputText = ref('')
const isDecisionMode = ref(false)
const showDecisionInfo = ref(false)
const isTyping = ref(false)
const messageListRef = ref<HTMLElement | null>(null)

function formatTime(date: Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function toggleDecisionMode() {
  if (!isDecisionMode.value) {
    showDecisionInfo.value = true
  }
  isDecisionMode.value = !isDecisionMode.value
}

function showSettings() {
  alert('设置功能开发中...')
}

async function sendMessage() {
  if (!inputText.value.trim()) return

  const userMsg: any = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText.value,
    timestamp: new Date(),
    isDecisionMode: isDecisionMode.value,
  }

  messages.value.push(userMsg)
  const text = inputText.value
  inputText.value = ''

  scrollToBottom()

  isTyping.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = isDecisionMode.value 
      ? [
          '这是一个重要的决定，让我们从多个角度来分析：\n\n**【利弊分析】**\n• 优势：让我们看看这个选择的积极方面\n• 劣势：也需要考虑潜在的风险\n\n**【关键问题】**\n在做出决定之前，建议你思考：\n1. 这个决定对你的长期目标有什么影响？\n2. 最坏的情况是什么？你能接受吗？\n\n**【风险提示】**\n做重大决策时，建议多方收集信息，谨慎考虑。',
        ]
      : [
          '这是一个很有趣的想法！从另一个角度来看，或许我们可以考虑...',
          '我理解你的感受。让我从一个不同的视角来帮你分析一下。',
          '作为你的互补视角，我认为这个问题可以从多个方面来思考。',
          '很有意思的思路！让我补充一些你可能没有考虑到的角度。',
        ]
    
    const randomIndex = Math.floor(Math.random() * responses.length)
    const aiMsg: any = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responses[randomIndex] + (isDecisionMode.value ? '' : `\n\n根据你描述的情况（"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"），我建议你可以尝试从另一个角度看待这个问题。`),
      timestamp: new Date(),
      isDecisionMode: isDecisionMode.value,
    }

    messages.value.push(aiMsg)
  } finally {
    isTyping.value = false
  }

  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

function handleComplementChange(e: any) {
  const level = parseInt(e.target.value)
  if (!personaStore.activePersona) return

  const canModify = personaStore.canModifyComplement(personaStore.activePersona)
  if (!canModify) {
    const remainDays = personaStore.getRemainDays(personaStore.activePersona)
    alert(`每月限修改1次，还剩${remainDays}天`)
    return
  }

  personaStore.updateComplementLevel(level)
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
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
}

.welcome-text {
  flex: 1;
  font-size: 16px;
  color: #666666;
  line-height: 1.6;
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
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
  gap: 6px;
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  width: fit-content;
  margin-bottom: 20px;
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

.mode-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 22px;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 24px;
}

.modal-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.section-title.disclaimer {
  color: #ff9500;
}

.section-text {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.modal-close {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  border-radius: 24px;
  border: none;
  margin-top: 24px;
}

.input-section {
  background: #ffffff;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mode-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.mode-btn {
  flex: 1;
  height: 44px;
  background: #f5f5f5;
  color: #666666;
  font-size: 14px;
  border-radius: 22px;
  border: none;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.mode-btn.decision.active {
  background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
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
