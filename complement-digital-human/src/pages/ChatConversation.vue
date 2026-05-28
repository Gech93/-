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

    <!-- API Key 设置弹窗 -->
    <div class="modal-overlay" v-if="showApiKeyModal" @click="showApiKeyModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">设置 DeepSeek API Key</h3>
        
        <div class="form-group">
          <label class="form-label">API Key</label>
          <input
            v-model="apiKey"
            class="form-input"
            placeholder="输入你的 DeepSeek API Key"
            type="password"
          />
          <p class="form-hint">从 DeepSeek 平台获取 API Key</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" v-model="useDeepSeek" />
            启用 DeepSeek AI
          </label>
        </div>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showApiKeyModal = false">取消</button>
          <button class="btn btn-save" @click="saveApiKey">保存</button>
        </div>

        <div class="api-info">
          <p>获取 API Key：</p>
          <ol>
            <li>访问 <a href="https://platform.deepseek.com/" target="_blank">DeepSeek 开放平台</a></li>
            <li>注册并登录账号</li>
            <li>创建 API Key 并复制</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const router = useRouter()
const personaStore = usePersonaStore()

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const messageListRef = ref<HTMLElement | null>(null)
const complementLevel = ref(50)
const personaName = ref('数字人')
const personaMbti = ref('AI')

const showApiKeyModal = ref(false)
const apiKey = ref('')
const useDeepSeek = ref(false)

// 获取存储键
const getStorageKey = () => {
  const personaId = personaStore.activePersona?.id || 'default'
  return `chat_messages_${personaId}`
}

onMounted(() => {
  const activePersona = personaStore.activePersona
  if (activePersona) {
    personaName.value = activePersona.name
    personaMbti.value = activePersona.complementMbti
    complementLevel.value = activePersona.complementLevel
  }
  
  loadApiSettings()
  loadMessages()
})

function loadApiSettings() {
  const savedKey = localStorage.getItem('deepseek_api_key')
  const savedUseDeepSeek = localStorage.getItem('use_deepseek')
  
  if (savedKey) {
    apiKey.value = savedKey
    useDeepSeek.value = savedUseDeepSeek === 'true'
  }
}

function loadMessages() {
  const storageKey = getStorageKey()
  const savedMessages = localStorage.getItem(storageKey)
  
  if (savedMessages) {
    try {
      const parsed = JSON.parse(savedMessages)
      messages.value = parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    } catch (error) {
      console.error('加载消息失败:', error)
      messages.value = []
    }
  }
  
  nextTick(() => {
    scrollToBottom()
  })
}

function saveMessages() {
  const storageKey = getStorageKey()
  try {
    const dataToSave = messages.value.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

function showSettings() {
  showApiKeyModal.value = true
}

function saveApiKey() {
  if (!apiKey.value.trim()) {
    alert('请输入 API Key')
    return
  }
  
  localStorage.setItem('deepseek_api_key', apiKey.value.trim())
  localStorage.setItem('use_deepseek', useDeepSeek.value.toString())
  showApiKeyModal.value = false
  alert('设置已保存！')
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function quickSend(text: string) {
  inputText.value = text
  handleSend()
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  inputText.value = ''
  
  const userMsg: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date(),
  }
  messages.value.push(userMsg)
  saveMessages()
  
  isTyping.value = true
  scrollToBottom()

  try {
    let response: string
    
    if (useDeepSeek.value && apiKey.value) {
      response = await callDeepSeekAPI(text)
    } else {
      response = generateMockResponse(text)
    }
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }
    messages.value.push(aiMsg)
    saveMessages()
  } catch (error) {
    console.error('AI 回复失败:', error)
    const errorMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '抱歉，AI 回复失败了。你可以稍后重试，或检查 API Key 设置。',
      timestamp: new Date(),
    }
    messages.value.push(errorMsg)
    saveMessages()
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

async function callDeepSeekAPI(userMessage: string): Promise<string> {
  const apiKeyValue = localStorage.getItem('deepseek_api_key')
  
  if (!apiKeyValue) {
    throw new Error('未设置 API Key')
  }

  const persona = personaStore.activePersona
  const userMbti = personaStore.userMbti || '未知'
  const complementMbti = persona?.complementMbti || '未知'
  const complementLevelValue = complementLevel.value

  const systemPrompt = `你是用户的互补AI伙伴。用户的人格类型是 ${userMbti}，你的互补人格类型是 ${complementMbti}，互补度为 ${complementLevelValue}%。

你的角色是提供与用户互补的视角和思考方式，帮助用户从不同角度看待问题。
- 如果用户表现出内向(I)，你应该表现得外向(E)，更主动地分享想法
- 如果用户偏重感觉(S)，你可以提供直觉(N)的观点，关注可能性和未来
- 如果用户偏重思考(T)，你可以提供情感(F)的视角，关注人际关系和价值观
- 如果用户偏重判断(J)，你可以表现得更随性(P)，提供灵活的方案

保持友好、专业的语气，但始终保持你的互补特质。`

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyValue}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: false
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function generateMockResponse(text: string): string {
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
  position: relative;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 48px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  border: none;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.api-info {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
}

.api-info p {
  margin-bottom: 8px;
  font-weight: bold;
}

.api-info ol {
  margin: 0;
  padding-left: 20px;
}

.api-info li {
  margin-bottom: 4px;
}

.api-info a {
  color: #667eea;
  text-decoration: none;
}
</style>
