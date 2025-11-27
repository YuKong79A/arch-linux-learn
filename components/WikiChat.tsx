import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { createWikiChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

export const WikiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      content: '你好！我是 Arch Wiki AI。请问有什么关于安装、包管理或系统配置的问题吗？',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = createWikiChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !chatSession.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const result = await chatSession.current.sendMessageStream({ message: userMsg.content });
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now()
      }]);

      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, content: fullText } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: '连接 Arch 知识库时遇到错误，请重试。',
        timestamp: Date.now()
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      <div className="flex-none p-4 md:p-6 border-b border-white/5 flex items-center gap-3">
        <BookOpen className="text-arch-blue" size={24} />
        <div>
          <h2 className="text-xl font-bold text-white">Arch Wiki 助手</h2>
          <p className="text-xs text-arch-muted">由 Gemini 2.5 Flash 驱动</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-white text-black' : 'bg-arch-blue text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-white text-black' 
                  : 'bg-arch-surface border border-arch-border text-arch-text'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-code:text-arch-blue font-light">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-2">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {isStreaming && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-arch-blue text-white flex items-center justify-center flex-shrink-0">
                 <Bot size={16} />
               </div>
               <div className="flex items-center gap-1 p-3">
                 <div className="w-2 h-2 bg-arch-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                 <div className="w-2 h-2 bg-arch-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                 <div className="w-2 h-2 bg-arch-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
               </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 md:p-6 border-t border-white/5 bg-arch-darker">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="询问关于分区、桌面环境、网络配置..."
            className="w-full bg-arch-surface border border-arch-border rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-arch-blue"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-arch-blue hover:text-white disabled:text-gray-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};