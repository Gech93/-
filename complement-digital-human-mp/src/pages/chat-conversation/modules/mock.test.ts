import { describe, expect, it } from 'vitest'
import { detectScenario, generateMockResponse, scenarioTemplates } from './mock'

describe('detectScenario', () => {
  it('识别决策类话题', () => {
    expect(detectScenario('我最近很纠结，不知道该选哪个工作')).toBe('decision')
    expect(detectScenario('帮我做个重要决定')).toBe('decision')
    expect(detectScenario('我好迷茫，不知道怎么办')).toBe('decision')
  })

  it('识别情绪类话题', () => {
    expect(detectScenario('最近压力好大，很焦虑')).toBe('emotion')
    expect(detectScenario('今天心情不好，很委屈')).toBe('emotion')
    expect(detectScenario('最近总是失眠')).toBe('emotion')
  })

  it('识别关系类话题', () => {
    expect(detectScenario('和同事吵架了')).toBe('relationship')
    expect(detectScenario('和伴侣最近总吵架')).toBe('relationship')
  })

  it('识别目标类话题', () => {
    expect(detectScenario('我想规划一下明年')).toBe('goal')
    expect(detectScenario('我的梦想是创业')).toBe('goal')
  })

  it('识别视角类话题', () => {
    expect(detectScenario('帮我换个角度思考')).toBe('perspective')
    expect(detectScenario('我想听听你的想法')).toBe('perspective')
  })

  it('无关键词时回落到 default', () => {
    expect(detectScenario('今天天气不错')).toBe('default')
    expect(detectScenario('')).toBe('default')
  })

  it('按声明顺序优先匹配（决策在情绪之前）', () => {
    expect(detectScenario('我很纠结要不要辞职，压力很大')).toBe('decision')
  })
})

describe('generateMockResponse', () => {
  it('返回对应场景模板的结构化回复', () => {
    const res = generateMockResponse('我该不该换工作，好纠结')
    expect(res.structured?.perspective).toContain(scenarioTemplates.decision.perspective)
    expect(res.structured?.suggestions).toEqual(scenarioTemplates.decision.suggestions)
    expect(res.structured?.followUpQuestion).toBe(scenarioTemplates.decision.followUp)
  })

  it('text 为结构化字段的格式化拼接', () => {
    const res = generateMockResponse('我该不该换工作，好纠结')
    expect(res.text).toContain(res.structured!.perspective)
    expect(res.text).toContain('【建议】')
    expect(res.text).toContain(`💬 ${res.structured!.followUpQuestion}`)
  })

  it('suggestions 是模板的副本，不被外部修改影响', () => {
    const res = generateMockResponse('我该不该换工作，好纠结')
    res.structured!.suggestions.push('额外建议')
    expect(scenarioTemplates.decision.suggestions).toHaveLength(3)
  })

  it('离线模式不产生 memoryUpdates', () => {
    const res = generateMockResponse('随便聊聊')
    expect(res.memoryUpdates).toBeUndefined()
  })
})
