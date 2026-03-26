import { LoginRequest, SignUpRequest } from "@/models/types";
import { log } from "console";

export const getData = async (
  url: string,
  themesUrl: string,
  difficultiesUrl: string,
) => {
  return fetch(`${url}${themesUrl}${difficultiesUrl}`, {
    credentials: "include",
  });
};

/**
 * Sends a POST request to the given URL with the provided body serialised as JSON.
 * @param url - The API endpoint to post to
 * @param body - The data to send in the request body (will be JSON.stringify'd)
 */
export const postData = async (url: string, body: unknown) => {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};

const loginURI = process.env.NEXT_PUBLIC_LOGIN_URL || "default-url";

export const loginUser = async (body: LoginRequest) => {
  return await fetch(loginURI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};

const signUpURL = process.env.NEXT_PUBLIC_SIGNUP_URL || "default-url";

export const signUpUser = async (body: SignUpRequest) => {
  return await fetch(signUpURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};
