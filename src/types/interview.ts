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
  feedback: string;
}

export interface InterviewEvaluation {
  overall_score: number;
  communication: number;
  confidence: number;
  answer_quality: number;
  clarity: number;
  professionalism: number;
  response_structure: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  per_question_feedback: PerQuestionFeedback[];
}
