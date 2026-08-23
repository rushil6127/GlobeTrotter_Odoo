"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Star, Plus } from "lucide-react";
import {
  ActivityCategory,
  getActivityCategoryConfig,
} from "@/lib/categories";
import { formatCurrency } from "@/lib/formatters";

/* ───────── Types ───────── */

export type { ActivityCategory };

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
  const cat = getActivityCategoryConfig(category);

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        "shadow-xs hover:shadow-lg transition-all duration-300",
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
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs backdrop-blur-xs",
              cat.bgColor,
              cat.color,
              cat.borderColor
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>
        </div>

        {/* Rating */}
        {rating !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-xs">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-neutral-700">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-neutral-900 line-clamp-1 text-base">
          {name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{location}</span>
          </span>
          {duration && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>{duration}</span>
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          {estimatedCost !== undefined && (
            <span className="text-sm font-bold text-neutral-900">
              {formatCurrency(estimatedCost, currency)}
            </span>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold",
                "transition-all duration-200 shadow-xs",
                added
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
              )}
            >
              <Plus className={cn("h-3.5 w-3.5", added && "rotate-45")} />
              <span>{added ? "Added" : "Add to Trip"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
