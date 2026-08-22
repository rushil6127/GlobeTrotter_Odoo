"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Star, Plus, Check } from "lucide-react";

/* ───────── Types ───────── */

export type ActivityCategory =
  | "food"
  | "adventure"
  | "culture"
  | "nature"
  | "shopping"
  | "sightseeing"
  | "nightlife"
  | "relaxation";

export interface ActivityCardProps {
  image?: string;
  name: string;
  category: ActivityCategory | string;
  location: string;
  duration?: string;
  estimatedCost?: number;
  currency?: string;
  rating?: number;
  onAdd?: () => void;
  added?: boolean;
  className?: string;
}

/* ───────── Category config ───────── */

const categoryConfig: Record<string, { emoji: string; color: string }> = {
  food: { emoji: "🍽️", color: "bg-orange-50/90 text-orange-700 border-orange-200/60" },
  adventure: { emoji: "🏔️", color: "bg-red-50/90 text-red-700 border-red-200/60" },
  culture: { emoji: "🏛️", color: "bg-violet-50/90 text-violet-700 border-violet-200/60" },
  nature: { emoji: "🌿", color: "bg-emerald-50/90 text-emerald-700 border-emerald-200/60" },
  shopping: { emoji: "🛍️", color: "bg-pink-50/90 text-pink-700 border-pink-200/60" },
  sightseeing: { emoji: "📸", color: "bg-sky-50/90 text-sky-700 border-sky-200/60" },
  nightlife: { emoji: "🌙", color: "bg-indigo-50/90 text-indigo-700 border-indigo-200/60" },
  relaxation: { emoji: "🧘", color: "bg-teal-50/90 text-teal-700 border-teal-200/60" },
};

/* ───────── Component ───────── */

export function ActivityCard({
  image,
  name,
  category,
  location,
  duration,
  estimatedCost,
  currency = "₹",
  rating,
  onAdd,
  added,
  className,
}: ActivityCardProps) {
  const normalizedCat = (category || "sightseeing").toLowerCase();
  const cat = categoryConfig[normalizedCat] || {
    emoji: "📍",
    color: "bg-neutral-50/90 text-neutral-700 border-neutral-200/60",
  };

  return (
    <div
      className={cn(
        "group bg-white rounded-3xl border border-neutral-200/60 overflow-hidden",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "hover:-translate-y-1 flex flex-col justify-between",
        className
      )}
    >
      {/* Image Banner */}
      <div className="relative h-40 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-neutral-100 to-accent/10 flex items-center justify-center text-3xl">
            {cat.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3.5 left-3.5">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md",
              cat.color
            )}
          >
            {cat.emoji} {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-2 py-1 shadow-sm">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-neutral-800">{rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors text-sm sm:text-base">
            {name}
          </h3>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1.5 font-medium">
            <span className="flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {location}
            </span>
            {duration && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            {estimatedCost !== undefined && (
              <span className="text-sm font-bold text-neutral-900">
                {currency}
                {estimatedCost.toLocaleString()}
              </span>
            )}
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
                "transition-all duration-200 shadow-sm",
                added
                  ? "bg-primary text-white scale-105"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
              )}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add to Trip
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
