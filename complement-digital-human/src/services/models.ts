export interface ModelOption {
  id: string
  label: string
  provider: string
  baseURL: string
  jsonMode: boolean
}

export const CUSTOM_MODEL_ID = '__custom__'

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'deepseek-chat', label: 'DeepSeek-V3（deepseek-chat）', provider: 'deepseek', baseURL: 'https://api.deepseek.com/chat/completions', jsonMode: true },
  { id: 'deepseek-reasoner', label: 'DeepSeek-R1（deepseek-reasoner）', provider: 'deepseek', baseURL: 'https://api.deepseek.com/chat/completions', jsonMode: false },
  { id: 'gpt-4o-mini', label: 'OpenAI GPT-4o-mini', provider: 'openai', baseURL: 'https://api.openai.com/v1/chat/completions', jsonMode: true },
  { id: 'moonshot-v1-8k', label: 'Kimi（moonshot-v1-8k）', provider: 'moonshot', baseURL: 'https://api.moonshot.cn/v1/chat/completions', jsonMode: true },
]

export function getModelOption(id: string): ModelOption {
  return MODEL_OPTIONS.find(m => m.id === id) || MODEL_OPTIONS[0]
}

export function isCustomModel(id: string): boolean {
  return id === CUSTOM_MODEL_ID
}
