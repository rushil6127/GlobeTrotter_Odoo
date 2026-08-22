"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { TripCard, type TripStatus } from "@/components/cards/TripCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, CardSkeleton } from "@/components/ui/Loader";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/lib/hooks/useApiData";
import { getTrips, type Trip } from "@/lib/api/trips";
import {
  Plus,
  Compass,
  Map,
  CalendarDays,
  Sparkles,
  MapPin,
  ArrowRight,
  Plane,
  Clock,
  AlertCircle,
  RefreshCw,
  Wallet,
  Globe2,
} from "lucide-react";

/* ───────── Quick-action data ───────── */

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Plan a Trip",
    description: "Start from scratch",
    href: "/trips/new",
    icon: <Plus className="h-5 w-5" />,
    gradient: "from-primary to-primary-600",
  },
  {
    label: "Explore Cities",
    description: "Find destinations",
    href: "/discover/cities",
    icon: <Compass className="h-5 w-5" />,
    gradient: "from-accent to-accent-600",
  },
  {
    label: "Discover Activities",
    description: "Things to do",
    href: "/discover/activities",
    icon: <Sparkles className="h-5 w-5" />,
    gradient: "from-secondary to-secondary-600",
  },
  {
    label: "My Trips",
    description: "All adventures",
    href: "/trips",
    icon: <Map className="h-5 w-5" />,
    gradient: "from-success to-emerald-600",
  },
];

/* ───────── Helper Functions ───────── */

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getDurationDays(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  } catch {
    return 1;
  }
}

function getTripStatus(startDateStr: string, endDateStr: string): TripStatus {
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (end < now) return "completed";
  if (start <= now && now <= end) return "ongoing";
  return "upcoming";
}

function formatCurrency(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return currency;
}

function getTripDestination(trip: Trip): string {
  if (trip.tripCities && trip.tripCities.length > 0) {
    return trip.tripCities.map((tc) => tc.city.name).join(" → ");
  }
  return trip.description || "Destination to be planned";
}

function getTripCoverImage(trip: Trip): string {
  if (trip.tripCities && trip.tripCities.length > 0 && trip.tripCities[0].city?.image) {
    return trip.tripCities[0].city.image;
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80";
}

function getCountdownText(startDateStr: string, endDateStr: string): string {
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start <= now && now <= end) return "Happening now";
  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Starts today";
  if (diffDays === 1) return "Starts tomorrow";
  return `In ${diffDays} days`;
}

/* ───────── Stats Overview Bar ───────── */

interface StatsOverviewProps {
  trips: Trip[];
}

function StatsOverview({ trips }: StatsOverviewProps) {
  const totalTrips = trips.length;
  const upcomingTrips = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === "upcoming").length;
  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalCities = trips.reduce((sum, t) => sum + (t.tripCities?.length || t._count?.tripCities || 1), 0);

  const stats = [
    {
      label: "Total Trips",
      value: totalTrips,
      icon: <Map className="h-5 w-5 text-primary" />,
      bg: "bg-primary/10",
    },
    {
      label: "Upcoming Trips",
      value: upcomingTrips,
      icon: <Plane className="h-5 w-5 text-accent" />,
      bg: "bg-accent/10",
    },
    {
      label: "Total Planned",
      value: `₹${totalBudget.toLocaleString()}`,
      icon: <Wallet className="h-5 w-5 text-secondary-600" />,
      bg: "bg-secondary/15",
    },
    {
      label: "Destinations",
      value: totalCities,
      icon: <Globe2 className="h-5 w-5 text-info" />,
      bg: "bg-info/15",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200/60 p-4 sm:p-5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
            {stat.icon}
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
            <p className="text-lg sm:text-xl font-bold text-neutral-900 mt-0.5 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── Upcoming Trip Hero Highlight ───────── */

function UpcomingTripBanner({ trip }: { trip: Trip }) {
  const router = useRouter();
  const status = getTripStatus(trip.startDate, trip.endDate);
  const duration = getDurationDays(trip.startDate, trip.endDate);
  const destination = getTripDestination(trip);
  const coverImage = getTripCoverImage(trip);
  const currencySymbol = formatCurrency(trip.currency);
  const countdown = getCountdownText(trip.startDate, trip.endDate);

  const members =
    trip.tripMembers?.map((m) => ({
      name: m.user?.name || "Collaborator",
      avatar: m.user?.avatar || undefined,
    })) || [];

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <h2 className="text-xl font-display font-bold text-neutral-900">Next Adventure</h2>
        </div>
        <Badge variant={status === "ongoing" ? "success" : "info"} size="sm" dot>
          {countdown}
        </Badge>
      </div>

      <div
        onClick={() => router.push(`/trips/${trip.id}`)}
        className={cn(
          "relative bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-primary/20",
          "shadow-sm hover:shadow-xl transition-all duration-300",
          "overflow-hidden group cursor-pointer hover:-translate-y-0.5"
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Banner */}
          <div className="relative h-56 md:h-auto md:w-80 shrink-0 overflow-hidden">
            <img
              src={coverImage}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-neutral-950/60 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="primary" size="sm" dot>
                {status === "ongoing" ? "Happening Now" : "Upcoming"}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 text-white md:hidden">
              <span className="text-xs font-semibold uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                {destination}
              </span>
            </div>
          </div>

          {/* Trip Details Content */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 group-hover:text-primary transition-colors">
                    {trip.name}
                  </h3>
                  <p className="text-neutral-500 font-medium flex items-center gap-1.5 mt-1 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <span className="line-clamp-1">{destination}</span>
                  </p>
                </div>
              </div>

              {trip.description && (
                <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed pt-1">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-neutral-100 text-sm text-neutral-600">
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                {duration} {duration === 1 ? "day" : "days"}
              </span>
              {trip.budget > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-neutral-800">
                  <Wallet className="h-4 w-4 text-secondary-600 shrink-0" />
                  {currencySymbol}
                  {trip.budget.toLocaleString()}
                </span>
              )}
              {members.length > 0 && (
                <div className="flex items-center gap-2">
                  <AvatarGroup avatars={members} max={3} size="sm" />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-semibold text-primary group-hover:text-primary-600 flex items-center gap-1.5 transition-colors">
                Open Trip Workspace
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/trips/${trip.id}/itinerary`);
                }}
              >
                View Itinerary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Quick Actions Grid ───────── */

function QuickActionsGrid() {
  const router = useRouter();

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-neutral-900">Quick Actions</h2>
        <span className="text-xs text-neutral-400 font-medium">Fast shortcuts</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {quickActions.map((action) => (
          <div
            key={action.href}
            onClick={() => router.push(action.href)}
            className={cn(
              "group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl cursor-pointer",
              "bg-white/80 backdrop-blur-sm border border-neutral-200/60",
              "shadow-sm hover:shadow-lg transition-all duration-300",
              "hover:-translate-y-1"
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white",
                "shadow-md group-hover:scale-110 transition-transform duration-300",
                action.gradient
              )}
            >
              {action.icon}
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-neutral-900 group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────── Your Trips Grid ───────── */

function TripsGrid({ trips }: { trips: Trip[] }) {
  const router = useRouter();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-900">Your Adventures</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage and organize all your upcoming and past travels</p>
        </div>
        <button
          onClick={() => router.push("/trips")}
          className="text-sm font-semibold text-primary hover:text-primary-600 flex items-center gap-1 transition-colors"
        >
          View all ({trips.length})
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {trips.slice(0, 6).map((trip) => {
          const status = getTripStatus(trip.startDate, trip.endDate);
          const coverImage = getTripCoverImage(trip);
          const destination = getTripDestination(trip);
          const currencySymbol = formatCurrency(trip.currency);
          const citiesCount = trip.tripCities?.length ?? trip._count?.tripCities ?? 1;
          const activitiesCount = trip._count?.itineraryItems ?? 0;
          const members = trip.tripMembers?.map((m) => ({
            name: m.user?.name || "Collaborator",
            avatar: m.user?.avatar || undefined,
          }));

          return (
            <TripCard
              key={trip.id}
              coverImage={coverImage}
              name={trip.name}
              destination={destination}
              startDate={formatDate(trip.startDate)}
              endDate={formatDate(trip.endDate)}
              citiesCount={citiesCount}
              activitiesCount={activitiesCount}
              status={status}
              budget={trip.budget}
              currency={currencySymbol}
              members={members}
              onView={() => {
                router.push(`/trips/${trip.id}`);
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ───────── Dashboard Skeletons ───────── */

function DashboardSkeleton() {
  return (
    <div className="space-y-10 pt-4 md:pt-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width="40%" height={36} />
        <Skeleton variant="text" width="60%" height={20} />
        <div className="flex gap-3 pt-2">
          <Skeleton variant="rounded" width={160} height={44} />
          <Skeleton variant="rounded" width={120} height={44} />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </div>

      {/* Banner skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width={140} height={24} />
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 flex flex-col md:flex-row gap-6">
          <Skeleton variant="rounded" width={280} height={180} />
          <div className="flex-1 space-y-4">
            <Skeleton variant="text" width="50%" height={28} />
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="text" lines={2} />
            <div className="flex gap-4 pt-2">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="space-y-3">
        <Skeleton variant="text" width={120} height={24} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

/* ───────── Dashboard Page ───────── */

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: trips, isLoading, error, refetch } = useApiData<Trip[]>(() => getTrips());

  // Dynamic greetings
  const timeGreeting = getTimeGreeting();
  const greetingName = user?.name ? user.name.split(" ")[0] : "Traveler";

  // Calculate upcoming trip (earliest upcoming or ongoing trip)
  const sortedTrips = trips ? [...trips] : [];
  const upcomingTrips = sortedTrips.filter((t) => {
    const status = getTripStatus(t.startDate, t.endDate);
    return status === "upcoming" || status === "ongoing";
  });
  const upcomingTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  return (
    <PageShell currentPath="/dashboard" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-10 pb-32">
        {/* ── Loading State ── */}
        {isLoading && <DashboardSkeleton />}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-3xl p-8 text-center space-y-4 mt-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Unable to load your trips</h3>
              <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">
                {error.message || "An unexpected error occurred while communicating with the server."}
              </p>
            </div>
            <Button variant="outline" size="md" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
              Try Again
            </Button>
          </div>
        )}

        {/* ── Loaded State ── */}
        {!isLoading && !error && trips && (
          <>
            {/* ── Welcome Section ── */}
            <section className="space-y-4 pt-4 md:pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-neutral-900 tracking-tight">
                    {timeGreeting}, <span className="text-primary">{greetingName}</span>! 👋
                  </h1>
                  <p className="text-sm sm:text-base text-neutral-500 mt-1.5 max-w-xl leading-relaxed">
                    {trips.length === 0 ? (
                      "Ready to plan your next adventure? Start by creating your first custom itinerary."
                    ) : (
                      <>
                        You have{" "}
                        <span className="font-semibold text-neutral-800">
                          {upcomingTrips.length} upcoming {upcomingTrips.length === 1 ? "adventure" : "adventures"}
                        </span>{" "}
                        planned. Where to next?
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<Plus className="h-5 w-5" />}
                    onClick={() => router.push("/trips/new")}
                    className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                  >
                    Plan a New Trip
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Compass className="h-5 w-5" />}
                    onClick={() => router.push("/discover")}
                  >
                    Explore Cities
                  </Button>
                </div>
              </div>

              {/* ── Stats Bar ── */}
              {trips.length > 0 && <StatsOverview trips={trips} />}
            </section>

            {/* ── Next Adventure Hero Banner (if upcoming trip exists) ── */}
            {upcomingTrip && <UpcomingTripBanner trip={upcomingTrip} />}

            {/* ── Quick Actions Grid ── */}
            <QuickActionsGrid />

            {/* ── Your Trips Grid OR Rich Empty State ── */}
            {trips.length > 0 ? (
              <TripsGrid trips={trips} />
            ) : (
              <section className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-8 sm:p-12 shadow-sm text-center">
                <EmptyState
                  variant="trips"
                  title="No trips planned yet"
                  description="Start planning your dream adventure today. Create custom multi-city routes, schedule daily activities, collaborate with friends, and manage your travel budget."
                  action={
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<Plus className="h-5 w-5" />}
                        onClick={() => router.push("/trips/new")}
                        className="shadow-md shadow-primary/20"
                      >
                        Plan Your First Trip
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        leftIcon={<Compass className="h-5 w-5" />}
                        onClick={() => router.push("/discover/cities")}
                      >
                        Browse Popular Cities
                      </Button>
                    </div>
                  }
                />
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
