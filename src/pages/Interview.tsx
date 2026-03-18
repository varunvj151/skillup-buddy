import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Code, Users as UsersIcon } from 'lucide-react';

export default function Interview() {
  const navigate = useNavigate();
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | null>(null);

  const startSession = () => {
    if (!interviewType) return;
    navigate('/interview/session', { state: { type: interviewType } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Interview Prep" showBack />
      
      <main className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-primary/10">
            <Briefcase className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Mock Interview
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Practice with an AI interviewer. You will answer 5 questions verbally and receive a detailed evaluation.
          </p>
        </div>

        <Card className="p-8 max-w-2xl mx-auto animate-slide-up shadow-lg border-primary/10">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Select Interview Type</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setInterviewType('hr')}
              className={`p-6 rounded-2xl text-center transition-all duration-300 border-2 flex flex-col items-center justify-center gap-4 ${
                interviewType === 'hr'
                  ? 'border-primary bg-primary/10 scale-[1.02] shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`p-4 rounded-full ${interviewType === 'hr' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <UsersIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="text-lg font-semibold block text-foreground">HR Interview</span>
                <span className="text-sm text-muted-foreground mt-1 block">Behavioral & Culture Fit</span>
              </div>
            </button>
            
            <button
              onClick={() => setInterviewType('technical')}
              className={`p-6 rounded-2xl text-center transition-all duration-300 border-2 flex flex-col items-center justify-center gap-4 ${
                interviewType === 'technical'
                  ? 'border-primary bg-primary/10 scale-[1.02] shadow-md'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`p-4 rounded-full ${interviewType === 'technical' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Code className="w-8 h-8" />
              </div>
              <div>
                <span className="text-lg font-semibold block text-foreground">Technical Interview</span>
                <span className="text-sm text-muted-foreground mt-1 block">Core CS Concepts</span>
              </div>
            </button>
          </div>

          <Button
            onClick={startSession}
            disabled={!interviewType}
            size="lg"
            className="w-full h-14 text-lg font-semibold gradient-primary"
          >
            Start Interview
          </Button>
        </Card>
      </main>
    </div>
  );
}
