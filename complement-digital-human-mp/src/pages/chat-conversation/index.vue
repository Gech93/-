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
import { usePersonaStore, findRelevantFacts, bigFiveMeta, bigFiveDims } from '../../stores/persona'

interface StructuredReply {
  perspective: string
  suggestions: string[]
  followUpQuestion: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  structured?: StructuredReply
}

interface ChatResponse {
  text: string
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
    let response: ChatResponse
    
    if (useDeepSeek.value && apiKey.value) {
      response = await callDeepSeekAPI(text)
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

    // 记忆层：提取用户事实、更新行为画像并记录会话
    const persona = personaStore.activePersona
    if (persona) {
      persona.memory.summary = text.length > 40 ? text.slice(0, 40) + '…' : text
      maybeExtractUserFact(text)
      personaStore.updateBehaviorProfile(text)
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

// ---------- 动态 System Prompt 工厂 ----------

const traitBehaviors: Record<string, string> = {
  E: '主动分享想法，带动对话节奏',
  I: '先倾听、留出空间，用提问引导对方表达',
  S: '关注事实与细节，给出可落地的具体步骤',
  N: '关注可能性与未来趋势，跳出细节提出新思路',
  T: '理性分析利弊，结构化解剖问题',
  F: '关注价值观、人际影响与情感温度',
  J: '帮助收敛决策，把想法落实为明确计划',
  P: '保持灵活开放，提供多个备选方案',
}

const dimPairs: [string, string][] = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
]

function describeMbtiProfile(profile: any): string {
  if (!profile || !profile.scores) return ''
  const s = profile.scores
  const dims = [
    { name: 'E/I', value: s.E, pos: '外向(E)', neg: '内向(I)' },
    { name: 'S/N', value: s.S, pos: '感觉(S)', neg: '直觉(N)' },
    { name: 'T/F', value: s.T, pos: '思考(T)', neg: '情感(F)' },
    { name: 'J/P', value: s.J, pos: '判断(J)', neg: '感知(P)' },
  ]
  return dims
    .map(d => `${d.name} ${d.value >= 50 ? d.pos : d.neg}(${d.value}%)`)
    .join('，')
}

function buildComplementGuidance(userMbti: string, complementMbti: string): string {
  const lines: string[] = []
  for (let i = 0; i < 4; i++) {
    const [a, b] = dimPairs[i]
    const u = userMbti[i]
    const c = complementMbti[i]
    if (u !== c) {
      lines.push(
        `- 用户在「${a}/${b}」维度上是「${u}」，请以「${c}」的倾向互补回应：${traitBehaviors[c]}`
      )
    }
  }
  return lines.join('\n') || '- 保持平衡而自然的回应方式'
}

function describeBigFiveProfile(bigFiveProfile: any): string {
  if (!bigFiveProfile || !bigFiveProfile.scores) return ''
  return bigFiveDims
    .map(d => `${bigFiveMeta[d].label} ${bigFiveProfile.scores[d]}`)
    .join('，')
}

function buildBigFiveGuidance(userScores: any, complementScores: any): string {
  if (!userScores || !complementScores) return ''
  const lines: string[] = []
  bigFiveDims.forEach(d => {
    const u = userScores[d]
    const c = complementScores[d]
    if (Math.abs(u - c) >= 10) {
      const meta = bigFiveMeta[d]
      const direction = c >= 60 ? meta.high : c <= 40 ? meta.low : '中性'
      lines.push(`- 用户在「${meta.label}」维度偏「${u >= 60 ? meta.high : u <= 40 ? meta.low : '中性'}」(${u})，请以更「${direction}」(${c})的方式互补回应`)
    }
  })
  return lines.join('\n') || ''
}

function describeBehaviorProfile(bp: any): string {
  if (!bp) return ''
  return [
    `情绪倾向：${bp.emotionTendency}`,
    `决策风格：${bp.decisionStyle}`,
    `表达方式：${bp.expressionStyle}`,
    `深层需求：${bp.deepNeed}`,
  ].join('；')
}

function buildSystemPrompt(): string {
  const persona = personaStore.activePersona
  const userMbti = personaStore.userMbti || '未知'
  const profileText = describeMbtiProfile(personaStore.mbtiProfile)
  const bigFiveText = describeBigFiveProfile(personaStore.bigFiveProfile)
  const complementMbti = persona?.complementMbti || '未知'
  const level = persona?.complementLevel ?? 50
  const style = persona?.communicationStyle
  const memory = persona?.memory
  const behavior = persona?.behaviorProfile

  const parts: string[] = []
  parts.push(`你是「${persona?.name || '互补AI伙伴'}」，一个与用户人格互补的 AI 伙伴。`)
  parts.push(`用户人格类型：${userMbti}${profileText ? `（各维度强度：${profileText}）` : ''}`)
  parts.push(`你的互补人格类型：${complementMbti}，互补度 ${level}%（互补度越高，你与用户的人格差异越明显）。`)
  if (personaStore.bigFiveProfile) {
    parts.push(`用户大五人格：${bigFiveText}`)
    if (persona?.complementBigFive) {
      parts.push(`你的大五互补人格：${bigFiveDims.map(d => `${bigFiveMeta[d].label} ${persona.complementBigFive[d]}`).join('，')}`)
    }
  }
  parts.push('')
  parts.push('【互补维度指引】')
  parts.push(buildComplementGuidance(userMbti, complementMbti))
  const bfGuidance = buildBigFiveGuidance(personaStore.bigFiveProfile?.scores, persona?.complementBigFive)
  if (bfGuidance) {
    parts.push('')
    parts.push('【大五互补指引】')
    parts.push(bfGuidance)
  }

  if (style) {
    const formalityMap: Record<string, string> = { casual: '随和', neutral: '中性', formal: '正式' }
    parts.push('')
    parts.push(`【沟通风格】正式度：${formalityMap[style.formality] || '中性'}；语气：${style.tone.join('、')}；偏好：${style.signature}`)
  }

  if (behavior) {
    parts.push('')
    parts.push(`【你对用户的行为画像】${describeBehaviorProfile(behavior)}`)
  }

  if (memory && (memory.summary || (memory.userFacts && memory.userFacts.length))) {
    parts.push('')
    parts.push('【你对用户的记忆】')
    if (memory.userFacts && memory.userFacts.length) {
      parts.push(`用户提到过：${memory.userFacts.join('；')}`)
    }
    if (memory.summary) {
      parts.push(`最近话题：${memory.summary}`)
    }
  }

  const lastUserText = [...messages.value].reverse().find(m => m.role === 'user')?.content
  if (memory?.facts?.length && lastUserText) {
    const relevant = findRelevantFacts(memory.facts, lastUserText, 3)
    if (relevant.length) {
      parts.push('')
      parts.push('【与当前话题相关的用户经历/偏好】')
      relevant.forEach(f => parts.push(`- ${f.content}（重要度 ${f.importance}/5）`))
    }
  }

  parts.push('')
  parts.push('请始终从互补视角回应，先共情再给新视角，避免简单附和。')
  return parts.join('\n')
}

// ---------- 结构化输出 + Few-shot ----------

function buildStructuredInstruction(): string {
  return `请严格按照下面的 JSON 格式回复，不要输出任何 JSON 以外的文字：
{"perspective":"...","suggestions":["...","...","..."],"followUpQuestion":"..."}

字段说明：
- perspective：从互补人格视角给出的核心分析与洞察（80-150字）
- suggestions：2-4 条具体、可执行的建议
- followUpQuestion：1 个引导用户继续思考的苏格拉底式追问

参考示例（用户 INFJ，互补 ENTP，互补度 60%）：
用户：我最近工作压力很大，总想辞职。
{"perspective":"我理解这份疲惫。从更偏直觉(N)和思考(T)的视角看，你真正想逃离的或许不是工作本身，而是价值感缺失。","suggestions":["记录最近一周让你最有成就感的时刻，找到你的价值来源","和2-3位做过类似转型的人聊聊，获取真实参照","把辞职拆成换岗/转行/休息三个子选项分别评估"],"followUpQuestion":"如果明天就能辞职，你第一件想做的事是什么？"}`
}

function parseStructuredReply(content: string): StructuredReply {
  try {
    const cleaned = content.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no json')
    const json = JSON.parse(cleaned.slice(start, end + 1))
    return {
      perspective: typeof json.perspective === 'string' ? json.perspective : content,
      suggestions: Array.isArray(json.suggestions)
        ? json.suggestions.map((s: any) => String(s)).filter(Boolean)
        : [],
      followUpQuestion: typeof json.followUpQuestion === 'string' ? json.followUpQuestion : '',
    }
  } catch (e) {
    return { perspective: content, suggestions: [], followUpQuestion: '' }
  }
}

function formatStructuredText(reply: StructuredReply): string {
  const parts: string[] = []
  if (reply.perspective) parts.push(reply.perspective)
  if (reply.suggestions.length) {
    parts.push('【建议】')
    parts.push(reply.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }
  if (reply.followUpQuestion) {
    parts.push(`💬 ${reply.followUpQuestion}`)
  }
  return parts.join('\n\n')
}

// ---------- DeepSeek API（带对话历史） ----------

async function callDeepSeekAPI(userMessage: string): Promise<ChatResponse> {
  const apiKeyValue = uni.getStorageSync('deepseek_api_key')
  
  if (!apiKeyValue) {
    throw new Error('未设置 API Key')
  }

  const systemPrompt = buildSystemPrompt()
  const structuredInstruction = buildStructuredInstruction()
  const fullSystem = `${systemPrompt}\n\n${structuredInstruction}`

  // 注入最近最多 6 条历史（不含当前这条用户消息）
  const history = messages.value.slice(-7, -1).map(m => ({
    role: m.role,
    content: m.content,
  }))

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
        { role: 'system', content: fullSystem },
        ...history,
        { role: 'user', content: userMessage }
      ],
      stream: false,
      response_format: { type: 'json_object' }
    }
  })

  if (response.statusCode !== 200) {
    throw new Error(`API 请求失败: ${response.statusCode}`)
  }

  const data = response.data as any
  const content = data.choices[0].message.content
  const structured = parseStructuredReply(content)
  return { text: formatStructuredText(structured), structured }
}

// ---------- Mock 模式：场景化模板库 + 苏格拉底式引导 ----------

interface ScenarioTemplate {
  perspective: string
  suggestions: string[]
  followUp: string
}

const scenarioTemplates: Record<string, ScenarioTemplate> = {
  decision: {
    perspective: '从互补视角来看，选择没有绝对的对错，关键在于它是否与你的长期方向一致。比起"选哪个"，更值得关注的是你选择背后的动机。',
    suggestions: [
      '把每个选项的利弊分别写下来，给它们打分',
      '设想 1 年后回看，你会怎么评价这个选择',
      '先做一个最小成本的尝试，用真实反馈代替想象',
    ],
    followUp: '如果最坏的结果出现，你仍然愿意选的那个，往往就是答案——你觉得呢？',
  },
  emotion: {
    perspective: '我能感觉到这件事对你的影响。先别急着找解决方案，允许自己先被理解——情绪本身就在传递重要的信息。',
    suggestions: [
      '给此刻的情绪命名，写下它想告诉你什么',
      '区分事实、想法和感受，减少过度解读',
      '把情绪释放出来之后，再决定要不要行动',
    ],
    followUp: '如果可以给自己放一个小小的假，你最想做什么？',
  },
  relationship: {
    perspective: '关系中看似是对方的问题，往往有一半和我们自己有关。换个角度看，矛盾常常是双方需求没有被说清楚的信号。',
    suggestions: [
      '先描述事实，再表达感受，而不是直接指责',
      '问自己：这段关系里我最看重的是什么',
      '换位写下对方可能的想法，寻找共同点',
    ],
    followUp: '如果你是对方，听到你的这些话，你希望听到什么样的表达？',
  },
  goal: {
    perspective: '目标之所以让人焦虑，往往不是因为它太大，而是因为它还只是一个模糊的念头。把它变成可执行的小步，动力自然就回来了。',
    suggestions: [
      '把大目标拆成本周就能完成的 3 个小行动',
      '给自己设一个可衡量的进度反馈机制',
      '想象完成后的画面，用它驱动每天的行动',
    ],
    followUp: '如果这个目标只能推进一小步，你明天最愿意做的那一小步是什么？',
  },
  perspective: {
    perspective: '换一个视角，并不是否定你的想法，而是帮你看到边界之外的可能性。很多时候我们不是缺少答案，而是困在单一的问题框架里。',
    suggestions: [
      '假设十年后的你回看这件事，会给出什么建议',
      '用"如果是我最好的朋友遇到这件事"来重述问题',
      '列出这个问题的反面，看看它带来了什么新信息',
    ],
    followUp: '如果这个问题根本不是问题，那它可能是什么？',
  },
  default: {
    perspective: '这是一个值得认真对待的话题。作为与你互补的视角，我建议我们一起把它拆开来看，找到你真正在意的东西。',
    suggestions: [
      '试着把想法写下来，理清自己的真实诉求',
      '找到这件事里你能控制的部分，先行动起来',
      '保持开放心态，允许答案晚一点出现',
    ],
    followUp: '你希望从这次对话里带走什么？',
  },
}

function detectScenario(text: string): string {
  if (/决定|决策|选择|怎么办|纠结|迷茫|犹豫/.test(text)) return 'decision'
  if (/压力|焦虑|烦|累|难过|情绪|心情|生气|委屈|孤独|失眠|抑郁/.test(text)) return 'emotion'
  if (/朋友|同事|伴侣|家人|关系|吵架|相处|分手|父母/.test(text)) return 'relationship'
  if (/目标|计划|规划|梦想|愿望|想要|未来|改变/.test(text)) return 'goal'
  if (/角度|思维|想法|思考|视角/.test(text)) return 'perspective'
  return 'default'
}

function generateMockResponse(text: string): ChatResponse {
  const scenario = detectScenario(text)
  const template = scenarioTemplates[scenario]
  const structured: StructuredReply = {
    perspective: template.perspective,
    suggestions: [...template.suggestions],
    followUpQuestion: template.followUp,
  }
  return { text: formatStructuredText(structured), structured }
}

// ---------- 记忆层 ----------

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

function updateComplementLevel(e: any) {
  const target = e.detail.value
  const persona = personaStore.activePersona
  if (persona) {
    const ok = personaStore.updateComplementLevel(target)
    if (ok) {
      complementLevel.value = target
    } else {
      complementLevel.value = persona.complementLevel
      uni.showToast({ title: '互补度每月仅可调整一次', icon: 'none' })
    }
  } else {
    complementLevel.value = target
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

.suggestion-list {
  margin-top: 24rpx;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.suggestion-index {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 50%;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.suggestion-text {
  flex: 1;
  font-size: 28rpx;
  color: #444444;
  line-height: 1.5;
}

.follow-up {
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  background: rgba(118, 75, 162, 0.08);
  border-radius: 16rpx;
}

.follow-up-text {
  font-size: 28rpx;
  color: #764ba2;
  line-height: 1.5;
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
