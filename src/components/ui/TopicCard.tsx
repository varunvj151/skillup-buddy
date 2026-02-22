import { cn } from '@/lib/utils';

interface TopicCardProps {
  name: string;
  icon: string;
  description?: string;
  isSelected?: boolean;
  onClick: () => void;
  delay?: number;
}

export function TopicCard({ name, icon, description, isSelected, onClick, delay = 0 }: TopicCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-5 rounded-xl text-left transition-all duration-300",
        "border-2 hover:shadow-md",
        "animate-slide-up",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-transparent bg-card hover:border-primary/50"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{name}</h4>
          {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}
