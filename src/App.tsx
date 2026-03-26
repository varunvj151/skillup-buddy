import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Aptitude from "./pages/Aptitude";
import AptitudeLearn from "./pages/AptitudeLearn";
import TopicLesson from "./pages/TopicLesson";
import AptitudeTest from "./pages/AptitudeTest";
import TestSession from "./pages/TestSession";
import TestResult from "./pages/TestResult";
import TestSetup from "./pages/TestSetup"; // New
import TestInstruction from "./pages/TestInstruction"; // New
import GroupDiscussion from "./pages/GroupDiscussion";
import Interview from "./pages/Interview";
import NotFound from "./pages/NotFound";
import GDVoice from "./pages/GDVoice";
import GDResult from "./pages/GDResult";
import InterviewSession from "./pages/InterviewSession";
import InterviewResult from "./pages/InterviewResult";

import { isSupabaseConfigured } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

function ConfigErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuration Required</h1>
        <p className="text-muted-foreground leading-relaxed">
          The application is missing critical environment variables (<code className="bg-muted px-1 rounded text-sm">VITE_SUPABASE_URL</code> and <code className="bg-muted px-1 rounded text-sm">VITE_SUPABASE_PUBLISHABLE_KEY</code>).
        </p>
        <div className="p-4 bg-muted/30 rounded-lg text-sm text-left border border-border/50 font-mono overflow-auto">
          <p className="text-xs text-muted-foreground mb-2">Check your deployment settings for:</p>
          <p className="text-primary">1. Supabase Project URL</p>
          <p className="text-primary">2. Project API (Anon) Key</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full h-12 rounded-full font-semibold mt-4 transition-all"
        >
          I've fixed it, reload the app
        </Button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Onboarding />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/aptitude" element={<ProtectedRoute><Aptitude /></ProtectedRoute>} />
      <Route path="/aptitude/learn" element={<ProtectedRoute><AptitudeLearn /></ProtectedRoute>} />
      <Route path="/aptitude/learn/:topicId" element={<ProtectedRoute><TopicLesson /></ProtectedRoute>} />
      <Route path="/aptitude/test" element={<ProtectedRoute><AptitudeTest /></ProtectedRoute>} />
      <Route path="/test/setup/:topicId" element={<ProtectedRoute><TestSetup /></ProtectedRoute>} />
      <Route path="/test/instruction/:topicId" element={<ProtectedRoute><TestInstruction /></ProtectedRoute>} />
      <Route path="/test/start/:topicId" element={<ProtectedRoute><TestSession /></ProtectedRoute>} />
      <Route path="/aptitude/test/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
      <Route path="/group-discussion" element={<ProtectedRoute><GroupDiscussion /></ProtectedRoute>} />
      <Route path="/gd/voice/:topicId" element={<ProtectedRoute><GDVoice /></ProtectedRoute>} />
      <Route path="/gd/result" element={<ProtectedRoute><GDResult /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
      <Route path="/interview/session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/interview/result" element={<ProtectedRoute><InterviewResult /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  if (!isSupabaseConfigured) {
    return <ConfigErrorFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
