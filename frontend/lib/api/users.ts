/**
 * GlobeTrotter — User Profile API Module
 *
 * Covers GET /api/users/me and PUT /api/users/me
 * Contract: backend/FRONTEND_INTEGRATION.md §3.2
 */

import { apiGet, apiPut } from "@/lib/api/client";
import type { User } from "@/lib/api/auth";

export interface UpdateUserProfileInput {
  name?: string;
  avatar?: string | null;
}

/**
 * Retrieve current user profile
 */
export async function getUserProfile(): Promise<{ user: User }> {
  return apiGet<{ user: User }>("/users/me");
}

/**
 * Update current user profile (name, avatar)
 */
export async function updateUserProfile(input: UpdateUserProfileInput): Promise<{ user: User }> {
  return apiPut<{ user: User }>("/users/me", input);
}
