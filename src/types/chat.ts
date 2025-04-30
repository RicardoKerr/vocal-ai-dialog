
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface OpenAITextResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export interface OpenAIAudioResponse {
  audioUrl: string;
}

export interface ChatWidgetProps {
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  initialMessage?: string;
  apiKey?: string;
}
