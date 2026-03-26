import { AuthResponse, LoginRequest, SignUpRequest } from "@/models/types";
import { loginUser, signUpUser } from "./serviceBase";

/**
 * Sends login credentials to the server and returns the auth response.
 * For now this is mocked — it simulates a successful login without a real backend.
 * @param data - The user's email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const res = await loginUser(data);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Login failed");
  }
  return res.json() as Promise<AuthResponse>;
};

/**
 * Sends registration data to the server and returns the auth response.
 * For now this is mocked — it simulates a successful sign-up without a real backend.
 * @param data - The user's email, password, first name and last name
 */
export const signUp = async (data: SignUpRequest) => {
  const res = await signUpUser(data);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Sign up failed");
  }
  return res.json() as Promise<AuthResponse>;
};
