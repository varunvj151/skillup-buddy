import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { allTopics } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Lightbulb, ArrowRight } from 'lucide-react';

export default function TopicLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const topic = allTopics.find(t => t.id === topicId);
  
  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Topic not found</p>
      </div>
    );
  }

  const lesson = topic.lessons[0]; // For now, show first lesson

  return (
    <div className="min-h-screen bg-background">
      <Header title={topic.name} showBack />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-24">
        {/* Topic Header */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-aptitude flex items-center justify-center">
            <span className="text-3xl">{topic.icon}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{topic.name}</h1>
            <p className="text-muted-foreground">{topic.description}</p>
          </div>
        </div>

        {/* Lesson Content */}
        <Card className="p-6 mb-6 animate-slide-up">
          <h2 className="text-xl font-bold text-foreground mb-4">{lesson.title}</h2>
          <div className="prose prose-sm max-w-none">
            {lesson.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-foreground mb-4 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        {/* Examples */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Solved Examples
          </h3>
          <div className="space-y-4">
            {lesson.examples.map((example, index) => (
              <Card key={index} className="p-5 bg-success/5 border-success/20">
                <p className="font-medium text-foreground mb-3">
                  <span className="text-success">Q{index + 1}:</span> {example.problem}
                </p>
                <div className="bg-background rounded-lg p-4 mb-3">
                  <p className="font-mono text-primary font-semibold">{example.solution}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Explanation:</span> {example.explanation}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Quick Tips
          </h3>
          <Card className="p-5 bg-warning/5 border-warning/20">
            <ul className="space-y-3">
              {lesson.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-warning/20 text-warning text-sm font-medium flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate(`/aptitude/test?topic=${topicId}`)}
            className="w-full h-14 text-lg font-semibold gradient-primary"
          >
            Practice This Topic <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
