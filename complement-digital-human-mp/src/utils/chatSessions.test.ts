import { describe, expect, it } from 'vitest'
import {
  createSession,
  ensureSessions,
  getMessagesKey,
  getSessionsKey,
  loadSessions,
  removeSession,
  saveSessions,
  touchSession,
} from './chatSessions'
import type { ChatSessionMeta } from './chatSessions'

function makeSession(id: string): ChatSessionMeta {
  return {
    id,
    title: '新对话',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    preview: '',
  }
}

describe('chatSessions 存储键', () => {
  it('生成会话列表与消息的存储键', () => {
    expect(getSessionsKey('p1')).toBe('chat_sessions_p1')
    expect(getMessagesKey('p1', 's1')).toBe('chat_messages_p1_s1')
  })
})

describe('chatSessions 增删改查', () => {
  it('无数据时返回空列表', () => {
    expect(loadSessions('p1')).toEqual([])
  })

  it('保存后可以读回', () => {
    saveSessions('p1', [makeSession('s1')])
    const list = loadSessions('p1')
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('s1')
  })

  it('损坏的存储内容回退为空列表', () => {
    uni.setStorageSync('chat_sessions_p1', 'not-json{')
    expect(loadSessions('p1')).toEqual([])
  })

  it('创建会话会插入列表头部', () => {
    createSession('p1')
    createSession('p1')
    const list = loadSessions('p1')
    expect(list).toHaveLength(2)
    expect(list[0].title).toBe('新对话')
    expect(list[0].id).toMatch(/^\d+_\w+$/)
  })

  it('touchSession 更新标题、预览与更新时间', () => {
    const s = createSession('p1')
    touchSession('p1', s.id, [
      { role: 'user', content: '今天天气怎么样啊' },
      {
        role: 'assistant',
        content: '今天天气不错',
        structured: { perspective: '从一个新的角度看这个问题' },
      },
    ])
    const meta = loadSessions('p1')[0]
    expect(meta.title).toBe('今天天气怎么样啊')
    expect(meta.preview).toBe('从一个新的角度看这个问题')
    expect(new Date(meta.updatedAt).getTime()).toBeGreaterThan(new Date('2026-01-01T00:00:00.000Z').getTime())
  })

  it('removeSession 删除会话元数据与消息', () => {
    const a = createSession('p1')
    createSession('p1')
    uni.setStorageSync(getMessagesKey('p1', a.id), JSON.stringify([{ role: 'user', content: 'hi' }]))
    removeSession('p1', a.id)
    expect(loadSessions('p1')).toHaveLength(1)
    expect(uni.getStorageSync(getMessagesKey('p1', a.id))).toBe('')
  })
})

describe('chatSessions 旧版单会话迁移', () => {
  it('无会话且无 legacy 数据时返回空列表', () => {
    expect(ensureSessions('p1')).toEqual([])
  })

  it('将旧版 chat_messages_ 迁移为 legacy 会话并清理旧键', () => {
    uni.setStorageSync(
      'chat_messages_p1',
      JSON.stringify([
        { role: 'user', content: '你好呀', timestamp: '2026-01-01T00:00:00.000Z' },
        { role: 'assistant', content: '你好，我是互补数字人', timestamp: '2026-01-02T00:00:00.000Z' },
      ])
    )
    const sessions = ensureSessions('p1')
    expect(sessions).toHaveLength(1)
    expect(sessions[0].id).toBe('legacy')
    expect(sessions[0].title).toBe('你好呀')
    expect(sessions[0].preview).toBe('你好，我是互补数字人')
    expect(uni.getStorageSync('chat_messages_p1')).toBe('')
    const migrated = uni.getStorageSync('chat_messages_p1_legacy')
    expect(migrated).toContain('互补数字人')
  })

  it('已有会话时不再触发迁移', () => {
    saveSessions('p2', [makeSession('s1')])
    expect(ensureSessions('p2')[0].id).toBe('s1')
  })
})