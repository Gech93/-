export const mbtiQuestions = [
  { id: 1, dimension: 'EI', question: '你更倾向于：', options: ['从与他人的互动中获得能量', '从独处中获得能量'] },
  { id: 2, dimension: 'EI', question: '在社交场合中，你更倾向于：', options: ['主动开启对话、带动气氛', '等别人先开口、顺势加入'] },
  { id: 3, dimension: 'EI', question: '如果周末完全由你安排，哪种方式更能让你恢复精力？', options: ['和朋友聚会、热热闹闹地玩', '在家安静休息、独处放松'] },
  { id: 4, dimension: 'EI', question: '长时间待在热闹的人群中后，你的感受更接近：', options: ['被充电了，越聊越有精神', '被耗尽了，想一个人静静'] },

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
  weight?: number
}

export const bigFiveQuestions: BigFiveQuestion[] = [
  { id: 1, dimension: 'O', label: '开放性', reversed: false, question: '我会主动尝试新事物、接触新想法。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 2, dimension: 'O', label: '开放性', reversed: true, question: '我更习惯熟悉的做法，不太喜欢改变。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 3, dimension: 'O', label: '开放性', reversed: false, question: '我对哲学、艺术、抽象概念这类话题很感兴趣。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 4, dimension: 'O', label: '开放性', reversed: true, question: '比起充满变化的生活，按部就班更让我安心。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 5, dimension: 'O', label: '开放性', reversed: false, question: '遇到难题时，我喜欢尝试多种不同的解决思路。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },

  { id: 6, dimension: 'C', label: '尽责性', reversed: false, question: '我会提前规划，并认真把任务完成。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 7, dimension: 'C', label: '尽责性', reversed: true, question: '我经常拖延，把事情拖到最后才做。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 8, dimension: 'C', label: '尽责性', reversed: false, question: '我的桌面和物品通常摆放得井井有条。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 9, dimension: 'C', label: '尽责性', reversed: true, question: '我常凭一时冲动做事，很少提前想后果。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 10, dimension: 'C', label: '尽责性', reversed: false, question: '答应别人的事，我会尽力兑现。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },

  { id: 11, dimension: 'E', label: '外向性', reversed: false, question: '在社交场合中我感到精力充沛。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 12, dimension: 'E', label: '外向性', reversed: true, question: '我更享受独处，不太喜欢热闹的场合。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 13, dimension: 'E', label: '外向性', reversed: false, question: '我能轻松地和陌生人开启话题。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 14, dimension: 'E', label: '外向性', reversed: true, question: '在大群人面前发言会让我很不自在。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 15, dimension: 'E', label: '外向性', reversed: false, question: '聚会时，我常常是带动气氛的那个人。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },

  { id: 16, dimension: 'A', label: '合作倾向', reversed: false, question: '我乐于助人，容易信任他人。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 17, dimension: 'A', label: '合作倾向', reversed: true, question: '与人合作时，我倾向于坚持自己的看法。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 18, dimension: 'A', label: '合作倾向', reversed: false, question: '即使不认同对方，我也会先照顾对方的感受。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 19, dimension: 'A', label: '合作倾向', reversed: true, question: '为了把事情做好，我可以接受比较强硬的竞争。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 20, dimension: 'A', label: '合作倾向', reversed: false, question: '别人向我倾诉时，我通常能耐心听完。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },

  { id: 21, dimension: 'N', label: '情绪稳定性', reversed: false, question: '我容易感到紧张或焦虑。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 22, dimension: 'N', label: '情绪稳定性', reversed: true, question: '面对压力时，我通常能保持平静。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'] },
  { id: 23, dimension: 'N', label: '情绪稳定性', reversed: false, question: '一点小麻烦就能让我的情绪波动好一阵。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
  { id: 24, dimension: 'N', label: '情绪稳定性', reversed: true, question: '我很少因为心事而失眠。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 0.9 },
  { id: 25, dimension: 'N', label: '情绪稳定性', reversed: false, question: '我常担心未来可能发生的坏事。', options: ['非常不同意', '比较不同意', '一般', '比较同意', '非常同意'], weight: 1.1 },
]

export const bigFiveMeta: Record<keyof BigFiveScores, { label: string; low: string; high: string }> = {
  O: { label: '开放性', low: '务实传统', high: '开放创新' },
  C: { label: '尽责性', low: '灵活随性', high: '严谨自律' },
  E: { label: '外向性', low: '内敛沉静', high: '外向活跃' },
  A: { label: '合作倾向', low: '直接坚定', high: '温和合作' },
  N: { label: '情绪稳定性', low: '平稳从容', high: '细腻敏感' },
}

export const bigFiveDims = ['O', 'C', 'E', 'A', 'N'] as (keyof BigFiveScores)[]

// 非对称映射：弱化"一般"选项，鼓励表达倾向，避免分数向 50 塌缩
export const bigFiveOptionScores = [8, 32, 50, 68, 92]

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
  lastAt: string
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

export const defaultCommunicationStyle: CommunicationStyle = {
  formality: 'neutral',
  tone: ['理性', '友好'],
  signature: '回复中常给出可执行的建议',
}

export interface FeedbackSample {
  text: string
  count: number
  lastAt: string
}

export interface PersonaFeedback {
  useful: number
  miss: number
  usefulSamples: FeedbackSample[]
  missSamples: FeedbackSample[]
}

// 记忆衰减：反馈记忆以"半衰期"随时间减弱，旧认可权重降低，直至被遗忘
export const FEEDBACK_HALF_LIFE_DAYS = 7
export const FEEDBACK_MIN_STRENGTH = 0.5

// 事实记忆衰减：重要度随"上次被提到"的时间半衰衰减，久未回顾的记忆逐渐被遗忘
export const FACT_HALF_LIFE_DAYS = 30
export const FACT_MIN_STRENGTH = 0.5

export interface Persona {
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
  feedback: PersonaFeedback
}
