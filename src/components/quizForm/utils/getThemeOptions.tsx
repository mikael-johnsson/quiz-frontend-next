import { Question } from "@/models/types";
import { getQuestions } from "@/services/quizService";

export const getThemeOptions = async (URL: string) => {
  const optionThemes: string[] = [];

  const data = await getQuestions([], [], URL, true);

  data.questions?.forEach((question: Question) => {
    question.themes?.forEach((theme) => {
      if (!optionThemes.includes(theme)) optionThemes.push(theme);
    });
  });

  return optionThemes;
};
