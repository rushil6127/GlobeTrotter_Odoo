"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AiPlannerModal } from "@/components/ai/AiPlannerModal";
import { Plus, RefreshCw, AlertCircle, Search, SortAsc, Sparkles } from "lucide-react";
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
  return (
    t.tripCities?.[0]?.city?.image ??
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80"
  );
}

function tripDestination(t: Trip) {
  if (t.tripCities && t.tripCities.length > 0)
    return t.tripCities.map((tc) => tc.city.name).join(" → ");
  return "Destination to be planned";
}

type SortKey = "date" | "name" | "budget";
type FilterStatus = "all" | "upcoming" | "ongoing" | "completed";

export default function TripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: trips, isLoading, error, refetch } = useApiData<Trip[]>(() => getTrips());
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const filteredTrips = (trips ?? []).filter((t) => {
    const status = tripStatus(t);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    const dest = tripDestination(t).toLowerCase();
    const name = t.name.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || name.includes(query) || dest.includes(query);
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filteredTrips].sort((a, b) => {
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
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
              My Adventures
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 mt-1">
              {trips ? `Organize and manage your ${trips.length} travel plans` : "Loading your trips…"}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Sparkles className="h-4 w-4 text-amber-500" />}
              onClick={() => setAiPlannerOpen(true)}
              className="bg-gradient-to-r from-amber-50 to-orange-50/70 border-amber-200/90 text-amber-900 shadow-xs font-bold shrink-0"
            >
              Plan with AI
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => router.push("/trips/new")}
              className="shadow-md shadow-primary/20 hover:shadow-lg transition-all shrink-0"
            >
              Plan a New Trip
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["all", "upcoming", "ongoing", "completed"] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0",
                  statusFilter === tab
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search trips or cities…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl px-2.5 h-9 shadow-sm shrink-0">
              <SortAsc className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="text-xs text-neutral-700 bg-transparent border-none outline-none cursor-pointer pr-1"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="budget">Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!isLoading && error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/80 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <h3 className="font-bold text-neutral-900">Failed to load trips</h3>
              <p className="text-xs text-neutral-600 mt-1">{error.message}</p>
            </div>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sorted.length === 0 && (
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 sm:p-14 shadow-sm text-center">
            <EmptyState
              variant="trips"
              title={searchQuery || statusFilter !== "all" ? "No matching trips found" : "No trips yet"}
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query to find your trips."
                  : "Start planning your first adventure — build custom routes, schedule activities, and track budgets."
              }
              action={
                searchQuery || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => router.push("/trips/new")}
                  >
                    Plan Your First Trip
                  </Button>
                )
              }
            />
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && !error && sorted.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((t) => {
              const status = tripStatus(t);
              const members = t.tripMembers?.map((m) => ({
                name: m.user?.name || "Collaborator",
                avatar: m.user?.avatar || undefined,
              }));
              const citiesCount = t.tripCities?.length ?? t._count?.tripCities ?? 1;
              const activitiesCount = t._count?.itineraryItems ?? 0;

              return (
                <TripCard
                  key={t.id}
                  name={t.name}
                  destination={tripDestination(t)}
                  startDate={fmtDate(t.startDate)}
                  endDate={fmtDate(t.endDate)}
                  status={status}
                  budget={t.budget}
                  currency={currencySymbol(t.currency)}
                  coverImage={coverImage(t)}
                  citiesCount={citiesCount}
                  activitiesCount={activitiesCount}
                  members={members}
                  onView={() => router.push(`/trips/${t.id}`)}
                  onMore={() => setDeleteTarget(t)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title={`Delete "${deleteTarget.name}"?`}
          message="Are you sure you want to delete this trip? All linked itinerary items, destinations, and expenses will be permanently removed."
          confirmLabel="Delete Trip"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
        />
      )}

      {/* AI Planner Modal */}
      <AiPlannerModal
        open={aiPlannerOpen}
        onClose={() => setAiPlannerOpen(false)}
        onItinerarySaved={refetch}
      />
    </PageShell>
  );
}
