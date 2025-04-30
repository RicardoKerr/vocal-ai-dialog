
import React from 'react';
import ChatWidget from '@/components/ChatWidget';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Chatbot IA com Voz</h1>
        <p className="text-gray-300">
          Converse por texto ou voz com este assistente alimentado pela OpenAI
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        <ChatWidget
          title="Johnson Smith [ Rakewells ]"
          subtitle="Assistente Virtual Inteligente"
          initialMessage="Olá, sou Johnson Smith. Como posso te ajudar?"
        />
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>
          Para utilizar este widget, você precisará de uma chave da API OpenAI.
          <br />
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-chatbot-accent hover:underline"
          >
            Obtenha sua chave aqui
          </a>
        </p>
      </div>
    </div>
  );
};

export default Index;
