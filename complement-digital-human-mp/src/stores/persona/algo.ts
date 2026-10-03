import { bigFiveDims, bigFiveMeta, bigFiveOptionScores, bigFiveQuestions } from './types'
import type { BehaviorProfile, BigFiveProfile, BigFiveScores, MbtiScores } from './types'

function clampScore(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)))
}

function computeDimensionConsistency(answers: Record<number, number>): Record<keyof BigFiveScores, number> {
  const result = {} as Record<keyof BigFiveScores, number>
  bigFiveDims.forEach(d => {
    const forward: number[] = []
    const reverse: number[] = []
    Object.entries(answers).forEach(([qid, optionIndex]) => {
      const q = bigFiveQuestions.find(item => item.id === parseInt(qid))
      if (!q || q.dimension !== d) return
      const raw = bigFiveOptionScores[optionIndex] ?? 50
      const scored = q.reversed ? 100 - raw : raw
      if (q.reversed) reverse.push(scored)
      else forward.push(scored)
    })
    // 一致性 = 正题得分与反题反转得分越接近越一致；只有单侧题目时无法交叉验证，取保守默认值 0.5（既不奖励也不惩罚，避免置信度虚高）
    if (forward.length && reverse.length) {
      const avgF = forward.reduce((a, b) => a + b, 0) / forward.length
      const avgR = reverse.reduce((a, b) => a + b, 0) / reverse.length
      result[d] = Math.max(0, Math.min(1, 1 - Math.abs(avgF - avgR) / 100))
    } else {
      result[d] = 0.5
    }
  })
  return result
}

export function calculateBigFiveProfile(answers: Record<number, number>): BigFiveProfile {
  const accum: Record<keyof BigFiveScores, { sum: number; weight: number }> = {
    O: { sum: 0, weight: 0 },
    C: { sum: 0, weight: 0 },
    E: { sum: 0, weight: 0 },
    A: { sum: 0, weight: 0 },
    N: { sum: 0, weight: 0 },
  }

  Object.entries(answers).forEach(([qid, optionIndex]) => {
    const q = bigFiveQuestions.find(item => item.id === parseInt(qid))
    if (!q) return
    let score = bigFiveOptionScores[optionIndex] ?? 50
    if (q.reversed) score = 100 - score
    const w = q.weight ?? 1
    accum[q.dimension].sum += score * w
    accum[q.dimension].weight += w
  })

  const scores = {} as BigFiveScores
  bigFiveDims.forEach(d => {
    scores[d] = accum[d].weight > 0 ? clampScore(accum[d].sum / accum[d].weight) : 50
  })

  // 强度分：各维偏离 50 的程度
  const intensity = bigFiveDims.reduce((a, d) => a + Math.abs(scores[d] - 50) * 2, 0) / 5
  // 一致性分：正/反题作答矛盾会拉低可信度
  const consistencies = computeDimensionConsistency(answers)
  const consistency = bigFiveDims.reduce((a, d) => a + consistencies[d], 0) / 5
  const confidence = Math.round(intensity * consistency)

  const descriptions = {} as Record<keyof BigFiveScores, string>
  bigFiveDims.forEach(d => {
    const v = scores[d]
    descriptions[d] = v >= 60 ? `${bigFiveMeta[d].high}(${v})` : v <= 40 ? `${bigFiveMeta[d].low}(${v})` : `中性(${v})`
  })

  return { scores, confidence, descriptions }
}

const keyOf: Record<string, keyof MbtiScores> = { E: 'E', I: 'E', S: 'S', N: 'S', T: 'T', F: 'T', J: 'J', P: 'J' }

// 获取 MBTI 互补时被翻转的字母集合（复用翻转逻辑，供大五一致性约束使用）
export function getFlippedMbtiDims(mbti: string, complementLevel = 50, scores?: MbtiScores): Set<string> {
  const dims = mbti.split('')
  const level = Math.min(100, Math.max(0, complementLevel))
  const flipCount = Math.round((level / 100) * 4)
  const firmness = scores ? dims.map(d => Math.abs(scores[keyOf[d]] - 50)) : [0, 0, 0, 0]
  const flipOrder = [0, 1, 2, 3].sort((a, b) => firmness[a] - firmness[b])
  return new Set(flipOrder.slice(0, flipCount).map(i => dims[i]))
}

// MBTI 翻转方向 → 大五维度约束（互补人格方向应保持一致）
const mbtiFlipRule: Record<string, { dim: keyof BigFiveScores; dir: 1 | -1 }> = {
  E: { dim: 'E', dir: -1 }, // 翻 E → I(内向) → 大五 E 低
  I: { dim: 'E', dir: 1 },  // 翻 I → E(外向) → 大五 E 高
  S: { dim: 'O', dir: -1 }, // 翻 S → N(直觉) → 大五 O 低
  N: { dim: 'O', dir: 1 },  // 翻 N → S(实感) → 大五 O 高
  T: { dim: 'A', dir: -1 }, // 翻 T → F(情感) → 大五 A 低
  F: { dim: 'A', dir: 1 },  // 翻 F → T(思维) → 大五 A 高
  J: { dim: 'C', dir: 1 },  // 翻 J → P(随性) → 大五 C 高
  P: { dim: 'C', dir: -1 }, // 翻 P → J(自律) → 大五 C 低
}

export function calculateComplementBigFive(
  scores: BigFiveScores,
  level = 50,
  mbtiContext?: { mbtiType?: string; mbtiScores?: MbtiScores },
  confidence = 100
): BigFiveScores {
  const ratio = Math.min(1, Math.max(0, level / 100))
  // 置信度加权：测评不可靠时减弱互补偏移幅度
  const trust = Math.min(1, Math.max(0, confidence / 100))
  const magnitude = ratio * (0.4 + 0.6 * trust)

  const result = {} as BigFiveScores
  bigFiveDims.forEach(d => {
    const user = scores[d]
    if (d === 'N') {
      // N 维特殊处理：互补人格只向"情绪稳定"方向移动，永不制造高焦虑
      result[d] = clampScore(user - user * magnitude * 0.5)
      if (result[d] > 60) result[d] = 60
    } else {
      // 边界收缩：镜像点向 50 拉近（×0.75），互补人格落在 20~80 的可对话区间
      const mirror = 100 - user
      const effective = 50 + (mirror - 50) * 0.75
      result[d] = clampScore(user + (effective - user) * magnitude)
    }
  })

  // MBTI ↔ 大五一致性约束：被 MBTI 翻转的维度，大五互补方向必须一致
  if (mbtiContext?.mbtiType) {
    const flipped = getFlippedMbtiDims(mbtiContext.mbtiType, level, mbtiContext.mbtiScores)
    flipped.forEach(letter => {
      const rule = mbtiFlipRule[letter]
      if (!rule) return
      if (rule.dir === -1) result[rule.dim] = Math.min(result[rule.dim], 50)
      else result[rule.dim] = Math.max(result[rule.dim], 50)
    })
  }

  return result
}

const oppositeLetter: Record<string, string> = {
  E: 'I', I: 'E',
  S: 'N', N: 'S',
  T: 'F', F: 'T',
  J: 'P', P: 'J',
}

// 互补距离矩阵：按互补度决定反转的维度数量，且优先反转用户倾向最弱的维度，
// 保证"互补但可理解"，而不是无条件全部取反
export function calculateComplementMbti(mbti: string, complementLevel = 50, scores?: MbtiScores): string {
  const flipped = getFlippedMbtiDims(mbti, complementLevel, scores)
  return mbti.split('').map(d => (flipped.has(d) ? oppositeLetter[d] : d)).join('')
}

export function computeConfidence(scores: MbtiScores): number {
  const devs = [scores.E, scores.S, scores.T, scores.J].map(s => Math.abs(s - 50) * 2)
  return Math.round(devs.reduce((a, b) => a + b, 0) / 4)
}

export function inferBehaviorFromMessage(message: string): Partial<BehaviorProfile> {
  const result: Partial<BehaviorProfile> = {}

  if (/焦虑|紧张|害怕|担心|不安|压力|崩溃|失眠/.test(message)) {
    result.emotionTendency = '焦虑敏感'
  } else if (/开心|高兴|兴奋|激动|期待|幸福|满足|爽/.test(message)) {
    result.emotionTendency = '积极乐观'
  } else if (/难过|伤心|沮丧|失落|孤独|委屈|累|疲惫/.test(message)) {
    result.emotionTendency = '低落需要支持'
  } else if (/生气|愤怒|不满|烦|讨厌|抱怨/.test(message)) {
    result.emotionTendency = '情绪易波动'
  } else {
    result.emotionTendency = '平稳理性'
  }

  if (/怎么选|纠结|犹豫|不知道选|选哪个|拿不定/.test(message)) {
    result.decisionStyle = '犹豫型，需要引导做决定'
  } else if (/我要|我决定|我打算|必须|一定要/.test(message)) {
    result.decisionStyle = '果断型，倾向自主决策'
  } else if (/大家|别人|他们|家人|朋友|同事.*说|听.*意见/.test(message)) {
    result.decisionStyle = '参考型，重视他人意见'
  } else if (/分析|比较|数据|成本|利弊|方案/.test(message)) {
    result.decisionStyle = '分析型，偏好理性权衡'
  } else {
    result.decisionStyle = '综合型，需要结构化帮助'
  }

  if (/怎么办|教我|帮帮|怎么做|应该/.test(message)) {
    result.expressionStyle = '求建议，希望得到直接指导'
  } else if (/其实我|我不知道|说不清|有点乱/.test(message)) {
    result.expressionStyle = '倾诉型，需要被倾听'
  } else if (/我觉得|我认为|我的想法/.test(message)) {
    result.expressionStyle = '表达型，希望观点被确认'
  } else {
    result.expressionStyle = '陈述型，需要被理解'
  }

  if (/工作|晋升|绩效|领导|同事|职业|加班/.test(message)) {
    result.deepNeed = '职业成长与价值认同'
  } else if (/喜欢|爱好|兴趣|学|读书|电影|音乐/.test(message)) {
    result.deepNeed = '自我实现与兴趣探索'
  } else if (/对象|伴侣|恋爱|分手|相亲|婚姻/.test(message)) {
    result.deepNeed = '亲密关系中的安全感'
  } else if (/钱|工资|收入|存款|买房|负债/.test(message)) {
    result.deepNeed = '经济安全与掌控感'
  } else if (/健康|体检|生病|减肥|运动|失眠/.test(message)) {
    result.deepNeed = '身心健康与自律'
  } else {
    result.deepNeed = '被理解与获得方向感'
  }

  return result
}

// 行为画像校正：用对话观测证据微调静态测评分（贝叶斯式融合），形成"活的"人格输入
export function adjustBigFiveWithBehavior(
  scores: BigFiveScores,
  bp: BehaviorProfile | null,
  weight = 0.2
): BigFiveScores {
  if (!bp) return { ...scores }
  const evidence = {} as BigFiveScores
  bigFiveDims.forEach(d => (evidence[d] = 50))

  if (bp.emotionTendency === '焦虑敏感') evidence.N = 75
  else if (bp.emotionTendency === '积极乐观') { evidence.N = 30; evidence.E = 60 }
  else if (bp.emotionTendency === '低落需要支持') { evidence.N = 70; evidence.E = 35 }
  else if (bp.emotionTendency === '情绪易波动') evidence.N = 75
  else if (bp.emotionTendency === '平稳理性') evidence.N = 30

  if (bp.decisionStyle.includes('犹豫')) evidence.C = 35
  else if (bp.decisionStyle.includes('果断')) evidence.C = 70
  else if (bp.decisionStyle.includes('参考')) evidence.A = 70
  else if (bp.decisionStyle.includes('分析')) evidence.O = 65
  else if (bp.decisionStyle.includes('综合')) evidence.C = 55

  if (bp.expressionStyle.includes('倾诉')) { evidence.E = 35; evidence.A = 65 }
  else if (bp.expressionStyle.includes('求建议')) evidence.E = 40
  else if (bp.expressionStyle.includes('表达')) evidence.E = 60

  const result = {} as BigFiveScores
  bigFiveDims.forEach(d => {
    result[d] = clampScore(scores[d] * (1 - weight) + evidence[d] * weight)
  })
  return result
}
