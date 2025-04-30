
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MoreVertical } from 'lucide-react';
import { ChatWidgetProps, ChatMessage as ChatMessageType } from '../types/chat';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import { OpenAIService } from '../services/openaiService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

const ChatWidget: React.FC<ChatWidgetProps> = ({
  title = "Assistente IA",
  subtitle = "Como posso ajudar você hoje?",
  avatarUrl,
  initialMessage = "Olá! Como posso ajudar você hoje?",
  apiKey = "",
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openaiKey, setOpenaiKey] = useState(apiKey);
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const openaiService = useRef<OpenAIService | null>(null);
  
  useEffect(() => {
    if (openaiKey) {
      openaiService.current = new OpenAIService(openaiKey);
    }
  }, [openaiKey]);
  
  useEffect(() => {
    if (initialMessage && openaiKey) {
      const initialBotMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages([initialBotMessage]);
    }
  }, [initialMessage, openaiKey]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiKeyInput.trim()) {
      toast.error("Por favor, insira uma chave da API OpenAI válida");
      return;
    }
    
    setOpenaiKey(openaiKeyInput);
    openaiService.current = new OpenAIService(openaiKeyInput);
    setShowKeyInput(false);
    
    // Adiciona mensagem inicial após configurar a chave
    const initialBotMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    };
    setMessages([initialBotMessage]);
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!openaiService.current) {
      toast.error("Chave da API OpenAI não configurada");
      setShowKeyInput(true);
      return;
    }
    
    if (!input.trim()) return;
    
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Simula processamento da API
      const response = await openaiService.current.sendMessage(input);
      
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      // Gera o áudio para a resposta
      const audioUrl = await openaiService.current.generateAudio(response);
      if (audioUrl) {
        botMessage.audioUrl = audioUrl;
      }
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast.error("Ocorreu um erro ao processar sua mensagem");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
    setTimeout(() => {
      handleSubmit();
    }, 500);
  };
  
  return (
    <div className="flex flex-col h-[600px] w-[400px] bg-chatbot-dark rounded-lg overflow-hidden border border-chatbot-border shadow-lg">
      {/* Header */}
      <div className="bg-chatbot-light p-4 flex items-center justify-between border-b border-chatbot-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-chatbot-border">
            <img 
              src={avatarUrl || "https://ui-avatars.com/api/?name=AI&background=2A2A2A&color=fff"} 
              alt="AI Assistant" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <div className="p-4 bg-chatbot-light border-b border-chatbot-border">
          <form onSubmit={handleApiKeySubmit} className="space-y-2">
            <label className="block text-sm text-gray-300">
              Insira sua chave da API OpenAI para continuar:
            </label>
            <Input
              type="password"
              value={openaiKeyInput}
              onChange={(e) => setOpenaiKeyInput(e.target.value)}
              placeholder="sk-..."
              className="bg-chatbot-dark text-white border-chatbot-border"
              required
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-chatbot-accent hover:bg-opacity-80"
              >
                Salvar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chatbot-scrollbar">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            avatarUrl={avatarUrl}
          />
        ))}
        {loading && (
          <div className="flex space-x-2 justify-center items-center text-white p-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-subtle"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-subtle" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-subtle" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-chatbot-light p-4 border-t border-chatbot-border">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-chatbot-message-bot border-chatbot-border text-white placeholder:text-gray-400"
            disabled={loading || showKeyInput}
          />
          <VoiceInput onTranscript={handleVoiceInput} />
          <Button 
            type="submit" 
            variant="ghost"
            size="icon"
            className="text-chatbot-accent hover:text-white hover:bg-chatbot-accent"
            disabled={loading || !input.trim() || showKeyInput}
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
