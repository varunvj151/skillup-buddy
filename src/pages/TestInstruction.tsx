import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allTopics } from '@/data/topics';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function TestInstruction() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { difficulty } = location.state || { difficulty: 'mixed' };
    const topic = allTopics.find(t => t.id === topicId);

    // Recommended constraints
    const questionCount = 10;
    const timeLimit = 10; // minutes

    if (!topic) return null;

    const handleStart = () => {
        navigate(`/test/start/${topicId}`, {
            state: { difficulty, questionCount, timeLimit }
        });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header title="Instructions" showBack />

            <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full pb-24">
                <div className="mb-6 animate-fade-in">
                    <h2 className="text-xl font-bold mb-2">Read Carefully</h2>
                    <p className="text-muted-foreground">
                        Please review the rules before starting the test.
                    </p>
                </div>

                <Card className="p-6 mb-6 border-l-4 border-l-primary animate-scale-in">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Topic</p>
                            <h3 className="font-bold text-lg">{topic.name}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Difficulty</p>
                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium capitalize">
                                {difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-2xl font-bold">{questionCount}</p>
                            <p className="text-xs text-muted-foreground">Questions</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-2xl font-bold">{timeLimit} <span className="text-sm font-normal">min</span></p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                            <p className="text-sm">+1 Mark for every correct answer.</p>
                        </div>
                        <div className="flex gap-3">
                            <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">No negative marking for wrong answers.</p>
                        </div>
                        <div className="flex gap-3">
                            <Clock className="w-5 h-5 text-warning flex-shrink-0" />
                            <p className="text-sm">Test will auto-submit when the timer ends.</p>
                        </div>
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            <p className="text-sm">You can navigate between questions freely.</p>
                        </div>
                    </div>
                </Card>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <Button variant="outline" className="flex-1 h-12" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Button onClick={handleStart} className="flex-1 h-12 gradient-primary font-semibold">
                        Start Test
                    </Button>
                </div>
            </div>
        </div>
    );
}
