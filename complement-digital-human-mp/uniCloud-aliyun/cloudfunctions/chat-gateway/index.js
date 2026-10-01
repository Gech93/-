'use strict'

const https = require('https')

// 密钥只保存在服务端：在 uniCloud 控制台为该云函数配置环境变量 DEEPSEEK_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/chat/completions'

function requestDeepSeek(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const url = new URL(DEEPSEEK_BASE_URL)
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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
  const { model = 'deepseek-chat', messages = [] } = event

  if (!Array.isArray(messages) || messages.length === 0) {
    return { code: 400, msg: 'messages 不能为空' }
  }
  if (!DEEPSEEK_API_KEY) {
    return { code: 500, msg: '服务端未配置 DEEPSEEK_API_KEY 环境变量' }
  }

  try {
    const res = await requestDeepSeek({
      model,
      messages,
      stream: false,
      response_format: { type: 'json_object' }
    })
    if (res.status !== 200) {
      const msg = res.data && res.data.error ? res.data.error.message : '上游请求失败'
      return { code: res.status, msg }
    }
    return { code: 0, data: res.data }
  } catch (e) {
    return { code: 500, msg: e && e.message ? e.message : '网关内部错误' }
  }
}