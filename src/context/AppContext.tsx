import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, TestResult, Message } from '@/types';
import { supabase } from '@/lib/supabase';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  currentModule: string | null;
  setCurrentModule: (module: string | null) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  gdMessages: Message[];
  addGdMessage: (message: Message) => void;
  clearGdMessages: () => void;
  interviewMessages: Message[];
  addInterviewMessage: (message: Message) => void;
  clearInterviewMessages: () => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [gdMessages, setGdMessages] = useState<Message[]>([]);
  const [interviewMessages, setInterviewMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized; skipping auth restore.');
      setUser(null);
      return;
    }

    const restoreProfile = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) {
        setUser(null);
        return;
      }

      const raw = localStorage.getItem(`profile:${data.session.user.id}`);
      if (!raw) {
        setUser(null);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    };

    restoreProfile();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const addGdMessage = (message: Message) => {
    setGdMessages(prev => [...prev, message]);
  };

  const clearGdMessages = () => {
    setGdMessages([]);
  };

  const addInterviewMessage = (message: Message) => {
    setInterviewMessages(prev => [...prev, message]);
  };

  const clearInterviewMessages = () => {
    setInterviewMessages([]);
  };

  const logout = async () => {
    if (!supabase) {
      console.warn('Supabase client is not initialized; logout skipped.');
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      currentModule,
      setCurrentModule,
      testResults,
      addTestResult,
      gdMessages,
      addGdMessage,
      clearGdMessages,
      interviewMessages,
      addInterviewMessage,
      clearInterviewMessages,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
