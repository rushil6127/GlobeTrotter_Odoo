"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Plus } from "lucide-react";
import { PriceIndicator } from "@/components/travel/TravelBadges";

/* ───────── Types ───────── */

export interface CityCardProps {
  image?: string;
  name: string;
  country: string;
  description?: string;
  priceLevel?: 1 | 2 | 3;
  onAdd?: () => void;
  added?: boolean;
  className?: string;
}

/* ───────── Component ───────── */

export function CityCard({
  image,
  name,
  country,
  description,
  priceLevel,
  onAdd,
  added,
  className,
}: CityCardProps) {
  return (
    <div
      className={cn(
        "group bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        "shadow-xs hover:shadow-lg transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-secondary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center",
              "transition-all duration-200 shadow-xs",
              added
                ? "bg-primary text-white"
                : "bg-white/90 backdrop-blur-xs text-neutral-600 hover:bg-primary hover:text-white"
            )}
            aria-label={added ? "Remove from trip" : "Add to trip"}
          >
            <Plus className={cn("h-4 w-4", added && "rotate-45")} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-semibold text-neutral-900 text-base">{name}</h3>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">{country}</span>
          </p>
        </div>
        {description && (
          <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
        {priceLevel && (
          <div className="pt-1">
            <PriceIndicator level={priceLevel} />
          </div>
        )}
      </div>
    </div>
  );
}
