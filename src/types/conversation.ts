export interface ConversationMessage {
  id: string;
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ConversationSession {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  preview?: string;
  messages: ConversationMessage[];
  context?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
