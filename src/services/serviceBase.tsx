import { LoginRequest, SignUpRequest } from "@/models/types";
import { getRequiredHttpsUrl } from "./utils/httpHelpers";

export const getData = async (
  url: string,
  themesUrl: string,
  difficultiesUrl: string,
  isApprovedUrl: string,
) => {
  return fetch(`${url}?${themesUrl}${difficultiesUrl}${isApprovedUrl}`, {
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

const loginURI = getRequiredHttpsUrl(
  process.env.NEXT_PUBLIC_LOGIN_URL,
  "NEXT_PUBLIC_LOGIN_URL",
);

export const loginUser = async (body: LoginRequest) => {
  return await fetch(loginURI, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};

const signUpURL = getRequiredHttpsUrl(
  process.env.NEXT_PUBLIC_USERS_URL,
  "NEXT_PUBLIC_USERS_URL",
);

export const signUpUser = async (body: SignUpRequest) => {
  return await fetch(signUpURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};
