import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Aptitude() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Learn',
      description: 'Topic-based learning with explanations, examples, and tips',
      icon: <BookOpen className="w-8 h-8" />,
      route: '/aptitude/learn',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Attend Test',
      description: 'Practice with timed MCQ tests and get detailed feedback',
      icon: <FileText className="w-8 h-8" />,
      route: '/aptitude/test',
      color: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Aptitude & Reasoning" showBack />
      
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl gradient-aptitude flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Aptitude & Reasoning
          </h1>
          <p className="text-muted-foreground">
            Build strong foundations in quantitative aptitude and logical reasoning
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          {options.map((option, index) => (
            <button
              key={option.title}
              onClick={() => navigate(option.route)}
              className={cn(
                "group w-full p-6 rounded-2xl text-left",
                "bg-card border border-border",
                "hover:shadow-hover hover:-translate-y-1",
                "transition-all duration-300",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center text-white",
                  `bg-gradient-to-br ${option.color}`
                )}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-5 rounded-xl bg-muted/50 border border-border animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h4 className="font-semibold text-foreground mb-2">📚 Topics Covered</h4>
          <div className="flex flex-wrap gap-2">
            {['Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance', 'Probability', 'Logical Reasoning', 'Puzzles'].map((topic) => (
              <span key={topic} className="px-3 py-1 text-sm rounded-full bg-background border border-border text-muted-foreground">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
