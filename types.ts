export enum AppMode {
  COMMAND_FORGE = 'COMMAND_FORGE',
  WIKI_CHAT = 'WIKI_CHAT',
  LOG_ANALYZER = 'LOG_ANALYZER'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface CommandResult {
  command: string;
  explanation?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface LogAnalysis {
  summary: string;
  fixes: string[];
  relevantCommands: string[];
}
