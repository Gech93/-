import { ref } from 'vue'
import { usePersonaStore } from '../stores/persona'

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isDecisionMode?: boolean
}

// 对话记录
const conversations = ref<Record<string, Message[]>>({})
const currentConversationId = ref<string | null>(null)

// 模拟AI回复
const mockResponses = {
  normal: [
    '这是一个很有趣的想法！从另一个角度来看，或许我们可以考虑...',
    '我理解你的感受。让我从一个不同的角度来帮你分析一下。',
    '作为你的互补视角，我认为这个问题可以从多个方面来思考。',
    '很有意思的思路！让我补充一些你可能没有考虑到的角度。',
    '我注意到你似乎在纠结这个问题。让我帮你理清一下思路。',
  ],
  decision: [
    '这是一个重要的决定，让我们从多个角度来分析：\n\n【利弊分析】\n• 优势：...\n• 劣势：...\n\n【关键问题】\n在做出决定之前，建议你思考：\n1. 这个决定对你的长期目标有什么影响？\n2. 最坏的情况是什么？你能接受吗？\n\n【风险提示】\n做重大决策时，建议多方收集信息，谨慎考虑。',
  ],
}

// 决策模式说明
export const decisionModeGuide = {
  title: '决策模式说明',
  purpose: '帮助分析重要决策，提供多角度视角',
  features: [
    '更结构化的分析框架',
    '会主动提问关键问题',
    '明确区分你的倾向和互补视角',
  ],
  applicableScenarios: [
    '职业选择和发展规划',
    '人生重大决定',
    '重要人际关系问题',
  ],
  disclaimer: '最终决策权在您，我们提供视角而非答案',
}

export function useConversation() {
  const personaStore = usePersonaStore()
  
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
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      isDecisionMode,
    }
    
    const convId = currentConversationId.value || createConversation(
      personaStore.activePersona?.id || 'default'
    )
    
    if (!conversations.value[convId]) {
      conversations.value[convId] = []
    }
    conversations.value[convId].push(userMessage)
    
    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成AI回复
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateResponse(content, isDecisionMode),
      timestamp: new Date(),
      isDecisionMode,
    }
    
    conversations.value[convId].push(aiMessage)
    saveToStorage()
    
    // 更新对话计数
    if (personaStore.activePersona) {
      personaStore.activePersona.totalConversations++
    }
    
    return aiMessage
  }
  
  function generateResponse(userMessage: string, isDecisionMode: boolean): string {
    const responses = isDecisionMode ? mockResponses.decision : mockResponses.normal
    const randomIndex = Math.floor(Math.random() * responses.length)
    
    if (isDecisionMode) {
      return responses[randomIndex].replace('...', extractDecisionTopic(userMessage))
    }
    
    return `${responses[randomIndex]}\n\n根据你描述的情况，我建议你可以尝试...`
  }
  
  function extractDecisionTopic(message: string): string {
    // 简单提取决策主题
    const topics = message.substring(0, 50)
    return topics + (message.length > 50 ? '...' : '')
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
    uni.setStorageSync('conversations', {
      conversations: conversations.value,
      currentId: currentConversationId.value,
    })
  }
  
  function loadFromStorage() {
    const data = uni.getStorageSync('conversations')
    if (data) {
      conversations.value = data.conversations || {}
      currentConversationId.value = data.currentId
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
