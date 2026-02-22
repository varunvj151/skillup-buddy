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

const queryClient = new QueryClient();

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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
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

export default App;
