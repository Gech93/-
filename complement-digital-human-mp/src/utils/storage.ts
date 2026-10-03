export const STORAGE_KEYS = {
  personaData: 'persona_data',
  deepseekApiKey: 'deepseek_api_key',
  useDeepSeek: 'use_deepseek',
  cloudGatewayUrl: 'cloud_gateway_url',
  cloudGatewayToken: 'cloud_gateway_token',
  useCloudProxy: 'use_cloud_proxy',
  aiModel: 'ai_model',
  aiCustomModel: 'ai_custom_model',
  aiBaseUrl: 'ai_base_url',
} as const

export function readStorage<T>(key: string): T | null {
  try {
    const raw = uni.getStorageSync(key)
    if (raw === '' || raw === null || raw === undefined) return null
    if (typeof raw !== 'string') return raw as T
    try {
      return JSON.parse(raw) as T
    } catch (e) {
      return raw as T
    }
  } catch (e) {
    return readLocalStorage<T>(key)
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (e2) {
      console.error('保存失败:', e2)
    }
  }
}

export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (e2) {
      console.error('删除失败:', e2)
    }
  }
}

export function getStorageKeys(): string[] {
  try {
    const info = uni.getStorageInfoSync()
    return Array.isArray(info.keys) ? info.keys : []
  } catch (e) {
    return []
  }
}

function readLocalStorage<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === '') return null
    return JSON.parse(raw) as T
  } catch (e) {
    return null
  }
}