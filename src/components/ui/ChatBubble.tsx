import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  isAi: boolean;
  timestamp?: Date;
}

export function ChatBubble({ message, isAi, timestamp }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex gap-3 animate-slide-up",
      isAi ? "flex-row" : "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        isAi ? "gradient-primary" : "bg-accent"
      )}>
        {isAi ? (
          <Bot className="w-5 h-5 text-white" />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </div>
      
      {/* Message */}
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-2xl",
        isAi 
          ? "bg-card border border-border rounded-tl-sm" 
          : "gradient-accent text-white rounded-tr-sm"
      )}>
        <p className={cn(
          "text-sm leading-relaxed",
          isAi ? "text-foreground" : "text-white"
        )}>
          {message}
        </p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-1",
            isAi ? "text-muted-foreground" : "text-white/70"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
