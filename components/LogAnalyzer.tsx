import React, { useState } from 'react';
import { Activity, Search, AlertCircle, Wrench, ChevronRight } from 'lucide-react';
import { analyzeSystemLog } from '../services/geminiService';
import { LogAnalysis } from '../types';
import { TerminalBlock } from './TerminalBlock';

export const LogAnalyzer: React.FC = () => {
  const [logInput, setLogInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeSystemLog(logInput);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-500/10 rounded-xl">
          <Activity className="text-red-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">系统医生</h2>
          <p className="text-arch-muted">粘贴您的错误日志（journalctl, Xorg.0.log, pacman.log）进行 AI 诊断。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1 min-h-[300px]">
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder={`例如：\nFailed to start lightdm.service: Unit lightdm.service not found.\n...或者粘贴 dmesg 输出...`}
              className="w-full h-full min-h-[300px] bg-arch-surface border border-arch-border rounded-xl p-4 text-sm font-mono text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !logInput.trim()}
              className="absolute bottom-4 right-4 bg-red-600/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? '正在分析...' : (
                <>
                  <Search size={16} /> 诊断
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-arch-surface/50 border border-white/5 rounded-xl p-6 relative overflow-hidden">
          {!analysis && !analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 gap-4 p-8 text-center">
              <Wrench size={48} className="opacity-20" />
              <p>提交日志后，分析结果将显示在这里。</p>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-arch-darker/50 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              <p className="text-red-400 font-mono text-sm animate-pulse">正在读取日志...</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                  <AlertCircle size={18} /> 诊断结果
                </h3>
                <p className="text-white text-lg leading-relaxed">{analysis.summary}</p>
              </div>

              <div>
                <h3 className="text-arch-blue font-bold flex items-center gap-2 mb-3">
                  <Wrench size={18} /> 建议修复方案
                </h3>
                <ul className="space-y-3">
                  {analysis.fixes.map((fix, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                      <ChevronRight className="text-gray-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-300">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {analysis.relevantCommands.length > 0 && (
                <div>
                  <h3 className="text-green-400 font-bold text-sm uppercase tracking-wider mb-2">推荐操作</h3>
                  {analysis.relevantCommands.map((cmd, idx) => (
                    <TerminalBlock key={idx} content={cmd} label={`修复步骤 ${idx + 1}`} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};