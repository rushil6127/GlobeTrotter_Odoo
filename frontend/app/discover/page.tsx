"use client";

import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { getCities, getActivities, type CityListResponse, type ActivityListResponse } from "@/lib/api/cities";
import { Globe, Zap, ChevronRight, Map, Activity, Star, Compass, Sparkles, MapPin, DollarSign } from "lucide-react";

export default function DiscoverPage() {
  const { user } = useAuth();
  const { data: cityData, isLoading: citiesLoading } = useApiData<CityListResponse>(
    () => getCities({ page: 1, limit: 6 }),
    []
  );
  const { data: actData, isLoading: actsLoading } = useApiData<ActivityListResponse>(
    () => getActivities({ page: 1, limit: 6, sortBy: "estimatedCost", sortOrder: "asc" }),
    []
  );

  return (
    <PageShell currentPath="/discover" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto pt-2 md:pt-4 pb-32 space-y-10">
        {/* Hero Search & Inspiration Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-neutral-200/60 group">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop&q=80"
            alt="Discover"
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-neutral-950/60 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
            <Badge variant="accent" size="sm" dot className="self-start mb-3 shadow-sm">
              Explore Destinations
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-display font-bold leading-tight drop-shadow-sm">
              Discover the World
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-2 max-w-lg leading-relaxed">
              Explore iconic cities, curated experiences, and add them directly to your custom travel itineraries.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/discover/cities">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Globe className="h-4 w-4" />}
                  className="bg-white text-primary hover:bg-neutral-100 shadow-md font-bold"
                >
                  Explore Cities
                </Button>
              </Link>
              <Link href="/discover/activities">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                  className="border-white/40 text-white hover:bg-white/15 backdrop-blur-sm font-semibold"
                >
                  Browse Activities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Destinations Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Top Destinations
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Explore cities curated for unforgettable travel</p>
            </div>
            <Link
              href="/discover/cities"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              View all cities <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {citiesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={140} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {(cityData?.cities ?? []).map((city) => (
                <Link key={city.id} href={`/discover/activities?cityId=${city.id}`}>
                  <div className="group relative h-36 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-neutral-200/60 hover:-translate-y-1">
                    <img
                      src={
                        city.image ??
                        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop&q=70"
                      }
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/20 to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <p className="text-white text-xs font-bold text-center leading-tight drop-shadow-sm line-clamp-1">
                        {city.name}
                      </p>
                      <p className="text-[10px] text-white/80 text-center font-medium line-clamp-1 mt-0.5">
                        {city.country}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Popular Activities Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> Popular Activities & Sights
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Find things to do, taste, and experience</p>
            </div>
            <Link
              href="/discover/activities"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              View all activities <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {actsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={130} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {(actData?.activities ?? []).map((act) => (
                <Link key={act.id} href={`/discover/activities?cityId=${act.city.id}`}>
                  <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-neutral-200/70 p-4 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 cursor-pointer">
                    <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-neutral-100 shadow-sm">
                      <img
                        src={
                          act.image ??
                          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&auto=format&fit=crop&q=70"
                        }
                        alt={act.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {act.name}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        {act.city.name}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {act.category}
                        </span>
                        {act.estimatedCost != null && (
                          <span className="text-xs text-neutral-800 font-bold">
                            {act.estimatedCost === 0 ? "Free" : `₹${act.estimatedCost.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Fast Shortcuts */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
          <Link href="/trips/new">
            <div className="group bg-gradient-to-br from-primary-50 to-white border border-primary/20 rounded-3xl p-6 sm:p-8 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20 mb-4 group-hover:scale-110 transition-transform">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-neutral-900 text-lg">Plan a New Trip</h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                Create custom multi-destination routes, set your budget, and build daily itineraries from scratch.
              </p>
            </div>
          </Link>

          <Link href="/discover/cities">
            <div className="group bg-gradient-to-br from-accent-50 to-white border border-accent/20 rounded-3xl p-6 sm:p-8 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-md shadow-accent/20 mb-4 group-hover:scale-110 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-neutral-900 text-lg">Browse All Cities</h3>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                Filter destinations by country, explore top sights, and add stops to your active adventures.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
