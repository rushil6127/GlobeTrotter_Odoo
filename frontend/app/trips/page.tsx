"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { TripCard, type TripStatus } from "@/components/cards/TripCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Loader";
import { ConfirmModal } from "@/components/ui/Modal";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { getTrips, deleteTrip, type Trip } from "@/lib/api/trips";
import { Plus, RefreshCw, AlertCircle, Trash2, Map, SortAsc } from "lucide-react";
import { ApiError } from "@/lib/api/client";

/* ── helpers ── */
function tripStatus(t: Trip): TripStatus {
  const now = new Date();
  const start = new Date(t.startDate);
  const end = new Date(t.endDate);
  if (end < now) return "completed";
  if (start <= now && now <= end) return "ongoing";
  return "upcoming";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c;
}
function coverImage(t: Trip) {
  return (t.tripCities?.[0]?.city?.image) ??
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80";
}
function tripDestination(t: Trip) {
  if (t.tripCities && t.tripCities.length > 0)
    return t.tripCities.map((tc) => tc.city.name).join(" → ");
  return "Destination TBD";
}

type SortKey = "date" | "name" | "budget";

export default function TripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: trips, isLoading, error, refetch } = useApiData<Trip[]>(() => getTrips());
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const sorted = [...(trips ?? [])].sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "budget") return b.budget - a.budget;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteTrip(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete trip.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageShell currentPath="/trips">
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">My Trips</h1>
            <p className="text-neutral-500 mt-1">
              {trips ? `${trips.length} adventure${trips.length === 1 ? "" : "s"} planned` : "Loading…"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 shadow-sm">
              <SortAsc className="h-4 w-4 text-neutral-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-sm text-neutral-700 bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="date">By Date</option>
                <option value="name">By Name</option>
                <option value="budget">By Budget</option>
              </select>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => router.push("/trips/new")}
            >
              New Trip
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-neutral-700 font-medium">{error.message}</p>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && sorted.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 shadow-sm">
            <EmptyState
              variant="trips"
              title="No trips yet"
              description="Start planning your first adventure — create a trip, add cities, build your itinerary."
              action={
                <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => router.push("/trips/new")}>
                  Plan a Trip
                </Button>
              }
            />
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((trip) => (
              <div key={trip.id} className="relative group/card">
                <TripCard
                  coverImage={coverImage(trip)}
                  name={trip.name}
                  destination={tripDestination(trip)}
                  startDate={fmtDate(trip.startDate)}
                  endDate={fmtDate(trip.endDate)}
                  citiesCount={trip._count?.tripCities ?? trip.tripCities?.length ?? 0}
                  activitiesCount={trip._count?.itineraryItems ?? 0}
                  status={tripStatus(trip)}
                  budget={trip.budget}
                  currency={currencySymbol(trip.currency)}
                  members={trip.tripMembers?.map((m) => ({ name: m.user?.name ?? "", avatar: m.user?.avatar ?? undefined }))}
                  onView={() => router.push(`/trips/${trip.id}`)}
                />
                {/* Owner-only delete */}
                {user?.id === trip.userId && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(trip); }}
                    className={cn(
                      "absolute top-14 right-3 h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm",
                      "flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50",
                      "opacity-0 group-hover/card:opacity-100 transition-all duration-200 shadow-sm z-10"
                    )}
                    title="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {/* Add card */}
            <button
              onClick={() => router.push("/trips/new")}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-10 rounded-2xl",
                "border-2 border-dashed border-neutral-200 hover:border-primary/40",
                "bg-white/50 hover:bg-primary/5 transition-all duration-300 text-neutral-400 hover:text-primary",
                "group min-h-[200px]"
              )}
            >
              <div className="h-12 w-12 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Plan a New Trip</p>
            </button>
          </div>
        )}

        {/* Discover CTA */}
        {!isLoading && !error && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">Find inspiration</p>
              <p className="text-sm text-neutral-500 mt-0.5">Browse cities and activities to add to your trips.</p>
            </div>
            <Link href="/discover" className="shrink-0">
              <Button variant="outline" leftIcon={<Map className="h-4 w-4" />}>Discover</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(""); }}
        onConfirm={handleDelete}
        title="Delete trip"
        message={`Delete "${deleteTarget?.name}"? This will remove all cities, itinerary items, and expenses permanently.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
      {deleteError && (
        <p className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          {deleteError}
        </p>
      )}
    </PageShell>
  );
}
