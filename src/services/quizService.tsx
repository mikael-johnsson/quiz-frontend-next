import {
  PostQuestionRequest,
  QuestionResponse,
  SavedQuiz,
  UpdateQuestionRequest,
  UserQuestionQueryOptions,
} from "../models/types";
import { getData, postData } from "./serviceBase";
import { buildUrl } from "./utils/httpHelpers";
import { getErrorMessage, getRequiredHttpsUrl } from "./utils/httpHelpers";

const NEXT_PUBLIC_QUESTION_URL = process.env.NEXT_PUBLIC_QUESTION_URL || "";
const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid question data",
  401: "You are not authenticated",
  403: "You are not allowed to create questions",
  500: "Server error. Please try again later",
};

const getQuestionsUrl = () => {
  const explicitQuestionsUrl = process.env.NEXT_PUBLIC_QUESTION_URL;

  if (explicitQuestionsUrl?.trim()) {
    return getRequiredHttpsUrl(
      explicitQuestionsUrl,
      "NEXT_PUBLIC_QUESTION_URL",
    );
  }

  const baseUrl = getRequiredHttpsUrl(
    process.env.NEXT_PUBLIC_QUESTION_URL,
    "NEXT_PUBLIC_QUESTION_URL",
  );

  return `${baseUrl.replace(/\/$/, "")}/questions`;
};

const getQuizBaseUrl = () => {
  return getRequiredHttpsUrl(
    process.env.NEXT_PUBLIC_BASE_URL,
    "NEXT_PUBLIC_QUESTION_URL",
  ).replace(/\/$/, "");
};

export const getQuestions = async (
  themes: string[],
  difficulties: string[],
  URL: string,
  isApproved: boolean = true,
  amount?: number,
) => {
  const difficultiesUrl = buildUrl(difficulties, "&difficulties=");
  const themesUrl = buildUrl(themes, "&themes=");
  const isApprovedUrl = `&isApproved=${isApproved}`;
  const amountUrl = typeof amount === "number" ? `&amount=${amount}` : "";

  const res = await getData(
    URL,
    themesUrl,
    difficultiesUrl,
    isApprovedUrl,
    amountUrl,
  );
  if (!res.ok) {
    console.log("error");
    // add error message
  }
  const data: QuestionResponse = await res.json();
  return data;
};

/**
 * Loads the quiz previews that appear on the landing page.
 * The backend is expected to always return exactly three quizzes.
 */
export const getQuizPreviews = async () => {
  const res = await fetch(`${getQuizBaseUrl()}/quiz`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load quiz previews");
  }

  // const data: SavedQuizListResponse = await res.json();
  const data: SavedQuiz[] = await res.json();

  return data;
};

/**
 * Loads one saved quiz in full so the landing page can expand it on demand.
 */
export const getSavedQuiz = async (quizId: string) => {
  const encodedQuizId = encodeURIComponent(quizId);
  console.log(
    "getSavedQuiz fetch: ",
    `${getQuizBaseUrl()}/quiz/${encodedQuizId}`,
  );
  const res = await fetch(`${getQuizBaseUrl()}/quiz/${encodedQuizId}`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load quiz details");
  }

  const data: SavedQuiz = await res.json();
  return data;
};

/**
 * Saves the currently generated quiz on the backend.
 * According to the contract the request has no body and relies on cookie auth.
 */
export const saveGeneratedQuiz = async () => {
  const res = await fetch(`${getQuizBaseUrl()}/quiz`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to save quiz", STATUS_MESSAGES),
    );
  }

  return res;
};

/**
 * Save a specific quiz for the authenticated user.
 * POST /quiz/:id/save
 */
export const saveQuizById = async (quizId: string) => {
  if (!quizId) {
    throw new Error("quizId is required to save a quiz");
  }
  const res = await fetch(
    `${getQuizBaseUrl()}/quiz/${encodeURIComponent(quizId)}/save`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to save quiz", STATUS_MESSAGES),
    );
  }

  return res;
};

/**
 * Unsave a specific quiz for the authenticated user.
 * POST /quiz/:id/unsave
 */
export const unsaveQuizById = async (quizId: string) => {
  if (!quizId) {
    throw new Error("quizId is required to unsave a quiz");
  }
  const res = await fetch(
    `${getQuizBaseUrl()}/quiz/${encodeURIComponent(quizId)}/unsave`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(res, "Failed to unsave quiz", STATUS_MESSAGES),
    );
  }

  return res;
};

/**
 * Fetches questions created by a specific user.
 * This is used by the profile dashboard to show the logged-in user's contributions.
 */
export const getUserQuestions = async (
  userId: string,
  options: UserQuestionQueryOptions = {},
) => {
  const queryParams = new URLSearchParams();

  queryParams.set("createdBy", userId);

  if (typeof options.isApproved === "boolean") {
    queryParams.set("isApproved", options.isApproved.toString());
  }

  options.themes
    ?.map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .forEach((theme) => queryParams.append("themes", theme));

  options.difficulties
    ?.map((difficulty) => difficulty.trim())
    .filter((difficulty) => difficulty.length > 0)
    .forEach((difficulty) => queryParams.append("difficulties", difficulty));

  if (options.search?.trim()) {
    queryParams.set("search", options.search.trim());
  }

  // This should be refactored to be able to use getData() or even the whole
  // function to be getQuestions instead
  const questionsUrl = getQuestionsUrl();

  const res = await fetch(`${questionsUrl}?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(
        res,
        "Failed to load user questions",
        STATUS_MESSAGES,
      ),
    );
  }

  const data: QuestionResponse = await res.json();
  return data;
};

/**
 * Requests a quiz PDF from the upstream service.
 * `questionIds` is optional and keeps backward compatibility with existing
 * filter-based generation when IDs are not provided.
 */
export const getPdf = async (
  themes: string[],
  difficulties: string[],
  questionIds: number[] = [],
) => {
  const queryParams = new URLSearchParams();

  questionIds
    .filter((questionId) => Number.isInteger(questionId) && questionId > 0)
    .forEach((questionId) =>
      queryParams.append("questionIds", questionId.toString()),
    );

  themes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .forEach((theme) => queryParams.append("themes", theme));

  difficulties
    .map((difficulty) => difficulty.trim())
    .filter((difficulty) => difficulty.length > 0)
    .forEach((difficulty) => queryParams.append("difficulties", difficulty));

  console.log(
    `PDF URL: ${NEXT_PUBLIC_QUESTION_URL}/pdf?${queryParams.toString()}`,
  );

  const res = await fetch(
    `${NEXT_PUBLIC_QUESTION_URL}/pdf?${queryParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    },
  );
  console.log("PDF response status:", res);

  if (!res.ok) {
    console.log("error");
    // add error message
  }
  return res;
};

/**
 * Creates a new question for the authenticated user.
 * Uses NEXT_PUBLIC_QUESTION_URL when available
 */
export const createQuestion = async (
  questionData: PostQuestionRequest,
  urlOverride?: string,
) => {
  const resolvedUrl =
    urlOverride && urlOverride.trim().length > 0
      ? urlOverride
      : getQuestionsUrl();

  try {
    const res = await postData(resolvedUrl, questionData);

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(
          res,
          "Failed to create question",
          STATUS_MESSAGES,
        ),
      );
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network error while creating question");
  }
};

/**
 * Backward-compatible alias while components migrate to createQuestion().
 */
export const postQuestion = async (
  URL: string,
  questionData: PostQuestionRequest,
) => {
  return createQuestion(questionData, URL);
};

/**
 * Updates an existing question created by the authenticated user.
 */
export const updateQuestion = async (
  questionId: number,
  questionData: UpdateQuestionRequest,
) => {
  // doesnt work in this function right now
  // const questionsUrl = getQuestionsUrl();
  const questionsUrl = process.env.NEXT_PUBLIC_QUESTION_URL;

  try {
    // this is to accomodate backend, should be fixed to look better
    const questionObject = {
      question: questionData,
    };

    const res = await fetch(`${questionsUrl}/${questionId.toString()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionObject),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(
        await getErrorMessage(
          res,
          "Failed to update question",
          STATUS_MESSAGES,
        ),
      );
    }
    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network error while updating question");
  }
};

/**
 * Deletes an existing question created by the authenticated user.
 */
export const deleteQuestion = async (questionId: number) => {
  // doesnt work in this function right now
  // const questionsUrl = getQuestionsUrl();
  const questionsUrl = process.env.NEXT_PUBLIC_QUESTION_URL;

  try {
    const res = await fetch(`${questionsUrl}/${questionId.toString()}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(
          res,
          "Failed to delete question",
          STATUS_MESSAGES,
        ),
      );
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network error while deleting question");
  }
};

export const updateIsApproved = async (questionId: number, url: string) => {
  const resolvedUrl = url.trim().length > 0 ? url : "";
  if (!resolvedUrl) {
    throw new Error("URL is required to update question approval status");
  }

  const newresolvedUrl = resolvedUrl.replace("?", "");

  try {
    const res = await fetch(`${newresolvedUrl}/${questionId.toString()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(
          res,
          "Failed to update question approval status",
          STATUS_MESSAGES,
        ),
      );
    }

    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network error while updating question approval status");
  }
};
