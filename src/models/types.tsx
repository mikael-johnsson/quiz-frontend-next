export type QuestionResponse = {
  totalResult: number;
  questions: Question[];
};

export type Question = {
  question: string;
  answer: string;
  questionType: string;
  isApproved: boolean;
  themes: string[];
  difficultyLevel: string;
  createdBy: string;
  createdWhen: string;
  id: number;
};
