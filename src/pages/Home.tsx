import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { ModuleCard } from '@/components/ui/ModuleCard';
import { Brain, Users, Briefcase, TrendingUp } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useApp();

  const modules = [
    {
      title: 'Aptitude & Reasoning',
      description: 'Master quantitative aptitude and logical reasoning with topic-based learning and practice tests.',
      icon: <Brain className="w-8 h-8" />,
      gradient: 'aptitude' as const,
      route: '/aptitude'
    },
    {
      title: 'Group Discussion',
      description: 'Practice GD skills with an AI moderator that simulates real group discussion scenarios.',
      icon: <Users className="w-8 h-8" />,
      gradient: 'gd' as const,
      route: '/group-discussion'
    },
    {
      title: 'Interview Prep',
      description: 'Prepare for technical and HR interviews with an adaptive AI interviewer.',
      icon: <Briefcase className="w-8 h-8" />,
      gradient: 'interview' as const,
      route: '/interview'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hello, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to ace your placement rounds? Let's get started!
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-card rounded-2xl p-6 mb-8 shadow-card border border-border animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Progress</p>
              <p className="text-2xl font-bold text-foreground">Just Getting Started</p>
              <p className="text-sm text-primary">Complete your first module to track progress!</p>
            </div>
          </div>
        </div>

        {/* Module Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Choose Your Training</h2>
          <div className="grid gap-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.title}
                title={module.title}
                description={module.description}
                icon={module.icon}
                gradient={module.gradient}
                onClick={() => navigate(module.route)}
                delay={index * 100}
              />
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-semibold text-foreground mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-muted-foreground">
            Start with the Aptitude module to build a strong foundation, then practice GD and Interview skills for a well-rounded preparation!
          </p>
        </div>
      </main>
    </div>
  );
}
