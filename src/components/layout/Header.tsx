import { ArrowLeft, Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function Header({ title, showBack = false, transparent = false, onBack, rightElement }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 px-2 sm:px-4 py-3 sm:py-4",
      transparent
        ? "bg-transparent"
        : "bg-background/80 backdrop-blur-xl border-b border-border"
    )}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {showBack && (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5 text-foreground" />
            </button>
          )}

          {title ? (
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{title}</h1>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-border">
                <img src="/src/assets/logo.png" className="w-full h-full object-cover" alt="SkillUp Buddy Logo" />
              </div>

              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-foreground truncate">SkillUp Buddy</h1>
                <p className="text-xs text-muted-foreground hidden sm:line-clamp-1">Your AI Learning Companion</p>
              </div>

            </div>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {rightElement}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full gradient-accent flex items-center justify-center text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity">
                  {user.name.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 sm:w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
