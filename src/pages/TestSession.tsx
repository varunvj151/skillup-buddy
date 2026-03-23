import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getQuestionsForTopic, TestQuestion } from '@/data/testQuestions';
import { allTopics } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function TestSession() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { difficulty, questionCount, timeLimit } = location.state || {
    difficulty: 'mixed',
    questionCount: 10,
    timeLimit: 10
  };

  const topic = allTopics.find(t => t.id === topicId);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Initialize test
  useEffect(() => {
    if (topicId) {
      const q = getQuestionsForTopic(topicId, difficulty, questionCount);
      setQuestions(q);
      setAnswers(new Array(q.length).fill(null));
      setVisited(new Array(q.length).fill(false));

      // Mark first question as visited
      setVisited(prev => {
        const newVisited = [...prev];
        newVisited[0] = true;

        // Fix for initial load length issue if q.length > prev.length
        if (newVisited.length < q.length) {
          return new Array(q.length).fill(false).map((_, i) => i === 0);
        }
        return newVisited;
      });
    }
  }, [topicId, difficulty, questionCount]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted && questions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, questions.length]);

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

  const handleNavigation = (index: number) => {
    setCurrentQuestion(index);
    setSelectedAnswer(answers[index]);

    // Mark as visited
    const newVisited = [...visited];
    newVisited[index] = true;
    setVisited(newVisited);

    // Close palette on mobile if open
    setIsPaletteOpen(false);
  };

  const clearResponse = () => {
    setSelectedAnswer(null);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = null;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Calculate results
    let correct = 0;
    answers.forEach((ans, idx) => {
      if (questions[idx] && ans === questions[idx].correctAnswer) correct++;
    });

    navigate('/aptitude/test/result', {
      replace: true,
      state: {
        topicId,
        topicName: topic?.name,
        answers,
        questions,
        score: correct,
        total: questions.length,
        timeTaken: (timeLimit * 60) - timeLeft
      }
    });
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading test...</p>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        title={topic?.name || 'Test'}
        rightElement={
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono border",
            timeLeft < 60 ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" : "bg-muted/50 text-foreground border-border"
          )}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        }
      />

      <main className="flex-1 px-4 py-4 max-w-4xl mx-auto w-full pb-32">
        {/* Progress Bar */}
        <ProgressBar
          current={currentQuestion + 1}
          total={questions.length}
          showLabel={false}
          className="mb-6"
        />

        <div className="flex gap-6 lg:gap-8">
          {/* Left: Question Area */}
          <div className="flex-1">
            <Card className="p-6 mb-6 animate-fade-in shadow-sm border-border/50">
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <div className="flex gap-2">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider",
                    question.difficulty === 'easy' && "bg-success/10 text-success",
                    question.difficulty === 'medium' && "bg-warning/10 text-warning",
                    question.difficulty === 'hard' && "bg-destructive/10 text-destructive"
                  )}>
                    {question.difficulty}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-8 leading-relaxed">
                {question.question}
              </h2>

              {/* Options */}
              <div className="space-y-2 sm:space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={cn(
                      "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-200 flex items-center gap-3 sm:gap-4 touch-manipulation",
                      "border-2 min-h-12 sm:min-h-14",
                      selectedAnswer === index
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted hover:border-primary/50 bg-card hover:bg-muted/30"
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-colors flex-shrink-0",
                      selectedAnswer === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm sm:text-base text-foreground font-medium break-words">{option}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Question Palette (Desktop) */}
          <div className="hidden md:block w-48 lg:w-56 xl:w-72 flex-shrink-0">
            <Card className="p-3 md:p-4 sticky top-24">
              <h3 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Question Palette</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2 mb-4 md:mb-6">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigation(idx)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                      currentQuestion === idx && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      answers[idx] !== null ? "bg-success text-white" :
                        visited[idx] ? "bg-destructive text-white" :
                          "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Visited, Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span>Not Visited</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-background/80 backdrop-blur-xl border-t border-border z-10 safe-area-inset-bottom">
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-center">
          {/* Mobile Palette Trigger */}
          <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Questions</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-5 gap-3 mt-6">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigation(idx)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                      currentQuestion === idx && "ring-2 ring-primary",
                      answers[idx] !== null ? "bg-success text-white" :
                        visited[idx] ? "bg-destructive text-white" :
                          "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            onClick={clearResponse}
            disabled={selectedAnswer === null}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear
          </Button>

          <div className="flex-1 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => handleNavigation(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="w-24"
            >
              Previous
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="w-32 gradient-accent font-semibold"
              >
                Submit
              </Button>
            ) : (
              <Button
                onClick={() => handleNavigation(currentQuestion + 1)}
                className="w-32 gradient-primary font-semibold"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
