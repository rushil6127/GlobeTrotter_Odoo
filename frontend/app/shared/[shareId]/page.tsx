"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApiData } from "@/lib/hooks/useApiData";
import { getPublicSharedTrip, type PublicSharedTrip } from "@/lib/api/sharing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { Badge } from "@/components/ui/Badge";
import {
  Compass,
  CalendarDays,
  MapPin,
  Clock,
  User,
  Share2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Globe2,
  Plane,
  ChevronRight,
} from "lucide-react";

function fmtDate(d: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function getDays(s: string, e: string) {
  try {
    return Math.max(
      1,
      Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1
    );
  } catch {
    return 1;
  }
}

export default function PublicSharedTripPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;

  const {
    data,
    isLoading,
    error,
  } = useApiData<PublicSharedTrip>(() => getPublicSharedTrip(shareId), [shareId]);

  const trip = data?.trip;
  const organizer = data?.organizer;
  const cities = data?.cities || [];
  const days = data?.days || [];

  const coverImg =
    cities[0]?.city?.image ||
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80";

  const duration = trip ? getDays(trip.startDate, trip.endDate) : 1;

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased text-neutral-900 selection:bg-primary/20">
      {/* Public Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white shadow-xs shadow-primary/30 group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-display font-extrabold text-neutral-900 tracking-tight">
              Globe<span className="text-primary">Trotter</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Globe2 className="h-3.5 w-3.5" />
              Shared Public View
            </span>
            <Link href="/register">
              <Button size="sm" variant="primary" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                Plan Your Trip
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={280} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={360} />
          </div>
        )}

        {/* Error State: Invalid / Expired link */}
        {!isLoading && error && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-5 bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-sm">
            <div className="h-16 w-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                Shared Trip Unavailable
              </h2>
              <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                This public share link is invalid, expired, or has been revoked by the organizer.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md">
                  Explore GlobeTrotter
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Loaded Shared Trip Details */}
        {!isLoading && !error && trip && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Trip Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg border border-neutral-200/80 group">
              <div className="relative h-72 sm:h-96 w-full">
                <img
                  src={coverImg}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/40 to-transparent" />

                {/* Top Duration Badge */}
                <div className="absolute top-5 left-5">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-900 text-xs font-bold shadow-sm">
                    <Plane className="h-3.5 w-3.5 text-primary" />
                    {duration} Days Adventure
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-primary-200 font-bold">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {fmtDate(trip.startDate)} – {fmtDate(trip.endDate)}
                    </span>
                    {cities.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{cities.length} Destination Stops</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight drop-shadow-sm">
                    {trip.name}
                  </h1>

                  {trip.description && (
                    <p className="text-sm sm:text-base text-white/90 max-w-2xl line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                  )}

                  {/* Organizer Pill */}
                  {organizer && (
                    <div className="pt-2 flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white uppercase border border-white/30">
                        {organizer.avatar ? (
                          <img
                            src={organizer.avatar}
                            alt={organizer.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          organizer.name.charAt(0)
                        )}
                      </div>
                      <span className="text-xs font-semibold text-white/90">
                        Curated by <strong className="text-white font-bold">{organizer.name}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Destination Route Sequence */}
            {cities.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Route & Destinations ({cities.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {cities.map((c, i) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 flex items-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                        <img
                          src={
                            c.city.image ||
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&auto=format&fit=crop&q=80"
                          }
                          alt={c.city.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                          <span>Stop #{i + 1}</span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 truncate">
                          {c.city.name}
                        </h4>
                        <p className="text-xs text-neutral-400">{c.city.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Schedule */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-display font-bold text-neutral-900">
                  Daily Itinerary Schedule
                </h3>
                <span className="text-xs text-neutral-400 font-medium">
                  {days.length} Days Planned
                </span>
              </div>

              {days.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 text-center text-xs text-neutral-500 font-medium">
                  No scheduled activities in this itinerary yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {days.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="rounded-3xl bg-white border border-neutral-200/80 shadow-xs overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="p-4 sm:p-5 bg-neutral-50/80 border-b border-neutral-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-bold shadow-2xs">
                            Day {day.dayNumber}
                          </span>
                          {day.date && (
                            <span className="text-xs font-semibold text-neutral-600">
                              {fmtDate(day.date)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-neutral-400">
                          {day.items.length} {day.items.length === 1 ? "activity" : "activities"}
                        </span>
                      </div>

                      {/* Day Items */}
                      <div className="p-4 sm:p-5 divide-y divide-neutral-100">
                        {day.items.length === 0 ? (
                          <p className="text-xs text-neutral-400 py-3 italic">
                            Free exploration day.
                          </p>
                        ) : (
                          day.items.map((item) => (
                            <div
                              key={item.id}
                              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 min-w-0">
                                <h4 className="text-sm font-bold text-neutral-900">
                                  {item.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {item.startTime && (
                                    <span className="inline-flex items-center gap-1 font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px]">
                                      <Clock className="h-3 w-3" />
                                      {item.startTime}
                                      {item.endTime ? ` – ${item.endTime}` : ""}
                                    </span>
                                  )}
                                  {item.activity?.category && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700">
                                      {item.activity.category}
                                    </span>
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-neutral-500 pt-0.5">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-primary-900 via-primary to-indigo-900 p-8 sm:p-10 text-white text-center space-y-4 shadow-lg">
              <h3 className="text-2xl font-display font-extrabold">
                Inspired by this trip?
              </h3>
              <p className="text-sm text-primary-100 max-w-md mx-auto leading-relaxed">
                Build your own smart itinerary, optimize costs with local alternatives, and collaborate with travel companions.
              </p>
              <div className="pt-2">
                <Link href="/register">
                  <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Get Started Free on GlobeTrotter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/80 bg-white py-6 text-center text-xs text-neutral-400">
        <p>© 2026 GlobeTrotter. All rights reserved.</p>
      </footer>
    </div>
  );
}
