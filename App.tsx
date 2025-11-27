import React, { useState } from 'react';
import { Terminal, Book, Activity, Menu, X, Cpu } from 'lucide-react';
import { AppMode } from './types';
import { CommandAssistant } from './components/CommandAssistant';
import { WikiChat } from './components/WikiChat';
import { LogAnalyzer } from './components/LogAnalyzer';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.COMMAND_FORGE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: AppMode.COMMAND_FORGE, label: '指令锻造', icon: Terminal, color: 'text-arch-blue' },
    { id: AppMode.WIKI_CHAT, label: 'Wiki 助手', icon: Book, color: 'text-purple-400' },
    { id: AppMode.LOG_ANALYZER, label: '系统医生', icon: Activity, color: 'text-red-400' },
  ];

  const renderContent = () => {
    switch (activeMode) {
      case AppMode.COMMAND_FORGE:
        return <CommandAssistant />;
      case AppMode.WIKI_CHAT:
        return <WikiChat />;
      case AppMode.LOG_ANALYZER:
        return <LogAnalyzer />;
      default:
        return <CommandAssistant />;
    }
  };

  return (
    <div className="min-h-screen bg-arch-dark flex text-arch-text font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-arch-darker border-r border-arch-border">
        <div className="p-6 flex items-center gap-3 border-b border-arch-border/50">
          <div className="w-8 h-8 bg-arch-blue rounded-full flex items-center justify-center text-white">
            <Cpu size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">Arch Linux 助手</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeMode === item.id 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={activeMode === item.id ? item.color : 'text-gray-500'} size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-arch-border/50">
           <div className="p-3 rounded-lg bg-gradient-to-br from-arch-blue/20 to-transparent border border-arch-blue/20">
              <p className="text-xs text-arch-muted mb-1">系统状态</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-mono text-green-400">Gemini 在线</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-arch-darker border-b border-arch-border flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-arch-blue rounded-full flex items-center justify-center text-white">
             <Cpu size={18} strokeWidth={2.5} />
           </div>
           <span className="font-bold text-lg">Arch Linux 助手</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-arch-darker pt-20 px-6">
          <nav className="space-y-4">
             {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMode(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border ${
                  activeMode === item.id 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-transparent border-white/5 text-gray-400'
                }`}
              >
                <item.icon className={item.color} size={24} />
                <span className="text-lg font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-16 relative">
        <div className="max-w-6xl mx-auto h-full">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;