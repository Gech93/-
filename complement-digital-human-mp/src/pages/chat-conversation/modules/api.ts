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
}

export interface RequestResult {
  statusCode: number
  data: unknown
}

export interface ApiDeps {
  request: (options: RequestOptions) => Promise<RequestResult>
  getStorage: (key: string) => unknown
}

export interface CallDeepSeekParams {
  userMessage: string
  ctx: PromptContext
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  deps?: ApiDeps
}

const defaultDeps: ApiDeps = {
  request: (options) =>
    uni.request({
      url: options.url,
      method: options.method,
      header: options.header,
      data: options.data as string,
      timeout: options.timeout,
    }) as unknown as Promise<RequestResult>,
  getStorage: (key) => uni.getStorageSync(key),
}

// 格式异常判定：结构化解析发生降级（JSON 解析失败或 perspective 缺失），返回的是原文透传
function isFormatFailure(content: string, structured: StructuredReply): boolean {
  return structured.perspective === content
}

function directRequest(
  deps: ApiDeps,
  model: UserModelConfig,
  messages: Array<{ role: string; content: string }>
): Promise<ChatResponse | null> {
  const jsonMode = model.jsonMode && supportsJsonMode(model.model)
  return deps
    .request({
      url: model.baseUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey}`,
      },
      data: {
        model: model.model,
        messages,
        stream: false,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      },
      timeout: 30000,
    })
    .then((res) => {
      if (res.statusCode !== 200) {
        console.warn(`[failover] 直连 ${model.name}(${model.model}) 失败: HTTP ${res.statusCode}`)
        return null
      }
      const body = res.data as ChatCompletionData
      const content = body.choices?.[0]?.message?.content ?? ''
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
  messages: Array<{ role: string; content: string }>
): Promise<ChatResponse | null> {
  const model = primary ? primary.model : 'deepseek-chat'
  const provider = primary ? resolveProvider(primary.model) : 'deepseek'
  const jsonMode = primary ? primary.jsonMode : true
  return deps
    .request({
      url: gateway.url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        ...(gateway.token ? { Authorization: `Bearer ${gateway.token}` } : {}),
      },
      data: { model, provider, jsonMode, messages },
      timeout: 30000,
    })
    .then((res) => {
      const body = res.data as GatewayResponse
      if (res.statusCode !== 200 || !body || body.code !== 0 || !body.data) {
        console.warn('[failover] 网关兜底失败:', body?.msg || res.statusCode)
        return null
      }
      const content = body.data.choices?.[0]?.message?.content ?? ''
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
  const { userMessage, ctx, history, deps = defaultDeps } = params

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
    const result = await directRequest(deps, model, requestMessages)
    if (result) return result
  }

  // 网关兜底：全部直连失败后尝试一次
  if (gateway.enabled) {
    const result = await gatewayRequest(deps, gateway, models[0], requestMessages)
    if (result) return result
  }

  throw new Error(`所有模型均请求失败，请检查 API Key、接口地址或稍后重试（共尝试 ${models.length || 0} 个直连模型${gateway.enabled ? ' + 网关' : ''}）`)
}