import { beforeEach, describe, expect, it, vi } from 'vitest'

const STORAGE_KEY = 'persona_data'

function loadStore() {
  // 重置模块级单例，保证每个用例拿到独立 store 实例
  vi.resetModules()
  return import('./persona')
}

function makeMbtiProfile() {
  return {
    type: 'INTJ',
    scores: { E: 30, S: 40, T: 70, J: 60 },
    confidence: 80,
  }
}

describe('persona store 核心逻辑', () => {
  beforeEach(() => {
    uni.showToast.mockClear()
  })

  it('未完成 MBTI 时创建人格被拦截并提示', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    const persona = store.createPersona('测试')
    expect(persona).toBeNull()
    expect(uni.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '请先完成MBTI测试' }))
  })

  it('创建人格：首个人格 isActive 为 true，id 含随机后缀，持久化到存储', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()

    const persona = store.createPersona('小明')
    expect(persona).not.toBeNull()
    expect(persona!.name).toBe('小明')
    expect(persona!.isActive).toBe(true)
    expect(persona!.id).toMatch(/^\d+_[0-9a-z]+$/)
    expect(store.activePersonaId).toBe(persona!.id)
    expect(store.personas).toHaveLength(1)

    const saved = uni.getStorageSync(STORAGE_KEY) as Record<string, unknown>
    expect(Array.isArray(saved.personas)).toBe(true)
    expect((saved.personas as Array<{ id: string }>)[0].id).toBe(persona!.id)
  })

  it('同一套测评结果可创建不同互补度的人格并生成独立画像', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()
    store.bigFiveProfile = {
      scores: { O: 35, C: 70, E: 30, A: 60, N: 65 },
      confidence: 80,
      descriptions: {
        O: '务实传统(35)',
        C: '严谨自律(70)',
        E: '内敛沉静(30)',
        A: '温和合作(60)',
        N: '细腻敏感(65)',
      },
    }

    const similar = store.createPersona('相似形象', undefined, 20)
    const complementary = store.createPersona('互补形象', undefined, 80)

    expect(store.personas).toHaveLength(2)
    expect(similar?.mbtiScores).toEqual(complementary?.mbtiScores)
    expect(similar?.bigFiveScores).toEqual(complementary?.bigFiveScores)
    expect(similar?.complementLevel).toBe(20)
    expect(complementary?.complementLevel).toBe(80)
    expect(similar?.complementMbti).not.toBe(complementary?.complementMbti)
    expect(similar?.complementBigFive).not.toEqual(complementary?.complementBigFive)
  })

  it('达到人格上限后无法继续创建', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()

    for (let i = 0; i < 5; i++) {
      store.createPersona(`p${i}`)
    }
    expect(store.personas).toHaveLength(5)
    const extra = store.createPersona('溢出')
    expect(extra).toBeNull()
    expect(uni.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '已达到最大人格数量（5个）' })
    )
  })

  it('addMemoryFact 写入并限制 50 条上限，重复内容只提升 importance', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()
    store.createPersona('小明')

    store.addMemoryFact('喜欢读书')
    expect(store.activePersona!.memory.facts).toHaveLength(1)

    store.addMemoryFact('喜欢读书')
    expect(store.activePersona!.memory.facts).toHaveLength(1)
    expect(store.activePersona!.memory.facts[0].importance).toBe(4)

    for (let i = 0; i < 60; i++) {
      store.addMemoryFact(`事实${i}`)
    }
    expect(store.activePersona!.memory.facts.length).toBeLessThanOrEqual(50)
  })

  it('recordFeedback 累计计数并持久化 sample', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()
    store.createPersona('小明')

    store.recordFeedback(true, '回答很有帮助')
    store.recordFeedback(false, '答非所问')

    expect(store.activePersona!.feedback.useful).toBe(1)
    expect(store.activePersona!.feedback.miss).toBe(1)
    expect(store.activePersona!.feedback.usefulSamples[0].text).toContain('回答很有帮助')

    const saved = uni.getStorageSync(STORAGE_KEY) as Record<string, unknown>
    expect((saved.personas as Array<{ feedback: { useful: number } }>)[0].feedback.useful).toBe(1)
  })

  it('updateBehaviorProfile 累加 updateCount 并保留缺失字段的旧值', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()
    store.createPersona('小明')

    store.updateBehaviorProfile('我最近很焦虑，总在做决定')
    expect(store.activePersona!.behaviorProfile!.updateCount).toBe(1)
    expect(store.activePersona!.behaviorProfile!.emotionTendency).toBeTruthy()
  })

  it('resetTest 清空测试状态并持久化', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    // 预置一份带测试状态的存储，验证 resetTest 会覆盖持久化
    uni.setStorageSync(STORAGE_KEY, {
      userMbti: 'INTJ',
      isTestCompleted: true,
      answers: { 1: 0 },
      personas: [],
    })

    store.resetTest()
    expect(store.userMbti).toBeNull()
    expect(store.isTestCompleted).toBe(false)
    expect(store.answers).toEqual({})

    const saved = uni.getStorageSync(STORAGE_KEY) as Record<string, unknown>
    expect(saved.userMbti).toBeNull()
    expect(saved.isTestCompleted).toBe(false)
  })

  it('loadFromStorage 正常恢复已保存数据', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()
    store.userMbti = 'INTJ'
    store.mbtiProfile = makeMbtiProfile()
    store.createPersona('小明')
    store.switchPersona(store.personas[0].id)

    // 新实例应当从存储恢复
    const { usePersonaStore: useStore2 } = await loadStore()
    const store2 = useStore2()
    store2.loadFromStorage()
    expect(store2.userMbti).toBe('INTJ')
    expect(store2.personas).toHaveLength(1)
    expect(store2.personas[0].name).toBe('小明')
    expect(store2.activePersonaId).toBe(store2.personas[0].id)
  })

  it('loadFromStorage 对脏数据字段做类型兜底', async () => {
    const { usePersonaStore } = await loadStore()
    const store = usePersonaStore()

    uni.setStorageSync(
      STORAGE_KEY,
      JSON.stringify({
        userMbti: 123, // 非字符串
        isTestCompleted: 'yes', // 非布尔
        personas: 'not-an-array',
        answers: null,
      })
    )
    store.loadFromStorage()

    expect(store.userMbti).toBeNull()
    expect(store.isTestCompleted).toBe(false)
    expect(store.personas).toEqual([])
    expect(store.answers).toEqual({})
  })

  it('questions/bigFiveQuestionsList/suggestedNameList 暴露静态数据', async () => {
    const { usePersonaStore, mbtiQuestions, bigFiveQuestions, suggestedTypes } = await loadStore()
    const store = usePersonaStore()
    expect(store.questions).toStrictEqual(mbtiQuestions)
    expect(store.bigFiveQuestionsList).toStrictEqual(bigFiveQuestions)
    expect(store.suggestedNameList).toStrictEqual(suggestedTypes)
  })
})
