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
  user?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  tripCities?: TripCity[];
  tripMembers?: TripMember[];
  _count?: {
    tripCities?: number;
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
export async function getTrips(): Promise<Trip[]> {
  const data = await apiGet<{ trips: Trip[] }>("/trips");
  return data.trips;
}

/** GET /api/trips/:tripId */
export async function getTrip(tripId: string): Promise<Trip> {
  const data = await apiGet<{ trip: Trip }>(`/trips/${tripId}`);
  return data.trip;
}

/** POST /api/trips — Create a new trip */
export async function createTrip(data: CreateTripInput): Promise<Trip> {
  const dataRes = await apiPost<{ trip: Trip }>("/trips", data);
  return dataRes.trip;
}

/** PUT /api/trips/:tripId — Update trip metadata */
export async function updateTrip(
  tripId: string,
  data: UpdateTripInput
): Promise<Trip> {
  const dataRes = await apiPut<{ trip: Trip }>(`/trips/${tripId}`, data);
  return dataRes.trip;
}

/** DELETE /api/trips/:tripId — Delete a trip (OWNER only) */
export async function deleteTrip(tripId: string): Promise<void> {
  await apiDelete<{ id: string }>(`/trips/${tripId}`);
}

// ─────────────────────────────────────────────
// Trip City (multi-destination route)
// ─────────────────────────────────────────────

/** GET /api/trips/:tripId/cities — Get ordered city route */
export async function getTripCities(tripId: string): Promise<TripCity[]> {
  const data = await apiGet<{ tripCities: TripCity[] }>(`/trips/${tripId}/cities`);
  return data.tripCities;
}

/** POST /api/trips/:tripId/cities — Add a city stop */
export async function addCityToTrip(
  tripId: string,
  data: { cityId: string; arrivalDate?: string; departureDate?: string }
): Promise<TripCity> {
  const dataRes = await apiPost<{ tripCity: TripCity }>(`/trips/${tripId}/cities`, data);
  return dataRes.tripCity;
}

/** DELETE /api/trips/:tripId/cities/:cityId — Remove a city stop */
export async function removeCityFromTrip(
  tripId: string,
  cityId: string
): Promise<void> {
  await apiDelete<{ tripId: string; cityId: string }>(`/trips/${tripId}/cities/${cityId}`);
}

/** PUT /api/trips/:tripId/cities/reorder — Reorder city stops */
export async function reorderTripCities(
  tripId: string,
  cityIds: string[]
): Promise<TripCity[]> {
  const dataRes = await apiPut<{ tripCities: TripCity[] }>(`/trips/${tripId}/cities/reorder`, { cityIds });
  return dataRes.tripCities;
}

