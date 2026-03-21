export interface InterviewSession {
  type: 'hr' | 'technical';
  currentQuestionIndex: number;
  questions: string[];
  transcripts: string[];
  evaluation: InterviewEvaluation | null;
}

export interface PerQuestionFeedback {
  question: string;
  answer: string;
  score: number;
  communication: number;
  technical: number;
  feedback: string;
  status: 'OK' | 'TRANSCRIPTION_ERROR';
}

export interface InterviewEvaluation {
  overallScore: number;
  summary: string;
  questions: PerQuestionFeedback[];
}
