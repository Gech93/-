const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekRequest {
  model: string
  messages: Message[]
  temperature?: number
  max_tokens?: number
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function callDeepSeekAPI(
  apiKey: string,
  messages: Message[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const requestBody: DeepSeekRequest = {
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || '未知错误'}`)
    }

    const data: DeepSeekResponse = await response.json()
    return data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
  } catch (error) {
    console.error('调用DeepSeek API失败:', error)
    throw error
  }
}

export function buildSystemPrompt(
  userMbti: string,
  complementMbti: string,
  complementLevel: number,
  isDecisionMode: boolean,
  personaName: string
): string {
  const levelText = complementLevel <= 30 ? '轻度互补' : complementLevel <= 70 ? '中度互补' : '高度互补'
  
  const mbtiDescriptions: Record<string, string> = {
    'E': '外向、社交、能量来源于他人',
    'I': '内向、内省、能量来源于独处',
    'S': '实感、关注细节、务实',
    'N': '直觉、关注整体、想象力',
    'T': '思考、理性分析、客观',
    'F': '情感、价值观导向、同理心',
    'J': '判断、有条理、计划性',
    'P': '知觉、灵活、随性',
  }

  const userDesc = userMbti.split('').map(c => mbtiDescriptions[c]).join('；')
  const complementDesc = complementMbti.split('').map(c => mbtiDescriptions[c]).join('；')

  let systemPrompt = `你是"${personaName}"，一个与用户互补的数字伙伴。

用户的MBTI类型是${userMbti}，特点是：${userDesc}。
你的MBTI类型是${complementMbti}，特点是：${complementDesc}。
互补程度：${levelText}（${complementLevel}%）。

请始终以${complementMbti}的思维方式和${userMbti}互补的视角来回应。`

  if (isDecisionMode) {
    systemPrompt += `

当前处于决策模式，请：
1. 从多个角度分析问题
2. 提供利弊分析
3. 引导用户思考关键因素
4. 保持客观，不替用户做决定
5. 提醒用户考虑长期影响`
  } else {
    systemPrompt += `

请：
1. 倾听和理解用户
2. 提供互补的视角
3. 鼓励用户思考
4. 保持友好和支持的态度`
  }

  return systemPrompt
}
