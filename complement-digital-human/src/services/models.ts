export interface UserModelConfig {
  name: string
  model: string
  baseUrl: string
  apiKey: string
  jsonMode: boolean
  enabled: boolean
}

export interface GatewayConfig {
  enabled: boolean
  url: string
  token: string
}

// ===== 开发者内置网关配置（可选兜底入口）=====
// 部署 chat-gateway 云函数后，将地址与令牌填入此处，用户无需配置 API Key 即可使用内置模型
// 留空则网关仅当用户自定义了网关地址时才可用
const BUILTIN_GATEWAY_URL = ''
const BUILTIN_GATEWAY_TOKEN = ''

export const LEGACY_API_KEY_KEY = 'deepseek_api_key'

export const DEFAULT_DEEPSEEK_BASE_URL = 'https://api.deepseek.com/chat/completions'

export function defaultModels(): UserModelConfig[] {
  return [
    {
      name: 'DeepSeek',
      model: 'deepseek-chat',
      baseUrl: DEFAULT_DEEPSEEK_BASE_URL,
      apiKey: '',
      jsonMode: true,
      enabled: true,
    },
  ]
}

// 推理类模型不支持 response_format 强制 JSON，需降级为提示词约束 + 客户端容错解析
export function supportsJsonMode(model: unknown): boolean {
  if (typeof model !== 'string' || !model) return true
  return !(model === 'deepseek-reasoner' || model.startsWith('o1-') || model.startsWith('o3-'))
}

// 根据模型名前缀推断提供商（网关透传 / 直连默认地址使用）
export function resolveProvider(model: unknown): string {
  if (typeof model !== 'string' || !model) return 'deepseek'
  if (model.startsWith('deepseek-')) return 'deepseek'
  if (model.startsWith('gpt-') || model.startsWith('o1-') || model.startsWith('o3-') || model.startsWith('chatgpt-')) return 'openai'
  if (model.startsWith('moonshot-') || model.startsWith('kimi')) return 'moonshot'
  if (model.startsWith('glm-')) return 'zhipu'
  return 'deepseek'
}

export function defaultBaseUrlFor(model: unknown): string {
  const p = resolveProvider(model)
  if (p === 'openai') return 'https://api.openai.com/v1/chat/completions'
  if (p === 'moonshot') return 'https://api.moonshot.cn/v1/chat/completions'
  if (p === 'zhipu') return 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  return DEFAULT_DEEPSEEK_BASE_URL
}

// 校验并补全用户自定义的模型列表，非法条目剔除，列表为空回退默认一条
export function sanitizeModels(raw: unknown): UserModelConfig[] {
  if (!Array.isArray(raw)) return defaultModels()
  const list = raw
    .filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
    .map((m) => {
      const model = typeof m.model === 'string' ? m.model.trim() : ''
      const name = typeof m.name === 'string' && m.name.trim() ? m.name.trim() : model || '模型'
      const baseUrl = typeof m.baseUrl === 'string' && m.baseUrl.trim() ? m.baseUrl.trim() : defaultBaseUrlFor(model)
      return {
        name,
        model,
        baseUrl,
        apiKey: typeof m.apiKey === 'string' ? m.apiKey : '',
        jsonMode: typeof m.jsonMode === 'boolean' ? m.jsonMode : supportsJsonMode(model),
        enabled: m.enabled !== false,
      } as UserModelConfig
    })
    .filter((m) => m.model)
  return list.length ? list : defaultModels()
}

export function readModels(getStorage: (key: string) => unknown): UserModelConfig[] {
  const raw = getStorage('ai_models')
  if (raw === null || raw === undefined || raw === '') {
    const legacyKey = getStorage(LEGACY_API_KEY_KEY)
    if (typeof legacyKey === 'string' && legacyKey.trim()) {
      return [{ ...defaultModels()[0], apiKey: legacyKey.trim() }]
    }
    return defaultModels()
  }
  return sanitizeModels(raw)
}

// 实际参与直连 failover 的模型：启用 且有 Key、模型名与接口地址
export function usableModels(models: UserModelConfig[]): UserModelConfig[] {
  return models.filter((m) => m.enabled && !!m.apiKey.trim() && !!m.model && !!m.baseUrl)
}

export function readGatewayConfig(getStorage: (key: string) => unknown): GatewayConfig {
  const switchOn = getStorage('use_cloud_proxy') !== false
  const customUrl = typeof getStorage('cloud_gateway_url') === 'string' ? (getStorage('cloud_gateway_url') as string).trim() : ''
  const customToken = typeof getStorage('cloud_gateway_token') === 'string' ? (getStorage('cloud_gateway_token') as string).trim() : ''
  const url = customUrl || BUILTIN_GATEWAY_URL
  return { enabled: switchOn && !!url, url, token: customToken || BUILTIN_GATEWAY_TOKEN }
}

// 判断当前是否具备可用的 AI 服务（任一可用直连模型 或 网关可用）
export function hasUsableAi(getStorage: (key: string) => unknown): boolean {
  return usableModels(readModels(getStorage)).length > 0 || readGatewayConfig(getStorage).enabled
}