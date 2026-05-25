import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// MBTI问题数据
export const mbtiQuestions = [
  { id: 1, dimension: 'EI', question: '你更倾向于：', options: ['从与他人的互动中获得能量', '从独处中获得能量'] },
  { id: 2, dimension: 'EI', question: '在社交场合中，你通常：', options: ['主动参与并发起对话', '等待别人先和你说话'] },
  { id: 3, dimension: 'SN', question: '在接收信息时，你更关注：', options: ['具体的事实和细节', '整体的模式和可能性'] },
  { id: 4, dimension: 'SN', question: '你觉得更可靠的是：', options: ['经验和已经验证的事实', '直觉和灵感'] },
  { id: 5, dimension: 'TF', question: '做决定时，你更看重：', options: ['逻辑分析和客观事实', '个人价值观和对他人的影响'] },
  { id: 6, dimension: 'JP', question: '对于计划和安排，你：', options: ['喜欢提前规划好', '更随性，灵活应对'] },
]

// 人格建议类型
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
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const newPersona: Persona = {
      id: Date.now().toString(),
      name,
      mbtiType: userMbti.value,
      complementMbti: calculateComplementMbti(userMbti.value),
      complementLevel: 50,
      createdAt: now.toISOString(),
      nextModifyTime: nextMonth.toISOString(),
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
      alert(`距离下次可修改还有 ${remainingDays} 天`)
      return false
    }

    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    persona.complementLevel = level
    persona.nextModifyTime = nextMonth.toISOString()
    saveToStorage()

    alert('互补度已更新')
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
    const data = {
      userMbti: userMbti.value,
      personas: personas.value,
      activePersonaId: activePersonaId.value,
      isTestCompleted: isTestCompleted.value,
      answers: answers.value,
    }
    localStorage.setItem('persona_data', JSON.stringify(data))
  }

  // 从本地存储加载
  function loadFromStorage() {
    const dataStr = localStorage.getItem('persona_data')
    if (dataStr) {
      const data = JSON.parse(dataStr)
      userMbti.value = data.userMbti
      personas.value = data.personas || []
      activePersonaId.value = data.activePersonaId
      isTestCompleted.value = data.isTestCompleted
      answers.value = data.answers || {}
    }
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
    loadFromStorage,
    resetTest,
  }
})
