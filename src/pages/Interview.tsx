import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { Message } from '@/types';
import { Send, StopCircle, Briefcase, Code, Users as UsersIcon } from 'lucide-react';

const interviewRoles = [
  { name: "Java Developer", icon: "☕" },
  { name: "Python Developer", icon: "🐍" },
  { name: "Frontend Developer", icon: "🎨" },
  { name: "Data Analyst", icon: "📊" },
  { name: "Full Stack Developer", icon: "⚡" },
  { name: "Software Engineer", icon: "💻" }
];

const sampleQuestions: Record<string, string[]> = {
  "Java Developer": [
    "Can you explain the difference between JDK, JRE, and JVM?",
    "What are the main principles of Object-Oriented Programming?",
    "How does garbage collection work in Java?",
    "Explain the difference between ArrayList and LinkedList.",
    "What are the different types of exceptions in Java?"
  ],
  "Python Developer": [
    "What are Python decorators and how do they work?",
    "Explain the difference between lists and tuples in Python.",
    "What is the GIL in Python and why does it matter?",
    "How do you handle memory management in Python?",
    "Explain list comprehension with an example."
  ],
  "Frontend Developer": [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain the concept of the Virtual DOM in React.",
    "How does CSS specificity work?",
    "What are closures in JavaScript?",
    "Explain the difference between == and === in JavaScript."
  ],
  default: [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Where do you see yourself in 5 years?",
    "Why should we hire you?",
    "Do you have any questions for us?"
  ]
};

export default function Interview() {
  const { user, interviewMessages, addInterviewMessage, clearInterviewMessages } = useApp();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewType, setInterviewType] = useState<'technical' | 'hr'>('technical');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interviewMessages]);

  const getQuestions = () => {
    const role = customRole || selectedRole;
    return sampleQuestions[role] || sampleQuestions.default;
  };

  const startSession = () => {
    const role = customRole || selectedRole;
    if (!role) return;
    
    clearInterviewMessages();
    setIsSessionActive(true);
    setCurrentQuestionIndex(0);
    
    // AI greeting
    setTimeout(() => {
      addInterviewMessage({
        id: Date.now().toString(),
        role: 'ai',
        content: `Hello ${user?.name}! Welcome to your ${role} interview. 🎯\n\nI'll be conducting this ${interviewType === 'technical' ? 'technical' : 'HR'} interview today. Please answer the questions as you would in a real interview.\n\nLet's begin!\n\n**Question 1:** ${getQuestions()[0]}`,
        timestamp: new Date()
      });
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addInterviewMessage({
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    });
    setInputText('');

    const questions = getQuestions();
    const nextIndex = currentQuestionIndex + 1;

    setTimeout(() => {
      setIsSpeaking(true);
      
      if (nextIndex < questions.length) {
        setCurrentQuestionIndex(nextIndex);
        const acknowledgments = [
          "Thank you for that answer.",
          "I see, that's interesting.",
          "Good explanation.",
          "Alright, let's move on."
        ];
        addInterviewMessage({
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: `${acknowledgments[Math.floor(Math.random() * acknowledgments.length)]}\n\n**Question ${nextIndex + 1}:** ${questions[nextIndex]}`,
          timestamp: new Date()
        });
      } else {
        // End of interview
        endSession();
      }
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 1500);
  };

  const endSession = () => {
    setIsSpeaking(true);
    addInterviewMessage({
      id: Date.now().toString(),
      role: 'ai',
      content: `That concludes our interview, ${user?.name}! Thank you for your time. 🌟\n\n**Interview Feedback:**\n\n✅ **What went well:**\n• You answered all questions\n• You showed good communication skills\n• Your responses were structured\n\n💡 **Areas to improve:**\n• Include more specific examples from your experience\n• Use the STAR method (Situation, Task, Action, Result)\n• Practice explaining technical concepts more simply\n\n**Tips for your real interview:**\n1. Research the company thoroughly\n2. Prepare questions to ask the interviewer\n3. Practice common questions out loud\n4. Be confident but humble\n5. Follow up with a thank-you email\n\nKeep practicing! You're on the right track! 💪`,
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
      setTimeout(() => setIsListening(false), 5000);
    }
  };

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Interview Prep" showBack />
        
        <main className="px-4 py-6 max-w-4xl mx-auto pb-24">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-interview flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Interview Practice
            </h1>
            <p className="text-muted-foreground">
              Practice with an AI interviewer tailored to your role
            </p>
          </div>

          {/* Interview Type */}
          <Card className="p-5 mb-6 animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">Interview Type</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInterviewType('technical')}
                className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                  interviewType === 'technical'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Code className="w-6 h-6 mx-auto mb-2 text-primary" />
                <span className="font-medium text-foreground">Technical</span>
              </button>
              <button
                onClick={() => setInterviewType('hr')}
                className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${
                  interviewType === 'hr'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <UsersIcon className="w-6 h-6 mx-auto mb-2 text-accent" />
                <span className="font-medium text-foreground">HR</span>
              </button>
            </div>
          </Card>

          {/* Role Selection */}
          <Card className="p-6 mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold text-foreground mb-4">What role are you interviewing for?</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {interviewRoles.map((role) => (
                <button
                  key={role.name}
                  onClick={() => {
                    setSelectedRole(role.name);
                    setCustomRole('');
                  }}
                  className={`p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    selectedRole === role.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl mr-2">{role.icon}</span>
                  <span className="text-sm font-medium text-foreground">{role.name}</span>
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
              placeholder="Enter any other role..."
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                setSelectedRole('');
              }}
              className="mt-4 h-12"
            />
          </Card>

          <Button
            onClick={startSession}
            disabled={!selectedRole && !customRole}
            className="w-full h-14 text-lg font-semibold gradient-interview"
          >
            Start Interview
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={`${customRole || selectedRole} Interview`} showBack />
      
      {/* Messages */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 pb-40">
          {interviewMessages.map((msg) => (
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
                placeholder="Type your answer..."
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
            <StopCircle className="w-4 h-4 mr-2" /> End Interview & Get Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
