import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, FileText, Sparkles } from 'lucide-react';

export default function GDResult() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const { topic, transcript } = state || { topic: 'Unknown Topic', transcript: 'No data found' };

    return (
        <div className="min-h-screen bg-background">
            <Header title="GD Analysis" showBack={false} />

            <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">

                {/* Topic Card */}
                <Card className="p-6">
                    <h2 className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Topic</h2>
                    <h1 className="text-2xl font-bold leading-tight">{topic}</h1>
                </Card>

                {/* Evaluation Placeholder */}
                <Card className="p-6 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">AI Evaluation</h3>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                        <p>AI Feedback Integration Coming Soon...</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-20 bg-background/50 rounded animate-pulse" />
                            <div className="h-20 bg-background/50 rounded animate-pulse" />
                        </div>
                    </div>
                </Card>

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

                {/* Navigation */}
                <div className="flex gap-4 pt-4">
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
