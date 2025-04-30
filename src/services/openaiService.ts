
import { toast } from "sonner";

export class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é um assistente prestativo e amigável.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao enviar mensagem para a OpenAI:', error);
      toast.error('Erro ao processar a mensagem. Verifique a chave da API.');
      return 'Desculpe, ocorreu um erro ao processar sua mensagem.';
    }
  }
  
  async generateAudio(text: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'onyx'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      toast.error('Erro ao gerar áudio. Verifique a chave da API.');
      return '';
    }
  }
}
