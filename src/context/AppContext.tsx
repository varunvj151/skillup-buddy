import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, TestResult, Message } from '@/types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [gdMessages, setGdMessages] = useState<Message[]>([]);
  const [interviewMessages, setInterviewMessages] = useState<Message[]>([]);

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
      clearInterviewMessages
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
