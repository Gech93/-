import type { ChatSessionMeta } from './chatSessions'
import { getSessionsKey, getMessagesKey } from './chatSessions'

const APP_MARKER = 'complement-digital-human'

interface BackupData {
  persona_data?: unknown
  sessions?: Record<string, unknown>
  messages?: Record<string, Record<string, unknown>>
  settings?: { use_cloud_proxy?: unknown; cloud_gateway_url?: unknown }
}

function readStorage<T>(key: string): T | null {
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
    return null
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch (e2) {
      console.error('写入存储失败:', e2)
    }
  }
}

function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    try {
      localStorage.removeItem(key)
    } catch (e2) {
      console.error('删除存储失败:', e2)
    }
  }
}

function getStorageKeys(): string[] {
  try {
    const info = uni.getStorageInfoSync()
    return Array.isArray(info.keys) ? info.keys : []
  } catch (e) {
    return []
  }
}

export function buildBackupJson(): string {
  const personaData = readStorage('persona_data')
  const sessions: Record<string, ChatSessionMeta[]> = {}
  const messages: Record<string, Record<string, unknown[]>> = {}
  getStorageKeys().forEach(key => {
    if (key.startsWith('chat_sessions_')) {
      const personaId = key.slice('chat_sessions_'.length)
      sessions[personaId] = readStorage<ChatSessionMeta[]>(key) || []
    } else if (key.startsWith('chat_messages_')) {
      const rest = key.slice('chat_messages_'.length)
      const sep = rest.lastIndexOf('_')
      if (sep <= 0) return
      const personaId = rest.slice(0, sep)
      const sessionId = rest.slice(sep + 1)
      if (!messages[personaId]) messages[personaId] = {}
      messages[personaId][sessionId] = readStorage<unknown[]>(key) || []
    }
  })
  const backup = {
    app: APP_MARKER,
    exportedAt: new Date().toISOString(),
    data: {
      persona_data: personaData,
      sessions,
      messages,
      settings: {
        use_cloud_proxy: readStorage('use_cloud_proxy') === true,
        cloud_gateway_url: readStorage('cloud_gateway_url') || '',
      },
    },
  }
  return JSON.stringify(backup)
}

export function importBackupJson(jsonText: string): { ok: boolean; msg: string } {
  let parsed: { app?: unknown; data?: BackupData } | null = null
  try {
    parsed = JSON.parse(jsonText)
  } catch (e) {
    return { ok: false, msg: '文件内容不是有效的 JSON' }
  }
  if (!parsed || parsed.app !== APP_MARKER || !parsed.data || typeof parsed.data !== 'object') {
    return { ok: false, msg: '不是有效的互补数字人备份文件' }
  }
  const data = parsed.data

  getStorageKeys().forEach(key => {
    if (key.startsWith('chat_') || key === 'persona_data') removeStorage(key)
  })

  if (data.persona_data && typeof data.persona_data === 'object') {
    writeStorage('persona_data', JSON.stringify(data.persona_data))
  }

  const sessions = data.sessions || {}
  const messages = data.messages || {}
  Object.keys(sessions).forEach(personaId => {
    if (Array.isArray(sessions[personaId])) {
      writeStorage(getSessionsKey(personaId), JSON.stringify(sessions[personaId]))
    }
  })
  Object.keys(messages).forEach(personaId => {
    const m = messages[personaId]
    if (m && typeof m === 'object') {
      Object.keys(m).forEach(sessionId => {
        if (Array.isArray(m[sessionId])) {
          writeStorage(getMessagesKey(personaId, sessionId), JSON.stringify(m[sessionId]))
        }
      })
    }
  })

  const settings = data.settings || {}
  if (settings.use_cloud_proxy === true) {
    writeStorage('use_cloud_proxy', true)
  } else {
    removeStorage('use_cloud_proxy')
  }
  if (typeof settings.cloud_gateway_url === 'string' && settings.cloud_gateway_url) {
    writeStorage('cloud_gateway_url', settings.cloud_gateway_url)
  } else {
    removeStorage('cloud_gateway_url')
  }

  return { ok: true, msg: '导入成功' }
}

export function clearAllConversations(): number {
  const keys = getStorageKeys().filter(k => k.startsWith('chat_'))
  keys.forEach(removeStorage)
  return keys.length
}