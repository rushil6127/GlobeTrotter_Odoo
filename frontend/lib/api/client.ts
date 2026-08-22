/**
 * GlobeTrotter — Centralized API Fetch Client
 *
 * All API calls go through this module. Never scatter raw fetch() calls across pages.
 *
 * Features:
 * - Base URL from NEXT_PUBLIC_API_URL env var (never hardcoded)
 * - credentials: 'include' for HttpOnly cookie auth
 * - Standard envelope unwrapping: { success, data, message, error }
 * - Typed ApiError class for consistent error handling
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// ─────────────────────────────────────────────
// Types — matching backend FRONTEND_INTEGRATION.md
// ─────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─────────────────────────────────────────────
// ApiError — thrown by apiRequest on failure
// ─────────────────────────────────────────────

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ─────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // Always send HttpOnly cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let body: ApiResponse<T>;

  try {
    body = await res.json();
  } catch {
    throw new ApiError(
      "The server returned an unexpected response. Please try again.",
      res.status,
      "INVALID_RESPONSE"
    );
  }

  if (!body.success) {
    const err = body as ApiErrorResponse;
    throw new ApiError(
      err.message ?? "An unexpected error occurred.",
      res.status,
      err.error?.code ?? "UNKNOWN_ERROR",
      err.error?.details
    );
  }

  return (body as ApiSuccessResponse<T>).data;
}

// ─────────────────────────────────────────────
// Convenience wrappers
// ─────────────────────────────────────────────

export function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut<T>(
  path: string,
  body: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}
