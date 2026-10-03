import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// MBTI问题数据（完整版）
export const mbtiQuestions = [
  // E - I 维度：能量来源
  { id: 1, dimension: 'EI', question: '你更倾向于：', options: ['从与他人的互动中获得能量', '从独处中获得能量'] },
  { id: 2, dimension: 'EI', question: '在社交场合中，你更倾向于：', options: ['主动开启对话、带动气氛', '等别人先开口、顺势加入'] },
  { id: 3, dimension: 'EI', question: '如果周末完全由你安排，哪种方式更能让你恢复精力？', options: ['和朋友聚会、热热闹闹地玩', '在家安静休息、独处放松'] },
  { id: 4, dimension: 'EI', question: '长时间待在热闹的人群中后，你的感受更接近：', options: ['被充电了，越聊越有精神', '被耗尽了，想一个人静静'] },
  
  // S - N 维度：感知方式
  { id: 5, dimension: 'SN', question: '在接收信息时，你更关注：', options: ['具体的事实和细节', '整体的模式和可能性'] },
  { id: 6, dimension: 'SN', question: '你觉得更可靠的是：', options: ['经验和已经验证的事实', '直觉和灵感'] },
  { id: 7, dimension: 'SN', question: '你更喜欢：', options: ['处理实际的、具体的事务', '想象未来的可能性'] },
  { id: 8, dimension: 'SN', question: '描述事物时，你倾向于：', options: ['按实际情况，具体描述', '用比喻和类比，抽象描述'] },
  
  // T - F 维度：判断方式
  { id: 9, dimension: 'TF', question: '做决定时，你更看重：', options: ['逻辑分析和客观事实', '个人价值观和对他人的影响'] },
  { id: 10, dimension: 'TF', question: '当朋友遇到问题时，你通常：', options: ['帮助分析问题，提供解决方案', '给予情感支持，表示理解'] },
  { id: 11, dimension: 'TF', question: '你更看重：', options: ['公平和正义', '和谐和同理心'] },
  { id: 12, dimension: 'TF', question: '批评别人时，你：', options: ['直接指出问题，不太在意对方感受', '会考虑对方感受，委婉表达'] },
  
  // J - P 维度：生活方式
  { id: 13, dimension: 'JP', question: '对于计划和安排，你：', options: ['喜欢提前规划好', '更随性，灵活应对'] },
  { id: 14, dimension: 'JP', question: '面对截止日期，你：', options: ['提前完成，留有余地', '最后时刻冲刺'] },
  { id: 15, dimension: 'JP', question: '你的工作/生活环境通常是：', options: ['整洁有序', '随意但有自己的规律'] },
  { id: 16, dimension: 'JP', question: '做选择时，你倾向于：', options: ['快速决定，不喜欢拖延', '保持开放，收集更多信息'] },
]

// 人格建议类型
export const suggestedTypes = [
  { name: '分析师', tags: ['分析型'], description: '擅长逻辑分析和数据驱动建议' },
  { name: '倾听者', tags: ['情感型'], description: '善于情感支持和理解' },
  { name: '创意伙伴', tags: ['创意型'], description: '提供创新想法和灵感' },
  { name: '规划师', tags: ['规划型'], description: '擅长目标分解和执行' },
  { name: '探险家', tags: ['探险型'], description: '鼓励冒险和突破舒适区' },
]

interface MemoryFact {
  content: string
  category: string
  importance: number
  createdAt: string
  lastAt: string
}

interface FeedbackSample {
  text: string
  count: number
  lastAt: string
}

interface BehaviorProfile {
  emotionTendency: string
  decisionStyle: string
  expressionStyle: string
  deepNeed: string
  updateCount: number
  lastUpdatedAt: string
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
  memory: {
    facts: MemoryFact[]
    summary: string
    userFacts: string[]
  }
  feedback: {
    useful: number
    miss: number
    usefulSamples: FeedbackSample[]
    missSamples: FeedbackSample[]
  }
  behaviorProfile: BehaviorProfile
}

const MAX_GROWTH_LEVEL = 10
const CONVERSATIONS_PER_LEVEL = 10
const MAX_MEMORY_FACTS = 20
const MAX_USER_FACTS = 20

function defaultMemory() {
  return { facts: [], summary: '', userFacts: [] }
}

function defaultFeedback() {
  return { useful: 0, miss: 0, usefulSamples: [], missSamples: [] }
}

function defaultBehaviorProfile(): BehaviorProfile {
  return {
    emotionTendency: '平稳理性',
    decisionStyle: '综合型，需要结构化帮助',
    expressionStyle: '陈述型，需要被理解',
    deepNeed: '被理解与获得方向感',
    updateCount: 0,
    lastUpdatedAt: new Date().toISOString(),
  }
}

export const usePersonaStore = defineStore('persona', () => {
  // 状态
  const userMbti = ref<string | null>(null)
  const personas = ref<Persona[]>([])
  const activePersonaId = ref<string | null>(null)
  const mbtiTestProgress = ref(0)
  const answers = ref<Record<number, number>>({})
  const isTestCompleted = ref(false)

  // 计算属性
  const activePersona = computed(() => {
    return personas.value.find(p => p.id === activePersonaId.value) || personas.value[0] || null
  })

  const canCreateMore = computed(() => {
    return personas.value.length < 5
  })

  const personaCount = computed(() => personas.value.length)

  const questions = computed(() => mbtiQuestions)

  const suggestedNameList = computed(() => suggestedTypes)

  // 计算互补MBTI
  function calculateComplementMbti(mbti: string): string {
    const complementMap: Record<string, string> = {
      'E': 'I', 'I': 'E',
      'S': 'N', 'N': 'S',
      'T': 'F', 'F': 'T',
      'J': 'P', 'P': 'J',
    }
    return mbti.split('').map(c => complementMap[c]).join('')
  }

  // 计算MBTI类型
  function calculateMbti(): string {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    
    Object.entries(answers.value).forEach(([questionId, optionIndex]) => {
      const question = mbtiQuestions.find(q => q.id === parseInt(questionId))
      if (question) {
        const dimension = question.dimension
        const option = optionIndex === 0 ? dimension[0] : dimension[1]
        counts[option as keyof typeof counts]++
      }
    })

    return [
      counts.E > counts.I ? 'E' : 'I',
      counts.S > counts.N ? 'S' : 'N',
      counts.T > counts.F ? 'T' : 'F',
      counts.J > counts.P ? 'J' : 'P',
    ].join('')
  }

  // 设置答案
  function setAnswer(questionId: number, optionIndex: number) {
    answers.value[questionId] = optionIndex
    mbtiTestProgress.value = questionId
  }

  // 完成MBTI测试
  function completeMbtiTest() {
    userMbti.value = calculateMbti()
    isTestCompleted.value = true
    saveToStorage()
  }

  // 创建人格
  function createPersona(name: string, suggested?: typeof suggestedTypes[0]) {
    if (!canCreateMore.value) {
      alert('已达到最大人格数量（5个）')
      return null
    }

    if (!userMbti.value) {
      alert('请先完成MBTI测试')
      return null
    }

    const now = new Date()
    // 新创建的人格可以立即修改互补度
    const nextModify = new Date(now.getTime())

    const newPersona: Persona = {
      id: Date.now().toString(),
      name,
      mbtiType: userMbti.value,
      complementMbti: calculateComplementMbti(userMbti.value),
      complementLevel: 50,
      createdAt: now.toISOString(),
      nextModifyTime: nextModify.toISOString(),
      totalConversations: 0,
      growthLevel: 1,
      isActive: personas.value.length === 0,
      tags: suggested?.tags || [],
      memory: defaultMemory(),
      feedback: defaultFeedback(),
      behaviorProfile: defaultBehaviorProfile(),
    }

    personas.value.push(newPersona)
    if (personas.value.length === 1) {
      activePersonaId.value = newPersona.id
    }
    saveToStorage()

    return newPersona
  }

  // 切换人格
  function switchPersona(id: string) {
    activePersonaId.value = id
    personas.value.forEach(p => {
      p.isActive = p.id === id
    })
    saveToStorage()
  }

  // 更新互补度
  function updateComplementLevel(level: number) {
    const persona = activePersona.value
    if (!persona) return false

    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)

    if (now < nextModify) {
      const remainingDays = Math.ceil((nextModify.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      console.log(`距离下次可修改还有 ${remainingDays} 天`)
      return false
    }

    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    persona.complementLevel = level
    persona.nextModifyTime = nextWeek.toISOString()
    saveToStorage()

    return true
  }

  // 删除人格
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

  // 检查是否可以修改
  function canModifyComplement(persona: Persona): boolean {
    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)
    return now >= nextModify
  }

  // 获取剩余天数
  function getRemainDays(persona: Persona): number {
    const now = new Date()
    const nextModify = new Date(persona.nextModifyTime)
    return Math.max(0, Math.ceil((nextModify.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  }

  // 保存到本地存储
  function saveToStorage() {
    try {
      const data = {
        userMbti: userMbti.value,
        personas: personas.value,
        activePersonaId: activePersonaId.value,
        isTestCompleted: isTestCompleted.value,
        answers: answers.value,
      }
      localStorage.setItem('persona_data', JSON.stringify(data))
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 从本地存储加载
  function loadFromStorage() {
    try {
      const dataStr = localStorage.getItem('persona_data')
      if (dataStr) {
        const data = JSON.parse(dataStr)
        userMbti.value = data.userMbti || null
        personas.value = (data.personas || []).map((p: any) => ({
          ...p,
          memory: p.memory || defaultMemory(),
          feedback: p.feedback || defaultFeedback(),
          behaviorProfile: p.behaviorProfile || defaultBehaviorProfile(),
        }))
        activePersonaId.value = data.activePersonaId || null
        isTestCompleted.value = data.isTestCompleted || false
        answers.value = data.answers || {}
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      userMbti.value = null
      personas.value = []
      activePersonaId.value = null
      isTestCompleted.value = false
      answers.value = {}
    }
  }

  // 记录一次对话（成长体系：每 10 次升 1 级）
  function recordConversation() {
    const persona = activePersona.value
    if (!persona) return
    persona.totalConversations += 1
    persona.growthLevel = Math.min(MAX_GROWTH_LEVEL, 1 + Math.floor(persona.totalConversations / CONVERSATIONS_PER_LEVEL))
    saveToStorage()
  }

  // 记录反馈（👍 有用 / 🤔 没感觉）
  function recordFeedback(useful: boolean, sampleText = '') {
    const persona = activePersona.value
    if (!persona) return
    if (useful) {
      persona.feedback.useful += 1
      if (sampleText) {
        const trimmed = sampleText.length > 60 ? sampleText.slice(0, 60) + '…' : sampleText
        const existing = persona.feedback.usefulSamples.find(s => s.text === trimmed)
        if (existing) {
          existing.count += 1
          existing.lastAt = new Date().toISOString()
        } else {
          persona.feedback.usefulSamples.push({ text: trimmed, count: 1, lastAt: new Date().toISOString() })
        }
      }
    } else {
      persona.feedback.miss += 1
      if (sampleText) {
        const trimmed = sampleText.length > 60 ? sampleText.slice(0, 60) + '…' : sampleText
        const existing = persona.feedback.missSamples.find(s => s.text === trimmed)
        if (existing) {
          existing.count += 1
          existing.lastAt = new Date().toISOString()
        } else {
          persona.feedback.missSamples.push({ text: trimmed, count: 1, lastAt: new Date().toISOString() })
        }
      }
    }
    saveToStorage()
  }

  // 应用 AI 抽取的记忆更新（事实/滚动摘要/行为画像）
  function applyMemoryUpdates(updates: {
    facts?: Array<{ content: string; category?: string }>
    summary?: string
    behavior?: Partial<BehaviorProfile>
  }) {
    const persona = activePersona.value
    if (!persona) return
    if (updates.facts?.length) {
      const now = new Date().toISOString()
      updates.facts.forEach(f => {
        if (!f.content) return
        const trimmed = f.content.trim()
        if (!trimmed) return
        const existing = persona.memory.facts.find(mf => mf.content === trimmed)
        if (existing) {
          existing.importance = Math.min(5, existing.importance + 1)
          existing.lastAt = now
        } else {
          persona.memory.facts.push({
            content: trimmed,
            category: f.category || 'other',
            importance: 3,
            createdAt: now,
            lastAt: now,
          })
        }
        if (!persona.memory.userFacts.includes(trimmed)) {
          persona.memory.userFacts.push(trimmed)
        }
      })
      if (persona.memory.facts.length > MAX_MEMORY_FACTS) persona.memory.facts = persona.memory.facts.slice(-MAX_MEMORY_FACTS)
      if (persona.memory.userFacts.length > MAX_USER_FACTS) persona.memory.userFacts = persona.memory.userFacts.slice(-MAX_USER_FACTS)
    }
    if (updates.summary) {
      persona.memory.summary = updates.summary.slice(0, 120)
    }
    if (updates.behavior) {
      persona.behaviorProfile = {
        ...persona.behaviorProfile,
        ...updates.behavior,
        updateCount: persona.behaviorProfile.updateCount + 1,
        lastUpdatedAt: new Date().toISOString(),
      }
    }
    saveToStorage()
  }

  // 重置测试
  function resetTest() {
    mbtiTestProgress.value = 0
    answers.value = {}
    isTestCompleted.value = false
  }

  return {
    // 状态
    userMbti,
    personas,
    activePersonaId,
    mbtiTestProgress,
    answers,
    isTestCompleted,
    
    // 计算属性
    activePersona,
    canCreateMore,
    personaCount,
    questions,
    suggestedNameList,
    
    // 方法
    setAnswer,
    completeMbtiTest,
    createPersona,
    switchPersona,
    updateComplementLevel,
    deletePersona,
    canModifyComplement,
    getRemainDays,
    recordConversation,
    recordFeedback,
    applyMemoryUpdates,
    loadFromStorage,
    resetTest,
  }
})
