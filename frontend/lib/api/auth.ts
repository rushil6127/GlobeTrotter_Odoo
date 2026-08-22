/**
 * GlobeTrotter — Auth API Module
 *
 * Covers: POST /api/auth/register, /api/auth/login, /api/auth/logout, GET /api/auth/me
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.1
 */

import { apiGet, apiPost } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthData {
  user: User;
  token: string;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

/** POST /api/auth/register — Create a new account */
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthData> {
  return apiPost<AuthData>("/auth/register", data);
}

/** POST /api/auth/login — Sign in with email + password */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthData> {
  return apiPost<AuthData>("/auth/login", data);
}

/** POST /api/auth/logout — Clear session cookie */
export async function logoutUser(): Promise<void> {
  await apiPost<null>("/auth/logout", {});
}

/** GET /api/auth/me — Verify active session; returns user */
export async function getMe(): Promise<{ user: User }> {
  return apiGet<{ user: User }>("/auth/me");
}

/** GET /api/users/me — Get user profile */
export async function getUserProfile(): Promise<{ user: User }> {
  return apiGet<{ user: User }>("/users/me");
}

