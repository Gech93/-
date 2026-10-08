import { readStorage, removeStorage, writeStorage } from './storage'

export interface ChatSessionMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  preview: string
}

export function getSessionsKey(personaId: string): string {
  return `chat_sessions_${personaId}`
}

export function getMessagesKey(personaId: string, sessionId: string): string {
  return `chat_messages_${personaId}_${sessionId}`
}

interface LegacyMessage {
  role?: string
  content?: string
  timestamp?: string
}

interface SessionMessage {
  role?: string
  content?: string
  structured?: { perspective?: string }
}

export function loadSessions(personaId: string): ChatSessionMeta[] {
  const list = readStorage<ChatSessionMeta[]>(getSessionsKey(personaId))
  return Array.isArray(list) ? list : []
}

export function saveSessions(personaId: string, sessions: ChatSessionMeta[]): void {
  writeStorage(getSessionsKey(personaId), sessions)
}

export function ensureSessions(personaId: string): ChatSessionMeta[] {
  const sessions = loadSessions(personaId)
  if (sessions.length) return sessions

  const legacyKey = `chat_messages_${personaId}`
  const legacy = readStorage<LegacyMessage[]>(legacyKey)
  if (Array.isArray(legacy) && legacy.length) {
    const id = 'legacy'
    const firstUser = legacy.find((m: LegacyMessage) => m.role === 'user')
    const firstMessage = legacy[0]
    const lastMessage = legacy[legacy.length - 1]
    const session: ChatSessionMeta = {
      id,
      title: firstUser && firstUser.content ? firstUser.content.slice(0, 16) : '对话',
      createdAt: firstMessage && firstMessage.timestamp ? firstMessage.timestamp : new Date().toISOString(),
      updatedAt: lastMessage && lastMessage.timestamp ? lastMessage.timestamp : new Date().toISOString(),
      preview: lastMessage && lastMessage.content ? lastMessage.content.slice(0, 30) : '',
    }
    saveSessions(personaId, [session])
    writeStorage(getMessagesKey(personaId, id), legacy.filter(Boolean))
    removeStorage(legacyKey)
    return [session]
  }
  return []
}

export function createSession(personaId: string): ChatSessionMeta {
  const now = new Date().toISOString()
  const session: ChatSessionMeta = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: '新对话',
    createdAt: now,
    updatedAt: now,
    preview: '',
  }
  const sessions = loadSessions(personaId)
  sessions.unshift(session)
  saveSessions(personaId, sessions)
  return session
}

export function touchSession(personaId: string, sessionId: string, messages: SessionMessage[]): void {
  const sessions = loadSessions(personaId)
  const meta = sessions.find(s => s.id === sessionId)
  if (!meta) return
  const firstUser = messages.find((m: SessionMessage) => m.role === 'user')
  const last = messages[messages.length - 1]
  if (firstUser && firstUser.content) meta.title = firstUser.content.slice(0, 16)
  if (last && last.structured && last.structured.perspective) {
    meta.preview = last.structured.perspective.slice(0, 30)
  } else if (last && last.content) {
    meta.preview = last.content.slice(0, 30)
  }
  meta.updatedAt = new Date().toISOString()
  saveSessions(personaId, sessions)
}

export function removeSession(personaId: string, sessionId: string): void {
  const sessions = loadSessions(personaId)
  saveSessions(
    personaId,
    sessions.filter(s => s.id !== sessionId)
  )
  removeStorage(getMessagesKey(personaId, sessionId))
}