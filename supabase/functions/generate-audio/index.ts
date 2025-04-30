
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
    
    // Obter a chave da API do ambiente seguro
    const apiKey = "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";
    if (!apiKey) {
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log("Gerando áudio com o texto:", text.substring(0, 50) + "...");
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice || 'onyx',
        response_format: 'mp3',
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro na API OpenAI:", errorData);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData}`);
    }

    // Converter o áudio para base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log("Áudio gerado com sucesso");
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
