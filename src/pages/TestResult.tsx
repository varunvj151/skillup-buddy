import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, Home, RotateCcw, BookOpen, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestQuestion } from '@/data/testQuestions';

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

  const getPerformanceFeedback = () => {
    if (percentage >= 80) {
      return {
        emoji: '🏆',
        title: 'Outstanding!',
        text: 'You have mastered this topic. Ready for Placement Level tests.',
        action: 'Try Hard / Placement Tests',
        color: 'text-primary',
        actionIcon: TrendingUp
      };
    }
    if (percentage >= 50) {
      return {
        emoji: '💪',
        title: 'Good Job!',
        text: 'You are doing well. Practice Medium level to improve further.',
        action: 'Practice Medium Level',
        color: 'text-warning',
        actionIcon: Target
      };
    }
    return {
      emoji: '📚',
      title: 'Keep Learning',
      text: 'Review the basic concepts in the Learn module to build a strong foundation.',
      action: 'Go to Learn Module',
      color: 'text-muted-foreground',
      actionIcon: BookOpen
    };
  };

  const feedback = getPerformanceFeedback();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Test Results" showBack onBack={() => navigate('/aptitude/test', { replace: true })} />

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full pb-32">
        {/* Score Card */}
        <Card className="p-8 text-center mb-6 animate-scale-in overflow-hidden relative border-2 border-primary/10">
          <div className="absolute inset-0 bg-primary/5 pattern-dots opacity-50" />
          <div className="relative z-10">
            <span className="text-6xl mb-4 block animate-bounce-slow">{feedback.emoji}</span>
            <h2 className="text-3xl font-bold text-foreground mb-2">{feedback.title}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{feedback.text}</p>

            <div className="flex justify-center items-center gap-2 mb-8">
              <div className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {score}
              </div>
              <div className="text-3xl text-muted-foreground self-end mb-2">/ {total}</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{percentage}% Accuracy</p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 flex flex-col items-center justify-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-success" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">{score}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </Card>
          <Card className="p-3 sm:p-4 flex flex-col items-center justify-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-destructive" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">{total - score}</p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </Card>
          <Card className="p-3 sm:p-4 col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">{formatTime(timeTaken)}</p>
            <p className="text-xs text-muted-foreground">Time Taken</p>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Detailed Analysis</h3>
        </div>

        <div className="space-y-4">
          {questions.map((q: TestQuestion, idx: number) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            const isSkipped = userAnswer === null;

            return (
              <Card
                key={idx}
                className={cn(
                  "p-5 animate-slide-up transition-all hover:shadow-md",
                  isCorrect ? "border-l-4 border-l-success" :
                    isSkipped ? "border-l-4 border-l-muted" : "border-l-4 border-l-destructive"
                )}
                style={{ animationDelay: `${(idx + 3) * 50}ms` }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="font-mono text-sm text-muted-foreground mt-1">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-lg mb-4">{q.question}</p>

                    <div className="space-y-2 mb-4">
                      {/* User Answer */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-24 text-muted-foreground">Your Answer:</span>
                        {isSkipped ? (
                          <span className="text-muted-foreground italic">Skipped</span>
                        ) : (
                          <span className={cn(
                            "font-medium",
                            isCorrect ? "text-success" : "text-destructive"
                          )}>
                            {q.options[userAnswer]} {isCorrect ? "(Correct)" : "(Incorrect)"}
                          </span>
                        )}
                      </div>

                      {/* Correct Answer (if wrong or skipped) */}
                      {(!isCorrect || isSkipped) && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-24 text-muted-foreground">Correct Answer:</span>
                          <span className="font-medium text-success">
                            {q.options[q.correctAnswer]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Explanation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-10">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/aptitude/test', { replace: true })}
            className="flex-1 h-12"
          >
            <Home className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          <Button
            onClick={() => navigate('/aptitude/test', { replace: true })}
            className="flex-1 h-12 gradient-primary font-semibold"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> New Test
          </Button>
        </div>
      </div>
    </div>
  );
}
