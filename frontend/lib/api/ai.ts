/**
 * GlobeTrotter — AI Travel Assistant API Module
 *
 * Covers:
 * - POST /api/ai/generate-itinerary (public/authenticated generation)
 * - POST /api/trips/:tripId/itinerary/from-ai (persisting draft items to trip)
 *
 * Contract: backend/FRONTEND_INTEGRATION.md §3.12
 */

import { apiPost } from "@/lib/api/client";
import type { ItineraryResponse } from "@/lib/api/itinerary";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GenerateAiItineraryInput {
  destination: string;
  budget: number;
  days: number;
  style?: string[];
  currency?: string;
  travelers?: number;
}

export interface GeneratedAiItem {
  title: string;
  dayNumber: number;
  startTime?: string;
  endTime?: string;
  estimatedCost?: number;
  notes?: string;
  activityId?: string;
  order?: number;
}

export interface GeneratedAiDay {
  dayNumber: number;
  title: string;
  items: GeneratedAiItem[];
}

export interface GeneratedAiItinerary {
  destination: string;
  summary: string;
  daysCount: number;
  currency: string;
  travelers: number;
  budget: number;
  totalEstimatedCost: number;
  budgetStatus: "WITHIN_BUDGET" | "OVER_BUDGET" | "CLOSE_TO_LIMIT";
  budgetBreakdown?: {
    transport: number;
    food: number;
    activities: number;
    accommodation: number;
    shopping: number;
    other: number;
  };
  routeOrder: string[];
  suggestedActivities?: Array<{
    id: string;
    name: string;
    category: string;
    duration: number;
    cost: number;
  }>;
  days: GeneratedAiDay[];
}

export interface SaveAiItineraryInput {
  items: Array<{
    title: string;
    dayNumber: number;
    startTime?: string;
    endTime?: string;
    estimatedCost?: number;
    notes?: string;
    activityId?: string;
    order?: number;
  }>;
}

// ─────────────────────────────────────────────
// Methods
// ─────────────────────────────────────────────

/**
 * Generate intelligent day-wise itinerary matching destination and preferences.
 * Does NOT auto-save to database — returns preview draft for customization.
 */
export async function generateAiItinerary(
  input: GenerateAiItineraryInput
): Promise<GeneratedAiItinerary> {
  return apiPost<GeneratedAiItinerary>("/ai/generate-itinerary", input);
}

/**
 * Persist finalized AI itinerary items into a trip database.
 */
export async function saveAiItineraryToTrip(
  tripId: string,
  input: SaveAiItineraryInput
): Promise<ItineraryResponse> {
  return apiPost<ItineraryResponse>(`/trips/${tripId}/itinerary/from-ai`, input);
}
