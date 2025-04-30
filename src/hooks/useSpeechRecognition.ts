
import { useState, useEffect, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = ({ onResult, onEnd }: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Seu navegador não suporta reconhecimento de voz.');
      return;
    }
    
    try {
      setIsListening(true);
      setError(null);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const currentTranscript = result[0].transcript;
        
        setTranscript(currentTranscript);
        if (onResult) onResult(currentTranscript);
      };
      
      recognition.onerror = (event) => {
        setError(`Erro no reconhecimento de voz: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };
      
      recognition.start();
    } catch (err) {
      setError('Erro ao iniciar o reconhecimento de voz.');
      setIsListening(false);
    }
  }, [onResult, onEnd]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
};

// Adiciona as definições do tipo para o TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
