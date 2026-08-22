"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { getCities, searchCities, type City, type CityListResponse } from "@/lib/api/cities";
import { getTrips, addCityToTrip, type Trip } from "@/lib/api/trips";
import { Search, Globe, Plus, Check, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Map } from "lucide-react";

/* ── Add to Trip modal ── */
function AddToTripModal({
  city,
  open,
  onClose,
}: {
  city: City | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: trips, isLoading } = useApiData<Trip[]>(() => getTrips(), []);
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setSelectedTrip(""); setAdded(false); setError(""); }
  }, [open]);

  async function handleAdd() {
    if (!city || !selectedTrip) return;
    setAdding(true);
    setError("");
    try {
      await addCityToTrip(selectedTrip, { cityId: city.id });
      setAdded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add city.");
    } finally { setAdding(false); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add ${city?.name} to a Trip`}
      size="sm"
      footer={
        !added ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={adding}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} loading={adding} disabled={!selectedTrip}>
              Add City
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose}>Done</Button>
        )
      }
    >
      {added ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="h-6 w-6 text-success" />
          </div>
          <p className="text-sm font-medium text-neutral-900">{city?.name} added to trip!</p>
          <Link href="/trips" className="text-xs text-primary hover:underline">View My Trips</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <Skeleton variant="text" width="100%" height={36} />
          ) : !trips || trips.length === 0 ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-neutral-500">No trips yet. Create one first.</p>
              <Link href="/trips/new">
                <Button size="sm" variant="primary">Create Trip</Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-600">Select a trip to add {city?.name}:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrip(t.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all",
                      selectedTrip === t.id
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-neutral-100 hover:border-neutral-200 text-neutral-800"
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ── City Card ── */
function CityCard({ city, onAdd }: { city: City; onAdd: (city: City) => void }) {
  return (
    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img
          src={city.image ?? `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=70`}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="font-bold text-white text-lg leading-tight">{city.name}</h3>
            <p className="text-white/70 text-xs">{city.country}</p>
          </div>
          {city._count?.activities != null && (
            <Badge variant="default" size="sm" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {city._count.activities} activities
            </Badge>
          )}
        </div>
      </div>
      {city.description && (
        <p className="text-xs text-neutral-500 px-4 pt-3 pb-2 line-clamp-2">{city.description}</p>
      )}
      <div className="px-4 pb-4 flex gap-2">
        <Link href={`/discover/activities?cityId=${city.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">Explore Activities</Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => onAdd(city)}
        >
          Add to Trip
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function DiscoverCitiesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<City[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [addTarget, setAddTarget] = useState<City | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults(null); return; }
    setSearching(true);
    searchCities(debouncedQuery)
      .then((r) => setSearchResults(r))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const { data: cityData, isLoading, error, refetch } = useApiData<CityListResponse>(
    () => getCities({ page, limit: 12 }),
    [page]
  );

  const displayCities = searchResults ?? cityData?.cities ?? [];
  const pagination = cityData?.pagination;

  return (
    <PageShell currentPath="/discover">
      <div className="max-w-6xl mx-auto pt-2 md:pt-6 pb-32 space-y-6">

        {/* Header */}
        <div>
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
            <Link href="/discover" className="hover:text-primary transition-colors">Discover</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Cities</span>
          </nav>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Explore Cities</h1>
          <p className="text-neutral-500 mt-1">Find your next destination and add it to a trip.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search cities by name or country…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-neutral-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary border-r-transparent animate-spin" />}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-neutral-700">{error.message}</p>
            <Button size="sm" variant="outline" leftIcon={<RefreshCw className="h-3 w-3" />} onClick={refetch}>Retry</Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && !searchResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={260} />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && displayCities.length === 0 && (
          <EmptyState
            variant="activities"
            title="No cities found"
            description={query ? `No cities match "${query}". Try a different search.` : "No cities available."}
          />
        )}

        {/* Grid */}
        {displayCities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayCities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onAdd={(c) => { setAddTarget(c); setAddOpen(true); }}
              />
            ))}
          </div>
        )}

        {/* Pagination (only for browse, not search) */}
        {!searchResults && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-sm text-neutral-500">Page {pagination.page} of {pagination.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <AddToTripModal
        city={addTarget}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </PageShell>
  );
}
