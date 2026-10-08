import { describe, expect, it } from 'vitest'
import { buildBackupJson, clearAllConversations, importBackupJson } from './backup'

function seedStorage(): void {
  uni.setStorageSync('persona_data', JSON.stringify({ name: '张三', mbtiType: 'INTJ' }))
  uni.setStorageSync('chat_sessions_p1', JSON.stringify([{ id: 's1', title: '对话一' }]))
  uni.setStorageSync('chat_messages_p1_s1', JSON.stringify([{ role: 'user', content: '你好' }]))
  uni.setStorageSync('use_cloud_proxy', true)
  uni.setStorageSync('cloud_gateway_url', 'https://gateway.example.com')
}

describe('backup 导出', () => {
  it('导出包含应用标记与全部数据域', () => {
    seedStorage()
    const parsed = JSON.parse(buildBackupJson())
    expect(parsed.app).toBe('complement-digital-human')
    expect(parsed.data.persona_data).toEqual({ name: '张三', mbtiType: 'INTJ' })
    expect(parsed.data.sessions.p1[0].id).toBe('s1')
    expect(parsed.data.messages.p1.s1[0].content).toBe('你好')
    expect(parsed.data.settings.use_cloud_proxy).toBe(true)
    expect(parsed.data.settings.cloud_gateway_url).toBe('https://gateway.example.com')
  })

  it('导出时间戳为合法 ISO 字符串', () => {
    const parsed = JSON.parse(buildBackupJson())
    expect(new Date(parsed.exportedAt).getTime()).not.toBeNaN()
  })
})

describe('backup 导入', () => {
  it('非法 JSON 返回失败', () => {
    const result = importBackupJson('not json{{')
    expect(result.ok).toBe(false)
  })

  it('应用标记不匹配返回失败', () => {
    const result = importBackupJson(JSON.stringify({ app: 'other-app', data: {} }))
    expect(result.ok).toBe(false)
  })

  it('导入前清空旧会话与人格数据', () => {
    seedStorage()
    uni.setStorageSync('chat_sessions_old', JSON.stringify([{ id: 'old' }]))

    const backup = JSON.stringify({
      app: 'complement-digital-human',
      exportedAt: new Date().toISOString(),
      data: {
        persona_data: { name: '李四', mbtiType: 'ESTJ' },
        sessions: { p2: [{ id: 'x', title: '新对话' }] },
        messages: { p2: { x: [{ role: 'user', content: '你好' }] } },
        settings: { use_cloud_proxy: false, cloud_gateway_url: '' },
      },
    })
    const result = importBackupJson(backup)
    expect(result.ok).toBe(true)
    expect(uni.getStorageSync('chat_sessions_old')).toBe('')
    expect(uni.getStorageSync('persona_data')).toBe(JSON.stringify({ name: '李四', mbtiType: 'ESTJ' }))
    expect(uni.getStorageSync('chat_sessions_p2')).toContain('"id":"x"')
    expect(uni.getStorageSync('chat_messages_p2_x')).toContain('你好')
    expect(uni.getStorageSync('use_cloud_proxy')).toBeFalsy()
    expect(uni.getStorageSync('cloud_gateway_url')).toBeFalsy()
  })

  it('导入保留开启的云代理设置', () => {
    const backup = JSON.stringify({
      app: 'complement-digital-human',
      exportedAt: new Date().toISOString(),
      data: {
        persona_data: {},
        sessions: {},
        messages: {},
        settings: { use_cloud_proxy: true, cloud_gateway_url: 'https://g.example.com' },
      },
    })
    const result = importBackupJson(backup)
    expect(result.ok).toBe(true)
    expect(uni.getStorageSync('use_cloud_proxy')).toBe(true)
    expect(uni.getStorageSync('cloud_gateway_url')).toBe('https://g.example.com')
  })
})

describe('backup 清空', () => {
  it('只清会话相关键，保留人格数据', () => {
    seedStorage()
    uni.setStorageSync('chat_sessions_p2', '[]')
    const count = clearAllConversations()
    expect(count).toBeGreaterThanOrEqual(3)
    expect(uni.getStorageSync('chat_sessions_p1')).toBe('')
    expect(uni.getStorageSync('chat_messages_p1_s1')).toBe('')
    expect(uni.getStorageSync('chat_sessions_p2')).toBe('')
    expect(uni.getStorageSync('persona_data')).not.toBe('')
  })
})