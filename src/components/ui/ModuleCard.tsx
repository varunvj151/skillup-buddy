import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  gradient: 'aptitude' | 'gd' | 'interview';
  onClick: () => void;
  delay?: number;
}

const gradientClasses = {
  aptitude: 'gradient-aptitude',
  gd: 'gradient-gd',
  interview: 'gradient-interview'
};

export function ModuleCard({ title, description, icon, gradient, onClick, delay = 0 }: ModuleCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full p-8 rounded-2xl text-left transition-all duration-300",
        "hover:-translate-y-2 hover:shadow-hover",
        "shadow-card bg-card overflow-hidden",
        "animate-slide-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        gradientClasses[gradient]
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
          "transition-all duration-300",
          gradientClasses[gradient],
          "text-white text-3xl"
        )}>
          {icon}
        </div>
        
        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-muted-foreground group-hover:text-white/80 transition-colors duration-300">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-primary group-hover:text-white transition-colors duration-300">
          <span className="text-sm font-medium">Start Learning</span>
          <svg 
            className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </button>
  );
}
