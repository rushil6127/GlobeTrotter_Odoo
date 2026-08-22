/**
 * GlobeTrotter — Trips API Module
 *
 * Covers GET/POST/PUT/DELETE /api/trips and /api/trips/:tripId/cities
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.3–3.4
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Types — matching backend response shapes
// ─────────────────────────────────────────────

export interface TripCity {
  id: string;
  order: number;
  arrivalDate?: string | null;
  departureDate?: string | null;
  city: {
    id: string;
    name: string;
    country: string;
    image?: string | null;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
}

export interface TripMember {
  id: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface Trip {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tripCities?: TripCity[];
  tripMembers?: TripMember[];
  _count?: {
    itineraryItems?: number;
    expenses?: number;
  };
}

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
}

export interface UpdateTripInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  currency?: string;
}

// ─────────────────────────────────────────────
// Trip CRUD
// ─────────────────────────────────────────────

/** GET /api/trips — List all trips for the authenticated user */
export function getTrips(): Promise<Trip[]> {
  return apiGet<Trip[]>("/trips");
}

/** GET /api/trips/:tripId */
export function getTrip(tripId: string): Promise<Trip> {
  return apiGet<Trip>(`/trips/${tripId}`);
}

/** POST /api/trips — Create a new trip */
export function createTrip(data: CreateTripInput): Promise<Trip> {
  return apiPost<Trip>("/trips", data);
}

/** PUT /api/trips/:tripId — Update trip metadata */
export function updateTrip(
  tripId: string,
  data: UpdateTripInput
): Promise<Trip> {
  return apiPut<Trip>(`/trips/${tripId}`, data);
}

/** DELETE /api/trips/:tripId — Delete a trip (OWNER only) */
export function deleteTrip(tripId: string): Promise<void> {
  return apiDelete<void>(`/trips/${tripId}`);
}

// ─────────────────────────────────────────────
// Trip City (multi-destination route)
// ─────────────────────────────────────────────

/** GET /api/trips/:tripId/cities — Get ordered city route */
export function getTripCities(tripId: string): Promise<TripCity[]> {
  return apiGet<TripCity[]>(`/trips/${tripId}/cities`);
}

/** POST /api/trips/:tripId/cities — Add a city stop */
export function addCityToTrip(
  tripId: string,
  data: { cityId: string; arrivalDate?: string; departureDate?: string }
): Promise<TripCity> {
  return apiPost<TripCity>(`/trips/${tripId}/cities`, data);
}

/** DELETE /api/trips/:tripId/cities/:cityId — Remove a city stop */
export function removeCityFromTrip(
  tripId: string,
  cityId: string
): Promise<void> {
  return apiDelete<void>(`/trips/${tripId}/cities/${cityId}`);
}

/** PUT /api/trips/:tripId/cities/reorder — Reorder city stops */
export function reorderTripCities(
  tripId: string,
  cityIds: string[]
): Promise<TripCity[]> {
  return apiPut<TripCity[]>(`/trips/${tripId}/cities/reorder`, { cityIds });
}
