import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GraduationCap, Target, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const explainAuthError = (error: unknown) => {
    const message = (error as { message?: string })?.message || '';

    if (message.toLowerCase().includes('invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'Please confirm your email before signing in.';
    }
    if (message.toLowerCase().includes('password should be at least 6 characters')) {
      return 'Password should be at least 6 characters.';
    }

    return message || 'Authentication failed. Please try again.';
  };

  useEffect(() => {
    const loadExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) return;

      const nextName =
        sessionUser.user_metadata?.full_name ||
        (sessionUser.email ? sessionUser.email.split('@')[0] : null) ||
        'User';
      setEmail(sessionUser.email || '');
      setName(nextName);
      setStep(2);
    };

    loadExistingSession();
  }, []);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider !== 'google') {
      toast({
        title: 'Coming soon',
        description: `${provider === 'facebook' ? 'Facebook' : 'Apple'} login is not configured yet.`,
      });
      return;
    }

    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      toast({
        title: 'Social login failed',
        description: explainAuthError(err),
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleComplete = () => {
    const finalName = name || (email ? email.split('@')[0] : null) || 'User';
    const profile = { name: finalName, branch, careerGoal };
    setUser(profile);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        localStorage.setItem(`profile:${data.session.user.id}`, JSON.stringify(profile));
      }
    });

    navigate('/home');
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Email and password are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAuthLoading(true);
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const sessionUser = data.user;
        const nextName =
          sessionUser?.user_metadata?.full_name ||
          (sessionUser?.email ? sessionUser.email.split('@')[0] : null) ||
          email.split('@')[0];
        setName(nextName);
        setEmail(sessionUser?.email || email);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const sessionUser = data.user;
        const nextName =
          sessionUser?.user_metadata?.full_name ||
          (sessionUser?.email ? sessionUser.email.split('@')[0] : null) ||
          email.split('@')[0];
        setName(nextName);
        setEmail(sessionUser?.email || email);
      }
      setStep(2);
      toast({
        title: authMode === 'login' ? 'Login successful' : 'Account created',
        description: 'Continue your profile setup.',
      });
    } catch (err) {
      toast({
        title: authMode === 'login' ? 'Login failed' : 'Registration failed',
        description: explainAuthError(err),
        variant: 'destructive',
      });
    } finally {
      setAuthLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-border">
            <img src="/src/assets/logo.png" className="w-full h-full object-cover" alt="SkillUp Buddy Logo" />
          </div>
          <span className="text-xl font-bold text-foreground">SkillUp Buddy</span>
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
      <div className="flex-1 px-3 sm:px-6 pb-6 sm:pb-8 flex items-center justify-center">
        {step === 1 && (
          <div className="w-full max-w-md animate-fade-in">
            <Card className="p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-2xl border-primary/5 bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-[2rem]">
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-foreground">
                {authMode === 'login' ? 'Sign-in' : 'Sign-up'}
              </h1>

              {/* Social Buttons */}
              <div className="space-y-2 sm:space-y-3 mb-6">
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={authLoading}
                  onClick={() => {
                    handleSocialLogin('google');
                  }}
                  className="w-full h-10 sm:h-11 md:h-12 rounded-full border-border hover:bg-muted font-medium flex gap-2 sm:gap-3 text-sm sm:text-base text-foreground transition-all"
                >
                   <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                   Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled
                  onClick={() => {
                    handleSocialLogin('facebook');
                  }}
                  className="w-full h-10 sm:h-11 md:h-12 rounded-full border-border hover:bg-muted font-medium flex gap-2 sm:gap-3 text-sm sm:text-base text-foreground transition-all"
                >
                   <div className="w-4 h-4 bg-[#1877F2] rounded-sm flex items-center justify-center text-[10px] text-white font-bold">f</div>
                   Continue with Facebook
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled
                  onClick={() => {
                    handleSocialLogin('apple');
                  }}
                  className="w-full h-12 rounded-full border-border hover:bg-muted font-medium flex gap-3 text-foreground transition-all"
                >
                   <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center text-[10px] text-white"></div>
                   Continue with Apple
                </Button>
              </div>


              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-border focus:ring-primary h-12"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-12 rounded-full font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-primary/20 transition-all mt-4"
                >
                  {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Register'}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {authMode === 'login' 
                    ? "Don't have an account? Register" 
                    : "Already have an account? Login"}
                </button>
              </div>
            </Card>
          </div>
        )}


        {step === 2 && (
          <div className="animate-fade-in">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg sm:rounded-2xl gradient-aptitude flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <GraduationCap className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2 text-foreground">
              Hey {name}! 🎓
            </h2>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
              What's your branch or field of study?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => setBranch(b)}
                  className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-300 text-xs sm:text-sm font-medium ${
                    branch === b
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-card border border-border hover:border-primary'
                  }`}
                >
                  <span>{b}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-lg sm:rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Target className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2 text-foreground">
              Almost there! 🎯
            </h2>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
              What's your career goal?
            </p>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {goals.map((g) => (
                <button
                  key={g}
                  onClick={() => setCareerGoal(g)}
                  className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all duration-300 text-xs sm:text-sm font-medium ${
                    careerGoal === g
                      ? 'gradient-accent text-white shadow-md'
                      : 'bg-card border border-border hover:border-accent'
                  }`}
                >
                  <span>{g}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step > 1 && (
        <div className="p-3 sm:p-4 md:p-6 pb-4 sm:pb-6 md:pb-8">
          <Button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleComplete();
            }}
            disabled={
              (step === 2 && !branch) ||
              (step === 3 && !careerGoal)
            }
            className="w-full h-10 sm:h-12 md:h-14 text-xs sm:text-sm md:text-base font-semibold gradient-primary hover:opacity-90 disabled:opacity-50"
          >
            {step < 3 ? (
              'Continue'
            ) : (
              <span className="flex items-center gap-2">
                <Rocket className="w-4 sm:w-5 h-4 sm:h-5" /> Let's Go!
              </span>
            )}
          </Button>
        </div>
      )}

    </div>
  );
}
