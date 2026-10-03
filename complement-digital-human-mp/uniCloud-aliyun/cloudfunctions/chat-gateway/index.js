'use strict'

const https = require('https')

// 安全要求：在 uniCloud 控制台为该云函数配置环境变量
//   - DEEPSEEK_API_KEY   DeepSeek 密钥（内置网关默认模型 deepseek-chat 必填）
//   - OPENAI_API_KEY     OpenAI 密钥（使用 gpt-*/o1-*/o3-* 模型时必填）
//   - MOONSHOT_API_KEY   Moonshot/Kimi 密钥（使用 moonshot-*/kimi-* 模型时必填）
//   - ZHIPU_API_KEY      智谱密钥（使用 glm-* 模型时必填）
//   - CHAT_GATEWAY_TOKEN 网关访问令牌（必填；客户端「网关令牌」需填相同值，请求头携带 Authorization: Bearer <token>）
//   - CHAT_GATEWAY_RATE_LIMIT 每 60 秒允许的最大请求数（可选，默认 60）
const CHAT_GATEWAY_TOKEN = process.env.CHAT_GATEWAY_TOKEN || ''
const RATE_LIMIT = Math.max(1, parseInt(process.env.CHAT_GATEWAY_RATE_LIMIT || '60', 10) || 60)

// 支持的模型提供商：密钥全部留在服务端，客户端只传模型名
const PROVIDERS = {
  deepseek: {
    baseURL: 'https://api.deepseek.com/chat/completions',
    key: process.env.DEEPSEEK_API_KEY || '',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1/chat/completions',
    key: process.env.OPENAI_API_KEY || '',
  },
  moonshot: {
    baseURL: 'https://api.moonshot.cn/v1/chat/completions',
    key: process.env.MOONSHOT_API_KEY || '',
  },
  zhipu: {
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    key: process.env.ZHIPU_API_KEY || '',
  },
}

const MAX_MESSAGES = 30
const MAX_CONTENT_LENGTH = 8000
const VALID_ROLES = new Set(['system', 'user', 'assistant'])

// 根据模型名前缀路由到对应提供商
function resolveProvider(model) {
  if (typeof model !== 'string' || !model) return 'deepseek'
  if (model.startsWith('deepseek-')) return 'deepseek'
  if (model.startsWith('gpt-') || model.startsWith('o1-') || model.startsWith('o3-') || model.startsWith('chatgpt-')) return 'openai'
  if (model.startsWith('moonshot-') || model.startsWith('kimi')) return 'moonshot'
  if (model.startsWith('glm-')) return 'zhipu'
  return 'deepseek'
}

// 推理类模型不支持 response_format 强制 JSON，需降级为提示词约束 + 客户端容错解析
function supportsJsonResponse(model) {
  return !(model === 'deepseek-reasoner' || model.startsWith('o1-') || model.startsWith('o3-'))
}

// 简易滑动窗口限流（进程内存态，云函数冷启动会重置；防刷额度/DDoS 需替换为 redis 或数据库计数）
const hitWindow = []

function allowRequest(ip) {
  const now = Date.now()
  const windowStart = now - 60 * 1000
  while (hitWindow.length && hitWindow[0].t < windowStart) hitWindow.shift()
  const key = ip || 'global'
  if (hitWindow.filter(h => h.key === key).length >= RATE_LIMIT) return false
  hitWindow.push({ key, t: now })
  return true
}

// 清洗并裁剪消息，防止超长 prompt 与非法角色消耗上游额度
function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return null
  const safe = messages
    .slice(0, MAX_MESSAGES)
    .map(m => {
      const role = m && typeof m.role === 'string' ? m.role : ''
      if (!VALID_ROLES.has(role)) return null
      const content = m && typeof m.content === 'string' ? m.content : ''
      return { role, content: content.slice(0, MAX_CONTENT_LENGTH) }
    })
    .filter(Boolean)
  return safe.length ? safe : null
}

function requestUpstream(payload, baseURL, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const url = new URL(baseURL)
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let raw = ''
        res.on('data', chunk => { raw += chunk })
        res.on('end', () => {
          let data = {}
          try {
            data = JSON.parse(raw)
          } catch (e) {
            data = { error: { message: '上游返回非 JSON 内容' } }
          }
          resolve({ status: res.statusCode, data })
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.main = async (event = {}) => {
  // URL 化（HTTP 触发）时请求体在 event.body；uniCloud.callFunction 方式时 event 即参数对象
  let payload = event
  if (event && (event.httpMethod || typeof event.body === 'string')) {
    try {
      payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {})
    } catch (e) {
      return { code: 400, msg: '请求体不是合法 JSON' }
    }
  }

  if (!CHAT_GATEWAY_TOKEN) {
    return { code: 500, msg: '服务端未配置 CHAT_GATEWAY_TOKEN 环境变量，无法提供网关服务' }
  }
  const headers = (event && event.headers) || {}
  const authHeader = headers.authorization || headers.Authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token || token !== CHAT_GATEWAY_TOKEN) {
    return { code: 401, msg: '访问令牌无效' }
  }

  const clientIP = (event && (event.clientIP || event.clientIp)) || ''
  if (!allowRequest(clientIP)) {
    return { code: 429, msg: '请求过于频繁，请稍后再试' }
  }

  const { model = 'deepseek-chat', messages = [], provider, jsonMode } = payload || {}
  const safeMessages = sanitizeMessages(messages)
  if (!safeMessages) {
    return { code: 400, msg: 'messages 不能为空或包含非法内容' }
  }

  const resolvedProvider = provider && PROVIDERS[provider] ? provider : resolveProvider(model)
  const providerConfig = PROVIDERS[resolvedProvider]
  if (!providerConfig) {
    return { code: 400, msg: `不支持的模型提供商: ${resolvedProvider}` }
  }
  if (!providerConfig.key) {
    return { code: 500, msg: `服务端未配置 ${resolvedProvider.toUpperCase()}_API_KEY 环境变量，无法使用该模型` }
  }

  const upstreamBody = { model, messages: safeMessages, stream: false }
  if (jsonMode !== false && supportsJsonResponse(model)) {
    upstreamBody.response_format = { type: 'json_object' }
  }

  try {
    const res = await requestUpstream(upstreamBody, providerConfig.baseURL, providerConfig.key)
    if (res.status !== 200) {
      const msg = res.data && res.data.error ? res.data.error.message : '上游请求失败'
      return { code: res.status, msg }
    }
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: 500, msg: e && e.message ? e.message : '网关内部错误' }
  }
}
