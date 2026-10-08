import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Send,
  Settings,
  Shield,
  Database,
  RefreshCw,
  Home,
  User,
} from 'lucide-react';

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
  'ESFP': { name: '表演者', traits: ['自发精力充沛', '热爱生活', '善于社交'] },
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Page = 'welcome' | 'test' | 'persona' | 'chat' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [userMbti, setUserMbti] = useState<string>('INTJ');
  const [complementLevel, setComplementLevel] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isDecisionMode, setIsDecisionMode] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSetAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    if (currentQuestion < mbtiQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setTestCompleted(true);
      setCurrentPage('persona');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setInputText('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiResponse = isDecisionMode
      ? '这是一个重要的决定。让我们从不同角度来分析这个问题。从互补的视角来看，你可能需要考虑更多可能性。'
      : '你好！我是你的互补数字人。很高兴能和你聊天，我会从不同的角度给你一些想法！';

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, aiMessage]);
  };

  const renderWelcomePage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">互补数字人</h1>
            <p className="text-xl text-blue-200">遇见另一个视角的你</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">MBTI测试</h3>
              <p className="text-blue-200 text-sm">发现你的人格类型</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
              <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">互补对话</h3>
              <p className="text-blue-200 text-sm">与另一个视角交流</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
              <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">决策参考</h3>
              <p className="text-blue-200 text-sm">获得不同角度的建议</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setCurrentPage('test')}
              className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2"
            >
              开始体验 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTestPage = () => {
    const question = mbtiQuestions[currentQuestion];
    const progress = (currentQuestion + 1) / mbtiQuestions.length * 100;
    const currentAnswer = answers[question.id];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentPage('welcome')} className="text-blue-200 hover:text-white flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" /> 返回
            </button>
            <div className="text-white/70 text-sm">
              第 {currentQuestion + 1} / {mbtiQuestions.length} 题
            </div>
          </div>

          <div className="h-2 bg-white/10 rounded-full">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">{question.question}</h2>
            </div>

            <div className="space-y-4">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSetAnswer(question.id, index)}
                  className={`w-full text-left p-6 rounded-2xl border-2 ${
                    currentAnswer === index
                      ? 'bg-blue-500/30 border-blue-400 text-white'
                      : 'bg-white/5 border-white/10 text-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{option}</span>
                    {currentAnswer === index && <CheckCircle2 className="w-6 h-6 text-blue-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 rounded-xl flex items-center gap-2 text-white"
            >
              <ChevronLeft className="w-5 h-5" /> 上一题
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonaPage = () => {
    const userDesc = mbtiDescriptions.INTJ;
    const complementDesc = mbtiDescriptions.ESFP;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-white text-center">你的人格档案</h1>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userDesc.name}</h2>
                <p className="text-3xl font-black text-blue-400">INTJ</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {userDesc.traits.map((trait, i) => (
                <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm">{trait}</span>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-purple-400/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">你的互补数字人</h2>
                <p className="text-3xl font-black text-purple-400">ESFP</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {complementDesc.traits.map((trait, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">{trait}</span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('chat')}
            className="w-full py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2"
          >
            开始与数字人聊天 <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderChatPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col">
        <div className="bg-white/10 backdrop-blur-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('persona')} className="text-white/70">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">表演者</h2>
              <p className="text-blue-200 text-sm">ESFP · 互补度 {complementLevel}%</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('settings')} className="text-white/70">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {conversation.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">你好！我是你的互补数字人</h3>
              </div>
            )}

            {conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-sm'
                    : 'bg-white/10 text-blue-50 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs mt-2 text-blue-200">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="flex justify-between text-xs text-blue-200 mb-1">
                  <span>像你</span>
                  <span>互补度 {complementLevel}%</span>
                  <span>互补</span>
                </div>
                <input
                  type="range" min="0" max="100" value={complementLevel}
                  onChange={(e) => setComplementLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>

            <button
              onClick={() => setIsDecisionMode(!isDecisionMode)}
              className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 ${
                isDecisionMode ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-white/10 text-blue-200'
              }`}
            >
              <Brain className="w-5 h-5" />
              {isDecisionMode ? '决策模式已开启' : '开启决策模式'}
            </button>

            <div className="flex gap-3">
              <input
                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="输入你的想法..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
              <button
                onClick={handleSendMessage} disabled={!inputText.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setCurrentPage('chat')} className="text-white/70">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">设置</h1>
          </div>

          <div className="space-y-3">
            <button onClick={() => setCurrentPage('welcome')} className="w-full flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold">首页</h3>
              </div>
            </button>
            <button onClick={() => setCurrentPage('persona')} className="w-full flex items-center gap-4 p-4 bg-white/10 rounded-2xl">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-semibold">人格档案</h3>
              </div>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-400" />
              <h2 className="text-xl font-bold text-white">关于</h2>
            </div>
            <div className="text-center text-blue-200/60 text-sm py-8">
              <p>互补数字人 v1.0</p>
              <p className="mt-1">用AI发现另一个视角</p>
            </div>
          </div>

        </div>
      </div>
    );
  };

  switch (currentPage) {
    case 'welcome':
      return renderWelcomePage();
    case 'test':
      return renderTestPage();
    case 'persona':
      return renderPersonaPage();
    case 'chat':
      return renderChatPage();
    case 'settings':
      return renderSettingsPage();
    default:
      return renderWelcomePage();
  }
}
