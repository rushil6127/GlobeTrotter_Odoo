/**
 * GlobeTrotter — Trip Sharing & Public Views API Module
 *
 * Covers:
 * - GET /api/trips/:tripId/share (authenticated)
 * - POST /api/trips/:tripId/share (authenticated)
 * - DELETE /api/trips/:tripId/share (authenticated)
 * - GET /api/shared/:shareId (public, unauthenticated)
 *
 * Contract: backend/FRONTEND_INTEGRATION.md §3.9
 */

import { apiGet, apiPost, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ShareLink {
  id: string;
  tripId: string;
  shareKey: string;
  shareUrl: string;
  expiresAt: string | null;
  isActive: boolean;
  isExpired?: boolean;
  createdAt: string;
}

export interface TripShareStatusResponse {
  isShared: boolean;
  shareLink: ShareLink | null;
}

export interface CreateShareLinkInput {
  expiresAt?: string;
  regenerate?: boolean;
}

export interface PublicTrip {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  currency: string;
  createdAt: string;
}

export interface PublicOrganizer {
  name: string;
  avatar: string | null;
}

export interface PublicCityStop {
  id: string;
  order: number;
  arrivalDate: string | null;
  departureDate: string | null;
  city: {
    id: string;
    name: string;
    country: string;
    image: string | null;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface PublicItineraryItem {
  id: string;
  dayNumber: number;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  title: string;
  notes: string | null;
  activity?: {
    id: string;
    name: string;
    category: string;
    duration: number | null;
    image: string | null;
    city?: {
      id: string;
      name: string;
      country: string;
    };
  } | null;
}

export interface PublicDay {
  dayNumber: number;
  date: string | null;
  itemsCount: number;
  items: PublicItineraryItem[];
}

export interface PublicSharedTrip {
  trip: PublicTrip;
  organizer: PublicOrganizer;
  cities: PublicCityStop[];
  itinerary: PublicItineraryItem[];
  days: PublicDay[];
}

// ─────────────────────────────────────────────
// Methods
// ─────────────────────────────────────────────

/**
 * Check active share status for a trip (authenticated owner/editor)
 */
export async function getTripShareStatus(tripId: string): Promise<TripShareStatusResponse> {
  return apiGet<TripShareStatusResponse>(`/api/trips/${tripId}/share`);
}

/**
 * Generate or retrieve an active share link for a trip
 */
export async function createShareLink(
  tripId: string,
  input?: CreateShareLinkInput
): Promise<{ shareLink: ShareLink }> {
  return apiPost<{ shareLink: ShareLink }>(`/api/trips/${tripId}/share`, input);
}

/**
 * Revoke sharing for a trip (deactivates public links)
 */
export async function revokeShareLink(
  tripId: string
): Promise<{ tripId: string; isShared: boolean; revokedCount?: number }> {
  return apiDelete<{ tripId: string; isShared: boolean; revokedCount?: number }>(
    `/api/trips/${tripId}/share`
  );
}

/**
 * Public retrieval of shared trip details using shareKey (unauthenticated)
 */
export async function getPublicSharedTrip(shareId: string): Promise<PublicSharedTrip> {
  return apiGet<PublicSharedTrip>(`/api/shared/${shareId}`);
}
