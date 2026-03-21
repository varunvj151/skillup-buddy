import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { GraduationCap, Target, Rocket } from 'lucide-react';
import { firebaseReady, auth, googleProvider, facebookProvider, appleProvider } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, type AuthError } from 'firebase/auth';
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
    const code = (error as AuthError)?.code || 'unknown';
    const rawMessage = (error as { message?: string })?.message || '';

    if (code.includes('popup-closed-by-user')) return 'Login popup was closed before sign-in.';
    if (code.includes('popup-blocked')) return 'Popup was blocked. Trying redirect login instead.';
    if (code.includes('unauthorized-domain')) return 'Domain is not authorized in Firebase Auth settings.';
    if (code.includes('operation-not-allowed')) return 'Provider is not enabled in Firebase Authentication.';
    if (code.includes('account-exists-with-different-credential')) return 'This email is linked with a different sign-in method.';
    if (code.includes('invalid-credential')) return 'Invalid credentials. Please try again.';
    if (code.includes('wrong-password')) return 'Wrong password.';
    if (code.includes('user-not-found')) return 'No account found with this email.';
    if (code.includes('invalid-email')) return 'Invalid email format.';
    if (code.includes('weak-password')) return 'Password is too weak (minimum 6 characters).';
    return `Authentication failed (${code}). ${rawMessage || 'Please check Firebase provider setup and try again.'}`;
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    if (!firebaseReady || !auth) {
      toast({
        title: 'Firebase not configured',
        description: 'Missing VITE_FIREBASE_* values. Please verify .env.local and restart dev server.',
        variant: 'destructive',
      });
      return;
    }

    const providerObj =
      provider === 'google'
        ? googleProvider
        : provider === 'facebook'
          ? facebookProvider
          : appleProvider;

    if (!providerObj) {
      toast({
        title: 'Provider unavailable',
        description: 'Selected login provider is not initialized.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAuthLoading(true);
      const credential = await signInWithPopup(auth, providerObj);
      const fbUser = credential.user;
      const nextName =
        fbUser.displayName ||
        (fbUser.email ? fbUser.email.split('@')[0] : null) ||
        'User';

      setEmail(fbUser.email || '');
      setName(nextName);
      setStep(2);
      toast({ title: 'Signed in', description: `Logged in with ${provider}.` });
    } catch (err) {
      const message = explainAuthError(err);
      const code = (err as AuthError)?.code || '';

      if (code.includes('popup-blocked')) {
        try {
          await signInWithRedirect(auth, providerObj);
          return;
        } catch (redirectErr) {
          toast({
            title: 'Social login failed',
            description: explainAuthError(redirectErr),
            variant: 'destructive',
          });
          return;
        }
      }

      toast({
        title: 'Social login failed',
        description: message,
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

    // Persist profile so refresh doesn't force onboarding again.
    if (auth?.currentUser?.uid) {
      localStorage.setItem(`profile:${auth.currentUser.uid}`, JSON.stringify(profile));
    }

    navigate('/home');
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firebaseReady || !auth) {
      toast({
        title: 'Firebase not configured',
        description: 'Missing VITE_FIREBASE_* values. Please verify .env.local and restart dev server.',
        variant: 'destructive',
      });
      return;
    }

    if (!email || !password) return;

    try {
      setAuthLoading(true);
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }

      const fbUser = auth.currentUser;
      const nextName =
        fbUser?.displayName ||
        (fbUser?.email ? fbUser.email.split('@')[0] : null) ||
        (email ? email.split('@')[0] : null) ||
        'User';

      setName(nextName);
      setEmail(fbUser?.email || email);
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
      <div className="flex-1 px-6 pb-8 flex items-center justify-center">
        {step === 1 && (
          <div className="w-full max-w-md animate-fade-in">
            <Card className="p-8 shadow-2xl border-primary/5 bg-card/50 backdrop-blur-sm rounded-[2rem]">
              <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
                {authMode === 'login' ? 'Sign-in' : 'Sign-up'}
              </h1>

              {/* Social Buttons */}
              <div className="space-y-3 mb-6">
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={authLoading}
                  onClick={() => {
                    handleSocialLogin('google');
                  }}
                  className="w-full h-12 rounded-full border-border hover:bg-muted font-medium flex gap-3 text-foreground transition-all"
                >
                   <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                   Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={authLoading}
                  onClick={() => {
                    handleSocialLogin('facebook');
                  }}
                  className="w-full h-12 rounded-full border-border hover:bg-muted font-medium flex gap-3 text-foreground transition-all"
                >
                   <div className="w-4 h-4 bg-[#1877F2] rounded-sm flex items-center justify-center text-[10px] text-white font-bold">f</div>
                   Continue with Facebook
                </Button>
                <Button 
                  variant="outline" 
                  type="button"
                  disabled={authLoading}
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
      {step > 1 && (
        <div className="p-6 pb-8">
          <Button
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else handleComplete();
            }}
            disabled={
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
      )}

    </div>
  );
}
