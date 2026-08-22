"use client";

import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import { getCities, getActivities, type CityListResponse, type ActivityListResponse } from "@/lib/api/cities";
import { Globe, Zap, ChevronRight, Map, Activity, Star } from "lucide-react";

export default function DiscoverPage() {
  const { data: cityData, isLoading: citiesLoading } = useApiData<CityListResponse>(
    () => getCities({ page: 1, limit: 6 }),
    []
  );
  const { data: actData, isLoading: actsLoading } = useApiData<ActivityListResponse>(
    () => getActivities({ page: 1, limit: 6, sortBy: "estimatedCost", sortOrder: "asc" }),
    []
  );

  return (
    <PageShell currentPath="/discover">
      <div className="max-w-6xl mx-auto pt-2 md:pt-6 pb-32 space-y-10">

        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&auto=format&fit=crop&q=80"
            alt="Discover"
            className="w-full h-52 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60 flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Discover the World</h1>
            <p className="text-white/80 mt-2 max-w-md">Explore cities, find activities, and add them directly to your trips.</p>
            <div className="flex gap-3 mt-5">
              <Link href="/discover/cities">
                <Button variant="primary" className="bg-white text-primary hover:bg-white/90" leftIcon={<Globe className="h-4 w-4" />}>
                  Explore Cities
                </Button>
              </Link>
              <Link href="/discover/activities">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10" leftIcon={<Zap className="h-4 w-4" />}>
                  Find Activities
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cities section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Top Destinations
            </h2>
            <Link href="/discover/cities" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {citiesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={120} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(cityData?.cities ?? []).map((city) => (
                <Link key={city.id} href={`/discover/activities?cityId=${city.id}`}>
                  <div className="group relative h-28 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all">
                    <img
                      src={city.image ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop&q=70"}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-0 right-0 px-2">
                      <p className="text-white text-xs font-semibold text-center leading-tight">{city.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Activities section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" /> Popular Activities
            </h2>
            <Link href="/discover/activities" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {actsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} variant="rounded" height={120} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(actData?.activities ?? []).map((act) => (
                <div key={act.id} className="flex items-center gap-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 p-4 shadow-sm hover:shadow-md transition-all group">
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={act.image ?? "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&auto=format&fit=crop&q=70"}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900 line-clamp-1">{act.name}</p>
                    <p className="text-xs text-neutral-500">{act.city.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" size="sm">{act.category}</Badge>
                      {act.estimatedCost != null && (
                        <span className="text-xs text-success font-medium">
                          {act.estimatedCost === 0 ? "Free" : `₹${act.estimatedCost.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href="/discover/activities">
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/trips/new">
            <div className="group bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer">
              <Map className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-neutral-900">Plan a New Trip</h3>
              <p className="text-sm text-neutral-500 mt-1">Create a trip and start building your itinerary.</p>
            </div>
          </Link>
          <Link href="/trips">
            <div className="group bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer">
              <Activity className="h-8 w-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-neutral-900">My Trips</h3>
              <p className="text-sm text-neutral-500 mt-1">View and manage all your planned adventures.</p>
            </div>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
