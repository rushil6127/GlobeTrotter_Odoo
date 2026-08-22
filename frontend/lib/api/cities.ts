/**
 * GlobeTrotter — Cities & Activities API Module
 *
 * Public endpoints — no auth required for discovery.
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.4 & §3.5
 */

import { apiGet } from "@/lib/api/client";

// ─────────────────────────────────────────────
// City types
// ─────────────────────────────────────────────

export interface City {
  id: string;
  name: string;
  country: string;
  description?: string | null;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  _count?: { activities?: number };
}

export interface CityListResponse {
  cities: City[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─────────────────────────────────────────────
// Activity types
// ─────────────────────────────────────────────

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: string;
  duration?: number | null;
  estimatedCost?: number | null;
  image?: string | null;
  description?: string | null;
  city: Pick<City, "id" | "name" | "country">;
}

export interface ActivityListResponse {
  activities: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─────────────────────────────────────────────
// City API calls
// ─────────────────────────────────────────────

/** GET /api/cities — Paginated city list */
export async function getCities(params?: {
  page?: number;
  limit?: number;
  country?: string;
}): Promise<CityListResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.country) qs.set("country", params.country);
  const query = qs.toString();
  return apiGet<CityListResponse>(`/cities${query ? `?${query}` : ""}`);
}

/** GET /api/cities/search?q= — Quick city search */
export async function searchCities(q: string): Promise<City[]> {
  const res = await apiGet<{ query: string; count: number; cities: City[] }>(
    `/cities/search?q=${encodeURIComponent(q)}`
  );
  return res.cities;
}

/** GET /api/cities/:cityId — Single city with activities */
export async function getCity(
  cityId: string
): Promise<City & { activities?: Activity[] }> {
  const res = await apiGet<{ city: City & { activities?: Activity[] } }>(
    `/cities/${cityId}`
  );
  return res.city;
}

// ─────────────────────────────────────────────
// Activity API calls
// ─────────────────────────────────────────────

/** GET /api/activities — Filtered activity list */
export async function getActivities(params?: {
  cityId?: string;
  category?: string;
  maxCost?: number;
  maxDuration?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ActivityListResponse> {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set("cityId", params.cityId);
  if (params?.category) qs.set("category", params.category);
  if (params?.maxCost !== undefined) qs.set("maxCost", String(params.maxCost));
  if (params?.maxDuration !== undefined) qs.set("maxDuration", String(params.maxDuration));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  if (params?.sortOrder) qs.set("sortOrder", params.sortOrder);
  const query = qs.toString();
  return apiGet<ActivityListResponse>(`/activities${query ? `?${query}` : ""}`);
}

/** GET /api/activities/:activityId — Activity details */
export async function getActivity(activityId: string): Promise<Activity> {
  const res = await apiGet<{ activity: Activity }>(`/activities/${activityId}`);
  return res.activity;
}
