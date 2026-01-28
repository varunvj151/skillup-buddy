export interface User {
  name: string;
  branch: string;
  careerGoal: string;
}

export interface Topic {
  id: string;
  name: string;
  category: 'aptitude' | 'reasoning';
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  examples: Example[];
  tips: string[];
}

export interface Example {
  problem: string;
  solution: string;
  explanation: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  strengths: string[];
  weakAreas: string[];
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
