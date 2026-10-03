import type { BehaviorProfile } from '../../../stores/persona'

export interface MemoryUpdatePayload {
  facts?: Array<{ content: string; category?: string }>
  summary?: string
  behavior?: Partial<BehaviorProfile>
}

export interface StructuredReply {
  perspective: string
  suggestions: string[]
  followUpQuestion: string
  memoryUpdates?: MemoryUpdatePayload
}

export interface ChatResponse {
  text: string
  structured?: StructuredReply
  memoryUpdates?: MemoryUpdatePayload
}

const MAX_FACTS = 3

export function parseMemoryUpdates(raw: unknown): MemoryUpdatePayload | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as { facts?: unknown; summary?: unknown; behavior?: unknown }
  const payload: MemoryUpdatePayload = {}
  if (Array.isArray(r.facts)) {
    const facts: Array<{ content: string; category?: string }> = []
    for (const f of r.facts) {
      const ff = f as { content?: unknown; category?: unknown }
      if (ff && typeof ff.content === 'string' && ff.content.trim()) {
        facts.push({
          content: ff.content.trim(),
          category: typeof ff.category === 'string' ? ff.category : undefined,
        })
        if (facts.length >= MAX_FACTS) break
      }
    }
    payload.facts = facts
  }
  if (typeof r.summary === 'string' && r.summary.trim()) {
    payload.summary = r.summary.trim()
  }
  if (r.behavior && typeof r.behavior === 'object') {
    const b = r.behavior as { emotionTendency?: unknown; decisionStyle?: unknown; expressionStyle?: unknown; deepNeed?: unknown }
    const behavior: Partial<BehaviorProfile> = {}
    if (typeof b.emotionTendency === 'string') behavior.emotionTendency = b.emotionTendency
    if (typeof b.decisionStyle === 'string') behavior.decisionStyle = b.decisionStyle
    if (typeof b.expressionStyle === 'string') behavior.expressionStyle = b.expressionStyle
    if (typeof b.deepNeed === 'string') behavior.deepNeed = b.deepNeed
    if (Object.keys(behavior).length) payload.behavior = behavior
  }
  return payload
}

export function parseStructuredReply(content: string): StructuredReply {
  try {
    const cleaned = content.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('no json')
    const json = JSON.parse(cleaned.slice(start, end + 1))
    return {
      perspective: typeof json.perspective === 'string' ? json.perspective : content,
      suggestions: Array.isArray(json.suggestions)
        ? json.suggestions.map((s: unknown) => String(s)).filter(Boolean)
        : [],
      followUpQuestion: typeof json.followUpQuestion === 'string' ? json.followUpQuestion : '',
      memoryUpdates: parseMemoryUpdates(json.memoryUpdates),
    }
  } catch (e) {
    return { perspective: content, suggestions: [], followUpQuestion: '' }
  }
}

export function formatStructuredText(structured: StructuredReply): string {
  const parts: string[] = []
  if (structured.perspective) parts.push(structured.perspective)
  if (structured.suggestions.length) {
    parts.push('【建议】')
    parts.push(structured.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'))
  }
  if (structured.followUpQuestion) {
    parts.push(`💬 ${structured.followUpQuestion}`)
  }
  return parts.join('\n\n')
}
