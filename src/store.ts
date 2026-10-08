import { create } from 'zustand';

const mbtiQuestions = [
  { id: 1, dimension: 'EI', question: '你更倾向于：', options: ['从与他人的互动中获得能量', '从独处中获得能量'] },
  { id: 2, dimension: 'EI', question: '在社交场合中，你通常：', options: ['主动参与并发起对话', '等待别人先和你说话'] },
  { id: 3, dimension: 'SN', question: '在接收信息时，你更关注：', options: ['具体的事实和细节', '整体的模式和可能性'] },
  { id: 4, dimension: 'SN', question: '你觉得更可靠的是：', options: ['经验和已经验证的事实', '直觉和灵感'] },
  { id: 5, dimension: 'TF', question: '做决定时，你更看重：', options: ['逻辑分析和客观事实', '个人价值观和对他人的影响'] },
  { id: 6, dimension: 'JP', question: '对于计划和安排，你：', options: ['喜欢提前规划好', '更随性，灵活应对'] },
];

const mbtiDescriptions = {
  'INTJ': { name: '建筑师', traits: ['富有想象力和战略性', '独立自主', '追求完美'] },
  'INTP': { name: '逻辑学家', traits: ['创新发明家', '求知欲强', '善于分析'] },
  'ENTJ': { name: '指挥官', traits: ['大胆、富有想象力', '意志坚强', '天生领导者'] },
  'ENTP': { name: '辩论家', traits: ['聪明好奇', '思维敏捷', '喜欢挑战'] },
  'INFJ': { name: '提倡者', traits: ['安静而神秘', '鼓舞人心', '理想主义'] },
  'INFP': { name: '调停者', traits: ['诗意善良', '追求和谐', '敏感体贴'] },
  'ENFJ': { name: '主人公', traits: ['富有魅力', '鼓舞人心', '天生领袖'] },
  'ENFP': { name: '竞选者', traits: ['热情洋溢', '富有创造力', '社交天才'] },
  'ISTJ': { name: '物流师', traits: ['实际且注重事实', '可靠负责', '传统保守'] },
  'ISFJ': { name: '守卫者', traits: ['专注温暖', '保护欲强', '传统可靠'] },
  'ESTJ': { name: '总经理', traits: ['出色的管理者', '务实有条理', '直接果断'] },
  'ESFJ': { name: '执政官', traits: ['热心肠', '受欢迎', '传统保守'] },
  'ISTP': { name: '鉴赏家', traits: ['大胆而实际', '灵活应变', '理性务实'] },
  'ISFP': { name: '探险家', traits: ['灵活有魅力', '热爱生活', '敏感善良'] },
  'ESTP': { name: '企业家', traits: ['聪明精力充沛', '善于感知', '直接坦率'] },
  'ESFP': { name: '表演者', traits: ['自发精力充沛', '热爱生活', '善于社交'] },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AppState {
  userMbti: string | null;
  complementLevel: number;
  currentQuestion: number;
  answers: Record<number, number>;
  testCompleted: boolean;
  currentConversation: Message[];
  isDecisionMode: boolean;
  currentPage: 'welcome' | 'test' | 'persona' | 'chat' | 'settings';
  setAnswer: (questionId: number, optionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeTest: () => void;
  getComplementMbti: () => string;
  setComplementLevel: (level: number) => void;
  sendMessage: (content: string) => Promise<void>;
  toggleDecisionMode: () => void;
  setCurrentPage: (page: AppState['currentPage']) => void;
  resetTest: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  userMbti: null,
  complementLevel: 50,
  currentQuestion: 0,
  answers: {},
  testCompleted: false,
  currentConversation: [],
  isDecisionMode: false,
  currentPage: 'welcome',

  setAnswer: (questionId: number, optionIndex: number) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: optionIndex } })),

  nextQuestion: () =>
    set((state) => ({
      currentQuestion: Math.min(state.currentQuestion + 1, mbtiQuestions.length - 1),
    })),

  previousQuestion: () =>
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    })),

  completeTest: () => {
    set({ userMbti: 'INTJ', testCompleted: true, currentPage: 'persona' });
  },

  getComplementMbti: () => 'ESFP',

  setComplementLevel: (level: number) =>
    set({ complementLevel: level }),

  sendMessage: async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      currentConversation: [...state.currentConversation, userMessage],
    }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const aiResponse = get().isDecisionMode
      ? '这是一个重要的决定。让我们从不同角度来分析这个问题。从互补的视角来看，你可能需要考虑...'
      : '你好！我是你的互补数字人。很高兴能和你聊天，我会从不同的角度给你一些想法！';

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    set((state) => ({
      currentConversation: [...state.currentConversation, aiMessage],
    }));
  },

  toggleDecisionMode: () =>
    set((state) => ({ isDecisionMode: !state.isDecisionMode })),

  setCurrentPage: (page) => set({ currentPage: page }),

  resetTest: () =>
    set({ currentQuestion: 0, answers: {}, testCompleted: false }),
}));

export { mbtiQuestions, mbtiDescriptions };
