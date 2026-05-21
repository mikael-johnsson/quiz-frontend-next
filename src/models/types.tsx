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
  difficulty: string;
  createdBy: string;
  createdWhen: string;
  id: number;
};

/**
 * Quiz data returned from the backend for the landing page and saved quiz flow.
 * This keeps the quiz identifier separate from the question IDs stored inside it.
 */
export type SavedQuiz = {
  _id: string;
  questions: number[] | Question[];
  createdBy: string;
  amountOfSaves: number;
  createdWhen?: string;
};

/**
 * Stores the exact quiz selection rendered in the UI,
 * so later actions (like PDF download) can reference the same question IDs.
 */
export type QuizSnapshot = {
  version: number;
  createdAt: string;
  questionIds: number[];
  themes: string[];
  difficulties: string[];
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
  firstname: string;
  lastname: string;
};

/** Shape of the response the server sends back after a successful login or sign-up */
export type AuthResponse = {
  id: string;
  email: string;
  firstname: string;
  savedQuizzes?: string[];
};

/** Data sent to the server when a user changes their password */
export type PasswordChangeRequest = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

/**
 * Query options for listing a single user's created questions.
 * This keeps filtering consistent between the profile dashboard,
 * the service layer, and the backend endpoint.
 */
export type UserQuestionQueryOptions = {
  isApproved?: boolean;
  themes?: string[];
  difficulties?: string[];
  search?: string;
};

/* Data sent to the server when creating a new quiz question */
export type PostQuestionRequest = {
  question: string;
  answer: string;
  questionType: string;
  themes: string[];
  difficulty: string;
  createdBy: string;
};

/* Data sent to the server when updating a quiz question */
export type UpdateQuestionRequest = {
  id: number;
  question: string;
  answer: string;
  questionType: string;
  themes: string[];
  difficulty: string;
  createdBy: string;
  createdWhen: string;
};
