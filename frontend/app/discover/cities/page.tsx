"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getCities, searchCities, type City, type CityListResponse } from "@/lib/api/cities";
import { getTrips, addCityToTrip, type Trip } from "@/lib/api/trips";
import { Search, Plus, Check, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, MapPin, X } from "lucide-react";

/* ── Add to Trip modal ── */
function AddToTripForm({
  city,
  onClose,
}: {
  city: City | null;
  onClose: () => void;
}) {
  const { data: trips, isLoading } = useApiData<Trip[]>(() => getTrips(), []);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!city || !selectedTrip) return;
    setAdding(true);
    setError("");
    try {
      await addCityToTrip(selectedTrip, { cityId: city.id });
      setAdded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add city.");
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
          <p className="text-base font-bold text-neutral-900">{city?.name} added to your route!</p>
          <p className="text-xs text-neutral-500 mt-1">You can now schedule activities for this destination.</p>
        </div>
        <Link href="/trips" className="text-xs text-primary font-semibold hover:underline pt-1">
          View Your Trips →
        </Link>
        <div className="pt-3 w-full flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          <CardSkeleton />
        </div>
      ) : !trips || trips.length === 0 ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-neutral-500">You don&apos;t have any trips yet. Create one first!</p>
          <Link href="/trips/new">
            <Button size="sm" variant="primary">
              Create a Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700">Choose Destination Trip</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {trips.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrip(t.id)}
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
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <Button variant="ghost" onClick={onClose} disabled={adding}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAdd} loading={adding} disabled={!selectedTrip}>
          Add Stop
        </Button>
      </div>
    </div>
  );
}

function AddToTripModal({
  city,
  open,
  onClose,
}: {
  city: City | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!open || !city) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${city.name} to a Trip`}
      size="sm"
    >
      <AddToTripForm city={city} onClose={onClose} />
    </Modal>
  );
}

/* ── City Card in Grid ── */
function DiscoverCityCard({ city, onAdd }: { city: City; onAdd: (city: City) => void }) {
  return (
    <div className="group bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative h-44 overflow-hidden shrink-0">
          <img
            src={
              city.image ??
              `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=70`
            }
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between">
            <div>
              <h3 className="font-display font-bold text-white text-lg leading-tight drop-shadow-sm">
                {city.name}
              </h3>
              <p className="text-white/90 text-xs font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-primary-300" />
                {city.country}
              </p>
            </div>
            {city._count?.activities != null && (
              <Badge variant="default" size="sm" className="bg-white/20 text-white border-0 backdrop-blur-md">
                {city._count.activities} sights
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          {city.description && (
            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {city.description}
            </p>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2 border-t border-neutral-100 mt-2">
        <Link href={`/discover/activities?cityId=${city.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth className="text-xs font-semibold">
            Explore Activities
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => onAdd(city)}
          className="text-xs font-bold shrink-0 shadow-sm"
        >
          Add Stop
        </Button>
      </div>
    </div>
  );
}

/* ── Main Cities Page ── */
export default function DiscoverCitiesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addModalCity, setAddModalCity] = useState<City | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const {
    data: cityData,
    isLoading,
    error,
    refetch,
  } = useApiData<CityListResponse>(
    async () => {
      if (debouncedSearch) {
        const results = await searchCities(debouncedSearch);
        return {
          cities: results,
          pagination: {
            page: 1,
            limit: results.length,
            total: results.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
      return getCities({ page, limit: 9 });
    },
    [page, debouncedSearch]
  );

  const cities = cityData?.cities ?? [];
  const pagination = cityData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <PageShell currentPath="/discover" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
          <Link href="/discover" className="hover:text-primary transition-colors">
            Discover
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Destinations</span>
        </div>

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
              Explore Destinations
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Find iconic cities, coastal towns, and cultural hubs to add to your journey
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search cities or countries…"
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
              <h3 className="font-bold text-neutral-900">Failed to load cities</h3>
              <p className="text-xs text-neutral-600 mt-1">{error.message}</p>
            </div>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && cities.length === 0 && (
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 sm:p-14 shadow-sm text-center">
            <EmptyState
              variant="search"
              title="No cities found"
              description={`We couldn't find any destinations matching "${search}". Try searching for another city.`}
              action={
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              }
            />
          </div>
        )}

        {/* Cities Grid */}
        {!isLoading && !error && cities.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <DiscoverCityCard
                  key={city.id}
                  city={city}
                  onAdd={(c) => setAddModalCity(c)}
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
      </div>

      {/* Add To Trip Modal */}
      <AddToTripModal
        city={addModalCity}
        open={Boolean(addModalCity)}
        onClose={() => setAddModalCity(null)}
      />
    </PageShell>
  );
}
