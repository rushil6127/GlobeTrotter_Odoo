"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, CardSkeleton } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getActivities, type Activity, type ActivityListResponse, getCities, type City, type CityListResponse } from "@/lib/api/cities";
import { getTrips, type Trip } from "@/lib/api/trips";
import { createItineraryItem } from "@/lib/api/itinerary";
import { SuggestActivityModal } from "@/components/collaboration/SuggestActivityModal";
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeft,
  MapPin,
  Sparkles,
  Lightbulb,
} from "lucide-react";

const CATEGORIES = ["All", "Sightseeing", "Food", "Adventure", "Water Sports", "Culture", "Shopping"];

/* ── Add to Itinerary Modal ── */
function AddToItineraryForm({
  activity,
  onClose,
}: {
  activity: Activity;
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

  function handleTripSelect(tripId: string) {
    setSelectedTrip(tripId);
    if (!tripId) return;
    try {
      const trip = trips?.find((t) => t.id === tripId);
      if (trip) {
        const days = Math.max(
          1,
          Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1
        );
        setTotalDays(days);
        setSelectedDay(1);
      }
    } catch {
      /* ignore */
    }
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
    } finally {
      setAdding(false);
    }
  }

  if (added) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-success/15 flex items-center justify-center text-success">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <p className="text-base font-bold text-neutral-900">{activity.name} added to Day {selectedDay}!</p>
          <p className="text-xs text-neutral-500 mt-1">This activity is now scheduled in your itinerary.</p>
        </div>
        <div className="flex gap-3 pt-3">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Link href={`/trips/${addedTripId}/itinerary`}>
            <Button variant="primary">View Itinerary</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tripsLoading ? (
        <div className="space-y-2">
          <CardSkeleton />
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm text-neutral-500">No trips yet. Create a trip first.</p>
          <Link href="/trips/new">
            <Button size="sm" variant="primary">
              Create a Trip
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Select Trip</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {trips.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTripSelect(t.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between",
                    selectedTrip === t.id
                      ? "bg-primary/10 border-primary font-bold text-primary"
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                    {t.tripCities?.length ?? t._count?.tripCities ?? 0} stops
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedTrip && (
            <div className="space-y-3 pt-1 border-t border-neutral-100">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Choose Day</label>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDay(i + 1)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                        selectedDay === i + 1
                          ? "bg-primary text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      Day {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="act-start-time"
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                  id="act-end-time"
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <Button variant="ghost" onClick={onClose} disabled={adding}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAdd} loading={adding} disabled={!selectedTrip}>
          Add to Itinerary
        </Button>
      </div>
    </div>
  );
}

function AddToItineraryModal({
  activity,
  open,
  onClose,
}: {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !activity) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add to Itinerary"
      description={activity.name}
      size="md"
    >
      <AddToItineraryForm activity={activity} onClose={onClose} />
    </Modal>
  );
}

/* ── Activity Card in Grid ── */
function DiscoverActivityCard({
  activity,
  onAdd,
  onSuggest,
}: {
  activity: Activity;
  onAdd: (act: Activity) => void;
  onSuggest: (act: Activity) => void;
}) {
  return (
    <div className="group bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative h-44 overflow-hidden shrink-0">
          <img
            src={
              activity.image ??
              `https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=70`
            }
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
          <div className="absolute top-3.5 left-3.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-neutral-800 shadow-sm border border-white/40">
              {activity.category}
            </span>
          </div>
          <div className="absolute bottom-3.5 left-3.5 right-3.5">
            <h3 className="font-display font-bold text-white text-base leading-snug drop-shadow-sm line-clamp-1">
              {activity.name}
            </h3>
            <p className="text-white/90 text-xs font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-primary-300" />
              {activity.city.name}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          {activity.description && (
            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium pt-1">
            {activity.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {activity.duration} mins
              </span>
            )}
            {activity.estimatedCost != null && (
              <span className="font-bold text-neutral-900 ml-auto">
                {activity.estimatedCost === 0 ? "Free" : `₹${activity.estimatedCost.toLocaleString()}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 border-t border-neutral-100 mt-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Lightbulb className="h-3.5 w-3.5 text-amber-500" />}
          onClick={() => onSuggest(activity)}
          className="text-xs font-bold shadow-2xs border-amber-200/90 text-amber-900 bg-amber-50/50 hover:bg-amber-100/60"
        >
          Suggest
        </Button>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => onAdd(activity)}
          className="text-xs font-bold shadow-sm flex-1"
        >
          Add to Trip
        </Button>
      </div>
    </div>
  );
}

/* ── Inner Page Content (Suspense wrapped) ── */
function DiscoverActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCityId = searchParams.get("cityId") ?? "";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cityId, setCityId] = useState(initialCityId);
  const [page, setPage] = useState(1);
  const [addModalAct, setAddModalAct] = useState<Activity | null>(null);
  const [suggestModalAct, setSuggestModalAct] = useState<Activity | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: cityListData } = useApiData<CityListResponse>(() => getCities({ page: 1, limit: 50 }), []);

  const {
    data: actData,
    isLoading,
    error,
    refetch,
  } = useApiData<ActivityListResponse>(
    () =>
      getActivities({
        page,
        limit: 9,
        category: category !== "All" ? category : undefined,
        cityId: cityId || undefined,
      }),
    [page, category, cityId]
  );

  const rawActivities = actData?.activities ?? [];
  const activities = debouncedSearch
    ? rawActivities.filter(
        (a) =>
          a.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          a.city.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : rawActivities;

  const pagination = actData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Link href="/discover" className="hover:text-primary transition-colors">
          Discover
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">Activities</span>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
            Discover Activities
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Curated sightseeing, food tours, outdoor adventures, and hidden gems
          </p>
        </div>

        {/* Search & City Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search activities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 px-3 rounded-2xl border border-neutral-200 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm cursor-pointer"
            >
              <option value="">All Destinations</option>
              {cityListData?.cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
              category === cat
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50"
            )}
          >
            {cat}
          </button>
        ))}
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
            <h3 className="font-bold text-neutral-900">Failed to load activities</h3>
            <p className="text-xs text-neutral-600 mt-1">{error.message}</p>
          </div>
          <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && activities.length === 0 && (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 sm:p-14 shadow-sm text-center">
          <EmptyState
            variant="activities"
            title="No activities found"
            description="Try changing your search keywords or switching category filters."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setCityId("");
                }}
              >
                Reset Filters
              </Button>
            }
          />
        </div>
      )}

      {/* Activities Grid */}
      {!isLoading && !error && activities.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <DiscoverActivityCard
                key={act.id}
                activity={act}
                onAdd={(a) => setAddModalAct(a)}
                onSuggest={(a) => setSuggestModalAct(a)}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft className="h-4 w-4" />}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-neutral-600 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shadow-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight className="h-4 w-4" />}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add To Itinerary Modal */}
      <AddToItineraryModal
        activity={addModalAct}
        open={Boolean(addModalAct)}
        onClose={() => setAddModalAct(null)}
      />

      {/* Suggest Activity Modal */}
      {suggestModalAct && (
        <SuggestActivityModal
          activityId={suggestModalAct.id}
          activityName={suggestModalAct.name}
          open={Boolean(suggestModalAct)}
          onClose={() => setSuggestModalAct(null)}
        />
      )}
    </div>
  );
}

/* ── Main Activity Page Wrapper with Suspense ── */
export default function DiscoverActivitiesPage() {
  const { user } = useAuth();

  return (
    <PageShell currentPath="/discover" userName={user?.name ?? undefined}>
      <Suspense fallback={<CardSkeleton />}>
        <DiscoverActivitiesContent />
      </Suspense>
    </PageShell>
  );
}
