import { afterEach, describe, expect, it, vi } from 'vitest'
import { callDeepSeekAPI, type ApiDeps, type RequestOptions } from './api'
import type { PromptContext } from './prompt'

const content = JSON.stringify({
  perspective: '从互补视角来看，先看见情绪，再找解法。',
  suggestions: ['记录一周的成就时刻', '和转型过的朋友聊聊'],
  followUpQuestion: '如果明天就能改变，你最想先做什么？',
})

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

describe('callDeepSeekAPI', () => {
  it('网关成功时直接返回结构化回复，不再请求直连', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        cloud_gateway_token: 'tok-1',
        deepseek_api_key: 'sk-test',
      }),
    })
    ;(request as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ statusCode: 200, data: { code: 0, data: { choices: [{ message: { content } }] } } })

    const history = [
      { role: 'user' as const, content: '昨天聊过工作' },
      { role: 'assistant' as const, content: '嗯，可以展开说说' },
    ]
    const result = await callDeepSeekAPI({ userMessage: '最近压力很大', ctx: makeCtx(), history, deps })

    expect(result.text).toContain('先看见情绪')
    expect(result.structured?.suggestions).toHaveLength(2)
    const mock = request as ReturnType<typeof vi.fn>
    expect(mock).toHaveBeenCalledTimes(1)
    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://gateway.example.com/chat')
    expect(call.method).toBe('POST')
    expect(call.header.Authorization).toBe('Bearer tok-1')
    expect(call.data).toMatchObject({ model: 'deepseek-chat' })
    const messages = (call.data as { messages: Array<{ role: string; content: string }> }).messages
    expect(messages[0].role).toBe('system')
    expect(messages[0].content).toContain('互补AI伙伴')
    expect(messages[1]).toEqual({ role: 'user', content: '昨天聊过工作' })
    expect(messages[2]).toEqual({ role: 'assistant', content: '嗯，可以展开说说' })
    expect(messages[3]).toEqual({ role: 'user', content: '最近压力很大' })
  })

  it('网关失败（非 200）时回退直连并返回直连结果', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        deepseek_api_key: 'sk-test',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockResolvedValueOnce({ statusCode: 500, data: { code: 1, msg: '内部错误' } })
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: '我很难受', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
    const directCall = (mock.mock.calls[1] as [RequestOptions])[0]
    expect(directCall.url).toBe('https://api.deepseek.com/chat/completions')
    expect(directCall.header.Authorization).toBe('Bearer sk-test')
    expect(warn).toHaveBeenCalled()
  })

  it('网关请求抛异常时回退直连', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        deepseek_api_key: 'sk-test',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: '我很难受', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('未启用网关时直接请求直连', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({ deepseek_api_key: 'sk-test' }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    const result = await callDeepSeekAPI({ userMessage: '你好', ctx: makeCtx(), history: [], deps })

    expect(result.text).toContain('先看见情绪')
    expect(mock).toHaveBeenCalledTimes(1)
    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://api.deepseek.com/chat/completions')
    expect(call.header.Authorization).toBe('Bearer sk-test')
    expect(call.data).toMatchObject({ stream: false, response_format: { type: 'json_object' } })
    const messages = (call.data as { messages: Array<{ role: string }> }).messages
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: '你好' })
  })

  it('未设置 API Key 时抛出错误且不发请求', async () => {
    const request = vi.fn()
    const deps = makeDeps({ request: request as ApiDeps['request'] })

    await expect(
      callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })
    ).rejects.toThrow('未设置 API Key')
    expect(request as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()
  })

  it('直连非 200 状态码时抛出错误', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({ deepseek_api_key: 'sk-test' }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 429, data: {} })

    await expect(
      callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })
    ).rejects.toThrow('API 请求失败: 429')
  })

  it('预设模型走网关时透传 provider 与 jsonMode', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        ai_model: 'gpt-4o-mini',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { code: 0, data: { choices: [{ message: { content } }] } } })

    await callDeepSeekAPI({ userMessage: '最近压力很大', ctx: makeCtx(), history: [], deps })

    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.data).toMatchObject({ model: 'gpt-4o-mini', provider: 'openai', jsonMode: true })
  })

  it('推理类模型（deepseek-reasoner）直连时不携带 response_format', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        deepseek_api_key: 'sk-test',
        ai_model: 'deepseek-reasoner',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.data).toMatchObject({ model: 'deepseek-reasoner', stream: false })
    expect(call.data).not.toHaveProperty('response_format')
  })

  it('自定义模型即使启用网关也跳过网关直接请求自定义接口', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        use_cloud_proxy: true,
        cloud_gateway_url: 'https://gateway.example.com/chat',
        deepseek_api_key: 'sk-test',
        ai_model: '__custom__',
        ai_custom_model: 'qwen-plus',
        ai_base_url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    expect(mock).toHaveBeenCalledTimes(1)
    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation')
    expect(call.header.Authorization).toBe('Bearer sk-test')
    expect(call.data).toMatchObject({ model: 'qwen-plus', stream: false })
  })

  it('自定义模型未填模型名与接口地址时回退 DeepSeek 默认值', async () => {
    const request = vi.fn()
    const deps = makeDeps({
      request: request as ApiDeps['request'],
      getStorage: makeGetter({
        deepseek_api_key: 'sk-test',
        ai_model: '__custom__',
      }),
    })
    const mock = request as ReturnType<typeof vi.fn>
    mock.mockResolvedValueOnce({ statusCode: 200, data: { choices: [{ message: { content } }] } })

    await callDeepSeekAPI({ userMessage: 'hi', ctx: makeCtx(), history: [], deps })

    const call = (mock.mock.calls[0] as [RequestOptions])[0]
    expect(call.url).toBe('https://api.deepseek.com/chat/completions')
    expect(call.data).toMatchObject({ model: 'deepseek-chat', stream: false })
  })
})