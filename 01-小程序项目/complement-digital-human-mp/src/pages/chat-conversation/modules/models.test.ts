import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  defaultModels,
  hasUsableAi,
  isReasoningModel,
  prioritizeModels,
  readGatewayConfig,
  readModels,
  resolveProvider,
  sanitizeModels,
  supportsJsonMode,
  usableModels,
  type UserModelConfig,
} from './models'

function makeGetter(entries: Record<string, unknown>) {
  const map = new Map(Object.entries(entries))
  return (key: string) => map.get(key)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('models: 多模型配置数据结构', () => {
  it('默认提供一条启用的 DeepSeek 空配置', () => {
    const list = defaultModels()
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ model: 'deepseek-chat', enabled: true, apiKey: '' })
  })

  it('sanitizeModels 剔除非法项并补齐字段', () => {
    const list = sanitizeModels([
      { model: 'deepseek-chat', apiKey: 'sk-1' },
      { model: '  ', enabled: true },
      null,
      { model: 'glm-4-plus', name: 'GLM', jsonMode: true, enabled: false },
    ])
    expect(list).toHaveLength(2)
    expect(list[0]).toMatchObject({
      name: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com/chat/completions',
      jsonMode: true,
      enabled: true,
    })
    expect(list[1]).toMatchObject({ name: 'GLM', model: 'glm-4-plus', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', enabled: false })
  })

  it('sanitizeModels 空数组回退默认配置', () => {
    expect(sanitizeModels([])).toHaveLength(1)
    expect(sanitizeModels('not-array' as unknown)).toHaveLength(1)
  })

  it('readModels 从 storage 读取数组', () => {
    const getter = makeGetter({
      ai_models: [{ model: 'kimi-k2', apiKey: 'sk-kimi', enabled: true }],
    })
    const list = readModels(getter)
    expect(list[0].model).toBe('kimi-k2')
    expect(list[0].baseUrl).toBe('https://api.moonshot.cn/v1/chat/completions')
  })

  it('readModels 兼容旧版 deepseek_api_key 单键配置', () => {
    const getter = makeGetter({ deepseek_api_key: 'sk-legacy' })
    const list = readModels(getter)
    expect(list).toHaveLength(1)
    expect(list[0].apiKey).toBe('sk-legacy')
    expect(list[0].model).toBe('deepseek-chat')
  })

  it('readModels 无任何配置时回退默认', () => {
    const getter = makeGetter({})
    expect(readModels(getter)[0].model).toBe('deepseek-chat')
  })

  it('usableModels 只保留启用且有 Key 的模型', () => {
    const list: UserModelConfig[] = [
      { name: 'A', model: 'a', baseUrl: 'u', apiKey: 'k', jsonMode: true, enabled: true },
      { name: 'B', model: 'b', baseUrl: 'u', apiKey: '', jsonMode: true, enabled: true },
      { name: 'C', model: 'c', baseUrl: 'u', apiKey: 'k2', jsonMode: true, enabled: false },
    ]
    const usable = usableModels(list)
    expect(usable).toHaveLength(1)
    expect(usable[0].model).toBe('a')
  })

  it('isReasoningModel 判定推理类慢模型', () => {
    expect(isReasoningModel('deepseek-reasoner')).toBe(true)
    expect(isReasoningModel('o1-mini')).toBe(true)
    expect(isReasoningModel('o3-pro')).toBe(true)
    expect(isReasoningModel('deepseek-chat')).toBe(false)
    expect(isReasoningModel('glm-4-plus')).toBe(false)
    expect(isReasoningModel('')).toBe(false)
  })

  it('prioritizeModels 把推理类慢模型稳定挪到末尾，快速模型保持原顺序', () => {
    const list: UserModelConfig[] = [
      { name: 'A', model: 'glm-4-plus', baseUrl: 'u', apiKey: 'k', jsonMode: true, enabled: true },
      { name: 'B', model: 'deepseek-reasoner', baseUrl: 'u', apiKey: 'k', jsonMode: true, enabled: true },
      { name: 'C', model: 'deepseek-chat', baseUrl: 'u', apiKey: 'k', jsonMode: true, enabled: true },
      { name: 'D', model: 'o1-mini', baseUrl: 'u', apiKey: 'k', jsonMode: true, enabled: true },
    ]
    const sorted = prioritizeModels(list)
    expect(sorted.map(m => m.model)).toEqual(['glm-4-plus', 'deepseek-chat', 'deepseek-reasoner', 'o1-mini'])
  })

  it('resolveProvider 与 supportsJsonMode 按模型推断', () => {
    expect(resolveProvider('gpt-4o-mini')).toBe('openai')
    expect(resolveProvider('moonshot-v1-8k')).toBe('moonshot')
    expect(resolveProvider('glm-4-plus')).toBe('zhipu')
    expect(resolveProvider('deepseek-chat')).toBe('deepseek')
    expect(supportsJsonMode('deepseek-reasoner')).toBe(false)
    expect(supportsJsonMode('o1-mini')).toBe(false)
    expect(supportsJsonMode('deepseek-chat')).toBe(true)
  })

  it('readGatewayConfig 支持内置/自定义/关闭三态', () => {
    expect(readGatewayConfig(makeGetter({})).enabled).toBe(false)
    expect(
      readGatewayConfig(makeGetter({ use_cloud_proxy: true, cloud_gateway_url: 'https://gw.example.com/chat' }))
    ).toMatchObject({ enabled: true, url: 'https://gw.example.com/chat' })
    expect(
      readGatewayConfig(makeGetter({ use_cloud_proxy: false, cloud_gateway_url: 'https://gw.example.com/chat' })).enabled
    ).toBe(false)
  })

  it('hasUsableAi 在可用模型或可用网关任一存在时为真', () => {
    expect(hasUsableAi(makeGetter({ ai_models: [{ model: 'deepseek-chat', apiKey: 'sk' }] }))).toBe(true)
    expect(hasUsableAi(makeGetter({ ai_models: [{ model: 'deepseek-chat', apiKey: '' }] }))).toBe(false)
    expect(hasUsableAi(makeGetter({ use_cloud_proxy: true, cloud_gateway_url: 'https://gw.example.com/chat' }))).toBe(true)
    expect(hasUsableAi(makeGetter({}))).toBe(false)
  })
})