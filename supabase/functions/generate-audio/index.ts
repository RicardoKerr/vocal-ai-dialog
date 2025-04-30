
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice } = await req.json();
    
    if (!text) {
      throw new Error('Texto é obrigatório para gerar áudio');
    }
    
    // Limitar o tamanho do texto para evitar problemas de memória
    const limitedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;
    
    // Usamos a chave da API diretamente, já que ela está segura na função de borda
    const apiKey = Deno.env.get("OPENAI_API_KEY") || "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";
    
    console.log(`Gerando áudio com o texto (${limitedText.length} caracteres): ${limitedText.substring(0, 50)}...`);
    
    // Usar fetch diretamente para API OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: limitedText,
        voice: voice || 'onyx',
        response_format: 'mp3',
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API OpenAI:", errorText);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
    }

    // Obter o buffer de áudio
    const audioBuffer = await response.arrayBuffer();
    console.log(`Áudio recebido: ${audioBuffer.byteLength} bytes`);
    
    // Função auxiliar para converter ArrayBuffer para Base64 em partes menores
    // para evitar estouro de pilha (stack overflow)
    function arrayBufferToBase64(buffer) {
      const chunks = 1024; // processar em partes menores
      let binary = '';
      const bytes = new Uint8Array(buffer);
      
      for (let i = 0; i < bytes.byteLength; i += chunks) {
        const slice = bytes.slice(i, Math.min(i + chunks, bytes.byteLength));
        let binaryChunk = '';
        for (let j = 0; j < slice.length; j++) {
          binaryChunk += String.fromCharCode(slice[j]);
        }
        binary += binaryChunk;
      }
      
      return btoa(binary);
    }
    
    // Converter para base64 usando nossa função segura
    const base64Audio = arrayBufferToBase64(audioBuffer);
    console.log("Áudio gerado e convertido para base64 com sucesso");

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
