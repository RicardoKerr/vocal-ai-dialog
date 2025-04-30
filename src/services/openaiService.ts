
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendMessage(message: string): Promise<string> {
    try {
      console.log("Enviando mensagem para o Supabase Edge Function...");
      // Usar a função de borda para enviar a mensagem
      const { data, error } = await supabase.functions.invoke('send-chat-message', {
        body: { 
          message,
          systemPrompt: 'Você é um assistente prestativo e amigável.'
        }
      });
      
      if (error) {
        console.error("Erro na função send-chat-message:", error);
        throw new Error(`Erro ao invocar função: ${error.message}`);
      }
      
      console.log("Resposta recebida do Supabase Edge Function");
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao enviar mensagem para a OpenAI:', error);
      toast.error('Erro ao processar a mensagem. Verifique a conexão com o Supabase.');
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
  
  async generateAudio(text: string): Promise<string> {
    try {
      console.log("Gerando áudio via Supabase Edge Function...");
      // Usar a função de borda para gerar áudio
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { 
          text,
          voice: 'onyx'
        }
      });
      
      if (error) {
        console.error("Erro na função generate-audio:", error);
        throw new Error(`Erro ao invocar função: ${error.message}`);
      }
      
      // Criar uma URL para o áudio a partir do conteúdo base64
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      console.log("Áudio gerado com sucesso");
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      toast.error('Erro ao gerar áudio. Verifique a conexão com o Supabase.');
      return '';
    }
  }
}
