import { buildSystemPrompt, buildStructuredInstruction, type MemoryInjection } from './deepseek'
import {
  readGatewayConfig,
  readModels,
  resolveProvider,
  supportsJsonMode,
  usableModels,
  type GatewayConfig,
  type UserModelConfig,
} from './models'

export interface MemoryUpdatePayload {
  facts?: Array<{ content: string; category?: string }>
  summary?: string
  behavior?: {
    emotionTendency?: string
    decisionStyle?: string
    expressionStyle?: string
    deepNeed?: string
  }
}

export interface StructuredReply {
  perspective: string
  suggestions: string[]
  followUpQuestion: string
  memoryUpdates?: MemoryUpdatePayload
}

export interface ChatResponse {
  text: string
  structured?: StructuredReply
  memoryUpdates?: MemoryUpdatePayload
}

export interface ChatCompletionData {
  choices?: Array<{ message?: { content?: string } }>
}

export interface GatewayResponse {
  code?: number
  msg?: string
  data?: ChatCompletionData
}

export interface CallAIParams {
  userMessage: string
  history: Array<{ role: string; content: string }>
  userMbti: string
  complementMbti: string
  complementLevel: number
  isDecisionMode: boolean
  personaName: string
  memoryInjection?: MemoryInjection
  getStorage?: (key: string) => unknown
}

const defaultGetStorage = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return undefined
    if (key === 'ai_models') return JSON.parse(raw)
    if (key === 'use_cloud_proxy') return raw !== 'false'
    return raw
  } catch (e) {
    return undefined
  }
}

const REQUEST_TIMEOUT = 30000

function fetchWithTimeout(url: string, init: RequestInit, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

// 解析结构化回复：永远返回降级对象（JSON 解析失败时 perspective 透传原文）
export function parseStructuredReply(content: string): StructuredReply {
  try {
    const cleaned = content.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no json')
    const json = JSON.parse(cleaned.slice(start, end + 1))
    return {
      perspective: typeof json.perspective === 'string' ? json.perspective : content,
      suggestions: Array.isArray(json.suggestions)
        ? json.suggestions.map((s: unknown) => String(s)).filter(Boolean)
        : [],
      followUpQuestion: typeof json.followUpQuestion === 'string' ? json.followUpQuestion : '',
      memoryUpdates: parseMemoryUpdates(json.memoryUpdates),
    }
  } catch (e) {
    return { perspective: content, suggestions: [], followUpQuestion: '' }
  }
}

export function parseMemoryUpdates(raw: unknown): MemoryUpdatePayload | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as { facts?: unknown; summary?: unknown; behavior?: unknown }
  const payload: MemoryUpdatePayload = {}
  if (Array.isArray(r.facts)) {
    const facts: Array<{ content: string; category?: string }> = []
    for (const f of r.facts) {
      const ff = f as { content?: unknown; category?: unknown }
      if (ff && typeof ff.content === 'string' && ff.content.trim()) {
        facts.push({
          content: ff.content.trim(),
          category: typeof ff.category === 'string' ? ff.category : undefined,
        })
        if (facts.length >= 3) break
      }
    }
    payload.facts = facts
  }
  if (typeof r.summary === 'string' && r.summary.trim()) {
    payload.summary = r.summary.trim()
  }
  if (r.behavior && typeof r.behavior === 'object') {
    const b = r.behavior as { emotionTendency?: unknown; decisionStyle?: unknown; expressionStyle?: unknown; deepNeed?: unknown }
    const behavior: { emotionTendency?: string; decisionStyle?: string; expressionStyle?: string; deepNeed?: string } = {}
    if (typeof b.emotionTendency === 'string') behavior.emotionTendency = b.emotionTendency
    if (typeof b.decisionStyle === 'string') behavior.decisionStyle = b.decisionStyle
    if (typeof b.expressionStyle === 'string') behavior.expressionStyle = b.expressionStyle
    if (typeof b.deepNeed === 'string') behavior.deepNeed = b.deepNeed
    if (Object.keys(behavior).length) payload.behavior = behavior
  }
  return payload
}

export function formatStructuredText(structured: StructuredReply): string {
  const parts: string[] = []
  if (structured.perspective) parts.push(structured.perspective)
  if (structured.suggestions.length) {
    parts.push('【建议】')
    parts.push(structured.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }
  if (structured.followUpQuestion) {
    parts.push(`💬 ${structured.followUpQuestion}`)
  }
  return parts.join('\n\n')
}

// 格式异常判定：结构化解析发生降级（JSON 解析失败或 perspective 缺失），返回的是原文透传
function isFormatFailure(content: string, structured: StructuredReply): boolean {
  return structured.perspective === content
}

async function directRequest(
  model: UserModelConfig,
  messages: Array<{ role: string; content: string }>
): Promise<ChatResponse | null> {
  const jsonMode = model.jsonMode && supportsJsonMode(model.model)
  try {
    const res = await fetchWithTimeout(model.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey}`,
      },
      body: JSON.stringify({
        model: model.model,
        messages,
        stream: false,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    })
    if (!res.ok) {
      console.warn(`[failover] 直连 ${model.name}(${model.model}) 失败: HTTP ${res.status}`)
      return null
    }
    const body = (await res.json().catch(() => ({}))) as ChatCompletionData
    const content = body.choices?.[0]?.message?.content ?? ''
    const structured = parseStructuredReply(content)
    if (isFormatFailure(content, structured)) {
      console.warn(`[failover] 直连 ${model.name}(${model.model}) 返回内容无法解析为结构化回复，切换下一个`)
      return null
    }
    return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
  } catch (e) {
    console.warn(`[failover] 直连 ${model.name}(${model.model}) 异常:`, e)
    return null
  }
}

async function gatewayRequest(
  gateway: GatewayConfig,
  primary: UserModelConfig | undefined,
  messages: Array<{ role: string; content: string }>
): Promise<ChatResponse | null> {
  const model = primary ? primary.model : 'deepseek-chat'
  const provider = primary ? resolveProvider(primary.model) : 'deepseek'
  const jsonMode = primary ? primary.jsonMode : true
  try {
    const res = await fetchWithTimeout(gateway.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gateway.token ? { Authorization: `Bearer ${gateway.token}` } : {}),
      },
      body: JSON.stringify({ model, provider, jsonMode, messages }),
    })
    const body = (await res.json().catch(() => ({}))) as GatewayResponse
    if (!res.ok || !body || body.code !== 0 || !body.data) {
      console.warn('[failover] 网关兜底失败:', body?.msg || res.status)
      return null
    }
    const content = body.data.choices?.[0]?.message?.content ?? ''
    const structured = parseStructuredReply(content)
    if (isFormatFailure(content, structured)) {
      console.warn('[failover] 网关兜底返回内容无法解析为结构化回复')
      return null
    }
    return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
  } catch (e) {
    console.warn('[failover] 网关兜底异常:', e)
    return null
  }
}

export async function callAI(params: CallAIParams): Promise<ChatResponse> {
  const {
    userMessage,
    history,
    userMbti,
    complementMbti,
    complementLevel,
    isDecisionMode,
    personaName,
    memoryInjection,
    getStorage = defaultGetStorage,
  } = params

  const systemPrompt =
    buildSystemPrompt(
      userMbti,
      complementMbti,
      complementLevel,
      isDecisionMode,
      personaName,
      memoryInjection
    ) + '\n\n' + buildStructuredInstruction()

  const requestMessages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const models = usableModels(readModels(getStorage))
  const gateway = readGatewayConfig(getStorage)

  if (models.length === 0 && !gateway.enabled) {
    throw new Error('未配置可用的 AI 服务：请在设置中添加至少一个带 API Key 的模型，或启用云端网关')
  }

  // 客户端直连优先：按配置顺序逐个尝试，硬失败或格式异常自动切换下一个
  for (const model of models) {
    const result = await directRequest(model, requestMessages)
    if (result) return result
  }

  // 网关兜底：全部直连失败后尝试一次
  if (gateway.enabled) {
    const result = await gatewayRequest(gateway, models[0], requestMessages)
    if (result) return result
  }

  throw new Error(`所有模型均请求失败，请检查 API Key、接口地址或稍后重试（共尝试 ${models.length || 0} 个直连模型${gateway.enabled ? ' + 网关' : ''}）`)
}