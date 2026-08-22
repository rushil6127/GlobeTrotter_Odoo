"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Star, Plus, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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
  category: ActivityCategory;
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

const categoryConfig: Record<ActivityCategory, { emoji: string; color: string }> = {
  food: { emoji: "🍽️", color: "bg-orange-50 text-orange-700" },
  adventure: { emoji: "🏔️", color: "bg-red-50 text-red-700" },
  culture: { emoji: "🏛️", color: "bg-violet-50 text-violet-700" },
  nature: { emoji: "🌿", color: "bg-emerald-50 text-emerald-700" },
  shopping: { emoji: "🛍️", color: "bg-pink-50 text-pink-700" },
  sightseeing: { emoji: "📸", color: "bg-sky-50 text-sky-700" },
  nightlife: { emoji: "🌙", color: "bg-indigo-50 text-indigo-700" },
  relaxation: { emoji: "🧘", color: "bg-teal-50 text-teal-700" },
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
  const cat = categoryConfig[category];

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl">
            {cat.emoji}
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", cat.color)}>
            {cat.emoji} {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Rating */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-neutral-700">{rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-neutral-900 line-clamp-1">{name}</h3>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
          {duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {duration}
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          {estimatedCost !== undefined && (
            <span className="text-sm font-bold text-neutral-800 flex items-center">
              {currency}{estimatedCost.toLocaleString()}
            </span>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold",
                "transition-all duration-200",
                added
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
              )}
            >
              <Plus className={cn("h-3.5 w-3.5", added && "rotate-45")} />
              {added ? "Added" : "Add to Trip"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
