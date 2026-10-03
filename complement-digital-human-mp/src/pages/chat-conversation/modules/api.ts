import { buildSystemPrompt, buildStructuredInstruction, type PromptContext } from './prompt'
import { formatStructuredText, parseStructuredReply, type ChatResponse } from './structured'
import { getModelOption, isCustomModel, CUSTOM_MODEL_ID } from './models'

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

// ===== 开发者内置网关配置（开箱即用）=====
// 部署 chat-gateway 云函数后，将地址与令牌填入此处，用户无需任何配置即可使用 AI
// 留空则回退到用户自行配置的 API Key 模式
const BUILTIN_GATEWAY_URL = '' // 例: 'https://xxx.next.bspapp.com/chat-gateway'
const BUILTIN_GATEWAY_TOKEN = '' // 与云函数环境变量 CHAT_GATEWAY_TOKEN 保持一致

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

  // 模型配置：ai_model 存预设模型 id 或自定义标记；自定义模型走直连（网关不支持路由未知上游）
  const modelSetting = (deps.getStorage('ai_model') as string) || 'deepseek-chat'
  const isCustom = isCustomModel(modelSetting)
  const customModelName = (deps.getStorage('ai_custom_model') as string) || ''
  const customBaseUrl = (deps.getStorage('ai_base_url') as string) || ''
  const modelOpt = getModelOption(modelSetting)
  const requestModel = isCustom ? (customModelName || 'deepseek-chat') : modelSetting
  const useJsonMode = !isCustom && modelOpt.jsonMode

  // 优先走云端网关（密钥留在服务端，客户端不暴露；携带访问令牌鉴权）
  // 默认启用内置网关（开箱即用），用户未显式关闭时自动走网关；自定义模型跳过网关
  const useProxy = deps.getStorage('use_cloud_proxy') !== false
  const customGatewayUrl = (deps.getStorage('cloud_gateway_url') as string) || ''
  const gatewayUrl = customGatewayUrl || BUILTIN_GATEWAY_URL
  if (useProxy && gatewayUrl && !isCustom) {
    const gatewayToken = (deps.getStorage('cloud_gateway_token') as string) || BUILTIN_GATEWAY_TOKEN
    try {
      const proxyRes = await deps.request({
        url: gatewayUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...(gatewayToken ? { Authorization: `Bearer ${gatewayToken}` } : {}),
        },
        data: {
          model: requestModel,
          provider: modelOpt.provider,
          jsonMode: useJsonMode,
          messages: requestMessages,
        },
        timeout: 30000,
      })
      const body = proxyRes.data as GatewayResponse
      if (proxyRes.statusCode === 200 && body && body.code === 0 && body.data) {
        const content = body.data.choices?.[0]?.message?.content ?? ''
        const structured = parseStructuredReply(content)
        return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
      }
      console.warn('云端网关调用失败，回退直连:', body?.msg || proxyRes.statusCode)
    } catch (e) {
      console.warn('云端网关调用异常，回退直连:', e)
    }
  }

  const apiKeyValue = deps.getStorage('deepseek_api_key') as string
  if (!apiKeyValue) {
    throw new Error('未设置 API Key')
  }

  const directBaseUrl = isCustom ? (customBaseUrl || 'https://api.deepseek.com/chat/completions') : modelOpt.baseURL

  const response = await deps.request({
    url: directBaseUrl,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyValue}`
    },
    data: {
      model: requestModel,
      messages: requestMessages,
      stream: false,
      ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
    },
    timeout: 30000,
  })

  if (response.statusCode !== 200) {
    throw new Error(`API 请求失败: ${response.statusCode}`)
  }

  const data = response.data as ChatCompletionData
  const content = data.choices?.[0]?.message?.content ?? ''
  const structured = parseStructuredReply(content)
  return { text: formatStructuredText(structured), structured, memoryUpdates: structured.memoryUpdates }
}
