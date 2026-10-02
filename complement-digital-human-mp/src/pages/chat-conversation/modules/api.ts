import { buildSystemPrompt, buildStructuredInstruction, type PromptContext } from './prompt'
import { formatStructuredText, parseStructuredReply, type ChatResponse } from './structured'

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

  // 优先走云端网关（密钥留在服务端，客户端不暴露；携带访问令牌鉴权）
  const gatewayUrl = deps.getStorage('cloud_gateway_url') as string
  const useProxy = deps.getStorage('use_cloud_proxy') === true
  if (useProxy && gatewayUrl) {
    const gatewayToken = (deps.getStorage('cloud_gateway_token') as string) || ''
    try {
      const proxyRes = await deps.request({
        url: gatewayUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          ...(gatewayToken ? { Authorization: `Bearer ${gatewayToken}` } : {}),
        },
        data: { model: 'deepseek-chat', messages: requestMessages },
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

  const response = await deps.request({
    url: 'https://api.deepseek.com/chat/completions',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKeyValue}`
    },
    data: {
      model: 'deepseek-chat',
      messages: requestMessages,
      stream: false,
      response_format: { type: 'json_object' }
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
