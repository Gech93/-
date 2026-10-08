import { buildSystemPrompt, buildStructuredInstruction, type PromptContext } from './prompt'
import { formatStructuredText, parseStructuredReply, type ChatResponse, type StructuredReply } from './structured'
import {
  readGatewayConfig,
  readModels,
  resolveProvider,
  supportsJsonMode,
  usableModels,
  type GatewayConfig,
  type UserModelConfig,
} from './models'

export interface ChatCompletionData {
  choices?: Array<{ message?: { content?: string } }>
}

export interface GatewayResponse {
  code?: number
  msg?: string
  data?: ChatCompletionData
}

export interface RequestOptions {
  url: string
  method: 'POST'
  header: Record<string, string>
  data: unknown
  timeout: number
  enableChunked?: boolean
}

export interface RequestResult {
  statusCode: number
  data: unknown
}

// 流式分块回调：传入的是底层原始分块数据（如 wx.request onChunkReceived 的 res.data）
export type ChunkCallback = (chunk: string) => void

export interface ApiDeps {
  request: (options: RequestOptions, onChunk?: ChunkCallback) => Promise<RequestResult>
  getStorage: (key: string) => unknown
  supportsChunked?: boolean
}

export interface CallDeepSeekParams {
  userMessage: string
  ctx: PromptContext
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  deps?: ApiDeps
  onText?: (text: string) => void
}

const defaultDeps: ApiDeps = {
  request: (options, onChunk) => {
    const task = uni.request({
      url: options.url,
      method: options.method,
      header: options.header,
      data: options.data as string,
      timeout: options.timeout,
      enableChunked: !!options.enableChunked,
    }) as unknown as Promise<RequestResult> & {
      onChunkReceived?: (cb: (res: { data?: string }) => void) => void
    }

    if (onChunk && options.enableChunked && typeof task.onChunkReceived === 'function') {
      task.onChunkReceived((res) => {
        if (typeof res.data === 'string' && res.data) onChunk(res.data)
      })
    }
    return task
  },
  getStorage: (key) => uni.getStorageSync(key),
  supportsChunked: true,
}

// 格式异常判定：结构化解析发生降级（JSON 解析失败或 perspective 缺失），返回的是原文透传
function isFormatFailure(content: string, structured: StructuredReply): boolean {
  return structured.perspective === content
}

// 解析 OpenAI 风格 SSE 分块行，返回增量文本；仅解析 data: 行并跳过 [DONE]
function parseSseLine(line: string): string {
  const trimmed = line.trim()
  if (!trimmed.startsWith('data:')) return ''
  const payload = trimmed.slice(5).trim()
  if (!payload || payload === '[DONE]') return ''
  try {
    const parsed = JSON.parse(payload)
    return parsed?.choices?.[0]?.delta?.content ?? ''
  } catch (e) {
    return ''
  }
}

// SSE 流累积器：跨 chunk 处理半行缓冲，把原始分块增量解析为纯文本片段（转发给 onText），
// 并在结束时返回累积的完整纯文本内容（用于结构化解析与格式校验）
function createSseAccumulator(onText?: (text: string) => void): {
  content: () => string
  gotData: () => boolean
  onData: (chunk: string) => void
  flush: () => void
} {
  const textParts: string[] = []
  let lineBuffer = ''
  let gotAny = false

  const consumeLine = (line: string) => {
    const piece = parseSseLine(line)
    if (!piece) return
    textParts.push(piece)
    if (onText) onText(piece)
  }

  return {
    content: () => textParts.join(''),
    gotData: () => gotAny,
    onData: (chunk) => {
      gotAny = true
      lineBuffer += chunk
      let nl: number
      while ((nl = lineBuffer.indexOf('\n')) >= 0) {
        const line = lineBuffer.slice(0, nl)
        lineBuffer = lineBuffer.slice(nl + 1)
        consumeLine(line)
      }
    },
    flush: () => {
      if (lineBuffer) {
        consumeLine(lineBuffer)
        lineBuffer = ''
      }
    },
  }
}

function directRequest(
  deps: ApiDeps,
  model: UserModelConfig,
  messages: Array<{ role: string; content: string }>,
  onText?: (text: string) => void
): Promise<ChatResponse | null> {
  const jsonMode = model.jsonMode && supportsJsonMode(model.model)
  const useChunked = !!deps.supportsChunked
  const acc = createSseAccumulator(onText)
  return deps
    .request(
      {
        url: model.baseUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`,
        },
        data: {
          model: model.model,
          messages,
          stream: useChunked,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        },
        timeout: 30000,
        enableChunked: useChunked,
      },
      useChunked ? acc.onData : undefined
    )
    .then((res) => {
      if (res.statusCode !== 200) {
        console.warn(`[failover] 直连 ${model.name}(${model.model}) 失败: HTTP ${res.statusCode}`)
        return null
      }
      let content: string
      if (useChunked && acc.gotData()) {
        // 流式路径：解析所有分块行后取完整纯文本，换行被 SSE 帧分隔故直接去除
        acc.flush()
        content = acc.content().replace(/\r?\n/g, '')
      } else {
        const body = res.data as ChatCompletionData
        content = body.choices?.[0]?.message?.content ?? ''
      }
      const structured = parseStructuredReply(content)
      if (isFormatFailure(content, structured)) {
        console.warn(`[failover] 直连 ${model.name}(${model.model}) 返回内容无法解析为结构化回复，切换下一个`)
        return null
      }
      return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
    })
    .catch((e) => {
      console.warn(`[failover] 直连 ${model.name}(${model.model}) 异常:`, e)
      return null
    })
}

function gatewayRequest(
  deps: ApiDeps,
  gateway: GatewayConfig,
  primary: UserModelConfig | undefined,
  messages: Array<{ role: string; content: string }>,
  onText?: (text: string) => void
): Promise<ChatResponse | null> {
  const model = primary ? primary.model : 'deepseek-chat'
  const provider = primary ? resolveProvider(primary.model) : 'deepseek'
  const jsonMode = primary ? primary.jsonMode : true
  const useChunked = !!deps.supportsChunked
  const acc = createSseAccumulator(onText)
  return deps
    .request(
      {
        url: gateway.url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...(gateway.token ? { Authorization: `Bearer ${gateway.token}` } : {}),
        },
        data: { model, provider, jsonMode, messages, stream: useChunked },
        timeout: 30000,
        enableChunked: useChunked,
      },
      useChunked ? acc.onData : undefined
    )
    .then((res) => {
      const body = res.data as GatewayResponse
      if (res.statusCode !== 200 || !body || body.code !== 0 || !body.data) {
        console.warn('[failover] 网关兜底失败:', body?.msg || res.statusCode)
        return null
      }
      let content: string
      if (useChunked && acc.gotData()) {
        acc.flush()
        content = acc.content().replace(/\r?\n/g, '')
      } else {
        content = body.data.choices?.[0]?.message?.content ?? ''
      }
      const structured = parseStructuredReply(content)
      if (isFormatFailure(content, structured)) {
        console.warn('[failover] 网关兜底返回内容无法解析为结构化回复')
        return null
      }
      return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
    })
    .catch((e) => {
      console.warn('[failover] 网关兜底异常:', e)
      return null
    })
}

export async function callDeepSeekAPI(params: CallDeepSeekParams): Promise<ChatResponse> {
  const { userMessage, ctx, history, deps = defaultDeps, onText } = params

  const systemPrompt = buildSystemPrompt(ctx)
  const structuredInstruction = buildStructuredInstruction()
  const fullSystem = `${systemPrompt}\n\n${structuredInstruction}`

  const requestMessages = [
    { role: 'system', content: fullSystem },
    ...history,
    { role: 'user', content: userMessage },
  ]

  const models = usableModels(readModels(deps.getStorage))
  const gateway = readGatewayConfig(deps.getStorage)

  if (models.length === 0 && !gateway.enabled) {
    throw new Error('未配置可用的 AI 服务：请在设置中添加至少一个带 API Key 的模型，或启用云端网关')
  }

  // 客户端直连优先：按配置顺序逐个尝试，硬失败或格式异常自动切换下一个
  for (const model of models) {
    const result = await directRequest(deps, model, requestMessages, onText)
    if (result) return result
  }

  // 网关兜底：全部直连失败后尝试一次
  if (gateway.enabled) {
    const result = await gatewayRequest(deps, gateway, models[0], requestMessages, onText)
    if (result) return result
  }

  throw new Error(`所有模型均请求失败，请检查 API Key、接口地址或稍后重试（共尝试 ${models.length || 0} 个直连模型${gateway.enabled ? ' + 网关' : ''}）`)
}