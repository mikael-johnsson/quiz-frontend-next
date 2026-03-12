import { AuthResponse, LoginRequest, SignUpRequest } from "@/models/types";

/**
 * Sends login credentials to the server and returns the auth response.
 * For now this is mocked — it simulates a successful login without a real backend.
 * @param data - The user's email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  // --- MOCK: remove this block and uncomment the real call below when backend is ready ---
  console.log("Mock login called with:", data);
  return {
    token: "mock-token-123",
    user: { id: 1, email: data.email, firstName: "Mock", lastName: "User" },
  };
  // --- END MOCK ---

  // const res = await postData(`${AUTH_URL}/login`, data);
  // if (!res.ok) {
  //   const msg = await res.text();
  //   throw new Error(msg || "Login failed");
  // }
  // return res.json() as Promise<AuthResponse>;
};

/**
 * Sends registration data to the server and returns the auth response.
 * For now this is mocked — it simulates a successful sign-up without a real backend.
 * @param data - The user's email, password, first name and last name
 */
export const signUp = async (data: SignUpRequest): Promise<AuthResponse> => {
  // --- MOCK: remove this block and uncomment the real call below when backend is ready ---
  console.log("Mock signUp called with:", data);
  return {
    token: "mock-token-456",
    user: {
      id: 2,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  };
  // --- END MOCK ---

  // const res = await postData(`${AUTH_URL}/signup`, data);
  // if (!res.ok) {
  //   const msg = await res.text();
  //   throw new Error(msg || "Sign up failed");
  // }
  // return res.json() as Promise<AuthResponse>;
};
