/**
 * GlobeTrotter — Collaboration, Members, Voting & Comments API Module
 *
 * Covers:
 * - Collaborators: GET/POST /api/trips/:tripId/members, PUT/DELETE /api/trips/:tripId/members/:memberId
 * - Activity Voting: POST/DELETE /api/trips/:tripId/activities/:activityId/vote
 * - Trip & Activity Comments: GET/POST /api/trips/:tripId/comments
 * - Activity Suggestions: POST /api/trips/:tripId/activities/:activityId/suggest
 *
 * Contract: backend/FRONTEND_INTEGRATION.md §3.10, §3.11
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MemberRole = "OWNER" | "EDITOR" | "VIEWER";

export interface TripMemberUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  user: TripMemberUser;
}

export interface TripMembersResponse {
  tripId: string;
  tripName: string;
  owner: TripMemberUser;
  members: TripMember[];
}

export interface InviteMemberInput {
  email: string;
  role?: "EDITOR" | "VIEWER";
}

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  score: number;
  totalVotes: number;
}

export interface ActivityVote {
  id: string;
  tripId: string;
  activityId: string;
  userId: string;
  voteType: "UPVOTE" | "DOWNVOTE";
  user: TripMemberUser;
}

export interface VoteResponse {
  vote?: ActivityVote;
  removed?: boolean;
  stats: VoteStats;
}

export interface TripComment {
  id: string;
  tripId: string;
  userId: string;
  itineraryItemId: string | null;
  text: string;
  createdAt: string;
  user: TripMemberUser;
  itineraryItem?: {
    id: string;
    title: string;
    dayNumber: number;
    date: string | null;
  } | null;
}

export interface GetCommentsResponse {
  tripId: string;
  count: number;
  comments: TripComment[];
}

export interface ActivitySuggestion {
  id: string;
  tripId: string;
  activityId: string;
  userId: string;
  notes?: string | null;
  dayNumber?: number | null;
  date?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  activity: {
    id: string;
    name: string;
    category: string;
    duration: number | null;
    image: string | null;
  };
  user: TripMemberUser;
}

// ─────────────────────────────────────────────
// Methods
// ─────────────────────────────────────────────

/**
 * Retrieve all collaborators for a trip
 */
export async function getTripMembers(tripId: string): Promise<TripMembersResponse> {
  return apiGet<TripMembersResponse>(`/trips/${tripId}/members`);
}

/**
 * Invite a collaborator by email (OWNER only)
 */
export async function inviteTripMember(
  tripId: string,
  input: InviteMemberInput
): Promise<{ member: TripMember }> {
  return apiPost<{ member: TripMember }>(`/trips/${tripId}/members`, input);
}

/**
 * Update member role (OWNER only)
 */
export async function updateTripMemberRole(
  tripId: string,
  memberId: string,
  role: "EDITOR" | "VIEWER"
): Promise<{ member: TripMember }> {
  return apiPut<{ member: TripMember }>(`/trips/${tripId}/members/${memberId}`, { role });
}

/**
 * Remove collaborator from trip (OWNER only)
 */
export async function removeTripMember(
  tripId: string,
  memberId: string
): Promise<{ id: string; tripId: string; userId: string }> {
  return apiDelete<{ id: string; tripId: string; userId: string }>(
    `/trips/${tripId}/members/${memberId}`
  );
}

/**
 * Cast or change vote on an activity
 */
export async function voteActivity(
  tripId: string,
  activityId: string,
  voteType: "UPVOTE" | "DOWNVOTE"
): Promise<VoteResponse> {
  return apiPost<VoteResponse>(`/trips/${tripId}/activities/${activityId}/vote`, { voteType });
}

/**
 * Remove user's vote on an activity
 */
export async function removeVote(
  tripId: string,
  activityId: string
): Promise<VoteResponse> {
  return apiDelete<VoteResponse>(`/trips/${tripId}/activities/${activityId}/vote`);
}

/**
 * Fetch trip or itinerary comments
 */
export async function getTripComments(
  tripId: string,
  itineraryItemId?: string
): Promise<GetCommentsResponse> {
  const query = itineraryItemId ? `?itineraryItemId=${encodeURIComponent(itineraryItemId)}` : "";
  return apiGet<GetCommentsResponse>(`/trips/${tripId}/comments${query}`);
}

/**
 * Post a new trip or itinerary comment
 */
export async function createTripComment(
  tripId: string,
  input: { text: string; itineraryItemId?: string }
): Promise<{ comment: TripComment }> {
  return apiPost<{ comment: TripComment }>(`/trips/${tripId}/comments`, input);
}

/**
 * Suggest an activity for the trip
 */
export async function suggestActivity(
  tripId: string,
  activityId: string,
  input?: { notes?: string; dayNumber?: number; date?: string }
): Promise<{ suggestion: ActivitySuggestion }> {
  return apiPost<{ suggestion: ActivitySuggestion }>(
    `/trips/${tripId}/activities/${activityId}/suggest`,
    input || {}
  );
}
