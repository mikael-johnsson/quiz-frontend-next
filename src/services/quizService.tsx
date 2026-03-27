import { PostQuestionRequest, QuestionResponse } from "../models/types";
import { getData, postData } from "./serviceBase";
import { buildUrl } from "./utils/buildUrl";
import { getErrorMessage, getRequiredHttpsUrl } from "./utils/httpHelpers";

const PDF_URL = process.env.PDF_URL || "";
const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid question data",
  401: "You are not authenticated",
  403: "You are not allowed to create questions",
  500: "Server error. Please try again later",
};

const getQuestionsUrl = () => {
  const explicitQuestionsUrl = process.env.NEXT_PUBLIC_QUESTIONS_URL;

  if (explicitQuestionsUrl?.trim()) {
    return getRequiredHttpsUrl(
      explicitQuestionsUrl,
      "NEXT_PUBLIC_QUESTIONS_URL",
    );
  }

  const baseUrl = getRequiredHttpsUrl(
    process.env.NEXT_PUBLIC_BASE_URL,
    "NEXT_PUBLIC_BASE_URL",
  );

  return `${baseUrl.replace(/\/$/, "")}/questions`;
};

export const getQuestions = async (
  themes: string[],
  difficulties: string[],
  URL: string,
  isApproved: boolean = true,
) => {
  const difficultiesUrl = buildUrl(difficulties, "&difficulties=");
  const themesUrl = buildUrl(themes, "&themes=");
  const isApprovedUrl = `&isApproved=${isApproved}`;

  const res = await getData(URL, themesUrl, difficultiesUrl, isApprovedUrl);
  if (!res.ok) {
    console.log("error");
    // add error message
  }
  const data: QuestionResponse = await res.json();
  return data;
};

export const getPdf = async (themes: string[], difficulties: string[]) => {
  const queryParams = new URLSearchParams();

  themes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .forEach((theme) => queryParams.append("themes", theme));

  difficulties
    .map((difficulty) => difficulty.trim())
    .filter((difficulty) => difficulty.length > 0)
    .forEach((difficulty) => queryParams.append("difficulties", difficulty));

  const res = await fetch(`${PDF_URL}?${queryParams.toString()}`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    console.log("error");
    // add error message
  }
  return res;
};

/**
 * Creates a new question for the authenticated user.
 * Uses NEXT_PUBLIC_QUESTIONS_URL when available, otherwise falls back to NEXT_PUBLIC_BASE_URL + /questions.
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
