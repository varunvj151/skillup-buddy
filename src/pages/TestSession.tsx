import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { sampleQuestions, allTopics } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestSession() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  
  const questions = sampleQuestions[topicId || ''] || [];
  const topic = allTopics.find(t => t.id === topicId);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    setSelectedAnswer(index);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    
    // Calculate results
    let correct = 0;
    answers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) correct++;
    });

    navigate('/aptitude/test/result', {
      state: {
        topicId,
        topicName: topic?.name,
        answers,
        questions,
        score: correct,
        total: questions.length,
        timeTaken: questions.length * 60 - timeLeft
      }
    });
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No questions available for this topic</p>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <Header title={topic?.name || 'Test'} showBack />
      
      <main className="px-4 py-4 max-w-4xl mx-auto pb-32">
        {/* Timer and Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            timeLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
          )}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <ProgressBar 
          current={currentQuestion + 1} 
          total={questions.length} 
          showLabel={false}
          className="mb-6"
        />

        {/* Question */}
        <Card className="p-6 mb-6 animate-fade-in">
          <div className="flex items-start gap-3 mb-6">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              question.difficulty === 'easy' && "bg-success/20 text-success",
              question.difficulty === 'medium' && "bg-warning/20 text-warning",
              question.difficulty === 'hard' && "bg-destructive/20 text-destructive"
            )}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all duration-200",
                  "border-2",
                  selectedAnswer === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    selectedAnswer === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-foreground">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestion(idx);
                setSelectedAnswer(answers[idx]);
              }}
              className={cn(
                "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                currentQuestion === idx && "ring-2 ring-primary",
                answers[idx] !== null
                  ? "gradient-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="flex-1 h-12"
          >
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 gradient-accent"
            >
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 gradient-primary"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
