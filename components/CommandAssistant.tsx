import React, { useState } from 'react';
import { Terminal, Send, AlertTriangle, ShieldAlert } from 'lucide-react';
import { generateArchCommand } from '../services/geminiService';
import { TerminalBlock } from './TerminalBlock';
import { CommandResult } from '../types';

export const CommandAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await generateArchCommand(input);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">指令锻造</h2>
        <p className="text-arch-muted">将自然语言转换为 Arch Linux 命令。</p>
      </div>

      <form onSubmit={handleSubmit} className="relative mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：安装 vlc 和 firefox，更新系统，检查磁盘使用情况..."
          className="w-full bg-arch-surface border border-arch-border rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-arch-blue focus:border-transparent font-mono shadow-2xl transition-all"
        />
        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-arch-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-arch-blue transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>

      {result && (
        <div className="animate-fade-in-up">
          {result.riskLevel === 'high' && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-3">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-red-400 text-sm">高风险命令</h4>
                <p className="text-red-200/80 text-sm mt-1">{result.explanation}</p>
              </div>
            </div>
          )}
          
          <TerminalBlock 
            content={result.command} 
            label="生成的命令" 
            danger={result.riskLevel === 'high'}
          />

          {result.explanation && result.riskLevel !== 'high' && (
            <div className="mt-4 flex items-start gap-3 text-arch-muted text-sm px-2">
              <div className="bg-arch-surface p-1 rounded-md">
                <AlertTriangle size={14} />
              </div>
              <p>{result.explanation}</p>
            </div>
          )}
        </div>
      )}
      
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 opacity-50">
          <div className="p-4 border border-dashed border-arch-border rounded-lg text-sm text-gray-500 hover:border-arch-blue/50 hover:text-arch-blue transition-colors cursor-pointer" onClick={() => setInput("更新整个系统（包含 AUR）")}>
            "更新整个系统（包含 AUR）"
          </div>
          <div className="p-4 border border-dashed border-arch-border rounded-lg text-sm text-gray-500 hover:border-arch-blue/50 hover:text-arch-blue transition-colors cursor-pointer" onClick={() => setInput("查找并删除孤立软件包")}>
            "查找并删除孤立软件包"
          </div>
          <div className="p-4 border border-dashed border-arch-border rounded-lg text-sm text-gray-500 hover:border-arch-blue/50 hover:text-arch-blue transition-colors cursor-pointer" onClick={() => setInput("配置 git 用户名和邮箱")}>
            "配置 git 用户名和邮箱"
          </div>
          <div className="p-4 border border-dashed border-arch-border rounded-lg text-sm text-gray-500 hover:border-arch-blue/50 hover:text-arch-blue transition-colors cursor-pointer" onClick={() => setInput("列出所有运行中的 systemd 服务")}>
            "列出所有运行中的 systemd 服务"
          </div>
        </div>
      )}
    </div>
  );
};