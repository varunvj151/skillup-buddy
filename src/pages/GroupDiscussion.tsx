import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Mic } from 'lucide-react';
import { gdTopics } from '@/data/gdTopics';

export default function GroupDiscussion() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  const startSession = () => {
    const topic = customTopic || selectedTopic;
    if (!topic) return;

    // Navigate to the voice session page with encoded topic
    navigate(`/gd/voice/${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Group Discussion" showBack />

      <main className="px-4 py-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl gradient-gd flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Voice-Based Group Discussion
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Practice your speaking skills with our structured GD simulator.
            Prepare, speak, and get analysis on your performance.
          </p>
        </div>

        {/* Topic Selection */}
        <Card className="p-8 border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Choose a Topic</h3>
          </div>

          <div className="space-y-3 mb-6">
            {gdTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic('');
                }}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 active:scale-[0.99] ${selectedTopic === topic
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{topic}</span>
                  {selectedTopic === topic && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or create your own</span>
            </div>
          </div>

          <Input
            placeholder="Enter a custom topic..."
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedTopic('');
            }}
            className="mt-2 h-12"
          />

          <Button
            onClick={startSession}
            disabled={!selectedTopic && !customTopic}
            className="w-full h-14 text-lg font-semibold gradient-gd mt-8 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
          >
            Start Voice Session
          </Button>
        </Card>

      </main>
    </div>
  );
}
