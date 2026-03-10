import { Question, QuestionResponse } from "@/models/types";
import { getData } from "@/services/serviceBase";

export const getThemeOptions = async (URL: string) => {
  const optionThemes: string[] = [];

  const response = await getData(URL, "", "");
  const data: QuestionResponse = await response.json();

  data.questions?.forEach((question: Question) => {
    question.themes?.forEach((theme) => {
      if (!optionThemes.includes(theme)) optionThemes.push(theme);
    });
  });

  return optionThemes;
};
