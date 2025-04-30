
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendMessage(message: string): Promise<string> {
    try {
      // Usar a função de borda para enviar a mensagem
      const { data, error } = await supabase.functions.invoke('send-chat-message', {
        body: { 
          message,
          systemPrompt: 'Você é um assistente prestativo e amigável.'
        }
      });
      
      if (error) {
        throw new Error(`Erro ao invocar função: ${error.message}`);
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao enviar mensagem para a OpenAI:', error);
      toast.error('Erro ao processar a mensagem. Verifique a conexão com o Supabase.');
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
  
  async generateAudio(text: string): Promise<string> {
    try {
      // Usar a função de borda para gerar áudio
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { 
          text,
          voice: 'onyx'
        }
      });
      
      if (error) {
        throw new Error(`Erro ao invocar função: ${error.message}`);
      }
      
      // Criar uma URL para o áudio a partir do conteúdo base64
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      toast.error('Erro ao gerar áudio. Verifique a conexão com o Supabase.');
      return '';
    }
  }
}
