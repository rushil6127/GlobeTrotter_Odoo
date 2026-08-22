/**
 * GlobeTrotter — Cities & Activities API Module
 *
 * Public endpoints — no auth required for discovery.
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.5 & §3.6
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
  priceLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CityListResponse {
  cities: City[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─────────────────────────────────────────────
// Activity types
// ─────────────────────────────────────────────

export interface Activity {
  id: string;
  name: string;
  category: string;
  duration?: number | null;
  estimatedCost?: number | null;
  image?: string | null;
  rating?: number | null;
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
  };
}

// ─────────────────────────────────────────────
// City API calls
// ─────────────────────────────────────────────

/** GET /api/cities — Paginated city list */
export function getCities(params?: {
  page?: number;
  limit?: number;
  country?: string;
  search?: string;
}): Promise<CityListResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.country) qs.set("country", params.country);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return apiGet<CityListResponse>(`/cities${query ? `?${query}` : ""}`);
}

/** GET /api/cities/search?q= — Quick city search */
export function searchCities(q: string): Promise<City[]> {
  return apiGet<City[]>(`/cities/search?q=${encodeURIComponent(q)}`);
}

/** GET /api/cities/:cityId — Single city details */
export function getCity(cityId: string): Promise<City> {
  return apiGet<City>(`/cities/${cityId}`);
}

// ─────────────────────────────────────────────
// Activity API calls
// ─────────────────────────────────────────────

/** GET /api/activities — Filtered activity list */
export function getActivities(params?: {
  cityId?: string;
  category?: string;
  maxCost?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ActivityListResponse> {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set("cityId", params.cityId);
  if (params?.category) qs.set("category", params.category);
  if (params?.maxCost !== undefined) qs.set("maxCost", String(params.maxCost));
  if (params?.search) qs.set("search", params.search);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiGet<ActivityListResponse>(`/activities${query ? `?${query}` : ""}`);
}

/** GET /api/activities/:activityId — Activity details */
export function getActivity(activityId: string): Promise<Activity> {
  return apiGet<Activity>(`/activities/${activityId}`);
}
