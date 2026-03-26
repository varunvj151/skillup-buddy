import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Home,
    FileText,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Lightbulb,
    Trophy,
    BarChart3,
    MessageSquareText,
    Brain,
    Mic2,
    Shield,
    Layers,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Map score keys to display labels and icons
const SCORE_META: Record<string, { label: string; icon: React.ReactNode }> = {
    content: { label: 'Content Knowledge', icon: <Brain className="w-5 h-5" /> },
    clarity: { label: 'Clarity of Thought', icon: <Layers className="w-5 h-5" /> },
    communication: { label: 'Communication Skills', icon: <MessageSquareText className="w-5 h-5" /> },
    confidence: { label: 'Confidence', icon: <Shield className="w-5 h-5" /> },
    structure: { label: 'Argument Structure', icon: <Mic2 className="w-5 h-5" /> },
};

function scoreColor(score: number): string {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
}

function overallColor(score: number): string {
    if (score >= 80) return 'text-green-500 border-green-500/30 bg-green-500/5';
    if (score >= 60) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
    return 'text-red-500 border-red-500/30 bg-red-500/5';
}

function progressColor(score: number): string {
    if (score >= 8) return '[&>div]:bg-green-500';
    if (score >= 6) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
}

export default function GDResult() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const {
        topic = 'Unknown Topic',
        transcript = 'No data found',
        evaluation = null,
    } = state || {};

    const scores = evaluation?.scores || {};
    const overallScore = evaluation?.overall_score ?? 0;
    const strengths: string[] = evaluation?.strengths || [];
    const improvements: string[] = evaluation?.improvements || [];
    const tips: string[] = evaluation?.tips || [];
    const validationFlags: string[] = evaluation?.validation_flags || [];

    return (
        <div className="min-h-screen bg-background">
            <Header title="GD Performance Report" showBack={false} />

            <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Topic Card */}
                <Card className="p-6">
                    <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Topic</h2>
                    <h1 className="text-2xl font-bold leading-tight">{topic}</h1>
                </Card>

                {/* Validation Warnings */}
                {validationFlags.length > 0 && (
                    <div className="space-y-3">
                        {validationFlags.includes('insufficient_response') && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex gap-3 items-start">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Insufficient Response</h4>
                                    <p className="text-sm opacity-90 mt-1">Your response was too short to be evaluated properly. Please ensure you speak at length next time.</p>
                                </div>
                            </div>
                        )}
                        {validationFlags.includes('low_communication_quality') && (
                            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 px-4 py-3 rounded-lg flex gap-3 items-start">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Repetitive Speech Detected</h4>
                                    <p className="text-sm opacity-90 mt-1">The system detected excessive repetition of phrases. Try to use varied vocabulary and clear arguments.</p>
                                </div>
                            </div>
                        )}
                        {validationFlags.includes('transcription_error') && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex gap-3 items-start">
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Transcription Error</h4>
                                    <p className="text-sm opacity-90 mt-1">The system detected issues with the audio transcription. This may be due to poor audio quality or background noise. Please try recording again in a quiet environment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Overall Score */}
                {evaluation && (
                    <Card className={`p-6 border-2 ${overallColor(overallScore)} text-center`}>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Trophy className="w-6 h-6" />
                            <h3 className="font-semibold text-xl">Overall Score</h3>
                        </div>
                        <div className="text-7xl font-bold font-mono">{overallScore}</div>
                        <p className="text-sm opacity-70 mt-2">out of 100</p>
                    </Card>
                )}

                {/* Category Scores */}
                {evaluation && (
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Category Scores</h3>
                        </div>
                        <div className="space-y-5">
                            {Object.entries(SCORE_META).map(([key, meta]) => {
                                const scoreData = scores[key];
                                const score = typeof scoreData === 'object' ? (scoreData.score ?? 0) : (scoreData ?? 0);
                                const explanation = typeof scoreData === 'object' ? scoreData.explanation : '';

                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span className="text-muted-foreground">{meta.icon}</span>
                                                {meta.label}
                                            </div>
                                            <span className={`text-lg font-bold font-mono ${scoreColor(score)}`}>
                                                {score}/10
                                            </span>
                                        </div>
                                        <Progress
                                            value={score * 10}
                                            className={`h-2 ${progressColor(score)}`}
                                        />
                                        {explanation && (
                                            <p className="text-xs text-muted-foreground pl-7">{explanation}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* Strengths */}
                {strengths.length > 0 && (
                    <Card className="p-6 border-green-500/20 bg-green-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-lg">Strengths</h3>
                        </div>
                        <ul className="space-y-3">
                            {strengths.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-sm">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Areas for Improvement */}
                {improvements.length > 0 && (
                    <Card className="p-6 border-yellow-500/20 bg-yellow-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-semibold text-lg">Areas for Improvement</h3>
                        </div>
                        <ul className="space-y-3">
                            {improvements.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="text-sm">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Tips */}
                {tips.length > 0 && (
                    <Card className="p-6 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold text-lg">Tips for Improvement</h3>
                        </div>
                        <ul className="space-y-3">
                            {tips.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span className="text-sm">{s}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Transcript */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">Your Transcript</h3>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {transcript}
                    </div>
                </Card>

                {/* No evaluation fallback */}
                {!evaluation && (
                    <Card className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">AI Evaluation</h3>
                        </div>
                        <p className="text-muted-foreground">
                            Evaluation data not available. This may happen if the server was unreachable
                            or the session was opened directly without completing a GD session.
                        </p>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex gap-4 pt-4 pb-8">
                    <Button
                        className="w-full h-12 text-lg gradient-primary"
                        onClick={() => navigate('/group-discussion', { replace: true })}
                    >
                        <Home className="w-5 h-5 mr-2" /> Back to GD Dashboard
                    </Button>
                </div>

            </main>
        </div>
    );
}
