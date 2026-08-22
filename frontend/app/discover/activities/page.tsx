"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getActivities, type Activity, type ActivityListResponse } from "@/lib/api/cities";
import { getCities, type City } from "@/lib/api/cities";
import { getTrips, getTripCities, type Trip, type TripCity } from "@/lib/api/trips";
import { createItineraryItem } from "@/lib/api/itinerary";
import {
  Search, Filter, Clock, DollarSign, Plus, Check, X, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, SlidersHorizontal, ArrowLeft,
} from "lucide-react";

const CATEGORIES = ["All", "Sightseeing", "Food", "Adventure", "Water Sports", "Culture", "Shopping"];

/* ── Add to Itinerary Modal ── */
function AddToItineraryModal({
  activity,
  open,
  onClose,
}: {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: trips, isLoading: tripsLoading } = useApiData<Trip[]>(() => getTrips(), []);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [selectedDay, setSelectedDay] = useState(1);
  const [totalDays, setTotalDays] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [addedTripId, setAddedTripId] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedTrip("");
      setSelectedDay(1);
      setTotalDays(1);
      setStartTime("");
      setEndTime("");
      setAdded(false);
      setError("");
    }
  }, [open]);

  async function handleTripSelect(tripId: string) {
    setSelectedTrip(tripId);
    if (!tripId) return;
    try {
      const trip = trips?.find((t) => t.id === tripId);
      if (trip) {
        const days = Math.max(1, Math.ceil(
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
        ));
        setTotalDays(days);
        setSelectedDay(1);
      }
    } catch { /* ignore */ }
  }

  async function handleAdd() {
    if (!activity || !selectedTrip) return;
    setAdding(true);
    setError("");
    try {
      await createItineraryItem(selectedTrip, {
        title: activity.name,
        dayNumber: selectedDay,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        estimatedCost: activity.estimatedCost ?? undefined,
        activityId: activity.id,
      });
      setAdded(true);
      setAddedTripId(selectedTrip);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add to itinerary.");
    } finally { setAdding(false); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add to Itinerary`}
      description={activity?.name}
      size="md"
      footer={
        !added ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={adding}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              loading={adding}
              disabled={!selectedTrip}
            >
              Add to Itinerary
            </Button>
          </>
        ) : (
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Link href={`/trips/${addedTripId}/itinerary`}>
              <Button variant="primary">View Itinerary</Button>
            </Link>
          </div>
        )
      }
    >
      {added ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm font-medium text-neutral-900">{activity?.name} added!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tripsLoading ? (
            <Skeleton variant="text" width="100%" height={36} />
          ) : !trips || trips.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-neutral-500">No trips yet. Create a trip first.</p>
              <Link href="/trips/new">
                <Button size="sm" variant="primary">Create Trip</Button>
              </Link>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-neutral-700 block mb-1.5">Select Trip</label>
                <select
                  value={selectedTrip}
                  onChange={(e) => handleTripSelect(e.target.value)}
                  className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Choose a trip —</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {selectedTrip && (
                <>
                  <div>
                    <label className="text-sm font-medium text-neutral-700 block mb-1.5">Day</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>Day {d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="act-start-time"
                      label="Start Time (optional)"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                    <Input
                      id="act-end-time"
                      label="End Time (optional)"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </>
              )}

              {error && <p className="text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ── Activity Card ── */
const catColors: Record<string, string> = {
  Sightseeing: "text-sky-600 bg-sky-50",
  Food: "text-amber-600 bg-amber-50",
  Adventure: "text-orange-600 bg-orange-50",
  "Water Sports": "text-blue-600 bg-blue-50",
  Culture: "text-purple-600 bg-purple-50",
  Shopping: "text-pink-600 bg-pink-50",
};

function ActivityCard({ activity, onAdd }: { activity: Activity; onAdd: (a: Activity) => void }) {
  const catClass = catColors[activity.category] ?? "text-neutral-600 bg-neutral-100";
  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 flex flex-col">
      <div className="relative h-36 overflow-hidden">
        <img
          src={activity.image ?? "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=70"}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={cn("text-xs px-2 py-1 rounded-full font-medium", catClass)}>{activity.category}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-neutral-900 leading-tight line-clamp-2">{activity.name}</h3>
        <p className="text-xs text-neutral-500 mt-0.5">{activity.city.name}, {activity.city.country}</p>
        {activity.description && (
          <p className="text-xs text-neutral-400 mt-2 line-clamp-2 flex-1">{activity.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3">
          {activity.duration && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              {activity.duration >= 60 ? `${Math.floor(activity.duration / 60)}h ${activity.duration % 60 > 0 ? `${activity.duration % 60}m` : ""}` : `${activity.duration}m`}
            </span>
          )}
          {activity.estimatedCost != null && (
            <span className="flex items-center gap-1 text-xs font-medium text-success">
              <DollarSign className="h-3 w-3" />
              {activity.estimatedCost === 0 ? "Free" : `₹${activity.estimatedCost.toLocaleString()}`}
            </span>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="mt-3 w-full"
          onClick={() => onAdd(activity)}
        >
          Add to Itinerary
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
function DiscoverActivitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [cityId, setCityId] = useState(searchParams.get("cityId") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [maxCost, setMaxCost] = useState(searchParams.get("maxCost") ?? "");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [addTarget, setAddTarget] = useState<Activity | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: cities } = useApiData<{ cities: City[] }>(
    () => import("@/lib/api/cities").then((m) => m.getCities({ limit: 100 })),
    []
  );

  const { data: actData, isLoading, error, refetch } = useApiData<ActivityListResponse>(
    () =>
      getActivities({
        cityId: cityId || undefined,
        category: category && category !== "All" ? category : undefined,
        maxCost: maxCost ? parseFloat(maxCost) : undefined,
        page,
        limit: 12,
      }),
    [cityId, category, maxCost, page]
  );

  function clearFilters() {
    setCityId("");
    setCategory("");
    setMaxCost("");
    setPage(1);
  }

  const hasFilters = !!(cityId || (category && category !== "All") || maxCost);

  return (
    <PageShell currentPath="/discover">
      <div className="max-w-6xl mx-auto pt-2 md:pt-6 pb-32 space-y-6">

        {/* Header */}
        <div>
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link href="/discover" className="hover:text-primary transition-colors">Discover</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Activities</span>
          </nav>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Discover Activities</h1>
          <p className="text-neutral-500 mt-1">Find things to do and add them straight to your itinerary.</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search activities…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat === "All" ? "" : cat); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                  (cat === "All" && !category) || category === cat
                    ? "bg-primary text-white shadow-sm"
                    : "bg-white border border-neutral-200 text-neutral-600 hover:border-primary/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {hasFilters ? `(${[cityId, category && category !== "All", maxCost].filter(Boolean).length})` : ""}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 p-4 shadow-sm flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-neutral-600 block mb-1">City</label>
              <select
                value={cityId}
                onChange={(e) => { setCityId(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-neutral-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Cities</option>
                {cities?.cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-xs font-medium text-neutral-600 block mb-1">Max Cost (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={maxCost}
                onChange={(e) => { setMaxCost(e.target.value); setPage(1); }}
                className="w-full h-9 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" leftIcon={<X className="h-3.5 w-3.5" />} onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-neutral-700">{error.message}</p>
            <Button size="sm" variant="outline" leftIcon={<RefreshCw className="h-3 w-3" />} onClick={refetch}>Retry</Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={280} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && actData?.activities.length === 0 && (
          <EmptyState
            variant="activities"
            title="No activities found"
            description="Try adjusting your filters or search for a different city."
            action={hasFilters ? <Button variant="outline" onClick={clearFilters}>Clear Filters</Button> : undefined}
          />
        )}

        {/* Count */}
        {!isLoading && actData && actData.activities.length > 0 && (
          <p className="text-sm text-neutral-500">
            {actData.pagination.total} activit{actData.pagination.total === 1 ? "y" : "ies"} found
          </p>
        )}

        {/* Grid */}
        {!isLoading && actData && actData.activities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {actData.activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                onAdd={(a) => { setAddTarget(a); setAddOpen(true); }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && actData && actData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              disabled={!actData.pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-sm text-neutral-500">
              Page {actData.pagination.page} of {actData.pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              disabled={!actData.pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <AddToItineraryModal
        activity={addTarget}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </PageShell>
  );
}

export default function DiscoverActivitiesPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverActivitiesContent />
    </Suspense>
  );
}
