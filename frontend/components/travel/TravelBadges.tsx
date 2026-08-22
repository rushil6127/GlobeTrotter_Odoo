"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  CalendarDays,
  Clock,
  Star,
  DollarSign,
  Navigation,
  Utensils,
  Mountain,
  Landmark,
  TreePine,
  ShoppingBag,
  Camera,
  Moon,
  Palmtree,
} from "lucide-react";

/* ═════════════════════════════════════════
   DESTINATION BADGE
   ═════════════════════════════════════════ */

export function DestinationBadge({
  city,
  country,
  className,
}: {
  city: string;
  country: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "bg-primary/10 text-primary text-sm font-medium",
        className
      )}
    >
      <MapPin className="h-3.5 w-3.5" />
      {city}, {country}
    </span>
  );
}

/* ═════════════════════════════════════════
   CATEGORY BADGE
   ═════════════════════════════════════════ */

type Category = "food" | "adventure" | "culture" | "nature" | "shopping" | "sightseeing" | "nightlife" | "relaxation";

const categoryMap: Record<Category, { icon: React.ReactNode; color: string; label: string }> = {
  food: { icon: <Utensils className="h-3.5 w-3.5" />, color: "bg-orange-50 text-orange-700 border-orange-200", label: "Food" },
  adventure: { icon: <Mountain className="h-3.5 w-3.5" />, color: "bg-red-50 text-red-700 border-red-200", label: "Adventure" },
  culture: { icon: <Landmark className="h-3.5 w-3.5" />, color: "bg-violet-50 text-violet-700 border-violet-200", label: "Culture" },
  nature: { icon: <TreePine className="h-3.5 w-3.5" />, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Nature" },
  shopping: { icon: <ShoppingBag className="h-3.5 w-3.5" />, color: "bg-pink-50 text-pink-700 border-pink-200", label: "Shopping" },
  sightseeing: { icon: <Camera className="h-3.5 w-3.5" />, color: "bg-sky-50 text-sky-700 border-sky-200", label: "Sightseeing" },
  nightlife: { icon: <Moon className="h-3.5 w-3.5" />, color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Nightlife" },
  relaxation: { icon: <Palmtree className="h-3.5 w-3.5" />, color: "bg-teal-50 text-teal-700 border-teal-200", label: "Relaxation" },
};

export function CategoryBadge({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const cat = categoryMap[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        cat.color,
        className
      )}
    >
      {cat.icon}
      {cat.label}
    </span>
  );
}

/* ═════════════════════════════════════════
   PRICE INDICATOR
   ═════════════════════════════════════════ */

export function PriceIndicator({
  level,
  className,
}: {
  level: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3].map((i) => (
        <DollarSign
          key={i}
          className={cn(
            "h-4 w-4",
            i <= level ? "text-accent" : "text-neutral-200"
          )}
        />
      ))}
    </span>
  );
}

/* ═════════════════════════════════════════
   DATE BADGE
   ═════════════════════════════════════════ */

export function DateBadge({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "bg-neutral-50 text-neutral-600 text-xs font-medium border border-neutral-200",
        className
      )}
    >
      <CalendarDays className="h-3.5 w-3.5" />
      {date}
    </span>
  );
}

/* ═════════════════════════════════════════
   DURATION BADGE
   ═════════════════════════════════════════ */

export function DurationBadge({
  duration,
  className,
}: {
  duration: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "bg-neutral-50 text-neutral-600 text-xs font-medium border border-neutral-200",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {duration}
    </span>
  );
}

/* ═════════════════════════════════════════
   LOCATION BADGE
   ═════════════════════════════════════════ */

export function LocationBadge({
  location,
  className,
}: {
  location: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
        "bg-neutral-50 text-neutral-600 text-xs font-medium border border-neutral-200",
        className
      )}
    >
      <Navigation className="h-3.5 w-3.5" />
      {location}
    </span>
  );
}

/* ═════════════════════════════════════════
   RATING BADGE
   ═════════════════════════════════════════ */

export function RatingBadge({
  rating,
  maxRating = 5,
  className,
}: {
  rating: number;
  maxRating?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg",
        "bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200",
        className
      )}
    >
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      {rating.toFixed(1)}
      <span className="text-amber-400 font-normal">/ {maxRating}</span>
    </span>
  );
}

/* ═════════════════════════════════════════
   TRIP STATUS BADGE
   ═════════════════════════════════════════ */

type TripStatus = "upcoming" | "ongoing" | "completed";

const statusConfig: Record<TripStatus, { label: string; dotColor: string; bgColor: string }> = {
  upcoming: {
    label: "Upcoming",
    dotColor: "bg-sky-500",
    bgColor: "bg-sky-50 text-sky-700 border-sky-200",
  },
  ongoing: {
    label: "Ongoing",
    dotColor: "bg-emerald-500 animate-pulse",
    bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  completed: {
    label: "Completed",
    dotColor: "bg-neutral-400",
    bgColor: "bg-neutral-50 text-neutral-600 border-neutral-200",
  },
};

export function TripStatusBadge({
  status,
  className,
}: {
  status: TripStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.bgColor,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
