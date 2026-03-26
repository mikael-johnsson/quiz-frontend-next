import { QuestionResponse } from "../models/types";
import { getData } from "./serviceBase";
import { buildUrl } from "./utils/buildUrl";

const PDF_URL = process.env.PDF_URL || "";

export const getQuestions = async (
  themes: string[],
  difficulties: string[],
  URL: string,
) => {
  const difficultiesUrl = buildUrl(difficulties, "&difficulties=");
  const themesUrl = buildUrl(themes, "&themes=");

  const res = await getData(URL, themesUrl, difficultiesUrl);
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
