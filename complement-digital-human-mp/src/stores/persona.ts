import { ref, computed } from 'vue'

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

export const suggestedTypes = [
  { name: '分析师', tags: ['分析型'], description: '擅长逻辑分析和数据驱动建议' },
  { name: '倾听者', tags: ['情感型'], description: '善于情感支持和理解' },
  { name: '创意伙伴', tags: ['创意型'], description: '提供创新想法和灵感' },
  { name: '规划师', tags: ['规划型'], description: '擅长目标分解和执行' },
  { name: '探险家', tags: ['探险型'], description: '鼓励冒险和突破舒适区' },
]

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
}

// 创建单例 store，确保所有页面共享同一个实例
let storeInstance: any = null

export function usePersonaStore() {
  if (storeInstance) {
    return storeInstance
  }

  const userMbti = ref<string | null>(null)
  const personas = ref<Persona[]>([])
  const activePersonaId = ref<string | null>(null)
  const mbtiTestProgress = ref(0)
  const answers = ref<Record<number, number>>({})
  const isTestCompleted = ref(false)

  const activePersona = computed(() => {
    return personas.value.find(p => p.id === activePersonaId.value) || personas.value[0] || null
  })

  const canCreateMore = computed(() => {
    return personas.value.length < 5
  })

  const personaCount = computed(() => personas.value.length)

  const questions = computed(() => mbtiQuestions)

  const suggestedNameList = computed(() => suggestedTypes)

  function calculateComplementMbti(mbti: string): string {
    const complementMap: Record<string, string> = {
      'E': 'I', 'I': 'E',
      'S': 'N', 'N': 'S',
      'T': 'F', 'F': 'T',
      'J': 'P', 'P': 'J',
    }
    return mbti.split('').map(c => complementMap[c]).join('')
  }

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

  function setAnswer(questionId: number, optionIndex: number) {
    answers.value[questionId] = optionIndex
    mbtiTestProgress.value = questionId
  }

  function completeMbtiTest() {
    userMbti.value = calculateMbti()
    isTestCompleted.value = true
    saveToStorage()
  }

  function createPersona(name: string, suggested?: typeof suggestedTypes[0]) {
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
      const remainingDays = Math.ceil((nextModify.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      return false
    }

    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    persona.complementLevel = level
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

  function saveToStorage() {
    try {
      const data = {
        userMbti: userMbti.value,
        personas: personas.value,
        activePersonaId: activePersonaId.value,
        isTestCompleted: isTestCompleted.value,
        answers: answers.value,
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
        personas.value = data.personas || []
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

  function resetTest() {
    mbtiTestProgress.value = 0
    answers.value = {}
    isTestCompleted.value = false
  }

  storeInstance = {
    userMbti,
    personas,
    activePersonaId,
    mbtiTestProgress,
    answers,
    isTestCompleted,
    activePersona,
    canCreateMore,
    personaCount,
    questions,
    suggestedNameList,
    setAnswer,
    completeMbtiTest,
    createPersona,
    switchPersona,
    updateComplementLevel,
    deletePersona,
    canModifyComplement,
    getRemainDays,
    loadFromStorage,
    resetTest,
  }

  return storeInstance
}
