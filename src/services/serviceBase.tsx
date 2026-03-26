import { LoginRequest, SignUpRequest } from "@/models/types";

const getRequiredHttpsUrl = (value: string | undefined, envName: string) => {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    throw new Error(`${envName} is missing. Add it to your .env file.`);
  }

  if (!trimmed.startsWith("https://")) {
    throw new Error(`${envName} must start with https://`);
  }

  return trimmed;
};

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
  process.env.NEXT_PUBLIC_SIGNUP_URL,
  "NEXT_PUBLIC_SIGNUP_URL",
);

export const signUpUser = async (body: SignUpRequest) => {
  return await fetch(signUpURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
};
