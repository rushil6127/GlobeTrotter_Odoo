"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Loader";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  getTrip,
  updateTrip,
  deleteTrip,
  getTripCities,
  addCityToTrip,
  removeCityFromTrip,
  reorderTripCities,
  type Trip,
  type TripCity,
} from "@/lib/api/trips";
import { searchCities, type City } from "@/lib/api/cities";
import {
  CalendarDays,
  MapPin,
  DollarSign,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  ExternalLink,
  Users,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Plane,
  Clock,
  Wallet,
  Compass,
  Sparkles,
} from "lucide-react";

/* ── helpers ── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c;
}

function getDays(s: string, e: string) {
  return Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1);
}

/* ── City Search Row ── */
function CitySearchPanel({
  tripId,
  existingCityIds,
  tripStart,
  tripEnd,
  onAdded,
}: {
  tripId: string;
  existingCityIds: string[];
  tripStart: string;
  tripEnd: string;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setSearching(true);
    setIsOpen(true);
    try {
      const cities = await searchCities(trimmed);
      setResults(cities || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  async function handleAdd(city: City) {
    setAdding(city.id);
    setAddError("");
    try {
      await addCityToTrip(tripId, { cityId: city.id });
      setResults([]);
      setQuery("");
      setIsOpen(false);
      onAdded();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Could not add city.");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="relative space-y-2">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search cities to add destination stop (e.g. London, Paris, Tokyo, Dubai)…"
          value={query}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            doSearch(val);
          }}
          className="w-full h-11 pl-10 pr-10 rounded-2xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white shadow-sm transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Floating Dropdown Popup */}
        {isOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-neutral-200/90 bg-white/98 backdrop-blur-xl shadow-2xl divide-y divide-neutral-100 max-h-72 overflow-y-auto z-40 animate-in fade-in slide-in-from-top-1 duration-150">
            {searching ? (
              <div className="flex items-center gap-2 p-4 text-sm text-neutral-500">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Searching destinations for &ldquo;{query}&rdquo;...</span>
              </div>
            ) : results.length > 0 ? (
              results.map((city) => {
                const already = existingCityIds.includes(city.id);
                return (
                  <div
                    key={city.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50/90 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {city.image ? (
                        <img
                          src={city.image}
                          alt={city.name}
                          className="h-10 w-10 rounded-xl object-cover shrink-0 border border-neutral-100"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">{city.name}</p>
                        <p className="text-xs text-neutral-500 font-medium truncate">{city.country}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={already ? "ghost" : "primary"}
                      disabled={already || adding === city.id}
                      loading={adding === city.id}
                      onClick={() => handleAdd(city)}
                      className="shrink-0 ml-2"
                    >
                      {already ? "Added" : "Add Stop"}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-neutral-500">
                <p className="font-medium text-neutral-700">No destinations found</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Try searching for London, Paris, Tokyo, Dubai, Rome, Amsterdam, etc.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {addError && <p className="text-xs text-red-600 font-medium px-1">{addError}</p>}
    </div>
  );
}

/* ── Cities List ── */
function CitiesList({
  tripId,
  tripStart,
  tripEnd,
  cities,
  onRefresh,
  canEdit,
}: {
  tripId: string;
  tripStart: string;
  tripEnd: string;
  cities: TripCity[];
  onRefresh: () => void;
  canEdit: boolean;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleRemove(cityId: string) {
    setRemoving(cityId);
    try {
      await removeCityFromTrip(tripId, cityId);
      onRefresh();
    } catch {
      /* noop */
    } finally {
      setRemoving(null);
    }
  }

  async function handleMove(idx: number, dir: -1 | 1) {
    const next = [...cities];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setReordering(true);
    try {
      await reorderTripCities(
        tripId,
        next.map((c) => c.city.id)
      );
      onRefresh();
    } catch {
      /* noop */
    } finally {
      setReordering(false);
    }
  }

  if (cities.length === 0) {
    return (
      <div className="bg-neutral-50/80 rounded-2xl p-6 text-center border border-dashed border-neutral-200 text-neutral-500 text-sm">
        No destination cities added yet. Use the search bar above to add your first stop.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cities.map((tc, idx) => (
        <div
          key={tc.id}
          className="flex items-center justify-between gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/70 shadow-sm hover:shadow-md transition-all group"
        >
          {/* Index & City Name */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {idx + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-neutral-900 truncate flex items-center gap-1.5">
                {tc.city.name}
                <span className="text-xs text-neutral-400 font-normal">({tc.city.country})</span>
              </p>
              {tc.arrivalDate && (
                <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  {fmtDate(tc.arrivalDate)}
                  {tc.departureDate ? ` – ${fmtDate(tc.departureDate)}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Reorder & Remove Actions */}
          {canEdit && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0 || reordering}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMove(idx, 1)}
                disabled={idx === cities.length - 1 || reordering}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-20 transition-colors"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRemove(tc.city.id)}
                disabled={removing === tc.city.id}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                title="Remove city stop"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Edit Trip Modal ── */
function EditTripModal({
  open,
  onClose,
  trip,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  onSaved: () => void;
}) {
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description ?? "");
  const [budget, setBudget] = useState(String(trip.budget));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateTrip(trip.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        budget: Number(budget) || 0,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update trip.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Trip Details" size="md">
      <form onSubmit={handleSave} className="space-y-4">
        {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
        <Input
          id="trip-name"
          label="Trip Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Trip notes or summary…"
          />
        </div>
        <Input
          id="trip-budget"
          label="Total Budget"
          type="number"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Main Trip Detail Page ── */
export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const { data: trip, isLoading, error, refetch } = useApiData<Trip>(() => getTrip(tripId), [tripId]);
  const { data: citiesData, refetch: refetchCities } = useApiData<TripCity[]>(
    () => getTripCities(tripId),
    [tripId]
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const canEdit = Boolean(trip);
  const cities = citiesData ?? trip?.tripCities ?? [];
  const existingCityIds = cities.map((c) => c.city.id);
  const coverImg =
    cities[0]?.city?.image ||
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80";
  const duration = trip ? getDays(trip.startDate, trip.endDate) : 0;
  const sym = trip ? currencySymbol(trip.currency) : "₹";

  async function handleDelete() {
    if (!trip) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteTrip(trip.id);
      router.push("/trips");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete trip.");
      setDeleting(false);
    }
  }

  return (
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={260} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton variant="rounded" height={300} className="lg:col-span-2" />
              <Skeleton variant="rounded" height={300} />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {!isLoading && error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/80 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <h3 className="font-bold text-neutral-900">Trip not found</h3>
              <p className="text-xs text-neutral-600 mt-1">{error.message}</p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
                Retry
              </Button>
              <Button variant="primary" onClick={() => router.push("/trips")}>
                Back to Trips
              </Button>
            </div>
          </div>
        )}

        {/* Loaded View */}
        {!isLoading && !error && trip && (
          <>
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-neutral-200/60 group">
              <div className="relative h-64 sm:h-80 overflow-hidden">
                <img
                  src={coverImg}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/40 to-transparent" />

                {/* Top Action Bar */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge variant="primary" size="sm" dot>
                    {duration} Days Adventure
                  </Badge>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={() => setEditOpen(true)}
                        className="bg-white/90 backdrop-blur-md shadow-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => setDeleteOpen(true)}
                        className="shadow-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <h1 className="text-2xl sm:text-4xl font-display font-bold leading-tight drop-shadow-sm">
                    {trip.name}
                  </h1>
                  {trip.description && (
                    <p className="text-sm sm:text-base text-white/90 max-w-2xl line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-white/80 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-primary-300" />
                      {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}
                    </span>
                    {trip.budget > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-secondary-300" />
                        {sym}
                        {trip.budget.toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-accent-300" />
                      {cities.length} {cities.length === 1 ? "Stop" : "Stops"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              <Link
                href={`/trips/${trip.id}`}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-sm shrink-0"
              >
                Overview & Stops
              </Link>
              <Link
                href={`/trips/${trip.id}/itinerary`}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <Clock className="h-4 w-4 text-primary" />
                Day-by-Day Itinerary
              </Link>
              <Link
                href={`/trips/${trip.id}/budget`}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0 flex items-center gap-1.5"
              >
                <Wallet className="h-4 w-4 text-primary" />
                Budget &amp; Expenses
              </Link>
            </div>

            {/* 2-Column Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Route Stops Management */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-neutral-900">Destination Stops</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Build your multi-city travel itinerary. Reorder stops to organize your travel route.
                    </p>
                  </div>

                  {/* Add City Search */}
                  {canEdit && (
                    <CitySearchPanel
                      tripId={trip.id}
                      existingCityIds={existingCityIds}
                      tripStart={trip.startDate}
                      tripEnd={trip.endDate}
                      onAdded={() => {
                        refetchCities();
                        refetch();
                      }}
                    />
                  )}

                  {/* Stops List */}
                  <CitiesList
                    tripId={trip.id}
                    tripStart={trip.startDate}
                    tripEnd={trip.endDate}
                    cities={cities}
                    onRefresh={() => {
                      refetchCities();
                      refetch();
                    }}
                    canEdit={canEdit}
                  />
                </div>
              </div>

              {/* Right Column: Quick Action Cards */}
              <div className="space-y-6">
                {/* Itinerary CTA Card */}
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl border border-primary/20 p-6 shadow-sm space-y-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base">Schedule Activities</h3>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Plan Day 1, Day 2, and beyond. Add sights, food tours, and excursions.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => router.push(`/trips/${trip.id}/itinerary`)}
                  >
                    Open Itinerary
                  </Button>
                </div>

                {/* Budget CTA Card — Coming Soon */}
                <div className="bg-neutral-50/80 rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-4 opacity-60">
                  <div className="h-10 w-10 rounded-2xl bg-neutral-200 text-neutral-400 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-500 text-base">Budget & Expenses</h3>
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-neutral-200 text-neutral-400 px-1.5 py-0.5 rounded-md">
                        Soon
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      Track trip spending and optimize your budget. Coming in a future release.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    disabled
                    className="cursor-not-allowed opacity-50"
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Trip Modal */}
      {trip && (
        <EditTripModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          trip={trip}
          onSaved={refetch}
        />
      )}

      {/* Delete Trip Confirm Modal */}
      {trip && (
        <ConfirmModal
          open={deleteOpen}
          title={`Delete "${trip.name}"?`}
          message="Are you sure you want to delete this trip? All linked itinerary items, destinations, and logged expenses will be permanently removed."
          confirmLabel="Delete Trip"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => {
            setDeleteOpen(false);
            setDeleteError("");
          }}
        />
      )}
    </PageShell>
  );
}
