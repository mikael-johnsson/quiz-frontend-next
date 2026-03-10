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

// --- Auth types ---

/** Data sent to the server when a user logs in */
export type LoginRequest = {
  email: string;
  password: string;
};

/** Data sent to the server when a user creates a new account */
export type SignUpRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** Shape of the response the server sends back after a successful login or sign-up */
export type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
};
