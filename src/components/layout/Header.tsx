import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBack = false, transparent = false, onBack, rightElement }: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <header className={cn(
      "sticky top-0 z-50 px-4 py-4",
      transparent
        ? "bg-transparent"
        : "bg-background/80 backdrop-blur-xl border-b border-border"
    )}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}

          {title ? (
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Skill Buddy</h1>
                <p className="text-xs text-muted-foreground">Your AI Learning Companion</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightElement}
          {user && (
            <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
