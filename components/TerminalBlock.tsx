import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface TerminalBlockProps {
  content: string;
  label?: string;
  danger?: boolean;
}

export const TerminalBlock: React.FC<TerminalBlockProps> = ({ content, label = "BASH", danger = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg overflow-hidden border ${danger ? 'border-red-900/50' : 'border-arch-border'} bg-arch-darker my-4 shadow-lg group`}>
      <div className={`flex items-center justify-between px-4 py-2 bg-white/5 border-b ${danger ? 'border-red-900/30' : 'border-white/5'}`}>
        <span className={`text-xs font-mono font-bold ${danger ? 'text-red-400' : 'text-arch-blue'}`}>
          {label}
        </span>
        <button 
          onClick={handleCopy}
          className="text-arch-muted hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-arch-text whitespace-pre-wrap break-all">
          <span className="text-arch-blue select-none mr-2">$</span>
          {content}
        </pre>
      </div>
    </div>
  );
};