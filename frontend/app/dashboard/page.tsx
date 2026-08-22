"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { TripCard } from "@/components/cards/TripCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { mockTrips, getUpcomingTrip } from "@/lib/mockTrips";
import type { Trip } from "@/lib/mockTrips";
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

/* ───────── Upcoming Trip Card ───────── */

function UpcomingTripBanner({ trip }: { trip: Trip }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Plane className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-display text-neutral-900">
          Next Adventure
        </h2>
      </div>

      <a
        href={`/trips/${trip.id}`}
        className={cn(
          "block bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-primary/20",
          "shadow-sm hover:shadow-lg transition-all duration-300",
          "overflow-hidden group"
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative h-48 md:h-auto md:w-72 shrink-0 overflow-hidden">
            <img
              src={trip.coverImage}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <Badge variant="primary" size="sm" dot>
                Upcoming
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
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </p>
            </div>

            <p className="text-sm text-neutral-600 line-clamp-2">
              {trip.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                {trip.startDate} – {trip.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                {trip.durationDays} days
              </span>
              <span className="font-semibold text-neutral-700">
                {trip.currency}
                {trip.budget.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                View trip details
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}

/* ───────── Quick Actions Grid ───────── */

function QuickActionsGrid() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-display text-neutral-900">Quick Actions</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {quickActions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={cn(
              "group flex flex-col items-center gap-3 p-5 rounded-2xl",
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
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────── Your Trips Grid ───────── */

function TripsGrid({ trips }: { trips: Trip[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display text-neutral-900">Your Trips</h2>
        <a
          href="/trips"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            coverImage={trip.coverImage}
            name={trip.name}
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
            citiesCount={trip.citiesCount}
            activitiesCount={trip.activitiesCount}
            status={trip.status}
            budget={trip.budget}
            currency={trip.currency}
            progress={trip.progress}
            members={trip.members}
            onView={() => {
              window.location.href = `/trips/${trip.id}`;
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ───────── Dashboard Page ───────── */

export default function DashboardPage() {
  const trips = mockTrips;
  const upcomingTrip = getUpcomingTrip(trips);

  return (
    <PageShell currentPath="/dashboard" userName="Pushp">
      <div className="max-w-6xl mx-auto space-y-12 pb-32">
        {/* ── Welcome Section ── */}
        <section className="space-y-4 pt-4 md:pt-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-display text-neutral-900">
              Welcome back, <span className="text-primary">Pushp</span>! 👋
            </h1>
            <p className="text-base md:text-lg text-neutral-500 mt-2 max-w-xl">
              Ready to plan your next adventure? You have{" "}
              <span className="font-semibold text-neutral-700">
                {trips.filter((t) => t.status === "upcoming").length} upcoming
              </span>{" "}
              trips waiting for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => {
                window.location.href = "/trips/new";
              }}
            >
              Plan a New Trip
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Compass className="h-5 w-5" />}
              onClick={() => {
                window.location.href = "/discover";
              }}
            >
              Explore
            </Button>
          </div>
        </section>

        {/* ── Upcoming Trip ── */}
        {upcomingTrip && <UpcomingTripBanner trip={upcomingTrip} />}

        {/* ── Your Trips ── */}
        <TripsGrid trips={trips} />

        {/* ── Quick Actions ── */}
        <QuickActionsGrid />
      </div>
    </PageShell>
  );
}
