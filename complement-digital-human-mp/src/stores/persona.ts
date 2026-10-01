import { ref, computed, reactive } from 'vue'

export const mbtiQuestions = [
  { id: 1, dimension: 'EI', question: '你更倾向于：', options: ['从与他人的互动中获得能量', '从独处中获得能量'] },
  { id: 2, dimension: 'EI', question: '在社交场合中，你通常：', options: ['主动参与并发起对话', '等待别人先和你说话'] },
  { id: 3, dimension: 'EI', question: '周末你更愿意：', options: ['和朋友聚会或参加活动', '在家安静休息'] },
  { id: 4, dimension: 'EI', question: '和很多人在一起后，你会感到：', options: ['精力充沛，心情愉悦', '疲惫，需要独处恢复'] },
  
  { id: 5, dimension: 'SN', question: '在接收信息时，你更关注：', options: ['具体的事实和细节', '整体的模式和可能性'] },
  { id: 6, dimension: 'SN', question: '你觉得更可靠的是：', options: ['经验和已经验证的事实', '直觉和灵感'] },
  { id: 7, dimension: 'SN', question: '你更喜欢：', options: ['处理实际的、具体的事务', '想象未来的可能性'] },
  { id: 8, dimension: 'SN', question: '描述事物时，你倾向于：', options: ['按实际情况，具体描述', '用比喻和类比，抽象描述'] },
  
  { id: 9, dimension: 'TF', question: '做决定时，你更看重：', options: ['逻辑分析和客观事实', '个人价值观和对他人的影响'] },
  { id: 10, dimension: 'TF', question: '当朋友遇到问题时，你通常：', options: ['帮助分析问题，提供解决方案', '给予情感支持，表示理解'] },
  { id: 11, dimension: 'TF', question: '你更看重：', options: ['公平和正义', '和谐和同理心'] },
  { id: 12, dimension: 'TF', question: '批评别人时，你：', options: ['直接指出问题，不太在意对方感受', '会考虑对方感受，委婉表达'] },
  
  { id: 13, dimension: 'JP', question: '对于计划和安排，你：', options: ['喜欢提前规划好', '更随性，灵活应对'] },
  { id: 14, dimension: 'JP', question: '面对截止日期，你：', options: ['提前完成，留有余地', '最后时刻冲刺'] },
  { id: 15, dimension: 'JP', question: '你的工作/生活环境通常是：', options: ['整洁有序', '随意但有自己的规律'] },
  { id: 16, dimension: 'JP', question: '做选择时，你倾向于：', options: ['快速决定，不喜欢拖延', '保持开放，收集更多信息'] },
]

export interface BigFiveScores {
  O: number
  C: number
  E: number
  A: number
  N: number
}

export interface BigFiveProfile {
  scores: BigFiveScores
  confidence: number
  descriptions: Record<keyof BigFiveScores, string>
}

export interface BigFiveQuestion {
  id: number
  dimension: keyof BigFiveScores
  label: string
  reversed: boolean
  question: string
  options: string[]
}

export const bigFiveQuestions: BigFiveQuestion[] = [
  { id: 1, dimension: 'O', label: '开放性', reversed: false, question: '我会主动尝试新事物、接触新想法。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 2, dimension: 'O', label: '开放性', reversed: true, question: '我更习惯熟悉的做法，不太喜欢改变。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 3, dimension: 'C', label: '尽责性', reversed: false, question: '我会提前规划，并认真把任务完成。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 4, dimension: 'C', label: '尽责性', reversed: true, question: '我经常拖延，把事情拖到最后才做。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 5, dimension: 'E', label: '外向性', reversed: false, question: '在社交场合中我感到精力充沛。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 6, dimension: 'E', label: '外向性', reversed: true, question: '我更享受独处，不太喜欢热闹的场合。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 7, dimension: 'A', label: '宜人性', reversed: false, question: '我乐于助人，容易信任他人。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 8, dimension: 'A', label: '宜人性', reversed: true, question: '与人合作时，我倾向于坚持自己的看法。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 9, dimension: 'N', label: '神经质', reversed: false, question: '我容易感到紧张或焦虑。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 10, dimension: 'N', label: '神经质', reversed: true, question: '面对压力时，我通常能保持平静。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
]

export const bigFiveMeta: Record<keyof BigFiveScores, { label: string; low: string; high: string }> = {
  O: { label: '开放性', low: '务实传统', high: '开放创新' },
  C: { label: '尽责性', low: '灵活随性', high: '严谨自律' },
  E: { label: '外向性', low: '内敛沉静', high: '外向活跃' },
  A: { label: '宜人性', low: '直接坚定', high: '温和合作' },
  N: { label: '神经质', low: '情绪稳定', high: '敏感细腻' },
}

export const bigFiveDims = ['O', 'C', 'E', 'A', 'N'] as (keyof BigFiveScores)[]

export const bigFiveOptionScores = [0, 25, 50, 75, 100]

export function calculateBigFiveProfile(answers: Record<number, number>): BigFiveProfile {
  const accum: Record<keyof BigFiveScores, { sum: number; count: number }> = {
    O: { sum: 0, count: 0 },
    C: { sum: 0, count: 0 },
    E: { sum: 0, count: 0 },
    A: { sum: 0, count: 0 },
    N: { sum: 0, count: 0 },
  }

  Object.entries(answers).forEach(([qid, optionIndex]) => {
    const q = bigFiveQuestions.find(item => item.id === parseInt(qid))
    if (!q) return
    let score = bigFiveOptionScores[optionIndex] ?? 50
    if (q.reversed) score = 100 - score
    accum[q.dimension].sum += score
    accum[q.dimension].count += 1
  })

  const scores = {} as BigFiveScores
  bigFiveDims.forEach(d => {
    scores[d] = accum[d].count > 0 ? Math.round(accum[d].sum / accum[d].count) : 50
  })

  const confidence = Math.round(bigFiveDims.reduce((a, d) => a + Math.abs(scores[d] - 50) * 2, 0) / 5)

  const descriptions = {} as Record<keyof BigFiveScores, string>
  bigFiveDims.forEach(d => {
    const v = scores[d]
    descriptions[d] = v >= 60 ? `${bigFiveMeta[d].high}(${v})` : v <= 40 ? `${bigFiveMeta[d].low}(${v})` : `中性(${v})`
  })

  return { scores, confidence, descriptions }
}

export function calculateComplementBigFive(scores: BigFiveScores, level = 50): BigFiveScores {
  const ratio = Math.min(100, Math.max(0, level)) / 100
  const result = {} as BigFiveScores
  bigFiveDims.forEach(d => {
    const user = scores[d]
    result[d] = Math.round(Math.min(100, Math.max(0, user + (100 - 2 * user) * ratio)))
  })
  return result
}

export interface BehaviorProfile {
  emotionTendency: string
  decisionStyle: string
  expressionStyle: string
  deepNeed: string
  updateCount: number
  lastUpdatedAt: string
}

export interface MemoryFact {
  id: string
  content: string
  keywords: string[]
  importance: number
  category: 'preference' | 'identity' | 'plan' | 'emotion' | 'work' | 'other'
  createdAt: string
}

export function bigramSet(text: string): Set<string> {
  const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
  const result = new Set<string>()
  for (let i = 0; i < chars.length - 1; i++) {
    result.add(chars.slice(i, i + 2))
  }
  return result
}

export function bigramJaccard(a: string, b: string): number {
  const sa = bigramSet(a)
  const sb = bigramSet(b)
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  sa.forEach(c => {
    if (sb.has(c)) inter++
  })
  return inter / (sa.size + sb.size - inter)
}

export function findRelevantFacts(facts: MemoryFact[], query: string, topK = 3): MemoryFact[] {
  return facts
    .map(f => ({
      fact: f,
      score: bigramJaccard(f.content, query) + bigramJaccard(f.keywords.join(' '), query) + f.importance * 0.01,
    }))
    .filter(item => item.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.fact)
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

export interface CommunicationStyle {
  formality: 'casual' | 'neutral' | 'formal'
  tone: string[]
  signature: string
}

export interface PersonaMemory {
  summary: string
  userFacts: string[]
  facts: MemoryFact[]
}

export interface MbtiScores {
  E: number
  S: number
  T: number
  J: number
}

export interface MbtiProfile {
  type: string
  scores: MbtiScores
  confidence: number
}

export interface SuggestedPersona {
  name: string
  tags: string[]
  description: string
  communicationStyle: CommunicationStyle
}

export const suggestedTypes: SuggestedPersona[] = [
  { name: '分析师', tags: ['分析型'], description: '擅长逻辑分析和数据驱动建议', communicationStyle: { formality: 'formal', tone: ['理性', '直接', '结构化'], signature: '回复通常给出结构化分析和行动清单' } },
  { name: '倾听者', tags: ['情感型'], description: '善于情感支持和理解', communicationStyle: { formality: 'casual', tone: ['温和', '共情', '耐心'], signature: '先共情理解，再温和给出建议' } },
  { name: '创意伙伴', tags: ['创意型'], description: '提供创新想法和灵感', communicationStyle: { formality: 'casual', tone: ['活泼', '发散', '启发式'], signature: '喜欢用比喻和联想激发灵感' } },
  { name: '规划师', tags: ['规划型'], description: '擅长目标分解和执行', communicationStyle: { formality: 'neutral', tone: ['条理', '务实', '鼓励'], signature: '擅长把目标拆解成可执行的步骤' } },
  { name: '探险家', tags: ['探险型'], description: '鼓励冒险和突破舒适区', communicationStyle: { formality: 'casual', tone: ['热情', '大胆', '积极'], signature: '鼓励尝试新事物，推动行动' } },
]

const defaultCommunicationStyle: CommunicationStyle = {
  formality: 'neutral',
  tone: ['理性', '友好'],
  signature: '回复中常给出可执行的建议',
}

interface Persona {
  id: string
  name: string
  mbtiType: string
  complementMbti: string
  complementLevel: number
  createdAt: string
  nextModifyTime: string
  totalConversations: number
  growthLevel: number
  isActive: boolean
  tags: string[]
  communicationStyle: CommunicationStyle
  memory: PersonaMemory
  confidence: number
  mbtiScores: MbtiScores
  bigFiveScores: BigFiveScores
  complementBigFive: BigFiveScores
  behaviorProfile: BehaviorProfile | null
}

const keyOf: Record<string, keyof MbtiScores> = { E: 'E', I: 'E', S: 'S', N: 'S', T: 'T', F: 'T', J: 'J', P: 'J' }

const oppositeLetter: Record<string, string> = {
  E: 'I', I: 'E',
  S: 'N', N: 'S',
  T: 'F', F: 'T',
  J: 'P', P: 'J',
}

// 互补距离矩阵：按互补度决定反转的维度数量，且优先反转用户倾向最弱的维度，
// 保证"互补但可理解"，而不是无条件全部取反
export function calculateComplementMbti(mbti: string, complementLevel = 50, scores?: MbtiScores): string {
  const dims = mbti.split('')
  const level = Math.min(100, Math.max(0, complementLevel))
  const flipCount = Math.round((level / 100) * 4)

  const firmness = scores ? dims.map(d => Math.abs(scores[keyOf[d]] - 50)) : [0, 0, 0, 0]
  const flipOrder = [0, 1, 2, 3].sort((a, b) => firmness[a] - firmness[b])
  const flipped = new Set(flipOrder.slice(0, flipCount))

  return dims.map((d, i) => (flipped.has(i) ? oppositeLetter[d] : d)).join('')
}

function computeConfidence(scores: MbtiScores): number {
  const devs = [scores.E, scores.S, scores.T, scores.J].map(s => Math.abs(s - 50) * 2)
  return Math.round(devs.reduce((a, b) => a + b, 0) / 4)
}

function createStore() {
  const userMbti = ref<string | null>(null)
  const mbtiProfile = ref<MbtiProfile | null>(null)
  const bigFiveProfile = ref<BigFiveProfile | null>(null)
  const personas = ref<Persona[]>([])
  const activePersonaId = ref<string | null>(null)
  const mbtiTestProgress = ref(0)
  const answers = ref<Record<number, number>>({})
  const isTestCompleted = ref(false)
  const bigFiveTestProgress = ref(0)
  const bigFiveAnswers = ref<Record<number, number>>({})
  const isBigFiveTestCompleted = ref(false)

  const activePersona = computed(() => {
    return personas.value.find(p => p.id === activePersonaId.value) || personas.value[0] || null
  })

  const canCreateMore = computed(() => {
    return personas.value.length < 5
  })

  const personaCount = computed(() => personas.value.length)

  const questions = computed(() => mbtiQuestions)

  const bigFiveQuestionsList = computed(() => bigFiveQuestions)

  const suggestedNameList = computed(() => suggestedTypes)

  function calculateMbtiProfile(): MbtiProfile {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    
    Object.entries(answers.value).forEach(([questionId, optionIndex]) => {
      const question = mbtiQuestions.find(q => q.id === parseInt(questionId))
      if (question) {
        const dimension = question.dimension
        const option = optionIndex === 0 ? dimension[0] : dimension[1]
        counts[option as keyof typeof counts]++
      }
    })

    const ratio = (a: number, b: number) => (a + b === 0 ? 50 : Math.round((a / (a + b)) * 100))

    const scores: MbtiScores = {
      E: ratio(counts.E, counts.I),
      S: ratio(counts.S, counts.N),
      T: ratio(counts.T, counts.F),
      J: ratio(counts.J, counts.P),
    }

    return {
      type: [
        scores.E > 50 ? 'E' : 'I',
        scores.S > 50 ? 'S' : 'N',
        scores.T > 50 ? 'T' : 'F',
        scores.J > 50 ? 'J' : 'P',
      ].join(''),
      scores,
      confidence: computeConfidence(scores),
    }
  }

  function setAnswer(questionId: number, optionIndex: number) {
    answers.value[questionId] = optionIndex
    mbtiTestProgress.value = questionId
  }

  function completeMbtiTest() {
    const profile = calculateMbtiProfile()
    mbtiProfile.value = profile
    userMbti.value = profile.type
    isTestCompleted.value = true
    saveToStorage()
  }

  function setBigFiveAnswer(questionId: number, optionIndex: number) {
    bigFiveAnswers.value[questionId] = optionIndex
    bigFiveTestProgress.value = questionId
  }

  function completeBigFiveTest() {
    const profile = calculateBigFiveProfile(bigFiveAnswers.value)
    bigFiveProfile.value = profile
    isBigFiveTestCompleted.value = true
    saveToStorage()
  }

  function normalizePersona(p: any): Persona {
    return {
      id: p.id,
      name: p.name,
      mbtiType: p.mbtiType,
      complementMbti: p.complementMbti,
      complementLevel: p.complementLevel ?? 50,
      createdAt: p.createdAt,
      nextModifyTime: p.nextModifyTime,
      totalConversations: p.totalConversations || 0,
      growthLevel: p.growthLevel || 1,
      isActive: p.isActive,
      tags: p.tags || [],
      communicationStyle: p.communicationStyle || defaultCommunicationStyle,
      memory: p.memory ? { summary: p.memory.summary || '', userFacts: p.memory.userFacts || [], facts: p.memory.facts || [] } : { summary: '', userFacts: [], facts: [] },
      confidence: p.confidence ?? 0,
      mbtiScores: p.mbtiScores || { E: 50, S: 50, T: 50, J: 50 },
      bigFiveScores: p.bigFiveScores || { O: 50, C: 50, E: 50, A: 50, N: 50 },
      complementBigFive: p.complementBigFive || { O: 50, C: 50, E: 50, A: 50, N: 50 },
      behaviorProfile: p.behaviorProfile || null,
    }
  }

  function createPersona(name: string, suggested?: typeof suggestedTypes[0], complementLevel = 50) {
    if (!canCreateMore.value) {
      try {
        uni.showToast({ title: '已达到最大人格数量（5个）', icon: 'none' })
      } catch (e) {
        console.log('提示：已达到最大人格数量')
      }
      return null
    }

    if (!userMbti.value) {
      try {
        uni.showToast({ title: '请先完成MBTI测试', icon: 'none' })
      } catch (e) {
        console.log('提示：请先完成MBTI测试')
      }
      return null
    }

    const now = new Date()
    const nextModify = new Date(now.getTime())
    const profile = mbtiProfile.value || {
      type: userMbti.value,
      scores: { E: 50, S: 50, T: 50, J: 50 },
      confidence: 0,
    }

    const bfScores: BigFiveScores = bigFiveProfile.value?.scores || { O: 50, C: 50, E: 50, A: 50, N: 50 }

    const newPersona: Persona = {
      id: Date.now().toString(),
      name,
      mbtiType: profile.type,
      complementMbti: calculateComplementMbti(profile.type, complementLevel, profile.scores),
      complementLevel,
      createdAt: now.toISOString(),
      nextModifyTime: nextModify.toISOString(),
      totalConversations: 0,
      growthLevel: 1,
      isActive: personas.value.length === 0,
      tags: suggested?.tags || [],
      communicationStyle: suggested?.communicationStyle || defaultCommunicationStyle,
      memory: { summary: '', userFacts: [], facts: [] },
      confidence: profile.confidence,
      mbtiScores: profile.scores,
      bigFiveScores: bfScores,
      complementBigFive: calculateComplementBigFive(bfScores, complementLevel),
      behaviorProfile: null,
    }

    personas.value.push(newPersona)
    if (personas.value.length === 1) {
      activePersonaId.value = newPersona.id
    }
    saveToStorage()

    return newPersona
  }

  function switchPersona(id: string) {
    activePersonaId.value = id
    personas.value.forEach(p => {
      p.isActive = p.id === id
    })
    saveToStorage()
  }

  function updateComplementLevel(level: number) {
    const persona = activePersona.value
    if (!persona) return false

    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)

    if (now < nextModify) {
      return false
    }

    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    persona.complementLevel = level
    persona.complementMbti = calculateComplementMbti(persona.mbtiType, level, persona.mbtiScores)
    persona.complementBigFive = calculateComplementBigFive(persona.bigFiveScores, level)
    persona.nextModifyTime = nextMonth.toISOString()
    saveToStorage()

    return true
  }

  function deletePersona(id: string) {
    const index = personas.value.findIndex(p => p.id === id)
    if (index > -1) {
      personas.value.splice(index, 1)
      if (activePersonaId.value === id) {
        activePersonaId.value = personas.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  function canModifyComplement(persona: Persona): boolean {
    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)
    return now >= nextModify
  }

  function getRemainDays(persona: Persona): number {
    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)
    return Math.max(0, Math.ceil((nextModify.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  }

  function addUserFact(fact: string) {
    const persona = activePersona.value
    if (!persona || !fact) return
    const trimmed = fact.trim()
    if (!trimmed) return
    const facts = persona.memory.userFacts
    if (!facts.includes(trimmed)) {
      facts.push(trimmed)
      if (facts.length > 12) facts.shift()
      saveToStorage()
    }
  }

  function recordConversation() {
    const persona = activePersona.value
    if (!persona) return
    persona.totalConversations += 1
    persona.growthLevel = Math.min(10, 1 + Math.floor(persona.totalConversations / 10))
    saveToStorage()
  }

  function addMemoryFact(content: string, category: MemoryFact['category'] = 'other', importance = 3) {
    const persona = activePersona.value
    if (!persona || !content) return
    const trimmed = content.trim()
    if (!trimmed) return
    const existing = persona.memory.facts.find(f => f.content === trimmed)
    if (existing) {
      existing.importance = Math.min(5, existing.importance + 1)
    } else {
      persona.memory.facts.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content: trimmed,
        keywords: trimmed.replace(/[，。！？,.!?]/g, ' ').split(/\s+/).filter(w => w.length >= 2).slice(0, 4),
        importance,
        category,
        createdAt: new Date().toISOString(),
      })
      if (persona.memory.facts.length > 50) persona.memory.facts.shift()
    }
    saveToStorage()
  }

  function updateBehaviorProfile(message: string, aiInferred?: Partial<BehaviorProfile>) {
    const persona = activePersona.value
    if (!persona || !message) return
    const inferred = aiInferred || inferBehaviorFromMessage(message)
    const prev = persona.behaviorProfile
    persona.behaviorProfile = {
      emotionTendency: inferred.emotionTendency || prev?.emotionTendency || '平稳理性',
      decisionStyle: inferred.decisionStyle || prev?.decisionStyle || '综合型，需要结构化帮助',
      expressionStyle: inferred.expressionStyle || prev?.expressionStyle || '陈述型，需要被理解',
      deepNeed: inferred.deepNeed || prev?.deepNeed || '被理解与获得方向感',
      updateCount: (prev?.updateCount || 0) + 1,
      lastUpdatedAt: new Date().toISOString(),
    }
    saveToStorage()
  }

  function saveToStorage() {
    try {
      const data = {
        userMbti: userMbti.value,
        mbtiProfile: mbtiProfile.value,
        bigFiveProfile: bigFiveProfile.value,
        personas: personas.value,
        activePersonaId: activePersonaId.value,
        isTestCompleted: isTestCompleted.value,
        answers: answers.value,
        isBigFiveTestCompleted: isBigFiveTestCompleted.value,
        bigFiveAnswers: bigFiveAnswers.value,
      }
      try {
        uni.setStorageSync('persona_data', JSON.stringify(data))
      } catch (e) {
        // H5 环境下使用 localStorage
        try {
          localStorage.setItem('persona_data', JSON.stringify(data))
        } catch (e2) {
          console.error('保存数据失败:', e2)
        }
      }
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  function loadFromStorage() {
    try {
      let dataStr: string | null = null
      try {
        dataStr = uni.getStorageSync('persona_data')
      } catch (e) {
        // H5 环境下使用 localStorage
        try {
          dataStr = localStorage.getItem('persona_data')
        } catch (e2) {
          console.log('无法获取存储数据')
        }
      }
      
      if (dataStr) {
        const data = JSON.parse(dataStr)
        userMbti.value = data.userMbti || null
        mbtiProfile.value = data.mbtiProfile || null
        bigFiveProfile.value = data.bigFiveProfile || null
        personas.value = (data.personas || []).map(normalizePersona)
        activePersonaId.value = data.activePersonaId || null
        isTestCompleted.value = data.isTestCompleted || false
        answers.value = data.answers || {}
        isBigFiveTestCompleted.value = data.isBigFiveTestCompleted || false
        bigFiveAnswers.value = data.bigFiveAnswers || {}
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      userMbti.value = null
      mbtiProfile.value = null
      bigFiveProfile.value = null
      personas.value = []
      activePersonaId.value = null
      isTestCompleted.value = false
      answers.value = {}
      isBigFiveTestCompleted.value = false
      bigFiveAnswers.value = {}
    }
  }

  function resetTest() {
    mbtiTestProgress.value = 0
    answers.value = {}
    isTestCompleted.value = false
    mbtiProfile.value = null
    userMbti.value = null
    bigFiveTestProgress.value = 0
    bigFiveAnswers.value = {}
    isBigFiveTestCompleted.value = false
    bigFiveProfile.value = null
  }

  return reactive({
    userMbti,
    mbtiProfile,
    bigFiveProfile,
    personas,
    activePersonaId,
    mbtiTestProgress,
    answers,
    isTestCompleted,
    bigFiveTestProgress,
    bigFiveAnswers,
    isBigFiveTestCompleted,
    activePersona,
    canCreateMore,
    personaCount,
    questions,
    bigFiveQuestionsList,
    suggestedNameList,
    setAnswer,
    completeMbtiTest,
    setBigFiveAnswer,
    completeBigFiveTest,
    createPersona,
    switchPersona,
    updateComplementLevel,
    deletePersona,
    canModifyComplement,
    getRemainDays,
    addUserFact,
    addMemoryFact,
    updateBehaviorProfile,
    recordConversation,
    loadFromStorage,
    resetTest,
  })
}

// 创建单例 store，确保所有页面共享同一个实例
let storeInstance: ReturnType<typeof createStore> | null = null

export function usePersonaStore() {
  if (!storeInstance) {
    storeInstance = createStore()
  }
  return storeInstance
}
