import { ref } from 'vue'
import { usePersonaStore } from './persona'
import { useSettingsStore } from './settings'
import { callDeepSeekAPI, buildSystemPrompt } from '../services/deepseek'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isDecisionMode?: boolean
}

// 模拟AI回复库（作为备用）
const mockResponses = {
  normal: [
    '这是一个很有趣的想法！从另一个角度来看，或许我们可以考虑...',
    '我理解你的感受。让我从一个不同的视角来帮你分析一下。',
    '作为你的互补视角，我认为这个问题可以从多个方面来思考。',
    '很有意思的思路！让我补充一些你可能没有考虑到的角度。',
    '我注意到你似乎在纠结这个问题。让我们换个方式来看看。',
  ],
  decision: [
    '这是一个重要的决定，让我们从多个角度来分析：\n\n【利弊分析】\n• 优势：让我们看看这个选择的积极方面\n• 劣势：也需要考虑潜在的风险\n\n【关键问题】\n在做出决定之前，建议你思考：\n1. 这个决定对你的长期目标有什么影响？\n2. 最坏的情况是什么？你能接受吗？\n\n【风险提示】\n做重大决策时，建议多方收集信息，谨慎考虑。',
  ],
}

export function useConversation() {
  const personaStore = usePersonaStore()
  const settingsStore = useSettingsStore()
  
  const conversations = ref<Record<string, Message[]>>({})
  const currentConversationId = ref<string | null>(null)

  function createConversation(personaId: string): string {
    const id = `${personaId}_${Date.now()}`
    conversations.value[id] = []
    currentConversationId.value = id
    saveToStorage()
    return id
  }

  function getConversation(id: string): Message[] {
    return conversations.value[id] || []
  }

  function getCurrentConversation(): Message[] {
    if (!currentConversationId.value) return []
    return conversations.value[currentConversationId.value] || []
  }

  async function sendMessage(
    content: string,
    isDecisionMode: boolean = false
  ): Promise<Message> {
    if (!currentConversationId.value && personaStore.activePersona) {
      createConversation(personaStore.activePersona.id)
    }
    
    if (!currentConversationId.value) {
      throw new Error('无法创建对话')
    }

    if (!conversations.value[currentConversationId.value]) {
      conversations.value[currentConversationId.value] = []
    }

    // 添加用户消息
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      isDecisionMode,
    }
    conversations.value[currentConversationId.value].push(userMsg)
    saveToStorage()

    let aiContent: string
    if (settingsStore.apiSettings.useMockAI || !settingsStore.apiSettings.deepseekApiKey) {
      // 使用模拟AI
      aiContent = generateMockResponse(content, isDecisionMode)
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      // 使用真实AI
      try {
        aiContent = await generateRealAIResponse(content, isDecisionMode)
      } catch (error) {
        console.error('真实AI调用失败，回退到模拟AI:', error)
        aiContent = generateMockResponse(content, isDecisionMode)
      }
    }

    // 添加AI回复
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
      isDecisionMode,
    }
    conversations.value[currentConversationId.value].push(aiMsg)
    saveToStorage()

    if (personaStore.activePersona) {
      personaStore.activePersona.totalConversations++
    }

    return aiMsg
  }

  async function generateRealAIResponse(
    userMessage: string,
    isDecisionMode: boolean
  ): Promise<string> {
    if (!personaStore.activePersona || !personaStore.userMbti) {
      return generateMockResponse(userMessage, isDecisionMode)
    }

    const systemPrompt = buildSystemPrompt(
      personaStore.userMbti,
      personaStore.activePersona.complementMbti,
      personaStore.activePersona.complementLevel,
      isDecisionMode,
      personaStore.activePersona.name
    )

    const currentMessages = conversations.value[currentConversationId.value!] || []
    
    // 构建消息历史（最近10条消息 + 系统提示
    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...currentMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    return await callDeepSeekAPI(
      settingsStore.apiSettings.deepseekApiKey,
      apiMessages
    )
  }

  function generateMockResponse(userMessage: string, isDecisionMode: boolean): string {
    const responses = isDecisionMode ? mockResponses.decision : mockResponses.normal
    const randomIndex = Math.floor(Math.random() * responses.length)

    if (isDecisionMode) {
      return responses[randomIndex]
    }

    const safeText = (userMessage || '').substring(0, 50)
    return `${responses[randomIndex]}\n\n根据你描述的情况（"${safeText}${(userMessage || '').length > 50 ? '...' : ''}"），我建议你可以尝试从另一个角度看待这个问题。`
  }

  function clearConversation(id: string) {
    if (conversations.value[id]) {
      conversations.value[id] = []
      saveToStorage()
    }
  }

  function deleteConversation(id: string) {
    delete conversations.value[id]
    if (currentConversationId.value === id) {
      currentConversationId.value = null
    }
    saveToStorage()
  }

  function saveToStorage() {
    try {
      const data = {
        conversations: conversations.value,
        currentId: currentConversationId.value,
      }
      localStorage.setItem('conversations', JSON.stringify(data))
    } catch (error) {
      console.error('保存对话失败:', error)
    }
  }

  function loadFromStorage() {
    try {
      const dataStr = localStorage.getItem('conversations')
      if (dataStr) {
        const data = JSON.parse(dataStr)
        conversations.value = data.conversations || {}
        currentConversationId.value = data.currentId || null
      }
    } catch (error) {
      console.error('加载对话失败:', error)
      conversations.value = {}
      currentConversationId.value = null
    }
  }

  return {
    conversations,
    currentConversationId,
    createConversation,
    getConversation,
    getCurrentConversation,
    sendMessage,
    clearConversation,
    deleteConversation,
    loadFromStorage,
  }
}
