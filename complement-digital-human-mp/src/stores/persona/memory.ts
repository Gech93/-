import { FACT_HALF_LIFE_DAYS, FACT_MIN_STRENGTH, FEEDBACK_HALF_LIFE_DAYS } from './types'
import type { FeedbackSample, MemoryFact } from './types'

export function bigramSet(text: string): Set<string> {
  const chars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase()
  const result = new Set<string>()
  for (let i = 0; i < chars.length - 1; i++) {
    result.add(chars.slice(i, i + 2))
  }
  return result
}

export function bigramJaccard(a: string, b: string): number {
  const sa = bigramSet(a)
  const sb = bigramSet(b)
  if (sa.size === 0 || sb.size === 0) return 0
  let inter = 0
  sa.forEach(c => {
    if (sb.has(c)) inter++
  })
  return inter / (sa.size + sb.size - inter)
}

export function findRelevantFacts(facts: MemoryFact[], query: string, topK = 3): MemoryFact[] {
  return facts
    .filter(f => factMemoryStrength(f) >= FACT_MIN_STRENGTH)
    .map(f => ({
      fact: f,
      score: bigramJaccard(f.content, query) + bigramJaccard(f.keywords.join(' '), query) + factMemoryStrength(f) * 0.01,
    }))
    .filter(item => item.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.fact)
}

export function feedbackSampleStrength(sample: FeedbackSample): number {
  const days = Math.max(0, (Date.now() - new Date(sample.lastAt).getTime()) / (24 * 60 * 60 * 1000))
  return sample.count * Math.pow(0.5, days / FEEDBACK_HALF_LIFE_DAYS)
}

export function normalizeFeedbackSample(s: Partial<FeedbackSample>): FeedbackSample {
  return {
    text: s.text || '',
    count: s.count || 1,
    lastAt: s.lastAt || new Date().toISOString(),
  }
}

export function factMemoryStrength(fact: MemoryFact): number {
  const days = Math.max(0, (Date.now() - new Date(fact.lastAt).getTime()) / (24 * 60 * 60 * 1000))
  return fact.importance * Math.pow(0.5, days / FACT_HALF_LIFE_DAYS)
}

export function normalizeMemoryFact(s: Partial<MemoryFact>): MemoryFact {
  return {
    id: s.id || '',
    content: s.content || '',
    keywords: s.keywords || [],
    importance: s.importance ?? 3,
    category: s.category || 'other',
    createdAt: s.createdAt || new Date().toISOString(),
    lastAt: s.lastAt || s.createdAt || new Date().toISOString(),
  }
}

export function forgetDecayedFacts(facts: MemoryFact[]): void {
  for (let i = facts.length - 1; i >= 0; i--) {
    if (factMemoryStrength(facts[i]) < FACT_MIN_STRENGTH) {
      facts.splice(i, 1)
    }
  }
}