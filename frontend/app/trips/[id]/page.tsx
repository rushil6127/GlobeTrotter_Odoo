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
  getTrip, updateTrip, deleteTrip, getTripCities, addCityToTrip,
  removeCityFromTrip, reorderTripCities, type Trip, type TripCity,
} from "@/lib/api/trips";
import { searchCities, type City } from "@/lib/api/cities";
import {
  CalendarDays, MapPin, DollarSign, Pencil, Trash2, Plus, Search,
  GripVertical, X, ExternalLink, Users, ArrowRight, AlertCircle, RefreshCw,
  Plane, Map,
} from "lucide-react";

/* ── helpers ── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c;
}
function getDays(s: string, e: string) {
  return Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000));
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

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const cities = await searchCities(q);
      setResults(cities);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, []);

  async function handleAdd(city: City) {
    setAdding(city.id);
    setAddError("");
    try {
      await addCityToTrip(tripId, { cityId: city.id });
      setResults([]);
      setQuery("");
      onAdded();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Could not add city.");
    } finally { setAdding(null); }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cities to add…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); doSearch(e.target.value); }}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      {addError && <p className="text-xs text-red-600">{addError}</p>}
      {(searching || results.length > 0) && (
        <div className="rounded-xl border border-neutral-100 bg-white shadow-lg divide-y divide-neutral-50 max-h-64 overflow-y-auto">
          {searching && <p className="text-sm text-neutral-400 p-3">Searching…</p>}
          {results.map((city) => {
            const already = existingCityIds.includes(city.id);
            return (
              <div key={city.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{city.name}</p>
                  <p className="text-xs text-neutral-500">{city.country}</p>
                </div>
                <Button
                  size="sm"
                  variant={already ? "ghost" : "outline"}
                  disabled={already || adding === city.id}
                  loading={adding === city.id}
                  onClick={() => handleAdd(city)}
                >
                  {already ? "Added" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
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
  const [localCities, setLocalCities] = useState<TripCity[]>(cities);

  React.useEffect(() => setLocalCities(cities), [cities]);

  async function handleRemove(cityId: string) {
    setRemoving(cityId);
    try {
      await removeCityFromTrip(tripId, cityId);
      onRefresh();
    } catch { /* error surfaced on refresh */ }
    finally { setRemoving(null); }
  }

  async function moveCity(idx: number, dir: -1 | 1) {
    const next = [...localCities];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setLocalCities(next);
    setReordering(true);
    try {
      await reorderTripCities(tripId, next.map((c) => c.city.id));
      onRefresh();
    } catch { setLocalCities(cities); }
    finally { setReordering(false); }
  }

  if (localCities.length === 0) {
    return (
      <EmptyState
        variant="activities"
        title="No cities yet"
        description="Search for cities and add them to build your route."
      />
    );
  }

  return (
    <div className="space-y-2">
      {localCities.map((tc, idx) => (
        <div
          key={tc.id}
          className="flex items-center gap-3 bg-white rounded-xl border border-neutral-100 px-4 py-3 shadow-sm"
        >
          {canEdit && (
            <div className="flex flex-col gap-0.5 text-neutral-300 shrink-0">
              <button
                onClick={() => moveCity(idx, -1)}
                disabled={idx === 0 || reordering}
                className="hover:text-primary disabled:opacity-30 transition-colors text-xs leading-none"
              >▲</button>
              <button
                onClick={() => moveCity(idx, 1)}
                disabled={idx === localCities.length - 1 || reordering}
                className="hover:text-primary disabled:opacity-30 transition-colors text-xs leading-none"
              >▼</button>
            </div>
          )}
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-neutral-900">{tc.city.name}</p>
            <p className="text-xs text-neutral-500">{tc.city.country}</p>
          </div>
          <div className="text-xs text-neutral-400 hidden sm:block">Stop {idx + 1}</div>
          {canEdit && (
            <button
              onClick={() => handleRemove(tc.city.id)}
              disabled={removing === tc.city.id}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Edit Trip Modal ── */
function EditTripModal({
  trip,
  open,
  onClose,
  onSaved,
}: {
  trip: Trip;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description ?? "");
  const [startDate, setStartDate] = useState(trip.startDate.split("T")[0]);
  const [endDate, setEndDate] = useState(trip.endDate.split("T")[0]);
  const [budget, setBudget] = useState(String(trip.budget));
  const [currency, setCurrency] = useState(trip.currency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await updateTrip(trip.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        budget: parseFloat(budget) || 0,
        currency,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.");
    } finally { setSaving(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Trip" size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input id="edit-name" label="Trip Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="edit-start" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input id="edit-end" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="edit-budget" label="Budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              {["INR","USD","EUR","GBP","JPY","AUD"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      </div>
    </Modal>
  );
}

/* ── Main Page ── */
type Tab = "overview" | "cities" | "itinerary";

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addCityOpen, setAddCityOpen] = useState(false);

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
    refetch: refetchTrip,
  } = useApiData<Trip>(() => getTrip(id), [id]);

  const {
    data: cities,
    isLoading: citiesLoading,
    refetch: refetchCities,
  } = useApiData<TripCity[]>(() => getTripCities(id), [id]);

  const isOwner = user?.id === trip?.userId;
  const canEdit = isOwner || trip?.tripMembers?.some(
    (m) => m.user?.id === user?.id && (m.role === "OWNER" || m.role === "EDITOR")
  );

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTrip(id);
      router.push("/trips");
    } catch { setDeleting(false); }
  }

  /* ── Loading ── */
  if (tripLoading) {
    return (
      <PageShell currentPath="/trips">
        <div className="max-w-5xl mx-auto pt-6 pb-32 space-y-6">
          <Skeleton variant="text" width="40%" height={36} />
          <Skeleton variant="text" width="60%" height={20} />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={80} />
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Error ── */
  if (tripError || !trip) {
    return (
      <PageShell currentPath="/trips">
        <div className="max-w-5xl mx-auto pt-6 pb-32">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-neutral-700">{tripError?.message ?? "Trip not found."}</p>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetchTrip}>Retry</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  const days = getDays(trip.startDate, trip.endDate);
  const sym = currencySymbol(trip.currency);
  const tripCities = cities ?? [];

  return (
    <PageShell currentPath="/trips">
      <div className="max-w-5xl mx-auto pt-2 md:pt-6 pb-32 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/trips" className="hover:text-primary transition-colors">My Trips</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate max-w-[200px]">{trip.name}</span>
        </nav>

        {/* Hero Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-lg overflow-hidden">
          {/* Cover */}
          <div className="relative h-40 md:h-56">
            <img
              src={tripCities[0]?.city?.image ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80"}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-md">{trip.name}</h1>
                {trip.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-1">{trip.description}</p>
                )}
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setDeleteOpen(true)}
                      className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/60 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-100 border-t border-neutral-100">
            {[
              { icon: <CalendarDays className="h-4 w-4 text-primary" />, label: "Dates", value: `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` },
              { icon: <Plane className="h-4 w-4 text-accent" />, label: "Duration", value: `${days} day${days !== 1 ? "s" : ""}` },
              { icon: <MapPin className="h-4 w-4 text-info" />, label: "Cities", value: `${tripCities.length}` },
              { icon: <DollarSign className="h-4 w-4 text-success" />, label: "Budget", value: `${sym}${trip.budget.toLocaleString()}` },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-4 px-3">
                {s.icon}
                <p className="text-xs text-neutral-500">{s.label}</p>
                <p className="text-sm font-semibold text-neutral-900 text-center">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-neutral-100 p-1 shadow-sm w-fit">
          {(["overview", "cities", "itinerary"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200",
                tab === t
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Route preview */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Map className="h-4 w-4 text-primary" /> Route
                </h3>
                <button onClick={() => setTab("cities")} className="text-xs text-primary hover:underline">Edit</button>
              </div>
              {tripCities.length === 0 ? (
                <p className="text-sm text-neutral-400">No cities added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {tripCities.map((tc, i) => (
                    <React.Fragment key={tc.id}>
                      <Badge variant="info" size="sm">{tc.city.name}</Badge>
                      {i < tripCities.length - 1 && <ArrowRight className="h-3 w-3 text-neutral-300 self-center" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Team */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" /> Team
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {trip.user?.name?.[0] ?? "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{trip.user?.name}</p>
                    <p className="text-xs text-neutral-500">{trip.user?.email}</p>
                  </div>
                  <Badge variant="primary" size="sm">Owner</Badge>
                </div>
                {trip.tripMembers?.filter((m) => m.user?.id !== trip.userId).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                      {m.user?.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{m.user?.name}</p>
                    </div>
                    <Badge variant="default" size="sm">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="sm:col-span-2 flex flex-wrap gap-3">
              <Button
                variant="outline"
                leftIcon={<CalendarDays className="h-4 w-4" />}
                onClick={() => router.push(`/trips/${id}/itinerary`)}
              >
                View Itinerary
              </Button>
              <Button
                variant="outline"
                leftIcon={<DollarSign className="h-4 w-4" />}
                onClick={() => router.push(`/trips/${id}/budget`)}
              >
                Budget & Expenses
              </Button>
              <Button
                variant="outline"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => router.push(`/discover/activities`)}
              >
                Discover Activities
              </Button>
            </div>
          </div>
        )}

        {/* Cities Tab */}
        {tab === "cities" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Trip Route</h3>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => setAddCityOpen(!addCityOpen)}
                >
                  Add City
                </Button>
              )}
            </div>

            {addCityOpen && canEdit && (
              <CitySearchPanel
                tripId={id}
                existingCityIds={tripCities.map((tc) => tc.city.id)}
                tripStart={trip.startDate}
                tripEnd={trip.endDate}
                onAdded={() => { refetchCities(); setAddCityOpen(false); }}
              />
            )}

            {citiesLoading ? (
              <div className="space-y-2">
                <Skeleton variant="rounded" height={56} />
                <Skeleton variant="rounded" height={56} />
              </div>
            ) : (
              <CitiesList
                tripId={id}
                tripStart={trip.startDate}
                tripEnd={trip.endDate}
                cities={tripCities}
                onRefresh={refetchCities}
                canEdit={!!canEdit}
              />
            )}
          </div>
        )}

        {/* Itinerary Tab (redirect to full page) */}
        {tab === "itinerary" && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm p-8 text-center space-y-4">
            <CalendarDays className="h-10 w-10 text-primary mx-auto" />
            <h3 className="font-semibold text-neutral-900 text-lg">Day-wise Itinerary</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto">
              Plan your activities day by day, add cost estimates, and reorder items on the full itinerary page.
            </p>
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => router.push(`/trips/${id}/itinerary`)}
            >
              Open Itinerary
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditTripModal
        trip={trip}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={refetchTrip}
      />
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Trip"
        message={`Delete "${trip.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </PageShell>
  );
}
