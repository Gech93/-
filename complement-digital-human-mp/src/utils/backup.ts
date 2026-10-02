import type { ChatSessionMeta } from './chatSessions'
import { getSessionsKey, getMessagesKey } from './chatSessions'
import { getStorageKeys, readStorage, removeStorage, writeStorage, STORAGE_KEYS } from './storage'

const APP_MARKER = 'complement-digital-human'

interface BackupData {
  persona_data?: unknown
  sessions?: Record<string, unknown>
  messages?: Record<string, Record<string, unknown>>
  settings?: { use_cloud_proxy?: unknown; cloud_gateway_url?: unknown }
}

export function buildBackupJson(): string {
  const personaData = readStorage(STORAGE_KEYS.personaData)
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
        use_cloud_proxy: readStorage(STORAGE_KEYS.useCloudProxy) === true,
        cloud_gateway_url: readStorage(STORAGE_KEYS.cloudGatewayUrl) || '',
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
    if (key.startsWith('chat_') || key === STORAGE_KEYS.personaData) removeStorage(key)
  })

  if (data.persona_data && typeof data.persona_data === 'object') {
    writeStorage(STORAGE_KEYS.personaData, JSON.stringify(data.persona_data))
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
    writeStorage(STORAGE_KEYS.useCloudProxy, true)
  } else {
    removeStorage(STORAGE_KEYS.useCloudProxy)
  }
  if (typeof settings.cloud_gateway_url === 'string' && settings.cloud_gateway_url) {
    writeStorage(STORAGE_KEYS.cloudGatewayUrl, settings.cloud_gateway_url)
  } else {
    removeStorage(STORAGE_KEYS.cloudGatewayUrl)
  }

  return { ok: true, msg: '导入成功' }
}

export function clearAllConversations(): number {
  const keys = getStorageKeys().filter(k => k.startsWith('chat_'))
  keys.forEach(removeStorage)
  return keys.length
}