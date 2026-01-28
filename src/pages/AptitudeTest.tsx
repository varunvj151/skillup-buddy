import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { TopicCard } from '@/components/ui/TopicCard';
import { allTopics, sampleQuestions } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aptitudeTopics, reasoningTopics } from '@/data/topics';

export default function AptitudeTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTopic = searchParams.get('topic');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(preselectedTopic);

  const handleStartTest = () => {
    if (selectedTopic && sampleQuestions[selectedTopic]) {
      navigate(`/aptitude/test/${selectedTopic}`);
    }
  };

  const hasQuestions = selectedTopic && sampleQuestions[selectedTopic];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Practice Test" showBack />
      
      <main className="px-4 py-6 max-w-4xl mx-auto pb-24">
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-foreground mb-2">Select a Topic</h2>
          <p className="text-muted-foreground">
            Choose a topic for your timed practice test
          </p>
        </div>

        <Tabs defaultValue="aptitude" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="aptitude" className="flex-1">Aptitude</TabsTrigger>
            <TabsTrigger value="reasoning" className="flex-1">Reasoning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="aptitude">
            <div className="space-y-3">
              {aptitudeTopics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  name={topic.name}
                  icon={topic.icon}
                  description={`${sampleQuestions[topic.id]?.length || 0} questions available`}
                  isSelected={selectedTopic === topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reasoning">
            <div className="space-y-3">
              {reasoningTopics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  name={topic.name}
                  icon={topic.icon}
                  description={`${sampleQuestions[topic.id]?.length || 0} questions available`}
                  isSelected={selectedTopic === topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  delay={index * 50}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fixed bottom button */}
      {selectedTopic && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={handleStartTest}
              disabled={!hasQuestions}
              className="w-full h-14 text-lg font-semibold gradient-primary disabled:opacity-50"
            >
              {hasQuestions ? 'Start Test' : 'No questions available yet'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
