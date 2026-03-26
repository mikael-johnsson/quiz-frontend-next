"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthResponse, LoginRequest } from "@/models/types";
import { getMe, login, logout } from "@/services/authService";

type AuthContextValue = {
  user: AuthResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshMe: () => Promise<void>;
  loginAction: (data: LoginRequest) => Promise<AuthResponse>;
  logoutAction: () => Promise<void>;
  setUser: (user: AuthResponse | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh auth state from backend cookie by calling the /me endpoint.
  const refreshMe = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentUser = await getMe();
      setUser(currentUser);
    } catch {
      // If /me fails (401, expired cookie, network issue), treat user as logged out.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAction = useCallback(async (data: LoginRequest) => {
    const authUser = await login(data);
    setUser(authUser);
    return authUser;
  }, []);

  const logoutAction = useCallback(async () => {
    try {
      await logout();
    } finally {
      // Always clear local auth state after a logout attempt.
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refreshMe,
      loginAction,
      logoutAction,
      setUser,
    }),
    [user, isLoading, refreshMe, loginAction, logoutAction],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
