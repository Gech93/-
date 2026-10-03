import { afterEach, describe, expect, it, vi } from 'vitest'
import { callDeepSeekAPI, type ApiDeps, type RequestOptions } from './api'
import type { PromptContext } from './prompt'
import type { UserModelConfig } from './models'

const content = JSON.stringify({
  perspective: '从互补视角来看，先看见情绪，再找解法。',
  suggestions: ['记录一周的成就时刻', '和转型过的朋友聊聊'],
  followUpQuestion: '如果明天就能改变，你最想先做什么？',
})

const PLAIN_TEXT = '抱歉，我暂时无法提供结构化回复。'

function makeModel(overrides: Partial<UserModelConfig> = {}): UserModelConfig {
  return {
    name: 'DeepSeek',
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    apiKey: 'sk-test',
    jsonMode: true,
    enabled: true,
    ...overrides,
  }
}

function makeCtx(overrides: Partial<PromptContext> = {}): PromptContext {
  return {
    persona: null,
    userMbti: 'INFJ',
    mbtiProfile: null,
    bigFiveProfile: null,
    lastUserText: '最近工作很烦',
    ...overrides,
  }
}

function makeGetter(entries: Record<string, unknown>) {
  const map = new Map(Object.entries(entries))
  return (key: string) => map.get(key)
}

function makeDeps(overrides: Partial<ApiDeps> = {}): ApiDeps {
  const request =
    overrides.request ||
    vi.fn((_options: RequestOptions) => Promise.resolve({ statusCode: 200, data: {} }))
  const getStorage = overrides.getStorage || makeGetter({})
  return { request, getStorage }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('callDeepSeekAPI: 多模型 failover', () => {
  it('单个直连模型成功时直接返回结构化回复', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({ ai_models: [makeModel()] }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const history = [
      { role: 'user' as const, content: '昨天聊过工作' },
      { role: 'assistant' as const, content: '嗯，可以展开说说' },
    ]
    const result = await callDeepSeekAPI({ userMessage: '最近压力很大', ctx: makeCtx(), history, deps })

    expect(result.text).toContain('先看见情绪')
    expect(result.structured?.suggestions).toHaveLength(2)
    expect(mock).toHaveBeenCalledTimes(1)
    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://api.deepseek.com/chat/completions')
    expect(call.header.Authorization).toBe('Bearer sk-test')
    expect(call.data).toMatchObject({ model: 'deepseek-chat', stream: false, response_format: { type: 'json_object' } })
    const messages = (call.data as { messages: Array<{ role: string; content: string }> }).messages
    expect(messages[0].role).toBe('system')
    expect(messages[0].content).toContain('互补AI伙伴')
    expect(messages[1]).toEqual({ role: 'user', content: '昨天聊过工作' })
    expect(messages[2]).toEqual({ role: 'assistant', content: '嗯，可以展开说说' })
    expect(messages[3]).toEqual({ role: 'user', content: '最近压力很大' })
  })

  it('第一个模型硬失败（非 200）时自动切换第二个模型', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [
          makeModel({ name: 'A', model: 'model-a', baseUrl: 'https://a.example.com/chat/completions', apiKey: 'sk-a' }),
          makeModel({ name: 'B', model: 'model-b', baseUrl: 'https://b.example.com/chat/completions', apiKey: 'sk-b' }),
        ],
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockResolvedValueOnce({ statusCode: 429, data: {} })
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: '我很难受', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
    const secondCall = (mock.mock.calls[1] as [RequestOptions])[0]
    expect(secondCall.url).toBe('https://b.example.com/chat/completions')
    expect(secondCall.header.Authorization).toBe('Bearer sk-b')
    expect(secondCall.data).toMatchObject({ model: 'model-b' })
  })

  it('第一个模型网络异常时自动切换第二个模型', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [
          makeModel({ name: 'A', baseUrl: 'https://a.example.com/chat/completions', apiKey: 'sk-a' }),
          makeModel({ name: 'B', model: 'model-b', baseUrl: 'https://b.example.com/chat/completions', apiKey: 'sk-b' }),
        ],
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('模型返回内容无法解析为结构化 JSON 时切换下一个模型', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [
          makeModel({ name: 'A', baseUrl: 'https://a.example.com/chat/completions', apiKey: 'sk-a' }),
          makeModel({ name: 'B', model: 'model-b', baseUrl: 'https://b.example.com/chat/completions', apiKey: 'sk-b' }),
        ],
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content: PLAIN_TEXT } }] } })
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
    expect((mock.mock.calls[1] as [RequestOptions])[0].url).toBe('https://b.example.com/chat/completions')
  })

  it('全部直连失败且网关可用时走网关兜底', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [makeModel({ name: 'A', baseUrl: 'https://a.example.com/chat/completions', apiKey: 'sk-a' })],
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        cloud_gateway_token: 'tok-1',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockResolvedValueOnce({ statusCode: 500, data: {} })
      .mockResolvedValueOnce({
        statusCode: 200,
        data: { code: 0, data: { choices: [{ message: { content } }] } },
      })

    const result = await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
    const gwCall = (mock.mock.calls[1] as [RequestOptions])[0]
    expect(gwCall.url).toBe('https://gateway.example.com/chat')
    expect(gwCall.header.Authorization).toBe('Bearer tok-1')
    expect(gwCall.data).toMatchObject({ model: 'deepseek-chat', provider: 'deepseek', jsonMode: true })
  })

  it('全部直连失败且无网关时抛出所有模型均失败', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [makeModel({ apiKey: 'sk-bad' })],
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValue({ statusCode: 503, data: {} })

    await expect(
      callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })
    ).rejects.toThrow('所有模型均请求失败')
  })

  it('未启用模型且网关不可用时抛出未配置可用的 AI 服务', async () => {
    const request = vi.fn()
    const deps = makeDeps({ request: request as ApiDeps['request'] })

    await expect(
      callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })
    ).rejects.toThrow('未配置可用的 AI 服务')
    expect(request as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()
  })

  it('仅配置枚举模型但无网关时报未配置错误', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        ai_models: [{ model: 'deepseek-chat', apiKey: '', enabled: true }],
      }),
    })

    await expect(
      callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })
    ).rejects.toThrow('未配置可用的 AI 服务')
    expect(request as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()
  })

  it('推理类模型（deepseek-reasoner）直连时不携带 response_format', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({ ai_models: [makeModel({ model: 'deepseek-reasoner' })] }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.data).toMatchObject({ model: 'deepseek-reasoner', stream: false })
    expect(call.data).not.toHaveProperty('response_format')
  })

  it('GLM 模型接口地址留空时自动推导为智谱地址', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({ ai_models: [makeModel({ model: 'glm-4-plus', apiKey: 'sk-glm', baseUrl: '' })] }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://open.bigmodel.cn/api/paas/v4/chat/completions')
    expect(call.data).toMatchObject({ model: 'glm-4-plus', stream: false })
  })

  it('网关可用但无直连模型时直接走网关', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({
      statusCode: 200,
      data: { code: 0, data: { choices: [{ message: { content } }] } },
    })

    const result = await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(1)
    const gwCall = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(gwCall.url).toBe('https://gateway.example.com/chat')
    expect(gwCall.data).toMatchObject({ model: 'deepseek-chat', provider: 'deepseek' })
  })
})