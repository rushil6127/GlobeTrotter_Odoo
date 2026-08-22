/**
 * GlobeTrotter — Itinerary API Module
 *
 * Covers GET/POST /api/trips/:tripId/itinerary, PUT/DELETE /api/itinerary/:itemId
 * Contract from: backend/FRONTEND_INTEGRATION.md §3.7
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  tripId: string;
  activityId?: string | null;
  dayNumber: number;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  title: string;
  notes?: string | null;
  estimatedCost?: number | null;
  order: number;
  activity?: {
    id: string;
    name: string;
    category: string;
    duration?: number | null;
    image?: string | null;
    estimatedCost?: number | null;
  } | null;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  itemsCount: number;
  dayEstimatedCost: number;
  items: ItineraryItem[];
}

export interface ItineraryResponse {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  days: ItineraryDay[];
  totalItems: number;
  totalEstimatedCost: number;
}

export interface CreateItineraryItemInput {
  title: string;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  estimatedCost?: number;
  notes?: string;
  activityId?: string;
}

export interface UpdateItineraryItemInput {
  title?: string;
  dayNumber?: number;
  startTime?: string;
  endTime?: string;
  estimatedCost?: number;
  notes?: string;
  activityId?: string;
  order?: number;
}

// ─────────────────────────────────────────────
// API calls
// ─────────────────────────────────────────────

/** GET /api/trips/:tripId/itinerary */
export async function getTripItinerary(
  tripId: string,
  dayNumber?: number
): Promise<ItineraryResponse> {
  const qs = dayNumber ? `?dayNumber=${dayNumber}` : "";
  return apiGet<ItineraryResponse>(`/trips/${tripId}/itinerary${qs}`);
}

/** POST /api/trips/:tripId/itinerary */
export async function createItineraryItem(
  tripId: string,
  data: CreateItineraryItemInput
): Promise<ItineraryItem> {
  const res = await apiPost<{ itineraryItem: ItineraryItem }>(
    `/trips/${tripId}/itinerary`,
    data
  );
  return res.itineraryItem;
}

/** PUT /api/trips/:tripId/itinerary/reorder */
export async function reorderItinerary(
  tripId: string,
  itemOrders: { itemId: string; order: number }[]
): Promise<void> {
  await apiPut(`/trips/${tripId}/itinerary/reorder`, { itemOrders });
}

/** PUT /api/itinerary/:itemId */
export async function updateItineraryItem(
  itemId: string,
  data: UpdateItineraryItemInput
): Promise<ItineraryItem> {
  const res = await apiPut<{ itineraryItem: ItineraryItem }>(
    `/itinerary/${itemId}`,
    data
  );
  return res.itineraryItem;
}

/** DELETE /api/itinerary/:itemId */
export async function deleteItineraryItem(itemId: string): Promise<void> {
  await apiDelete(`/itinerary/${itemId}`);
}
