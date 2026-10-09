import { describe, expect, it } from 'vitest'
import {
  adjustBigFiveWithBehavior,
  bigFiveOptionScores,
  bigFiveQuestions,
  bigramJaccard,
  bigramSet,
  calculateBigFiveProfile,
  calculateComplementBigFive,
  calculateComplementMbti,
  factMemoryStrength,
  feedbackSampleStrength,
  findRelevantFacts,
  getFlippedMbtiDims,
  inferBehaviorFromMessage,
} from './persona'
import type { BehaviorProfile, BigFiveScores, MemoryFact } from './persona'

const DAY = 24 * 60 * 60 * 1000
const now = () => new Date().toISOString()

const neutralScores: BigFiveScores = { O: 50, C: 50, E: 50, A: 50, N: 50 }

function makeFact(overrides: Partial<MemoryFact>): MemoryFact {
  return {
    id: 'f1',
    content: '事实内容',
    keywords: ['关键词'],
    importance: 3,
    category: 'other',
    createdAt: now(),
    lastAt: now(),
    ...overrides,
  }
}

describe('大五人格测评计算', () => {
  it('未作答时各维度回落到 50', () => {
    const profile = calculateBigFiveProfile({})
    expect(profile.scores).toEqual(neutralScores)
    expect(profile.confidence).toBe(0)
    expect(profile.descriptions.O).toContain('中性')
  })

  it('按外向作答开放题得到高分', () => {
    const openAnswers: Record<number, number> = {}
    bigFiveQuestions
      .filter(q => q.dimension === 'O')
      .forEach(q => {
        openAnswers[q.id] = q.reversed ? 0 : 4
      })
    const profile = calculateBigFiveProfile(openAnswers)
    expect(profile.scores.O).toBe(bigFiveOptionScores[4])
    expect(profile.descriptions.O).toContain('开放创新')
    expect(profile.confidence).toBeGreaterThan(0)
    expect(profile.confidence).toBeLessThanOrEqual(100)
  })

  it('反向作答开放题得到低分', () => {
    const closedAnswers: Record<number, number> = {}
    bigFiveQuestions
      .filter(q => q.dimension === 'O')
      .forEach(q => {
        closedAnswers[q.id] = q.reversed ? 4 : 0
      })
    const profile = calculateBigFiveProfile(closedAnswers)
    expect(profile.scores.O).toBe(bigFiveOptionScores[0])
    expect(profile.descriptions.O).toContain('务实传统')
  })
})

describe('MBTI 互补翻转', () => {
  it('50% 互补度翻转 2 个维度', () => {
    expect(calculateComplementMbti('INTJ', 50)).toBe('ESTJ')
    expect(calculateComplementMbti('ESTJ', 50)).toBe('INTJ')
  })

  it('100% 互补度翻转全部维度', () => {
    expect(calculateComplementMbti('INTJ', 100)).toBe('ESFP')
  })

  it('0% 互补度不翻转', () => {
    expect(calculateComplementMbti('INTJ', 0)).toBe('INTJ')
  })

  it('倾向弱的维度优先翻转', () => {
    const flipped = calculateComplementMbti('INTJ', 50, { E: 40, S: 90, T: 30, J: 60 })
    expect(flipped).toBe('ENTP')
  })

  it('getFlippedMbtiDims 返回集合尺寸与互补度对应', () => {
    expect(getFlippedMbtiDims('INTJ', 0).size).toBe(0)
    expect(getFlippedMbtiDims('INTJ', 50).size).toBe(2)
    expect(getFlippedMbtiDims('INTJ', 100).size).toBe(4)
  })
})

describe('大五互补人格计算', () => {
  it('中性人格在 50% 互补度下继续走向情绪稳定', () => {
    const result = calculateComplementBigFive(neutralScores, 50, undefined, 100)
    expect(result.O).toBe(50)
    expect(result.C).toBe(50)
    expect(result.E).toBe(50)
    expect(result.A).toBe(50)
    expect(result.N).toBe(38)
  })

  it('高外向分数被镜像收敛到可对话区间', () => {
    const result = calculateComplementBigFive({ O: 50, C: 50, E: 85, A: 50, N: 50 }, 50, undefined, 100)
    expect(result.E).toBe(54)
  })

  it('神经质维度永不制造高焦虑', () => {
    const result = calculateComplementBigFive({ O: 50, C: 50, E: 50, A: 50, N: 80 }, 50, undefined, 100)
    expect(result.N).toBe(60)
  })

  it('MBTI 翻转方向约束大五互补方向', () => {
    const result = calculateComplementBigFive(
      { O: 50, C: 50, E: 85, A: 50, N: 50 },
      50,
      { mbtiType: 'ESTJ' },
      100
    )
    expect(result.E).toBeLessThanOrEqual(50)
  })
})

describe('文本相似度与事实检索', () => {
  it('bigramSet 提取去标点小写二元组', () => {
    expect(bigramSet('读书')).toEqual(new Set(['读书']))
    expect(bigramSet('Hello!').has('he')).toBe(true)
  })

  it('完全相同的文本相似度为 1，空文本为 0', () => {
    expect(bigramJaccard('读书', '读书')).toBe(1)
    expect(bigramJaccard('', '读书')).toBe(0)
  })

  it('部分重叠文本计算 Jaccard 相似度', () => {
    const sim = bigramJaccard('我喜欢读书', '我喜欢看电影')
    expect(sim).toBeCloseTo(2 / 7, 5)
  })

  it('findRelevantFacts 返回语义最相关的事实', () => {
    const facts: MemoryFact[] = [
      makeFact({ id: 'f-books', content: '我很喜欢读书和文学', keywords: ['读书', '文学'], importance: 5 }),
      makeFact({ id: 'f-fitness', content: '我最近在健身和跑步', keywords: ['健身'], importance: 3 }),
      makeFact({ id: 'f-work', content: '工作压力很大经常加班', keywords: ['工作'], importance: 3 }),
    ]
    const result = findRelevantFacts(facts, '想让你推荐一本关于读书的书')
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].id).toBe('f-books')
  })

  it('findRelevantFacts 过滤完全无关的事实', () => {
    const facts: MemoryFact[] = [
      makeFact({ id: 'f1', content: '我很喜欢读书和文学', keywords: ['读书'], importance: 5 }),
    ]
    expect(findRelevantFacts(facts, '今天天气很好')).toEqual([])
  })

  it('已遗忘的陈旧事实不会进入检索结果', () => {
    const stale = makeFact({
      id: 'stale',
      content: '我很喜欢读书',
      keywords: ['读书'],
      importance: 1,
      lastAt: new Date(Date.now() - 150 * DAY).toISOString(),
    })
    const fresh = makeFact({
      id: 'fresh',
      content: '我很喜欢读书和文学',
      keywords: ['读书', '文学'],
      importance: 5,
    })
    const result = findRelevantFacts([stale, fresh], '想推荐一本关于读书的书')
    expect(result.map(f => f.id)).not.toContain('stale')
  })
})

describe('行为画像推断', () => {
  it('识别焦虑型情绪', () => {
    const bp = inferBehaviorFromMessage('最近好焦虑，压力很大，晚上都睡不好')
    expect(bp.emotionTendency).toBe('焦虑敏感')
  })

  it('识别积极乐观情绪', () => {
    expect(inferBehaviorFromMessage('今天真开心，特别兴奋！').emotionTendency).toBe('积极乐观')
  })

  it('识别低落情绪', () => {
    expect(inferBehaviorFromMessage('我很难过，感觉很孤独').emotionTendency).toBe('低落需要支持')
  })

  it('识别情绪波动', () => {
    expect(inferBehaviorFromMessage('烦死了，我真的很生气').emotionTendency).toBe('情绪易波动')
  })

  it('无情绪词时归为平稳理性', () => {
    expect(inferBehaviorFromMessage('今天做了个决定').emotionTendency).toBe('平稳理性')
  })

  it('识别犹豫型决策', () => {
    expect(inferBehaviorFromMessage('好纠结，不知道选哪个').decisionStyle).toBe('犹豫型，需要引导做决定')
  })

  it('识别果断型决策', () => {
    expect(inferBehaviorFromMessage('我决定了，一定要完成').decisionStyle).toBe('果断型，倾向自主决策')
  })

  it('识别参考型决策', () => {
    expect(inferBehaviorFromMessage('我朋友都说我应该听听大家的意见').decisionStyle).toBe(
      '参考型，重视他人意见'
    )
  })

  it('识别分析型决策', () => {
    expect(inferBehaviorFromMessage('我分析了成本和利弊，有替代方案').decisionStyle).toBe('分析型，偏好理性权衡')
  })

  it('识别求建议表达', () => {
    expect(inferBehaviorFromMessage('我该怎么办，帮帮我').expressionStyle).toBe('求建议，希望得到直接指导')
  })

  it('识别倾诉型表达', () => {
    expect(inferBehaviorFromMessage('我有点乱，说不清想讲什么').expressionStyle).toBe('倾诉型，需要被倾听')
  })

  it('识别需要职业成长的深层需求', () => {
    expect(inferBehaviorFromMessage('最近工作压力大，想寻求晋升路径').deepNeed).toBe('职业成长与价值认同')
  })

  it('识别兴趣探索的深层需求', () => {
    expect(inferBehaviorFromMessage('我喜欢读书和电影').deepNeed).toBe('自我实现与兴趣探索')
  })
})

describe('行为画像校正大五分数', () => {
  const bp: BehaviorProfile = {
    emotionTendency: '焦虑敏感',
    decisionStyle: '分析型，偏好理性权衡',
    expressionStyle: '表达型，希望观点被确认',
    deepNeed: '职业成长与价值认同',
    updateCount: 1,
    lastUpdatedAt: now(),
  }

  it('无行为画像时原样返回', () => {
    expect(adjustBigFiveWithBehavior(neutralScores, null)).toEqual(neutralScores)
  })

  it('默认权重 0.2 融合证据', () => {
    const result = adjustBigFiveWithBehavior(neutralScores, bp)
    expect(result.O).toBe(53)
    expect(result.C).toBe(50)
    expect(result.E).toBe(52)
    expect(result.A).toBe(50)
    expect(result.N).toBe(55)
  })

  it('权重为 1 时完全采用行为证据', () => {
    const result = adjustBigFiveWithBehavior(neutralScores, bp, 1)
    expect(result.O).toBe(65)
    expect(result.E).toBe(60)
    expect(result.N).toBe(75)
  })
})

describe('记忆衰减', () => {
  it('反馈强度按 7 天半衰期衰减', () => {
    const sample = { text: '有用', count: 2, lastAt: now() }
    expect(feedbackSampleStrength(sample)).toBeCloseTo(2, 5)
    sample.lastAt = new Date(Date.now() - 7 * DAY).toISOString()
    expect(feedbackSampleStrength(sample)).toBeCloseTo(1, 5)
    sample.lastAt = new Date(Date.now() - 14 * DAY).toISOString()
    expect(feedbackSampleStrength(sample)).toBeCloseTo(0.5, 5)
  })

  it('低认可度反馈在足够久后低于遗忘阈值', () => {
    const sample = { text: '没用', count: 1, lastAt: new Date(Date.now() - 28 * DAY).toISOString() }
    expect(feedbackSampleStrength(sample)).toBeLessThan(0.5)
  })

  it('事实强度按 30 天半衰期衰减', () => {
    const fact = makeFact({ importance: 4, lastAt: now() })
    expect(factMemoryStrength(fact)).toBeCloseTo(4, 5)
    fact.lastAt = new Date(Date.now() - 30 * DAY).toISOString()
    expect(factMemoryStrength(fact)).toBeCloseTo(2, 5)
  })

  it('低重要度事实在久未回顾后低于遗忘阈值', () => {
    const fact = makeFact({
      importance: 1,
      lastAt: new Date(Date.now() - 120 * DAY).toISOString(),
    })
    expect(factMemoryStrength(fact)).toBeLessThan(0.5)
  })
})