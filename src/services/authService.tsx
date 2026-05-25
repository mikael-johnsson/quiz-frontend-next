import {
  AuthResponse,
  LoginRequest,
  PasswordChangeRequest,
  SignUpRequest,
} from "@/models/types";
import { loginUser, signUpUser } from "./serviceBase";
import { getErrorMessage, getRequiredHttpsUrl } from "./utils/httpHelpers";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request",
  401: "You are not authenticated",
  409: "A user with this data already exists",
  500: "Server error. Please try again later",
};

/**
 *
 * @returns A url to the changePassword endpoint
 *  should handle undefined env-var better
 */
const getChangePasswordUrl = () => {
  try {
    const explicitChangePasswordUrl =
      process.env.NEXT_PUBLIC_USERS_URL + "/passwordchange";

    if (explicitChangePasswordUrl?.trim()) {
      return getRequiredHttpsUrl(
        explicitChangePasswordUrl,
        "NEXT_PUBLIC_USERS_URL",
      );
    } else {
      return "default_faulty_url";
    }
  } catch (error) {
    console.error(error);
    return "default_faulty_url";
  }
};

/**
 * Sends login credentials to the server and returns the auth response.
 * For now this is mocked — it simulates a successful login without a real backend.
 * @param data - The user's email and password
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const res = await loginUser(data);
    if (!res.ok) {
      throw new Error(
        await getErrorMessage(res, "Login failed", STATUS_MESSAGES),
      );
    }
    return res.json() as Promise<AuthResponse>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error while logging in");
  }
};

/**
 * Sends registration data to the server and returns the auth response.
 * For now this is mocked — it simulates a successful sign-up without a real backend.
 * @param data - The user's email, password, first name and last name
 */
export const signUp = async (data: SignUpRequest) => {
  try {
    const res = await signUpUser(data);
    if (!res.ok) {
      throw new Error(
        await getErrorMessage(res, "Sign up failed", STATUS_MESSAGES),
      );
    }
    return res.json() as Promise<AuthResponse>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error while signing up");
  }
};

/**
 * Sends the current and new password to the server so the authenticated user can update their password.
 */
export const changePassword = async (
  data: PasswordChangeRequest,
): Promise<void> => {
  const changePasswordUrl = getChangePasswordUrl();

  try {
    const res = await fetch(changePasswordUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(res, "Password change failed", STATUS_MESSAGES),
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Network error while changing password");
  }
};

/**
 * Gets the currently authenticated user by validating the auth cookie on the backend.
 */
export const getMe = async (): Promise<AuthResponse> => {
  const meUrl = getRequiredHttpsUrl(
    process.env.NEXT_PUBLIC_ME_URL,
    "NEXT_PUBLIC_ME_URL",
  );

  try {
    const res = await fetch(meUrl, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(
          res,
          "Failed to get current user",
          STATUS_MESSAGES,
        ),
      );
    }

    const payload = await res.json();
    const user = payload?.payload;

    if (!user) {
      throw new Error("Failed to parse current user response");
    }

    return {
      id: user.id,
      firstname: user.firstname,
      email: user.email,
      savedQuizzes: Array.isArray(user.savedQuizzes)
        ? user.savedQuizzes.map(String)
        : [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error while fetching current user");
  }
};

/**
 * Logs out the current user by asking the backend to clear the auth cookie.
 */
export const logout = async (): Promise<void> => {
  const logoutUrl = getRequiredHttpsUrl(
    process.env.NEXT_PUBLIC_LOGOUT_URL,
    "NEXT_PUBLIC_LOGOUT_URL",
  );

  try {
    const res = await fetch(logoutUrl, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(
        await getErrorMessage(res, "Logout failed", STATUS_MESSAGES),
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error while logging out");
  }
};
