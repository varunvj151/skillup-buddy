import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { Message } from '@/types';
import { Send, StopCircle, Users } from 'lucide-react';

const gdTopics = [
  "Should AI replace human jobs?",
  "Work from home vs Office work",
  "Social media: Boon or Bane?",
  "Is higher education necessary for success?",
  "Climate change and youth responsibility"
];

export default function GroupDiscussion() {
  const { user, gdMessages, addGdMessage, clearGdMessages } = useApp();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gdMessages]);

  const startSession = () => {
    const topic = customTopic || selectedTopic;
    if (!topic) return;
    
    clearGdMessages();
    setIsSessionActive(true);
    
    // AI greeting
    setTimeout(() => {
      addGdMessage({
        id: Date.now().toString(),
        role: 'ai',
        content: `Hello ${user?.name}! Welcome to this Group Discussion session. 👋\n\nToday's topic is: "${topic}"\n\nPlease share your opening thoughts on this topic. Take your time to structure your response. I'm here to listen and help you improve your GD skills!`,
        timestamp: new Date()
      });
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addGdMessage({
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    });
    setInputText('');

    // Simulated AI response
    setTimeout(() => {
      setIsSpeaking(true);
      const responses = [
        "That's an interesting perspective! Can you elaborate on how this impacts the younger generation?",
        "Good point! Now, what would you say to someone who disagrees with your view?",
        "I see your reasoning. How do you think we can balance both sides of this argument?",
        "Excellent observation! Can you provide a real-world example to support your point?",
        "That's a valid concern. What solutions would you propose?"
      ];
      addGdMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      });
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 1500);
  };

  const endSession = () => {
    setIsSpeaking(true);
    addGdMessage({
      id: Date.now().toString(),
      role: 'ai',
      content: `Great discussion, ${user?.name}! 🌟\n\n**Feedback:**\n\n✅ **Strengths:**\n• You showed good understanding of the topic\n• Your points were logically structured\n\n💡 **Areas for Improvement:**\n• Try to include more real-world examples\n• Practice maintaining a confident tone\n• Work on presenting counter-arguments\n\n**Tips for Next Time:**\n1. Start with a clear stance\n2. Use the PREP method (Point, Reason, Example, Point)\n3. Acknowledge opposing views before countering\n\nKeep practicing! You're improving with each session! 💪`,
      timestamp: new Date()
    });
    setTimeout(() => {
      setIsSpeaking(false);
      setIsSessionActive(false);
    }, 3000);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // Would integrate with speech-to-text here
      setTimeout(() => setIsListening(false), 5000);
    }
  };

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Group Discussion" showBack />
        
        <main className="px-4 py-6 max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-gd flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Group Discussion Practice
            </h1>
            <p className="text-muted-foreground">
              Practice with an AI moderator that simulates real GD scenarios
            </p>
          </div>

          {/* Topic Selection */}
          <Card className="p-6 mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">Choose a Topic</h3>
            <div className="space-y-3 mb-4">
              {gdTopics.map((topic, index) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCustomTopic('');
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    selectedTopic === topic
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <Input
              placeholder="Enter your own topic..."
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                setSelectedTopic('');
              }}
              className="mt-4 h-12"
            />
          </Card>

          <Button
            onClick={startSession}
            disabled={!selectedTopic && !customTopic}
            className="w-full h-14 text-lg font-semibold gradient-gd"
          >
            Start GD Session
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="GD Session" showBack />
      
      {/* Messages */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 pb-40">
          {gdMessages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isAi={msg.role === 'ai'}
              timestamp={msg.timestamp}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <VoiceButton
              isListening={isListening}
              isSpeaking={isSpeaking}
              onClick={toggleListening}
              size="md"
            />
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Type your response..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="h-12"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="h-12 w-12 gradient-primary"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <Button
            onClick={endSession}
            variant="outline"
            className="w-full h-12 border-destructive text-destructive hover:bg-destructive/10"
          >
            <StopCircle className="w-4 h-4 mr-2" /> End Session & Get Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
