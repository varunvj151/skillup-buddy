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
      <Header title="Interview Feedback" showBack={true} />

      
      <main className="px-4 py-8 max-w-4xl mx-auto space-y-8 pb-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">Interview Completed!</h1>
          <p className="text-muted-foreground">Here is your detailed AI interviewer feedback</p>
        </div>

        {/* Overall Score Card */}
        <Card className="p-6 md:p-8 animate-slide-up shadow-lg border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">Overall Interview Score</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`text-6xl font-bold ${
                evaluation.overallScore >= 80 ? 'text-green-500' :
                evaluation.overallScore >= 60 ? 'text-amber-500' :
                'text-destructive'
              }`}>
                {evaluation.overallScore}
              </span>
              <span className="text-2xl text-muted-foreground mt-4">/ 100</span>
            </div>
            {evaluation.summary && (
              <p className="mt-6 text-foreground leading-relaxed max-w-2xl mx-auto italic font-medium">
                "{evaluation.summary}"
              </p>
            )}
          </div>
        </Card>

        {/* Per-Question Transcript & Feedback */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-foreground">
            <MessageSquare className="w-6 h-6" /> Detailed Question Analysis
          </h2>
          
          {evaluation.questions?.map((fb: any, i: number) => (
            <Card key={i} className={`p-5 md:p-6 mb-4 shadow-sm border-border/50 relative overflow-hidden ${fb.status === 'TRANSCRIPTION_ERROR' ? 'bg-destructive/5 border-destructive/20' : ''}`}>
              {fb.status === 'TRANSCRIPTION_ERROR' && (
                <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Error
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground leading-tight">
                      Q{i + 1}: {fb.question}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                      {fb.score}/100
                    </span>
                  </div>
                </div>

                {/* Score Pills */}
                {fb.status !== 'TRANSCRIPTION_ERROR' && (
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Technical</span>
                      <span className="font-bold text-sm text-primary">{fb.technical}/10</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Communication</span>
                      <span className="font-bold text-sm text-primary">{fb.communication}/10</span>
                    </div>
                  </div>
                )}

                <div className={`p-4 rounded-lg border border-border mt-4 text-sm italic ${fb.status === 'TRANSCRIPTION_ERROR' ? 'bg-background/50 text-destructive' : 'bg-muted/30 text-muted-foreground'}`}>
                   "{fb.answer || "(No transcript available)"}"
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${fb.status === 'TRANSCRIPTION_ERROR' ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
                <p className="text-sm">
                  <span className={`font-semibold block mb-1 ${fb.status === 'TRANSCRIPTION_ERROR' ? 'text-destructive' : 'text-foreground'}`}>Feedback:</span>
                  <span className="text-muted-foreground leading-relaxed">{fb.feedback}</span>
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
