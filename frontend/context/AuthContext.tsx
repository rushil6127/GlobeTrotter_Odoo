"use client";

/**
 * GlobeTrotter — AuthContext
 *
 * Provides application-wide auth state: user, isLoading, isAuthenticated.
 * Exposed via useAuth() hook.
 *
 * On mount: calls GET /api/auth/me to restore session from HttpOnly cookie.
 * On login/register: updates user state and optionally stores token.
 * On logout: calls POST /api/auth/logout and clears state.
 *
 * Protected pages should use requireAuth from this context,
 * or rely on middleware.ts which handles server-side redirects.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  getMe,
  loginUser,
  registerUser,
  logoutUser,
  type User,
  type AuthData,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────

interface AuthContextValue {
  /** Authenticated user, or null if unauthenticated */
  user: User | null;
  /** True while the initial session check is running */
  isLoading: boolean;
  /** True once we have confirmed a valid session */
  isAuthenticated: boolean;
  /** Login with email + password. Throws ApiError on failure. */
  login: (email: string, password: string) => Promise<void>;
  /** Register a new account. Throws ApiError on failure. */
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Log out: clears cookie, resets state, redirects to /login */
  logout: () => Promise<void>;
  /** Manually update the user object (e.g. after profile edit) */
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On app mount — restore session from HttpOnly cookie
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      try {
        const data = await getMe();
        if (!cancelled) setUser(data.user);
      } catch (err) {
        // 401 = no active session, that's fine — stay unauthenticated
        if (err instanceof ApiError && err.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
          }
        } else if (err instanceof ApiError && err.status !== 401) {
          console.error("[AuthContext] Unexpected error restoring session:", err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const handleAuthSuccess = useCallback((data: AuthData) => {
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("token", data.token);
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    }
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginUser({ email, password });
      handleAuthSuccess(data);
    },
    [handleAuthSuccess]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await registerUser({ name, email, password });
      handleAuthSuccess(data);
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Best-effort — clear local state regardless
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      setUser,
    }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
