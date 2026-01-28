import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Target, Clock, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { topicName, answers, questions, score, total, timeTaken } = location.state || {};

  if (!questions) {
    navigate('/aptitude');
    return null;
  }

  const percentage = Math.round((score / total) * 100);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return { emoji: '🎉', text: 'Excellent! You\'re doing amazing!' };
    if (percentage >= 60) return { emoji: '👍', text: 'Good job! Keep practicing!' };
    if (percentage >= 40) return { emoji: '💪', text: 'Not bad! Room for improvement.' };
    return { emoji: '📚', text: 'Keep learning! You\'ve got this!' };
  };

  const message = getScoreMessage();

  return (
    <div className="min-h-screen bg-background">
      <Header title="Test Results" showBack />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-24">
        {/* Score Card */}
        <Card className="p-8 text-center mb-6 animate-scale-in overflow-hidden relative">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative z-10">
            <span className="text-6xl mb-4 block">{message.emoji}</span>
            <h2 className="text-3xl font-bold text-foreground mb-2">{message.text}</h2>
            <p className="text-muted-foreground mb-6">{topicName}</p>
            
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="text-6xl font-bold text-primary">{score}</div>
              <div className="text-2xl text-muted-foreground">/ {total}</div>
            </div>
            
            {/* Progress Circle */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 3.52} 352`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{percentage}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{score}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </Card>
          <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{total - score}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </Card>
          <Card className="p-4 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{formatTime(timeTaken)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </Card>
        </div>

        {/* Detailed Results */}
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Review</h3>
        <div className="space-y-4">
          {questions.map((q: any, idx: number) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            
            return (
              <Card 
                key={idx} 
                className={cn(
                  "p-5 animate-slide-up",
                  isCorrect ? "border-success/30" : "border-destructive/30"
                )}
                style={{ animationDelay: `${(idx + 3) * 50}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium text-foreground">{q.question}</p>
                </div>
                
                <div className="ml-8 space-y-2">
                  {!isCorrect && userAnswer !== null && (
                    <p className="text-sm">
                      <span className="text-destructive">Your answer:</span>{' '}
                      <span className="text-muted-foreground">{q.options[userAnswer]}</span>
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="text-success">Correct answer:</span>{' '}
                    <span className="text-foreground font-medium">{q.options[q.correctAnswer]}</span>
                  </p>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Explanation:</span> {q.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="flex-1 h-12"
          >
            <Home className="w-4 h-4 mr-2" /> Home
          </Button>
          <Button
            onClick={() => navigate('/aptitude/test')}
            className="flex-1 h-12 gradient-primary"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
