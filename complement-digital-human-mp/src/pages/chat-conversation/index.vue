<template>
  <view class="conversation-container">
    <view class="nav-header">
      <view class="nav-left" @click="goBack">←</view>
      <view class="nav-center">
        <text class="persona-name">{{ personaName }}</text>
        <text class="persona-mode">{{ personaMbti }} · {{ complementLevel }}% 互补</text>
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
            <text class="suggestion-chip" @click="quickSend('我正在考虑职业转型，想听听你的看法')">职业转型</text>
            <text class="suggestion-chip" @click="quickSend('我和朋友最近有点矛盾，不知道怎么处理')">关系冲突</text>
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
          <template v-if="msg.role === 'assistant' && msg.structured">
            <text class="message-text">{{ msg.structured.perspective }}</text>
            <view class="suggestion-list" v-if="msg.structured.suggestions.length">
              <view class="suggestion-item" v-for="(s, i) in msg.structured.suggestions" :key="i">
                <text class="suggestion-index">{{ i + 1 }}</text>
                <text class="suggestion-text">{{ s }}</text>
              </view>
            </view>
            <view class="follow-up" v-if="msg.structured.followUpQuestion">
              <text class="follow-up-text">💬 {{ msg.structured.followUpQuestion }}</text>
            </view>
            <view class="feedback-row">
              <text class="feedback-btn" @click="handleFeedback(true, msg)">👍 有帮助</text>
              <text class="feedback-btn" @click="handleFeedback(false, msg)">🤔 没感觉</text>
            </view>
          </template>
          <template v-else>
            <text class="message-text">{{ msg.content }}</text>
          </template>
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
          activeColor="#ff6b9d"
        />
        <text class="slider-value">{{ complementLevel }}%</text>
      </view>
      <view class="slider-guide">
        <text class="guide-item" :class="{ active: complementLevel <= 40 }">偏像你</text>
        <text class="guide-arrow">·</text>
        <text class="guide-item" :class="{ active: complementLevel > 40 && complementLevel < 80 }">平衡</text>
        <text class="guide-arrow">·</text>
        <text class="guide-item" :class="{ active: complementLevel >= 80 }">强互补</text>
        <text class="guide-hint" v-if="remainDays > 0">本月已调整，{{ remainDays }} 天后可再调</text>
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
          <text class="form-hint warning">风险提示：直连模式会在本机明文保存你的 API Key 并随请求传输，存在被采集滥用风险；建议优先使用设置页的「云端网关 + 网关令牌」方式</text>
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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePersonaStore, type MemoryFact } from '../../stores/persona'
import { createSession, ensureSessions, getMessagesKey, touchSession } from '../../utils/chatSessions'
import { readStorage, writeStorage, STORAGE_KEYS } from '../../utils/storage'
import { callDeepSeekAPI } from './modules/api'
import { generateMockResponse } from './modules/mock'
import type { PromptContext } from './modules/prompt'
import type { ChatResponse, StructuredReply } from './modules/structured'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  structured?: StructuredReply
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
const remainDays = ref(0)

const getStorageKey = () => {
  const personaId = personaStore.activePersona?.id || 'default'
  return getMessagesKey(personaId, sessionId.value || 'default')
}

const sessionId = ref('')

onLoad((options) => {
  const activePersona = personaStore.activePersona
  if (activePersona) {
    personaName.value = activePersona.name
    personaMbti.value = activePersona.complementMbti
    complementLevel.value = activePersona.complementLevel
    remainDays.value = personaStore.getRemainDays(activePersona)

    const pid = activePersona.id
    const sessions = ensureSessions(pid)
    if (options?.sessionId) {
      const found = sessions.find(s => s.id === options.sessionId)
      if (found) sessionId.value = found.id
    }
    if (!sessionId.value) {
      if (options?.newSession === '1') {
        sessionId.value = createSession(pid).id
      } else if (sessions.length) {
        sessionId.value = sessions[0].id
      } else {
        sessionId.value = createSession(pid).id
      }
    }
  }

  loadApiSettings()
  loadMessages()
})

function loadApiSettings() {
  const savedKey = readStorage<string>(STORAGE_KEYS.deepseekApiKey)
  const savedUseDeepSeek = readStorage(STORAGE_KEYS.useDeepSeek)

  if (savedKey) {
    apiKey.value = savedKey
    useDeepSeek.value = savedUseDeepSeek === true
  }
}

function loadMessages() {
  const storageKey = getStorageKey()
  const savedMessages = readStorage<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string; structured?: StructuredReply }>>(storageKey)

  if (Array.isArray(savedMessages)) {
    try {
      messages.value = savedMessages.map((msg) => ({
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
    writeStorage(storageKey, dataToSave)
    const persona = personaStore.activePersona
    if (persona && sessionId.value) {
      touchSession(persona.id, sessionId.value, dataToSave)
    }
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

function showSettings() {
  showApiKeyModal.value = true
}

function toggleDeepSeek(e: { detail: { value: boolean[] } }) {
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
  
  writeStorage(STORAGE_KEYS.deepseekApiKey, apiKey.value.trim())
  writeStorage(STORAGE_KEYS.useDeepSeek, useDeepSeek.value)
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
    let response: ChatResponse
    
    const gatewayUrl = readStorage<string>(STORAGE_KEYS.cloudGatewayUrl)
    const useProxy = readStorage(STORAGE_KEYS.useCloudProxy) === true
    if ((useDeepSeek.value && apiKey.value) || (useProxy && gatewayUrl)) {
      const ctx: PromptContext = {
        persona: personaStore.activePersona,
        userMbti: personaStore.userMbti,
        mbtiProfile: personaStore.mbtiProfile,
        bigFiveProfile: personaStore.bigFiveProfile,
        lastUserText: text,
      }
      // 注入最近最多 6 条历史（不含当前这条用户消息）
      const history = messages.value.slice(-7, -1).map(m => ({
        role: m.role,
        content: m.content,
      }))
      response = await callDeepSeekAPI({ userMessage: text, ctx, history })
    } else {
      response = generateMockResponse(text)
    }
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      structured: response.structured,
    }
    messages.value.push(aiMsg)
    saveMessages()

    // 记忆层：优先应用 AI 抽取的 memoryUpdates（事实/滚动摘要/行为画像），缺失或无结果时回退旧规则
    const persona = personaStore.activePersona
    if (persona) {
      const aiUpdates = response.memoryUpdates
      if (aiUpdates?.summary) {
        persona.memory.summary = aiUpdates.summary.slice(0, 120)
      } else {
        persona.memory.summary = text.length > 40 ? text.slice(0, 40) + '…' : text
      }
      if (aiUpdates?.facts?.length) {
        aiUpdates.facts.forEach(f => {
          personaStore.addMemoryFact(f.content, isFactCategory(f.category) ? f.category : 'other', 4)
          personaStore.addUserFact(f.content)
        })
      } else {
        maybeExtractUserFact(text)
      }
      if (aiUpdates?.behavior) {
        personaStore.updateBehaviorProfile(text, aiUpdates.behavior)
      } else {
        personaStore.updateBehaviorProfile(text)
      }
      personaStore.recordConversation()
    }
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

// ---------- 记忆层 ----------

const factCategorySet: MemoryFact['category'][] = ['preference', 'identity', 'plan', 'emotion', 'work', 'other']

function isFactCategory(v: unknown): v is MemoryFact['category'] {
  return factCategorySet.includes(v as MemoryFact['category'])
}

const factPatterns = ['我喜欢', '我不喜欢', '我是', '我在', '我最近', '我经常', '我打算', '我想要', '我希望', '我的工作', '我的目标', '我担心', '我害怕']

const factCategories: Record<string, 'preference' | 'identity' | 'plan' | 'emotion' | 'work' | 'other'> = {
  '我喜欢': 'preference',
  '我不喜欢': 'preference',
  '我是': 'identity',
  '我在': 'identity',
  '我最近': 'plan',
  '我经常': 'preference',
  '我打算': 'plan',
  '我想要': 'plan',
  '我希望': 'plan',
  '我的工作': 'work',
  '我的目标': 'plan',
  '我担心': 'emotion',
  '我害怕': 'emotion',
}

function maybeExtractUserFact(text: string) {
  const hit = factPatterns.find(p => text.includes(p))
  if (hit) {
    const fact = text.length > 60 ? text.slice(0, 60) + '…' : text
    personaStore.addUserFact(fact)
    personaStore.addMemoryFact(fact, factCategories[hit] || 'other', text.length > 30 ? 4 : 3)
  }
}

// ---------- 其他 ----------

function scrollToBottom() {
  setTimeout(() => {
    scrollTop.value = messages.value.length * 1000
  }, 100)
}

function updateComplementLevel(e: { detail: { value: number } }) {
  const target = e.detail.value
  const persona = personaStore.activePersona
  if (persona) {
    const ok = personaStore.updateComplementLevel(target)
    if (ok) {
      complementLevel.value = target
      remainDays.value = personaStore.getRemainDays(persona)
    } else {
      complementLevel.value = persona.complementLevel
      remainDays.value = personaStore.getRemainDays(persona)
      uni.showToast({
        title: remainDays.value > 0 ? `本月仅可调整一次，剩 ${remainDays.value} 天` : '互补度每月仅可调整一次',
        icon: 'none'
      })
    }
  } else {
    complementLevel.value = target
  }
}

function handleFeedback(useful: boolean, msg?: Message) {
  const sample = msg?.structured?.perspective || ''
  personaStore.recordFeedback(useful, sample)
  uni.showToast({
    title: useful ? '收到，我会保持这种视角' : '收到，我会尝试换种方式',
    icon: 'none'
  })
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
  background: var(--dopamine-bg);
  position: relative;
}

.nav-header {
  height: 120rpx;
  background: var(--dopamine-gradient);
  display: flex;
  align-items: center;
  padding: 0 40rpx;
  padding-top: 60rpx;
  color: var(--dopamine-card);
}

.nav-left, .nav-right {
  font-size: 56rpx;
  color: var(--dopamine-card);
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
  background: var(--dopamine-gradient);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  font-size: 40rpx;
  font-weight: bold;
  color: var(--dopamine-card);
}

.welcome-content {
  flex: 1;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  color: var(--dopamine-text-sub);
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: var(--dopamine-text-sub);
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
  background: rgba(255, 107, 157, 0.12);
  color: var(--dopamine-primary);
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
  background: var(--dopamine-gradient);
}

.message-item.user .message-text {
  color: var(--dopamine-card);
}

.message-item.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-avatar {
  width: 96rpx;
  height: 96rpx;
  background: var(--dopamine-gradient);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  font-size: 36rpx;
  font-weight: bold;
  color: var(--dopamine-card);
}

.message-content {
  max-width: 70%;
  background: var(--dopamine-card);
  padding: 32rpx;
  border-radius: 32rpx;
}

.message-text {
  display: block;
  font-size: 32rpx;
  color: var(--dopamine-text);
  line-height: 1.6;
  white-space: pre-wrap;
}

.suggestion-list {
  margin-top: 24rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  background: rgba(255, 107, 157, 0.08);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.suggestion-index {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  background: var(--dopamine-gradient);
  color: var(--dopamine-card);
  border-radius: 50%;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--dopamine-text);
  line-height: 1.5;
}

.follow-up {
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: rgba(167, 139, 250, 0.12);
  border-radius: 16rpx;
}

.follow-up-text {
  font-size: 28rpx;
  color: var(--dopamine-purple);
  line-height: 1.5;
}

.feedback-row {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.feedback-btn {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  background: var(--dopamine-bg);
  color: var(--dopamine-text-sub);
  font-size: 26rpx;
  border: 1rpx solid var(--dopamine-border);
}

.message-time {
  display: block;
  font-size: 24rpx;
  color: var(--dopamine-text-sub);
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
  background: var(--dopamine-card);
  border-radius: 32rpx;
}

.typing-dot {
  width: 20rpx;
  height: 20rpx;
  background: var(--dopamine-primary);
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
  background: var(--dopamine-card);
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
  color: var(--dopamine-text-sub);
  margin-right: 24rpx;
}

.slider-value {
  font-size: 28rpx;
  color: var(--dopamine-primary);
  font-weight: bold;
  min-width: 100rpx;
  text-align: right;
}

.slider-guide {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 32rpx;
}

.guide-item {
  font-size: 24rpx;
  color: var(--dopamine-text-sub);
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
}

.guide-item.active {
  color: var(--dopamine-primary);
  background: rgba(255, 107, 157, 0.12);
  font-weight: bold;
}

.guide-arrow {
  font-size: 24rpx;
  color: var(--dopamine-border);
}

.guide-hint {
  font-size: 24rpx;
  color: var(--dopamine-yellow);
  margin-left: 16rpx;
}

.input-row {
  display: flex;
  gap: 24rpx;
}

.message-input {
  flex: 1;
  height: 96rpx;
  background: var(--dopamine-bg);
  border-radius: 48rpx;
  padding: 0 40rpx;
  font-size: 32rpx;
  border: none;
}

.send-btn {
  width: 200rpx;
  height: 96rpx;
  background: var(--dopamine-gradient);
  color: var(--dopamine-card);
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
  color: var(--dopamine-text);
  margin-bottom: 48rpx;
  text-align: center;
}

.form-group {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: var(--dopamine-text-sub);
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: var(--dopamine-bg);
  border-radius: 24rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  border: none;
  box-sizing: border-box;
}

.form-hint {
  display: block;
  font-size: 24rpx;
  color: var(--dopamine-text-sub);
  margin-top: 16rpx;
}

.form-hint.warning {
  color: var(--dopamine-yellow);
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
  background: var(--dopamine-bg);
  color: var(--dopamine-text-sub);
}

.btn-save {
  background: var(--dopamine-gradient);
  color: white;
}

.api-info {
  margin-top: 48rpx;
  padding: 32rpx;
  background: var(--dopamine-bg);
  border-radius: 24rpx;
  font-size: 28rpx;
  color: var(--dopamine-text-sub);
  white-space: pre-line;
}
</style>
