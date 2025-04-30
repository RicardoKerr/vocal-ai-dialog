
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
    const { message, systemPrompt } = await req.json();
    
    // Obter a chave da API do ambiente seguro
    const apiKey = "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";
    if (!apiKey) {
      throw new Error('Chave da API OpenAI não configurada');
    }

    console.log("Enviando mensagem para a OpenAI...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt || 'Você é um assistente prestativo e amigável.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na API OpenAI:", errorData);
      throw new Error(`Erro na API OpenAI: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Resposta recebida da OpenAI");
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
