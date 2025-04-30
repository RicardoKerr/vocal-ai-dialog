
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
    };
    
    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));
    
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioUrl]);
  
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const calculateTime = (secs: number): string => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;
    
    if (!progressBar || !audio) return;
    
    const position = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    audio.currentTime = position * duration;
  };
  
  return (
    <div className="flex items-center space-x-2 p-2 bg-chatbot-message-bot rounded-lg">
      <audio ref={audioRef} src={audioUrl} preload="metadata"></audio>
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center bg-chatbot-accent rounded-full text-white"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      
      <div 
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer"
      >
        <div 
          className="h-full bg-chatbot-accent rounded-full"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-400 min-w-[40px]">
        {duration ? calculateTime(currentTime) : '0:00'}
      </div>
      <Volume2 size={18} className="text-gray-400" />
    </div>
  );
};

export default AudioPlayer;
