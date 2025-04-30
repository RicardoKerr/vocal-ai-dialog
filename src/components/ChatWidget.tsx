
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
  const [errorCount, setErrorCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const openaiService = useRef<OpenAIService | null>(null);
  
  useEffect(() => {
    // Sempre iniciar o serviço com uma chave vazia - a autenticação será feita pelo Supabase
    openaiService.current = new OpenAIService('');

    // Adicionar mensagem inicial
    const initialBotMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date(),
    };
    setMessages([initialBotMessage]);
  }, [initialMessage]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!openaiService.current) {
      toast.error("Serviço OpenAI não inicializado corretamente");
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
      console.log("Enviando mensagem para processamento:", input);
      // Processa a mensagem através do Supabase Edge Function
      const response = await openaiService.current.sendMessage(input);
      
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      // Tenta gerar o áudio apenas se a resposta do chat foi bem-sucedida
      if (response && !response.includes("Desculpe, ocorreu um erro")) {
        try {
          console.log("Gerando áudio para resposta");
          // Gera o áudio para a resposta através do Supabase Edge Function
          const audioUrl = await openaiService.current.generateAudio(response);
          if (audioUrl) {
            botMessage.audioUrl = audioUrl;
          }
        } catch (audioError) {
          console.error("Erro ao gerar áudio, continuando sem áudio:", audioError);
        }
      }
      
      setMessages(prev => [...prev, botMessage]);
      setErrorCount(0); // Reset error count on success
      
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast.error("Ocorreu um erro ao processar sua mensagem");
      
      // Increment error count and show more detailed error after multiple failures
      setErrorCount(prev => prev + 1);
      if (errorCount >= 2) {
        toast.error("Problema persistente detectado. Verifique os logs do console para mais detalhes.");
      }
      
      // Add error message from bot
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Estamos enfrentando problemas técnicos.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
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
            disabled={loading}
          />
          <VoiceInput onTranscript={handleVoiceInput} />
          <Button 
            type="submit" 
            variant="ghost"
            size="icon"
            className="text-chatbot-accent hover:text-white hover:bg-chatbot-accent"
            disabled={loading || !input.trim()}
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
