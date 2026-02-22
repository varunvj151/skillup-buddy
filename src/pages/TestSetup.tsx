import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { allTopics } from '@/data/topics';
import { testQuestions, getQuestionsForTopic } from '@/data/testQuestions';
import { Brain, Target, Zap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function TestSetup() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const topic = allTopics.find(t => t.id === topicId);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

    // Check available questions
    const availableQuestions = testQuestions.filter(q => q.topicId === topicId);

    if (!topic) return <div>Topic not found</div>;

    // If no questions at all, show coming soon
    if (availableQuestions.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Header title={topic.name} showBack />
                <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">🚧</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
                    <p className="text-muted-foreground">
                        We are currently adding questions for this topic. Check back later!
                    </p>
                    <Button className="mt-6" variant="outline" onClick={() => navigate('/aptitude/test')}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const difficulties = [
        {
            id: 'easy',
            name: 'Easy',
            desc: 'Concept Check',
            icon: Brain,
            color: 'text-success',
            bg: 'bg-success/10',
            border: 'border-success/20'
        },
        {
            id: 'medium',
            name: 'Medium',
            desc: 'Exam Level',
            icon: Target,
            color: 'text-warning',
            bg: 'bg-warning/10',
            border: 'border-warning/20'
        },
        {
            id: 'hard',
            name: 'Hard',
            desc: 'Placement Level',
            icon: Zap,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
            border: 'border-destructive/20'
        },
        {
            id: 'mixed',
            name: 'Mixed',
            desc: 'All Levels',
            icon: Layers,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        }
    ];

    const handleNext = () => {
        if (selectedDifficulty) {
            navigate(`/test/instruction/${topicId}`, { state: { difficulty: selectedDifficulty } });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="Test Setup" showBack />

            <main className="px-4 py-6 max-w-2xl mx-auto pb-24">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="w-12 h-12 text-3xl mx-auto mb-3 bg-muted/50 rounded-xl flex items-center justify-center">
                        {topic.icon}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{topic.name}</h1>
                    <p className="text-muted-foreground">Select a difficulty level to proceed</p>
                </div>

                <div className="grid gap-4">
                    {difficulties.map((diff, idx) => (
                        <button
                            key={diff.id}
                            onClick={() => setSelectedDifficulty(diff.id)}
                            className={cn(
                                "relative p-4 rounded-xl border-2 text-left transition-all duration-200 animate-slide-up",
                                selectedDifficulty === diff.id
                                    ? `border-primary bg-primary/5 ring-1 ring-primary`
                                    : "border-card hover:border-primary/50 bg-card",
                            )}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-lg", diff.bg, diff.color)}>
                                    <diff.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{diff.name}</h3>
                                    <p className="text-sm text-muted-foreground">{diff.desc}</p>
                                </div>
                                {selectedDifficulty === diff.id && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
                <div className="max-w-2xl mx-auto">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedDifficulty}
                        className="w-full h-12 text-lg font-semibold gradient-primary"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
