
import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const { isListening, transcript, startListening, stopListening, error } = useSpeechRecognition({
    onResult: (text) => {
      // Só atualiza quando parar de escutar, para evitar atualizações contínuas
    },
    onEnd: () => {
      if (transcript) {
        onTranscript(transcript);
      }
    }
  });

  useEffect(() => {
    if (isListening) {
      setIsPulsing(true);
    } else {
      setIsPulsing(false);
    }
  }, [isListening]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleVoiceToggle}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
          isListening ? 'bg-red-500 text-white' : 'bg-chatbot-accent text-white'
        }`}
        title={isListening ? "Parar gravação" : "Iniciar gravação de voz"}
      >
        {isListening ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>
      
      {isPulsing && (
        <span className="absolute top-0 left-0 w-10 h-10 rounded-full bg-red-500 opacity-75 animate-pulse-ring"></span>
      )}
      
      {error && (
        <div className="absolute bottom-full mb-2 p-2 bg-red-500 text-white text-xs rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
