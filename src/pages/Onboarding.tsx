import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, GraduationCap, Target, Rocket } from 'lucide-react';

const branches = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Other"
];

const goals = [
  "Product-Based Companies",
  "Service-Based Companies",
  "Startups",
  "Government Jobs",
  "Higher Studies",
  "Undecided"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

  const handleComplete = () => {
    setUser({ name, branch, careerGoal });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Skill Buddy</span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'gradient-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
              Welcome to Skill Buddy! 👋
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Your AI companion to crack aptitude tests, group discussions, and interviews.
            </p>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-foreground mb-2 block">What's your name?</span>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 text-lg"
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-aptitude flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
              Hey {name}! 🎓
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              What's your branch or field of study?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => setBranch(b)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    branch === b
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-card border border-border hover:border-primary'
                  }`}
                >
                  <span className="font-medium">{b}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-foreground">
              Almost there! 🎯
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              What's your career goal?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {goals.map((g) => (
                <button
                  key={g}
                  onClick={() => setCareerGoal(g)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    careerGoal === g
                      ? 'gradient-accent text-white shadow-md'
                      : 'bg-card border border-border hover:border-accent'
                  }`}
                >
                  <span className="font-medium">{g}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 pb-8">
        <Button
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else handleComplete();
          }}
          disabled={
            (step === 1 && !name.trim()) ||
            (step === 2 && !branch) ||
            (step === 3 && !careerGoal)
          }
          className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 disabled:opacity-50"
        >
          {step < 3 ? (
            'Continue'
          ) : (
            <span className="flex items-center gap-2">
              <Rocket className="w-5 h-5" /> Let's Go!
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
