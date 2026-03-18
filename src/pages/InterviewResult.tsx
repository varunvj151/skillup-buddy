import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InterviewSession } from '@/types/interview';
import { ArrowLeft, CheckCircle2, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react';

export default function InterviewResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = location.state?.session as InterviewSession;

  if (!session || !session.evaluation) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="mb-4 text-muted-foreground">No interview results found.</p>
        <Button onClick={() => navigate('/interview')}>Go Back</Button>
      </div>
    );
  }

  const { evaluation } = session;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Interview Feedback" showBack={false} />
      
      <main className="px-4 py-8 max-w-4xl mx-auto space-y-8 pb-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Interview Completed!</h1>
          <p className="text-muted-foreground">Here is your detailed AI interviewer feedback</p>
        </div>

        {/* Overall Score Card */}
        <Card className="p-6 md:p-8 animate-slide-up shadow-lg border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">Overall Score</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-6xl font-bold ${
                evaluation.overall_score >= 80 ? 'text-green-500' :
                evaluation.overall_score >= 60 ? 'text-amber-500' :
                'text-destructive'
              }`}>
                {evaluation.overall_score}
              </span>
              <span className="text-2xl text-muted-foreground mt-4">/ 100</span>
            </div>
          </div>
        </Card>

        {/* Category Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          {[
            { label: 'Communication', score: evaluation.communication },
            { label: 'Confidence', score: evaluation.confidence },
            { label: 'Answer Quality', score: evaluation.answer_quality },
            { label: 'Clarity', score: evaluation.clarity },
            { label: 'Professionalism', score: evaluation.professionalism },
            { label: 'Response Structure', score: evaluation.response_structure }
          ].map((cat, i) => (
            <Card key={i} className="p-4 flex items-center justify-between shadow-sm">
              <span className="font-medium text-foreground">{cat.label}</span>
              <div className="flex items-center gap-3 w-32 justify-end">
                <Progress value={cat.score * 10} className="w-20 h-2" />
                <span className="font-semibold text-sm w-8 text-right text-foreground">{cat.score}/10</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* Strengths */}
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" /> Strengths
            </h3>
            <ul className="space-y-3">
              {evaluation.strengths.map((str, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {str}
                </li>
              ))}
            </ul>
          </Card>

          {/* Improvements */}
          <Card className="p-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" /> Areas to Improve
            </h3>
            <ul className="space-y-3">
              {evaluation.improvements.map((str, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {str}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Suggestions */}
        <Card className="p-6 shadow-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-5 h-5" /> Actionable Suggestions
          </h3>
          <ul className="space-y-3">
            {evaluation.suggestions.map((str, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                {str}
              </li>
            ))}
          </ul>
        </Card>

        {/* Per-Question Transcript & Feedback */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-foreground">
            <MessageSquare className="w-6 h-6" /> Detailed Evaluation
          </h2>
          
          {evaluation.per_question_feedback.map((fb, i) => (
            <Card key={i} className="p-5 md:p-6 mb-4 shadow-sm border-border/50">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-foreground leading-tight">
                    Q{i + 1}: {fb.question}
                  </h4>
                  <span className="shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
                    {fb.score}/10
                  </span>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-border mt-3 text-sm italic text-muted-foreground">
                  "{fb.answer}"
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <span className="font-semibold text-foreground block mb-1">Feedback:</span>
                  <span className="text-muted-foreground">{fb.feedback}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => navigate('/interview')}
          className="w-full h-14 text-lg font-semibold mt-8 gradient-primary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Start New Interview
        </Button>
      </main>
    </div>
  );
}
