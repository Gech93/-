import { ref, computed, reactive } from 'vue'
import { bigFiveQuestions, defaultCommunicationStyle, FEEDBACK_MIN_STRENGTH, mbtiQuestions, suggestedTypes } from './types'
import type {
  BehaviorProfile,
  BigFiveProfile,
  BigFiveScores,
  FeedbackSample,
  MbtiProfile,
  MbtiScores,
  MemoryFact,
  Persona,
} from './types'
import {
  calculateBigFiveProfile,
  calculateComplementBigFive,
  calculateComplementMbti,
  computeConfidence,
  inferBehaviorFromMessage,
} from './algo'
import {
  feedbackSampleStrength,
  forgetDecayedFacts,
  normalizeFeedbackSample,
  normalizeMemoryFact,
} from './memory'

export * from './types'
export * from './algo'
export * from './memory'

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

  function normalizePersona(p: Partial<Persona>): Persona {
    return {
      id: p.id || '',
      name: p.name || '',
      mbtiType: p.mbtiType || '',
      complementMbti: p.complementMbti || '',
      complementLevel: p.complementLevel ?? 50,
      createdAt: p.createdAt || new Date().toISOString(),
      nextModifyTime: p.nextModifyTime || new Date().toISOString(),
      totalConversations: p.totalConversations || 0,
      growthLevel: p.growthLevel || 1,
      isActive: p.isActive || false,
      tags: p.tags || [],
      communicationStyle: p.communicationStyle || defaultCommunicationStyle,
      memory: p.memory ? { summary: p.memory.summary || '', userFacts: p.memory.userFacts || [], facts: (p.memory.facts || []).map(normalizeMemoryFact) } : { summary: '', userFacts: [], facts: [] },
      confidence: p.confidence ?? 0,
      mbtiScores: p.mbtiScores || { E: 50, S: 50, T: 50, J: 50 },
      bigFiveScores: p.bigFiveScores || { O: 50, C: 50, E: 50, A: 50, N: 50 },
      complementBigFive: p.complementBigFive || { O: 50, C: 50, E: 50, A: 50, N: 50 },
      behaviorProfile: p.behaviorProfile || null,
      feedback: {
        useful: p.feedback?.useful || 0,
        miss: p.feedback?.miss || 0,
        usefulSamples: (p.feedback?.usefulSamples || []).map(normalizeFeedbackSample),
        missSamples: (p.feedback?.missSamples || []).map(normalizeFeedbackSample),
      },
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
      complementBigFive: calculateComplementBigFive(
        bfScores,
        complementLevel,
        { mbtiType: profile.type, mbtiScores: profile.scores },
        bigFiveProfile.value?.confidence ?? 100
      ),
      behaviorProfile: null,
      feedback: { useful: 0, miss: 0, usefulSamples: [], missSamples: [] },
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
    persona.complementBigFive = calculateComplementBigFive(
      persona.bigFiveScores,
      level,
      { mbtiType: persona.mbtiType, mbtiScores: persona.mbtiScores },
      bigFiveProfile.value?.confidence ?? 100
    )
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
    forgetDecayedFacts(persona.memory.facts)
    const now = new Date().toISOString()
    const existing = persona.memory.facts.find(f => f.content === trimmed)
    if (existing) {
      existing.importance = Math.min(5, existing.importance + 1)
      existing.lastAt = now
    } else {
      persona.memory.facts.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content: trimmed,
        keywords: trimmed.replace(/[，。！？,.!?]/g, ' ').split(/\s+/).filter(w => w.length >= 2).slice(0, 4),
        importance,
        category,
        createdAt: now,
        lastAt: now,
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

  function rememberSample(samples: FeedbackSample[], text: string) {
    const trimmed = text.length > 60 ? text.slice(0, 60) + '…' : text
    const existing = samples.find(s => s.text === trimmed)
    if (existing) {
      existing.count += 1
      existing.lastAt = new Date().toISOString()
    } else {
      samples.push({ text: trimmed, count: 1, lastAt: new Date().toISOString() })
    }
  }

  function forgetDecayedSamples(samples: FeedbackSample[]) {
    for (let i = samples.length - 1; i >= 0; i--) {
      if (feedbackSampleStrength(samples[i]) < FEEDBACK_MIN_STRENGTH) {
        samples.splice(i, 1)
      }
    }
  }

  function recordFeedback(useful: boolean, sampleText = '') {
    const persona = activePersona.value
    if (!persona) return
    if (useful) {
      persona.feedback.useful += 1
      if (sampleText) rememberSample(persona.feedback.usefulSamples, sampleText)
      forgetDecayedSamples(persona.feedback.usefulSamples)
    } else {
      persona.feedback.miss += 1
      if (sampleText) rememberSample(persona.feedback.missSamples, sampleText)
      forgetDecayedSamples(persona.feedback.missSamples)
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
    recordFeedback,
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