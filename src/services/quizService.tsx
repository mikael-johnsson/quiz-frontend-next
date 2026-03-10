import { QuestionResponse } from "../models/types";
import { getData } from "./serviceBase";
import { buildUrl } from "./utils/buildUrl";

export const getQuestions = async (
  themes: string[],
  difficulties: string[],
  URL: string,
) => {
  const difficultiesUrl = buildUrl(difficulties, "&difficulties=");
  const themesUrl = buildUrl(themes, "&themes=");

  // const response = getData(URL, themesUrl, difficultiesUrl);
  // response
  //   .then(async (res) => {
  //     if (!res.ok) {
  //       const msg = await res.text();
  //       // createErrorMsg(msg);
  //       return;
  //     } else {
  //       return res.json();
  //     }
  //   })
  //   .then((data: QuestionResponse) => {
  //     if (!data) return;
  //     //   clearQuestions();
  //     //   createQuestions(data.questions);
  //   });

  const res = await getData(URL, themesUrl, difficultiesUrl);
  if (!res.ok) {
    console.log("error");
    // add error message
  }
  const data: QuestionResponse = await res.json();
  return data;
};
