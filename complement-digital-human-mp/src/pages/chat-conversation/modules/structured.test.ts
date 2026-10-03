import { describe, expect, it } from 'vitest'
import { formatStructuredText, parseMemoryUpdates, parseStructuredReply } from './structured'

describe('parseStructuredReply', () => {
  it('剥离 ```json 标记并解析出结构化字段', () => {
    const content = '```json\n{"perspective":"互补视角","suggestions":["建议A","建议B"],"followUpQuestion":"追问"}\n```'
    const reply = parseStructuredReply(content)
    expect(reply.perspective).toBe('互补视角')
    expect(reply.suggestions).toEqual(['建议A', '建议B'])
    expect(reply.followUpQuestion).toBe('追问')
  })

  it('提取首尾花括号之间的 JSON，容忍前后多余文字', () => {
    const content = '好的，以下是回复：{"perspective":"核心洞察","suggestions":[],"followUpQuestion":""} 希望能帮到你'
    const reply = parseStructuredReply(content)
    expect(reply.perspective).toBe('核心洞察')
    expect(reply.suggestions).toEqual([])
  })

  it('完全非 JSON 内容降级为 perspective 原文，其余字段为空', () => {
    const content = '这是一段普通文本，没有 JSON 结构'
    const reply = parseStructuredReply(content)
    expect(reply.perspective).toBe(content)
    expect(reply.suggestions).toEqual([])
    expect(reply.followUpQuestion).toBe('')
    expect(reply.memoryUpdates).toBeUndefined()
  })

  it('非字符串字段回退：perspective 用原文，suggestions 非数组为空', () => {
    const content = '{"perspective":123,"suggestions":"不是数组","followUpQuestion":true}'
    const reply = parseStructuredReply(content)
    expect(reply.perspective).toBe(content)
    expect(reply.suggestions).toEqual([])
    expect(reply.followUpQuestion).toBe('')
  })

  it('suggestions 中的非字符串元素被字符串化，空字符串被过滤', () => {
    const content = '{"perspective":"p","suggestions":[42,"有效",null,""],"followUpQuestion":"q"}'
    const reply = parseStructuredReply(content)
    expect(reply.suggestions).toEqual(['42', '有效', 'null'])
  })
})

describe('parseMemoryUpdates', () => {
  it('返回 undefined 当输入为 null/非对象', () => {
    expect(parseMemoryUpdates(null)).toBeUndefined()
    expect(parseMemoryUpdates('str')).toBeUndefined()
    expect(parseMemoryUpdates(undefined)).toBeUndefined()
  })

  it('解析数组 facts 并裁剪 content 空白', () => {
    const updates = parseMemoryUpdates({
      facts: [{ content: '  最近工作压力大  ', category: 'emotion' }, { content: '喜欢读书' }],
    })
    expect(updates?.facts).toEqual([
      { content: '最近工作压力大', category: 'emotion' },
      { content: '喜欢读书', category: undefined },
    ])
  })

  it('过滤非字符串或空白 content 的事实', () => {
    const updates = parseMemoryUpdates({
      facts: [{ content: '有效事实' }, { content: 42 }, { content: '   ' }, null, { content: '' }],
    })
    expect(updates?.facts).toEqual([{ content: '有效事实', category: undefined }])
  })

  it('最多保留 3 条事实', () => {
    const updates = parseMemoryUpdates({
      facts: [1, 2, 3, 4, 5].map(i => ({ content: `事实${i}`, category: 'other' })),
    })
    expect(updates?.facts).toHaveLength(3)
    expect(updates?.facts?.[2].content).toBe('事实3')
  })

  it('category 非字符串时回退为 undefined', () => {
    const updates = parseMemoryUpdates({ facts: [{ content: 'x', category: 123 }] })
    expect(updates?.facts?.[0].category).toBeUndefined()
  })

  it('summary 为空白字符串时不写入', () => {
    expect(parseMemoryUpdates({ summary: '   ' })).toEqual({})
    const updates = parseMemoryUpdates({ summary: '  有效摘要  ' })
    expect(updates?.summary).toBe('有效摘要')
  })

  it('behavior 仅保留字符串字段（含空串），全非字符串时省略 behavior', () => {
    const updates = parseMemoryUpdates({
      behavior: { emotionTendency: '焦虑敏感', decisionStyle: 123, deepNeed: '' },
    })
    expect(updates?.behavior).toEqual({ emotionTendency: '焦虑敏感', deepNeed: '' })
    expect(parseMemoryUpdates({ behavior: { expressionStyle: 1 } })).toEqual({})
  })

  it('behavior 完整字段全部解析', () => {
    const updates = parseMemoryUpdates({
      behavior: { emotionTendency: 'a', decisionStyle: 'b', expressionStyle: 'c', deepNeed: 'd' },
    })
    expect(updates?.behavior).toEqual({ emotionTendency: 'a', decisionStyle: 'b', expressionStyle: 'c', deepNeed: 'd' })
  })
})

describe('formatStructuredText', () => {
  it('拼接视角、建议与追问', () => {
    const text = formatStructuredText({
      perspective: '核心洞察',
      suggestions: ['建议一', '建议二'],
      followUpQuestion: '追问一句',
    })
    expect(text).toContain('核心洞察')
    expect(text).toContain('【建议】')
    expect(text).toContain('1. 建议一')
    expect(text).toContain('2. 建议二')
    expect(text).toContain('💬 追问一句')
  })

  it('空建议与空追问不输出对应章节', () => {
    const text = formatStructuredText({ perspective: '只有视角', suggestions: [], followUpQuestion: '' })
    expect(text).toBe('只有视角')
  })
})
