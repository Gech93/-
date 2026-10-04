import { formatStructuredText, type ChatResponse, type StructuredReply } from './structured'

interface ScenarioTemplate {
  perspective: string
  suggestions: string[]
  followUp: string
}

export const scenarioTemplates: Record<string, ScenarioTemplate> = {
  decision: {
    perspective: '从互补视角来看，选择没有绝对的对错，关键在于它是否与你的长期方向一致。比起"选哪个"，更值得关注的是你选择背后的动机。',
    suggestions: [
      '把每个选项的利弊分别写下来，给它们打分',
      '设想 1 年后回看，你会怎么评价这个选择',
      '先做一个最小成本的尝试，用真实反馈代替想象',
    ],
    followUp: '如果最坏的结果出现，你仍然愿意选的那个，往往就是答案——你觉得呢？',
  },
  emotion: {
    perspective: '我能感觉到这件事对你的影响。先别急着找解决方案，允许自己先被理解——情绪本身就在传递重要的信息。',
    suggestions: [
      '给此刻的情绪命名，写下它想告诉你什么',
      '区分事实、想法和感受，减少过度解读',
      '把情绪释放出来之后，再决定要不要行动',
    ],
    followUp: '如果可以给自己放一个小小的假，你最想做什么？',
  },
  relationship: {
    perspective: '关系中看似是对方的问题，往往有一半和我们自己有关。换个角度看，矛盾常常是双方需求没有被说清楚的信号。',
    suggestions: [
      '先描述事实，再表达感受，而不是直接指责',
      '问自己：这段关系里我最看重的是什么',
      '换位写下对方可能的想法，寻找共同点',
    ],
    followUp: '如果你是对方，听到你的这些话，你希望听到什么样的表达？',
  },
  goal: {
    perspective: '目标之所以让人焦虑，往往不是因为它太大，而是因为它还只是一个模糊的念头。把它变成可执行的小步，动力自然就回来了。',
    suggestions: [
      '把大目标拆成本周就能完成的 3 个小行动',
      '给自己设一个可衡量的进度反馈机制',
      '想象完成后的画面，用它驱动每天的行动',
    ],
    followUp: '如果这个目标只能推进一小步，你明天最愿意做的那一小步是什么？',
  },
  perspective: {
    perspective: '换一个视角，并不是否定你的想法，而是帮你看到边界之外的可能性。很多时候我们不是缺少答案，而是困在单一的问题框架里。',
    suggestions: [
      '假设十年后的你回看这件事，会给出什么建议',
      '用"如果是我最好的朋友遇到这件事"来重述问题',
      '列出这个问题的反面，看看它带来了什么新信息',
    ],
    followUp: '如果这个问题根本不是问题，那它可能是什么？',
  },
  default: {
    perspective: '我听到了你说的这件事。作为与你互补的视角，我想先和你一起把它拆开，找到你真正在意、也真正卡住你的地方。',
    suggestions: [
      '把整件事的前因后果按时间顺序理一遍',
      '找出这件事里最让你不舒服的那个点',
      '列出你已经试过、但没奏效的做法',
    ],
    followUp: '这件事里，最让你放心不下的具体是哪一环？',
  },
}

export function detectScenario(text: string): string {
  if (/决定|决策|选择|怎么办|纠结|迷茫|犹豫/.test(text)) return 'decision'
  if (/压力|焦虑|烦|累|难过|情绪|心情|生气|委屈|孤独|失眠|抑郁/.test(text)) return 'emotion'
  if (/朋友|同事|伴侣|家人|关系|吵架|相处|分手|父母/.test(text)) return 'relationship'
  if (/目标|计划|规划|梦想|愿望|想要|未来|改变/.test(text)) return 'goal'
  if (/角度|思维|想法|思考|视角/.test(text)) return 'perspective'
  return 'default'
}

export function generateMockResponse(text: string): ChatResponse {
  const scenario = detectScenario(text)
  const template = scenarioTemplates[scenario]
  const trimmed = text.trim()
  const topic = trimmed.length > 20 ? trimmed.slice(0, 20) + '…' : trimmed
  const structured: StructuredReply = {
    perspective: topic ? `听你说到「${topic}」，${template.perspective}` : template.perspective,
    suggestions: [...template.suggestions],
    followUpQuestion: template.followUp,
  }
  return { text: formatStructuredText(structured), structured }
}
