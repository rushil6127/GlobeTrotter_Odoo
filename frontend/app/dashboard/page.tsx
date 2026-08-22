"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { TripCard, type TripStatus } from "@/components/cards/TripCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
    icon: <Plus className="h-6 w-6" />,
    gradient: "from-primary to-primary-600",
  },
  {
    label: "Explore Cities",
    description: "Find destinations",
    href: "/discover/cities",
    icon: <Compass className="h-6 w-6" />,
    gradient: "from-accent to-accent-600",
  },
  {
    label: "Discover Activities",
    description: "Things to do",
    href: "/discover/activities",
    icon: <Sparkles className="h-6 w-6" />,
    gradient: "from-secondary to-secondary-600",
  },
  {
    label: "View Calendar",
    description: "See your schedule",
    href: "/calendar",
    icon: <CalendarDays className="h-6 w-6" />,
    gradient: "from-info to-sky-600",
  },
  {
    label: "My Trips",
    description: "All adventures",
    href: "/trips",
    icon: <Map className="h-6 w-6" />,
    gradient: "from-success to-emerald-600",
  },
];

/* ───────── Helper Functions ───────── */

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
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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

/* ───────── Upcoming Trip Card ───────── */

function UpcomingTripBanner({ trip }: { trip: Trip }) {
  const router = useRouter();
  const status = getTripStatus(trip.startDate, trip.endDate);
  const duration = getDurationDays(trip.startDate, trip.endDate);
  const destination = getTripDestination(trip);
  const coverImage = getTripCoverImage(trip);
  const currencySymbol = formatCurrency(trip.currency);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Plane className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-display text-neutral-900">
          Next Adventure
        </h2>
      </div>

      <div
        onClick={() => router.push(`/trips/${trip.id}`)}
        className={cn(
          "block bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-primary/20",
          "shadow-sm hover:shadow-lg transition-all duration-300",
          "overflow-hidden group cursor-pointer"
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative h-48 md:h-auto md:w-72 shrink-0 overflow-hidden">
            <img
              src={coverImage}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="primary" size="sm" dot>
                {status === "ongoing" ? "Ongoing" : "Upcoming"}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-center gap-3">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-primary transition-colors">
                {trip.name}
              </h3>
              <p className="text-neutral-500 flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="line-clamp-1">{destination}</span>
              </p>
            </div>

            {trip.description && (
              <p className="text-sm text-neutral-600 line-clamp-2">
                {trip.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                {duration} {duration === 1 ? "day" : "days"}
              </span>
              {trip.budget > 0 && (
                <span className="font-semibold text-neutral-700">
                  {currencySymbol}
                  {trip.budget.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                View trip details
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
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
    <section className="space-y-4">
      <h2 className="text-xl font-display text-neutral-900">Quick Actions</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {quickActions.map((action) => (
          <div
            key={action.href}
            onClick={() => router.push(action.href)}
            className={cn(
              "group flex flex-col items-center gap-3 p-5 rounded-2xl cursor-pointer",
              "bg-white/70 backdrop-blur-sm border border-neutral-100",
              "shadow-sm hover:shadow-lg transition-all duration-300",
              "hover:-translate-y-1"
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
                "shadow-sm group-hover:shadow-md transition-shadow",
                action.gradient
              )}
            >
              {action.icon}
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-neutral-800">
                {action.label}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {action.description}
              </p>
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
        <h2 className="text-xl font-display text-neutral-900">Your Trips</h2>
        <button
          onClick={() => router.push("/trips")}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {trips.map((trip) => {
          const status = getTripStatus(trip.startDate, trip.endDate);
          const coverImage = getTripCoverImage(trip);
          const destination = getTripDestination(trip);
          const currencySymbol = formatCurrency(trip.currency);
          const citiesCount = trip.tripCities?.length ?? trip._count?.tripCities ?? 0;
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
    <div className="space-y-12">
      {/* Header skeleton */}
      <div className="space-y-3 pt-4 md:pt-8">
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="60%" height={20} />
        <div className="flex gap-3 pt-2">
          <Skeleton variant="rounded" width={160} height={44} />
          <Skeleton variant="rounded" width={120} height={44} />
        </div>
      </div>

      {/* Banner skeleton */}
      <div className="space-y-4">
        <Skeleton variant="text" width={140} height={24} />
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 flex flex-col md:flex-row gap-6">
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
      <div className="space-y-4">
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

  // Greeting name
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
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        {/* ── Loading State ── */}
        {isLoading && <DashboardSkeleton />}

        {/* ── Error State ── */}
        {!isLoading && error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-8 text-center space-y-4 mt-8">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Failed to load your trips
              </h3>
              <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">
                {error.message || "An unexpected error occurred while communicating with the server."}
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── Loaded State ── */}
        {!isLoading && !error && trips && (
          <>
            {/* ── Welcome Section ── */}
            <section className="space-y-4 pt-4 md:pt-8">
              <div>
                <h1 className="text-3xl md:text-5xl font-display text-neutral-900">
                  Welcome back, <span className="text-primary">{greetingName}</span>! 👋
                </h1>
                <p className="text-base md:text-lg text-neutral-500 mt-2 max-w-xl">
                  {trips.length === 0 ? (
                    "Ready to plan your next adventure? Start by creating your first trip."
                  ) : (
                    <>
                      Ready to plan your next adventure? You have{" "}
                      <span className="font-semibold text-neutral-700">
                        {upcomingTrips.length} upcoming
                      </span>{" "}
                      {upcomingTrips.length === 1 ? "trip" : "trips"} waiting for you.
                    </>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Plus className="h-5 w-5" />}
                  onClick={() => router.push("/trips/new")}
                >
                  Plan a New Trip
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Compass className="h-5 w-5" />}
                  onClick={() => router.push("/discover")}
                >
                  Explore
                </Button>
              </div>
            </section>

            {/* ── Next Adventure Banner (if upcoming trip exists) ── */}
            {upcomingTrip && <UpcomingTripBanner trip={upcomingTrip} />}

            {/* ── Your Trips Grid OR Empty State ── */}
            {trips.length > 0 ? (
              <TripsGrid trips={trips} />
            ) : (
              <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-8 shadow-sm">
                <EmptyState
                  variant="trips"
                  title="No trips planned yet"
                  description="Start planning your dream adventure today. Create custom routes, manage your daily itinerary, and track your travel budget."
                  action={
                    <Button
                      variant="primary"
                      size="lg"
                      leftIcon={<Plus className="h-5 w-5" />}
                      onClick={() => router.push("/trips/new")}
                    >
                      Plan Your First Trip
                    </Button>
                  }
                />
              </section>
            )}

            {/* ── Quick Actions ── */}
            <QuickActionsGrid />
          </>
        )}
      </div>
    </PageShell>
  );
}
