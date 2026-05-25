import { ref } from 'vue'
import { usePersonaStore } from './persona'

// 消息类型
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isDecisionMode?: boolean
}

// 模拟AI回复库
const mockResponses = {
  normal: [
    '这是一个很有趣的想法！从另一个角度来看，或许我们可以考虑...',
    '我理解你的感受。让我从一个不同的视角来帮你分析一下。',
    '作为你的互补视角，我认为这个问题可以从多个方面来思考。',
    '很有意思的思路！让我补充一些你可能没有考虑到的角度。',
    '我注意到你似乎在纠结这个问题。让我帮你理清一下思路。',
    '我从你的描述中感受到了一些有趣的点。让我们换个方式来看看这个问题。',
  ],
  decision: [
    '这是一个重要的决定，让我们从多个角度来分析：\n\n**【利弊分析】**\n• 优势：让我们看看这个选择的积极方面\n• 劣势：也需要考虑潜在的风险\n\n**【关键问题】**\n在做出决定之前，建议你思考：\n1. 这个决定对你的长期目标有什么影响？\n2. 最坏的情况是什么？你能接受吗？\n\n**【风险提示】**\n做重大决策时，建议多方收集信息，谨慎考虑。',
  ],
}

export function useConversation() {
  const personaStore = usePersonaStore()
  
  const conversations = ref<Record<string, Message[]>>({})
  const currentConversationId = ref<string | null>(null)

  // 创建新对话
  function createConversation(personaId: string): string {
    const id = `${personaId}_${Date.now()}`
    conversations.value[id] = []
    currentConversationId.value = id
    saveToStorage()
    return id
  }

  // 获取对话
  function getConversation(id: string): Message[] {
    return conversations.value[id] || []
  }

  // 获取当前对话
  function getCurrentConversation(): Message[] {
    if (!currentConversationId.value) return []
    return conversations.value[currentConversationId.value] || []
  }

  // 发送消息
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

  // 生成回复
  function generateResponse(userMessage: string, isDecisionMode: boolean): string {
    const responses = isDecisionMode ? mockResponses.decision : mockResponses.normal
    const randomIndex = Math.floor(Math.random() * responses.length)

    if (isDecisionMode) {
      return responses[randomIndex].replace('...', extractDecisionTopic(userMessage))
    }

    return `${responses[randomIndex]}\n\n根据你描述的情况（"${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"），我建议你可以尝试从另一个角度看待这个问题。`
  }

  // 提取决策主题
  function extractDecisionTopic(message: string): string {
    const topics = message.substring(0, 50)
    return topics + (message.length > 50 ? '...' : '')
  }

  // 清空对话
  function clearConversation(id: string) {
    if (conversations.value[id]) {
      conversations.value[id] = []
      saveToStorage()
    }
  }

  // 删除对话
  function deleteConversation(id: string) {
    delete conversations.value[id]
    if (currentConversationId.value === id) {
      currentConversationId.value = null
    }
    saveToStorage()
  }

  // 保存到本地存储
  function saveToStorage() {
    const data = {
      conversations: conversations.value,
      currentId: currentConversationId.value,
    }
    localStorage.setItem('conversations', JSON.stringify(data))
  }

  // 从本地存储加载
  function loadFromStorage() {
    const dataStr = localStorage.getItem('conversations')
    if (dataStr) {
      const data = JSON.parse(dataStr)
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
