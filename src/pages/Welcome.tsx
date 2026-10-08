import React from 'react';
import { useAppStore } from '../store';
import { Sparkles, MessageSquare, Brain, ChevronRight } from 'lucide-react';

const Welcome: React.FC = () => {
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            互补数字人
          </h1>
          <p className="text-xl text-blue-200">
            遇见另一个视角的你
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">MBTI测试</h3>
            <p className="text-blue-200 text-sm">发现你的人格类型</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">互补对话</h3>
            <p className="text-blue-200 text-sm">与另一个视角交流</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300">
            <Sparkles className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">决策参考</h3>
            <p className="text-blue-200 text-sm">获得不同角度的建议</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentPage('test')}
            className="w-full py-4 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            开始体验
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="text-center text-blue-300/70 text-sm">
            无需注册 · 免费体验 · 随时开始
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
