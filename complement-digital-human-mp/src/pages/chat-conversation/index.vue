<template>
  <view class="conversation-container">
    <view class="nav-header">
      <view class="nav-left" @click="goBack">←</view>
      <view class="nav-center">
        <text class="persona-name">{{ personaName }}</text>
        <text class="persona-mode">{{ complementLevel }}% 互补</text>
      </view>
      <view class="nav-right" @click="showSettings">⋮</view>
    </view>

    <scroll-view class="message-list" scroll-y :scroll-top="scrollTop" enhanced show-scrollbar>
      <view class="welcome-message" v-if="messages.length === 0">
        <view class="welcome-avatar">
          <text>{{ personaMbti }}</text>
        </view>
        <view class="welcome-content">
          <text class="welcome-text">
            你好！我是{{ personaName }}，一个与你互补的AI伙伴。
          </text>
          <text class="welcome-subtitle">
            今天想聊点什么？或者我可以帮你从不同角度思考问题。
          </text>
          <view class="suggestion-chips">
            <text class="suggestion-chip" @click="quickSend('我最近工作压力有点大，想聊聊')">工作压力</text>
            <text class="suggestion-chip" @click="quickSend('我需要做一个重要决定')">重要决定</text>
            <text class="suggestion-chip" @click="quickSend('分享一下今天的心情')">今天心情</text>
            <text class="suggestion-chip" @click="quickSend('帮我从另一个角度思考问题')">换个角度</text>
          </view>
        </view>
      </view>

      <view
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="msg.role"
      >
        <view class="message-avatar" v-if="msg.role === 'assistant'">
          <text>{{ personaMbti }}</text>
        </view>
        <view class="message-content">
          <text class="message-text">{{ msg.content }}</text>
          <text class="message-time">{{ formatTime(msg.timestamp) }}</text>
        </view>
      </view>

      <view class="typing-indicator" v-if="isTyping">
        <view class="typing-dots">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
        </view>
      </view>
    </scroll-view>

    <view class="input-section">
      <view class="complement-slider">
        <text class="slider-label">互补度</text>
        <slider
          :value="complementLevel"
          min="0"
          max="100"
          step="10"
          @change="updateComplementLevel"
          activeColor="#667eea"
        />
        <text class="slider-value">{{ complementLevel }}%</text>
      </view>

      <view class="input-row">
        <input
          v-model="inputText"
          class="message-input"
          placeholder="输入你的想法..."
          confirm-type="send"
          @confirm="handleSend"
        />
        <button 
          class="send-btn" 
          @click="handleSend"
        >
          发送
        </button>
      </view>
    </view>

    <!-- API Key 设置弹窗 -->
    <view class="modal-overlay" v-if="showApiKeyModal" @click="showApiKeyModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">设置 DeepSeek API Key</text>
        
        <view class="form-group">
          <text class="form-label">API Key</text>
          <input
            v-model="apiKey"
            class="form-input"
            placeholder="输入你的 DeepSeek API Key"
            password
          />
          <text class="form-hint">从 DeepSeek 平台获取 API Key</text>
        </view>

        <view class="form-group">
          <checkbox-group @change="toggleDeepSeek">
            <label>
              <checkbox :checked="useDeepSeek" />
              <text> 启用 DeepSeek AI</text>
            </label>
          </checkbox-group>
        </view>

        <view class="modal-actions">
          <button class="btn btn-cancel" @click="showApiKeyModal = false">取消</button>
          <button class="btn btn-save" @click="saveApiKey">保存</button>
        </view>

        <view class="api-info">
          <text>获取 API Key：</text>
          <text>1. 访问 DeepSeek 开放平台\n2. 注册并登录账号\n3. 创建 API Key 并复制</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePersonaStore } from '../../stores/persona'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const personaStore = usePersonaStore()

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const scrollTop = ref(0)
const complementLevel = ref(50)
const personaName = ref('数字人')
const personaMbti = ref('AI')

const showApiKeyModal = ref(false)
const apiKey = ref('')
const useDeepSeek = ref(false)

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
  const savedKey = uni.getStorageSync('deepseek_api_key')
  const savedUseDeepSeek = uni.getStorageSync('use_deepseek')
  
  if (savedKey) {
    apiKey.value = savedKey
    useDeepSeek.value = savedUseDeepSeek === true
  }
}

function loadMessages() {
  const storageKey = getStorageKey()
  const savedMessages = uni.getStorageSync(storageKey)
  
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
  
  setTimeout(() => {
    scrollTop.value = messages.value.length * 1000
  }, 100)
}

function saveMessages() {
  const storageKey = getStorageKey()
  try {
    const dataToSave = messages.value.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }))
    uni.setStorageSync(storageKey, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

function showSettings() {
  showApiKeyModal.value = true
}

function toggleDeepSeek(e: any) {
  useDeepSeek.value = e.detail.value.length > 0
}

function saveApiKey() {
  if (!apiKey.value.trim()) {
    uni.showToast({
      title: '请输入 API Key',
      icon: 'none'
    })
    return
  }
  
  uni.setStorageSync('deepseek_api_key', apiKey.value.trim())
  uni.setStorageSync('use_deepseek', useDeepSeek.value)
  showApiKeyModal.value = false
  uni.showToast({
    title: '设置已保存',
    icon: 'success'
  })
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
  const apiKeyValue = uni.getStorageSync('deepseek_api_key')
  
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

  const response = await uni.request({
    url: 'https://api.deepseek.com/chat/completions',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyValue}`
    },
    data: {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: false
    }
  })

  if (response.statusCode !== 200) {
    throw new Error(`API 请求失败: ${response.statusCode}`)
  }

  const data = response.data as any
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
  setTimeout(() => {
    scrollTop.value = messages.value.length * 1000
  }, 100)
}

function updateComplementLevel(e: any) {
  complementLevel.value = e.detail.value
  if (personaStore.activePersona) {
    personaStore.updateComplementLevel(complementLevel.value)
  }
}

function goBack() {
  uni.navigateTo({
    url: '/pages/chat-list/index'
  })
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
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 0 40rpx;
  padding-top: 60rpx;
  color: #ffffff;
}

.nav-left, .nav-right {
  font-size: 56rpx;
  color: #ffffff;
  background: none;
  border: none;
  padding: 20rpx;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.persona-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
}

.persona-mode {
  display: block;
  font-size: 24rpx;
  opacity: 0.8;
}

.message-list {
  flex: 1;
  padding: 40rpx;
  box-sizing: border-box;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48rpx;
  background: white;
  border-radius: 32rpx;
  padding: 40rpx;
}

.welcome-avatar {
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.welcome-content {
  flex: 1;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.suggestion-chip {
  display: inline-block;
  padding: 16rpx 32rpx;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.message-item {
  display: flex;
  margin-bottom: 40rpx;
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
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.message-content {
  max-width: 70%;
  background: #ffffff;
  padding: 32rpx;
  border-radius: 32rpx;
}

.message-text {
  display: block;
  font-size: 32rpx;
  color: #333333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-time {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
  text-align: right;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.typing-dots {
  display: flex;
  gap: 12rpx;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 32rpx;
}

.typing-dot {
  width: 20rpx;
  height: 20rpx;
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
    transform: translateY(-20rpx);
  }
}

.input-section {
  background: #ffffff;
  padding: 40rpx;
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.complement-slider {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.slider-label {
  font-size: 28rpx;
  color: #999999;
  margin-right: 24rpx;
}

.slider-value {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
  min-width: 100rpx;
  text-align: right;
}

.input-row {
  display: flex;
  gap: 24rpx;
}

.message-input {
  flex: 1;
  height: 96rpx;
  background: #f5f5f5;
  border-radius: 48rpx;
  padding: 0 40rpx;
  font-size: 32rpx;
  border: none;
}

.send-btn {
  width: 200rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
}

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
  padding: 40rpx;
}

.modal-content {
  background: white;
  border-radius: 40rpx;
  padding: 64rpx;
  max-width: 700rpx;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 48rpx;
  text-align: center;
}

.form-group {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  border: none;
  box-sizing: border-box;
}

.form-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 48rpx;
}

.btn {
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
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
  margin-top: 48rpx;
  padding: 32rpx;
  background: #f5f5f5;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #666;
  white-space: pre-line;
}
</style>
