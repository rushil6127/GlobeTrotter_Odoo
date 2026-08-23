"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApiData } from "@/lib/hooks/useApiData";
import { getPublicSharedTrip, type PublicSharedTrip } from "@/lib/api/sharing";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";
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
  Check,
  Copy,
  MessageCircle,
  Send,
  Calendar,
  Layers,
  Heart,
} from "lucide-react";

function fmtDate(d: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtDateShort(d: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

/* Category colors map */
const categoryColors: Record<string, string> = {
  Sightseeing: "text-sky-700 bg-sky-50 border-sky-200/70",
  Food: "text-amber-700 bg-amber-50 border-amber-200/70",
  Adventure: "text-orange-700 bg-orange-50 border-orange-200/70",
  "Water Sports": "text-blue-700 bg-blue-50 border-blue-200/70",
  Culture: "text-purple-700 bg-purple-50 border-purple-200/70",
  Shopping: "text-pink-700 bg-pink-50 border-pink-200/70",
  Nightlife: "text-indigo-700 bg-indigo-50 border-indigo-200/70",
  Relaxation: "text-teal-700 bg-teal-50 border-teal-200/70",
  Other: "text-neutral-700 bg-neutral-100 border-neutral-200",
};

export default function PublicSharedTripPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params.shareId;

  const {
    data,
    isLoading,
    error,
  } = useApiData<PublicSharedTrip>(() => getPublicSharedTrip(shareId), [shareId]);

  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [copied, setCopied] = useState(false);

  const trip = data?.trip;
  const organizer = data?.organizer;
  const cities = data?.cities || [];
  const days = data?.days || [];
  const totalItems = data?.itinerary?.length || 0;

  const coverImg =
    cities[0]?.city?.image ||
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80";

  const duration = trip ? getDays(trip.startDate, trip.endDate) : 1;

  const filteredDays = useMemo(() => {
    if (selectedDay === "all") return days;
    return days.filter((d) => d.dayNumber === selectedDay);
  }, [days, selectedDay]);

  async function handleCopy() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`Trip link: ${window.location.href}`);
    }
  }

  function shareWhatsApp() {
    if (typeof window === "undefined" || !trip) return;
    const text = encodeURIComponent(`Explore "${trip.name}" on GlobeTrotter: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased text-neutral-900 selection:bg-primary/20">
      {/* Public Top Navbar */}
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
              Public Itinerary
            </span>
            <Link href="/register">
              <Button size="sm" variant="primary" leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-300" />}>
                Build Your Trip
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={320} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={400} />
          </div>
        )}

        {/* Error State: Invalid / Expired link */}
        {!isLoading && error && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-6 bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-sm animate-in fade-in duration-200">
            <div className="h-16 w-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-2xs">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-extrabold text-neutral-900">
                Shared Trip Unavailable
              </h2>
              <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                This public share link is invalid, has expired, or was revoked by the organizer.
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

        {/* Loaded Public Trip View */}
        {!isLoading && !error && trip && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 group">
              <div className="relative h-80 sm:h-[420px] w-full">
                <img
                  src={coverImg}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-neutral-950/20" />

                {/* Top Floating Badges */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-neutral-900 text-xs font-extrabold shadow-sm">
                      <Plane className="h-3.5 w-3.5 text-primary" />
                      {duration} Days Adventure
                    </span>
                    {cities.length > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-800 text-xs font-bold shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-secondary-600" />
                        {cities.length} {cities.length === 1 ? "Stop" : "Stops"}
                      </span>
                    )}
                  </div>

                  {/* Quick Share Pill */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-md shadow-sm transition-all",
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-white/90 hover:bg-white text-neutral-900"
                      )}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied Link!" : "Copy Link"}
                    </button>
                    <button
                      type="button"
                      onClick={shareWhatsApp}
                      className="p-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-transform hover:scale-105"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Hero Details */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-primary-200 font-bold">
                    <span className="flex items-center gap-1.5 bg-neutral-950/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <CalendarDays className="h-3.5 w-3.5 text-primary-300" />
                      {fmtDateShort(trip.startDate)} – {fmtDateShort(trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-neutral-950/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Clock className="h-3.5 w-3.5 text-amber-300" />
                      {totalItems} Scheduled Activities
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">
                    {trip.name}
                  </h1>

                  {trip.description && (
                    <p className="text-sm sm:text-base text-white/90 max-w-2xl line-clamp-2 leading-relaxed font-normal">
                      {trip.description}
                    </p>
                  )}

                  {/* Organizer Badge */}
                  {organizer && (
                    <div className="pt-1 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white uppercase border border-white/40 shadow-xs">
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
                      <span className="text-xs font-semibold text-white/95">
                        Itinerary curated by <strong className="text-white font-extrabold">{organizer.name}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Destination Route Stops */}
            {cities.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Journey Stops ({cities.length})
                  </h3>
                  <span className="text-xs text-neutral-400 font-medium">
                    Route Sequence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {cities.map((c, i) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 hover:bg-neutral-50 flex items-center gap-3.5 transition-all group"
                    >
                      <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-neutral-200 relative">
                        <img
                          src={
                            c.city.image ||
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&auto=format&fit=crop&q=80"
                          }
                          alt={c.city.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-primary uppercase">
                          <span>Stop #{i + 1}</span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900 truncate">
                          {c.city.name}
                        </h4>
                        <p className="text-xs text-neutral-400 truncate">{c.city.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Itinerary Timeline */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-display font-extrabold text-neutral-900">
                    Day-by-Day Itinerary
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Explore scheduled sightseeing, cultural stops, and culinary experiences.
                  </p>
                </div>

                {/* Day Filter Tabs */}
                {days.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedDay("all")}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                        selectedDay === "all"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      All Days ({days.length})
                    </button>
                    {days.map((d) => (
                      <button
                        key={d.dayNumber}
                        type="button"
                        onClick={() => setSelectedDay(d.dayNumber)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                          selectedDay === d.dayNumber
                            ? "bg-primary text-white shadow-xs"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                        )}
                      >
                        Day {d.dayNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {days.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-neutral-200/80 text-center text-xs text-neutral-400 font-medium">
                  No scheduled activities yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDays.map((day) => (
                    <div
                      key={day.dayNumber}
                      className="rounded-3xl bg-white border border-neutral-200/80 shadow-xs overflow-hidden"
                    >
                      {/* Day Header */}
                      <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200/70 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-xl bg-primary text-white text-xs font-extrabold shadow-2xs">
                            Day {day.dayNumber}
                          </span>
                          {day.date && (
                            <span className="text-xs font-bold text-neutral-700">
                              {fmtDate(day.date)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-neutral-400">
                          {day.items.length} {day.items.length === 1 ? "activity" : "activities"}
                        </span>
                      </div>

                      {/* Day Items Timeline */}
                      <div className="p-4 sm:p-6 space-y-4">
                        {day.items.length === 0 ? (
                          <p className="text-xs text-neutral-400 py-3 italic">
                            Free exploration day.
                          </p>
                        ) : (
                          <div className="relative border-l-2 border-primary/20 ml-3 pl-5 space-y-5">
                            {day.items.map((item) => {
                              const catStyle =
                                categoryColors[item.activity?.category || "Other"] ||
                                categoryColors.Other;

                              return (
                                <div key={item.id} className="relative group">
                                  {/* Timeline Dot */}
                                  <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-white border-2 border-primary ring-2 ring-primary/15 group-hover:scale-110 transition-transform" />

                                  <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <h4 className="text-sm font-bold text-neutral-900">
                                        {item.title}
                                      </h4>

                                      <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {item.startTime && (
                                          <span className="inline-flex items-center gap-1 font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md text-[11px]">
                                            <Clock className="h-3 w-3" />
                                            {item.startTime}
                                            {item.endTime ? ` – ${item.endTime}` : ""}
                                          </span>
                                        )}

                                        {item.activity?.category && (
                                          <span
                                            className={cn(
                                              "px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                                              catStyle
                                            )}
                                          >
                                            {item.activity.category}
                                          </span>
                                        )}

                                        {item.activity?.duration && (
                                          <span className="text-[11px] text-neutral-400 font-medium">
                                            {item.activity.duration} mins
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {item.notes && (
                                      <p className="text-xs text-neutral-600 leading-relaxed pt-0.5">
                                        {item.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Hero Call to Action */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary to-indigo-950 p-8 sm:p-12 text-white text-center space-y-4 shadow-xl border border-primary-700/50">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-lg mx-auto space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Next Adventure Awaits
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  Inspired to explore the world?
                </h3>
                <p className="text-xs sm:text-sm text-primary-100 leading-relaxed font-normal">
                  Build custom multi-city itineraries, automatically optimize your budget with local alternatives, and collaborate seamlessly.
                </p>
                <div className="pt-3">
                  <Link href="/register">
                    <Button
                      size="lg"
                      variant="secondary"
                      rightIcon={<ArrowRight className="h-4 w-4 text-primary" />}
                      className="shadow-lg font-bold"
                    >
                      Start Planning Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/80 bg-white py-6 text-center text-xs text-neutral-400">
        <p>© 2026 GlobeTrotter. Plan smart, travel further.</p>
      </footer>
    </div>
  );
}
