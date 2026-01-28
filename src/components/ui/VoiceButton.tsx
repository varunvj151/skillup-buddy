import { cn } from '@/lib/utils';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10'
};

export function VoiceButton({ isListening, isSpeaking, onClick, size = 'lg', className }: VoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full flex items-center justify-center",
        "transition-all duration-300",
        "focus:outline-none focus:ring-4 focus:ring-primary/30",
        sizeClasses[size],
        isListening 
          ? "gradient-accent shadow-lg" 
          : isSpeaking 
            ? "gradient-primary shadow-lg"
            : "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg",
        className
      )}
    >
      {/* Pulse rings when active */}
      {(isListening || isSpeaking) && (
        <>
          <span className={cn(
            "absolute inset-0 rounded-full animate-ping",
            isListening ? "bg-accent/40" : "bg-primary/40"
          )} />
          <span className={cn(
            "absolute inset-0 rounded-full voice-pulse",
            isListening ? "bg-accent/20" : "bg-primary/20"
          )} style={{ animationDelay: '0.5s' }} />
        </>
      )}
      
      {/* Icon */}
      <span className="relative z-10 text-white">
        {isSpeaking ? (
          <Volume2 className={cn(iconSizes[size], "animate-pulse")} />
        ) : isListening ? (
          <Mic className={iconSizes[size]} />
        ) : (
          <MicOff className={iconSizes[size]} />
        )}
      </span>
    </button>
  );
}
