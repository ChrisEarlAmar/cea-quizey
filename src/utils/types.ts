export type QuestionType = 'single' | 'multiple';

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: "multiple-choice-single" | "multiple-choice-multiple";
  text: string;
  points: number;
  explanation: string;
  choices: Choice[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  questions: Question[];
  config: {
    revealMode: "instant" | "review";
  };
}
