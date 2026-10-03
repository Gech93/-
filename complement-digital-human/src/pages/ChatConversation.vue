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
          <p class="message-text" v-if="msg.structured">{{ msg.structured.perspective }}</p>
          <p class="message-text" v-else>{{ msg.content }}</p>
          <div
            v-if="msg.structured && msg.structured.suggestions && msg.structured.suggestions.length"
            class="suggestion-block"
          >
            <p class="suggestion-title">接下来可以这样做</p>
            <ol class="suggestion-list">
              <li v-for="(s, i) in msg.structured.suggestions" :key="i" class="suggestion-item">{{ s }}</li>
            </ol>
          </div>
          <p v-if="msg.structured && msg.structured.followUpQuestion" class="follow-up-question">
            {{ msg.structured.followUpQuestion }}
          </p>
          <div v-if="msg.structured" class="feedback-row">
            <button class="feedback-btn" @click="sendFeedback(msg, true)">👍 有用</button>
            <button class="feedback-btn" @click="sendFeedback(msg, false)">🤔 没感觉</button>
          </div>
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
      <p class="guide-hint" v-if="remainDays > 0">本周已调整，{{ remainDays }} 天后可再调</p>
      <p class="guide-hint" v-else>互补度每周可调整一次，调整后影响 AI 的互补视角</p>

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

    <!-- AI 服务设置弹窗 -->
    <div class="modal-overlay" v-if="showApiKeyModal" @click="showApiKeyModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">AI 服务设置</h3>

        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" v-model="useGateway" />
            使用内置 AI 网关
          </label>
          <p class="form-hint" v-if="useGateway">内置网关已启用，无需配置即可使用 AI 对话</p>
          <p class="form-hint" v-else>已关闭网关，请在下方填写你自己的 API Key</p>
        </div>

        <div class="form-group" v-if="useGateway">
          <label class="form-label">自定义网关地址（可选）</label>
          <input
            v-model="gatewayUrl"
            class="form-input"
            placeholder="留空则使用内置网关"
          />
          <p class="form-hint">如需使用自建网关，请填写地址</p>
        </div>

        <div class="form-group" v-if="useGateway">
          <label class="form-label">自定义网关令牌（可选）</label>
          <input
            v-model="gatewayToken"
            class="form-input"
            placeholder="留空则使用内置令牌"
            type="password"
          />
        </div>

        <div class="form-group" v-if="!useGateway">
          <label class="form-label">DeepSeek API Key</label>
          <input
            v-model="apiKey"
            class="form-input"
            placeholder="输入你的 DeepSeek API Key"
            type="password"
          />
          <p class="form-hint">从 platform.deepseek.com 获取 API Key</p>
        </div>

        <div class="form-group">
          <label class="form-label">AI 模型</label>
          <select v-model="aiModel" class="form-input">
            <option v-for="opt in MODEL_OPTIONS" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
            <option :value="CUSTOM_MODEL_ID">自定义模型（直连）</option>
          </select>
          <p class="form-hint">网关模式支持预设模型；自定义模型需关闭网关并填写 API Key 直连</p>
        </div>

        <div class="form-group" v-if="aiModel === CUSTOM_MODEL_ID">
          <label class="form-label">自定义模型名称</label>
          <input
            v-model="customModelName"
            class="form-input"
            placeholder="如 qwen-plus / gpt-3.5-turbo"
          />
        </div>

        <div class="form-group" v-if="aiModel === CUSTOM_MODEL_ID">
          <label class="form-label">接口地址（OpenAI 兼容）</label>
          <input
            v-model="aiBaseUrl"
            class="form-input"
            placeholder="如 https://api.openai.com/v1/chat/completions"
          />
        </div>

        <div class="modal-actions">
          <button class="btn btn-cancel" @click="showApiKeyModal = false">取消</button>
          <button class="btn btn-save" @click="saveApiSettings">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonaStore } from '../stores/persona'
import { buildSystemPrompt, buildStructuredInstruction } from '../services/deepseek'
import { MODEL_OPTIONS, CUSTOM_MODEL_ID, getModelOption, isCustomModel } from '../services/models'

// ===== 开发者内置网关配置（开箱即用）=====
// 部署网关服务后，将地址与令牌填入此处，用户无需任何配置即可使用 AI
const BUILTIN_GATEWAY_URL = '' // 例: 'https://your-gateway.example.com/chat'
const BUILTIN_GATEWAY_TOKEN = '' // 网关访问令牌
interface StructuredReply {
  perspective: string
  suggestions: string[]
  followUpQuestion: string
  memoryUpdates?: {
    facts?: Array<{ content: string; category?: string }>
    summary?: string
    behavior?: {
      emotionTendency?: string
      decisionStyle?: string
      expressionStyle?: string
      deepNeed?: string
    }
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  structured?: StructuredReply | null
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
const useGateway = ref(true)
const gatewayUrl = ref('')
const gatewayToken = ref('')
const aiModel = ref('deepseek-chat')
const customModelName = ref('')
const aiBaseUrl = ref('')
const remainDays = ref(0)

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
    remainDays.value = personaStore.getRemainDays(activePersona)
  }
  
  loadApiSettings()
  loadMessages()
})

function loadApiSettings() {
  const savedKey = localStorage.getItem('deepseek_api_key')
  if (savedKey) apiKey.value = savedKey
  const savedUseGateway = localStorage.getItem('use_gateway')
  useGateway.value = savedUseGateway !== 'false'
  const savedGatewayUrl = localStorage.getItem('gateway_url')
  if (savedGatewayUrl) gatewayUrl.value = savedGatewayUrl
  const savedGatewayToken = localStorage.getItem('gateway_token')
  if (savedGatewayToken) gatewayToken.value = savedGatewayToken
  const savedAiModel = localStorage.getItem('ai_model')
  if (savedAiModel) aiModel.value = savedAiModel
  const savedCustomModelName = localStorage.getItem('ai_custom_model')
  if (savedCustomModelName) customModelName.value = savedCustomModelName
  const savedAiBaseUrl = localStorage.getItem('ai_base_url')
  if (savedAiBaseUrl) aiBaseUrl.value = savedAiBaseUrl
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

function saveApiSettings() {
  localStorage.setItem('use_gateway', useGateway.value.toString())
  localStorage.setItem('gateway_url', gatewayUrl.value.trim())
  localStorage.setItem('gateway_token', gatewayToken.value.trim())
  localStorage.setItem('deepseek_api_key', apiKey.value.trim())
  localStorage.setItem('ai_model', aiModel.value)
  localStorage.setItem('ai_custom_model', customModelName.value.trim())
  localStorage.setItem('ai_base_url', aiBaseUrl.value.trim())
  showApiKeyModal.value = false
  alert('设置已保存')
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
    let rawReply: string

    if (useGateway.value || apiKey.value) {
      rawReply = await callDeepSeekAPI(text)
    } else {
      rawReply = generateMockResponse(text)
    }
    
    const parsed = parseStructuredReply(rawReply)
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: parsed ? (parsed.perspective || rawReply) : rawReply,
      structured: parsed,
      timestamp: new Date(),
    }
    messages.value.push(aiMsg)
    saveMessages()

    // 记忆层 + 成长体系
    const persona = personaStore.activePersona
    if (persona && parsed) {
      if (parsed.memoryUpdates) {
        personaStore.applyMemoryUpdates(parsed.memoryUpdates)
      } else {
        personaStore.applyMemoryUpdates({
          summary: text.length > 40 ? text.slice(0, 40) + '…' : text,
        })
      }
      personaStore.recordConversation()
    } else if (persona) {
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

async function callDeepSeekAPI(userMessage: string): Promise<string> {
  const persona = personaStore.activePersona
  const userMbti = personaStore.userMbti || '未知'
  const complementMbti = persona?.complementMbti || '未知'
  const complementLevelValue = complementLevel.value
  const isDecisionMode = checkDecisionRequest(userMessage)

  const memoryInjection = persona
    ? {
        memory: persona.memory,
        feedback: persona.feedback,
        behaviorProfile: persona.behaviorProfile,
      }
    : undefined

  const systemPrompt = buildSystemPrompt(
    userMbti,
    complementMbti,
    complementLevelValue,
    isDecisionMode,
    persona?.name || '互补伙伴',
    memoryInjection
  ) + '\n\n' + buildStructuredInstruction()

  const history = messages.value.slice(-6).map(m => ({
    role: m.role,
    content: m.content,
  }))

  const requestMessages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ]

  // 模型配置：ai_model 存预设模型 id 或自定义标记；自定义模型走直连（网关不支持路由未知上游）
  const isCustom = isCustomModel(aiModel.value)
  const modelOpt = getModelOption(aiModel.value)
  const requestModel = isCustom ? (customModelName.value.trim() || 'deepseek-chat') : aiModel.value
  const useJsonMode = !isCustom && modelOpt.jsonMode

  // 优先走网关（内置或自定义），密钥留在服务端
  const gwUrl = gatewayUrl.value.trim() || BUILTIN_GATEWAY_URL
  if (useGateway.value && gwUrl && !isCustom) {
    const gwToken = gatewayToken.value.trim() || BUILTIN_GATEWAY_TOKEN
    try {
      const gwResponse = await fetch(gwUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(gwToken ? { Authorization: `Bearer ${gwToken}` } : {}),
        },
        body: JSON.stringify({
          model: requestModel,
          provider: modelOpt.provider,
          jsonMode: useJsonMode,
          messages: requestMessages,
        }),
      })
      if (gwResponse.ok) {
        const gwData = await gwResponse.json()
        const gwBody = gwData.data || gwData
        if (gwBody && gwBody.choices && gwBody.choices[0]) {
          return gwBody.choices[0].message.content
        }
      }
      console.warn('网关调用失败，回退直连:', gwResponse.status)
    } catch (e) {
      console.warn('网关调用异常，回退直连:', e)
    }
  }

  // 回退：直连 API（模型支持 JSON mode 时附加 response_format）
  const apiKeyValue = localStorage.getItem('deepseek_api_key')
  if (!apiKeyValue) {
    throw new Error('未配置 AI 服务：请在设置中启用内置网关，或填写你自己的 API Key')
  }

  const directBaseUrl = isCustom
    ? (aiBaseUrl.value.trim() || 'https://api.deepseek.com/chat/completions')
    : modelOpt.baseURL

  const response = await fetch(directBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyValue}`
    },
    body: JSON.stringify({
      model: requestModel,
      messages: requestMessages,
      stream: false,
      ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

function parseStructuredReply(raw: string): StructuredReply | null {
  try {
    const trimmed = raw.trim()
    const jsonText = trimmed.startsWith('{') ? trimmed : trimmed.slice(trimmed.indexOf('{'))
    const obj = JSON.parse(jsonText)
    if (!obj || typeof obj !== 'object' || !obj.perspective) return null
    return {
      perspective: String(obj.perspective),
      suggestions: Array.isArray(obj.suggestions) ? obj.suggestions.filter((s: unknown) => typeof s === 'string').map(String).slice(0, 4) : [],
      followUpQuestion: typeof obj.followUpQuestion === 'string' ? obj.followUpQuestion : '',
      memoryUpdates: obj.memoryUpdates || undefined,
    }
  } catch (error) {
    return null
  }
}

function sendFeedback(msg: Message, useful: boolean) {
  const persona = personaStore.activePersona
  if (!persona) return
  const sampleText = msg.structured?.suggestions?.join('；') || msg.content
  personaStore.recordFeedback(useful, sampleText)
  alert(useful ? '已记录，这类视角会继续保持' : '已记录，之后会避免这类表述')
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
  const persona = personaStore.activePersona
  if (!persona) {
    complementLevel.value = 50
    return
  }
  const target = complementLevel.value
  const remain = personaStore.getRemainDays(persona)
  if (remain > 0) {
    complementLevel.value = persona.complementLevel
    remainDays.value = remain
    alert(`本周仅可调整一次，剩 ${remain} 天`)
    return
  }
  if (target === persona.complementLevel) {
    complementLevel.value = target
    return
  }
  const ok = window.confirm(
    `确认将互补度从 ${persona.complementLevel}% 调整为 ${target}%？互补度每周仅可调整一次，调整后会影响 AI 的互补视角。`
  )
  if (!ok) {
    complementLevel.value = persona.complementLevel
    return
  }
  const success = personaStore.updateComplementLevel(target)
  if (success) {
    const updated = personaStore.activePersona
    remainDays.value = updated ? personaStore.getRemainDays(updated) : 0
    alert('互补度已更新')
  } else {
    complementLevel.value = persona.complementLevel
    alert('更新失败，请稍后重试')
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

.suggestion-block {
  margin-top: 12px;
  background: rgba(102, 126, 234, 0.06);
  border-left: 3px solid #667eea;
  border-radius: 8px;
  padding: 10px 12px;
}

.suggestion-title {
  font-size: 13px;
  font-weight: bold;
  color: #667eea;
  margin: 0 0 6px 0;
}

.suggestion-list {
  margin: 0;
  padding-left: 18px;
}

.suggestion-item {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 4px;
}

.follow-up-question {
  margin-top: 12px;
  font-size: 14px;
  color: #764ba2;
  background: rgba(118, 75, 162, 0.06);
  border-radius: 8px;
  padding: 10px 12px;
}

.feedback-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.feedback-btn {
  flex: 1;
  padding: 6px 0;
  font-size: 13px;
  color: #666666;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
  color: #667eea;
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

.guide-hint {
  font-size: 12px;
  color: #999999;
  margin: -6px 0 12px 0;
  text-align: center;
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
