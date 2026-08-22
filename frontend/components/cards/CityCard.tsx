"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Plus, Check } from "lucide-react";

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
        "group bg-white rounded-3xl border border-neutral-200/60 overflow-hidden",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "hover:-translate-y-1 flex flex-col justify-between",
        className
      )}
    >
      {/* Image Banner */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/20 via-neutral-100 to-primary/15 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-secondary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

        {/* City & Country badge on image */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <h3 className="font-display font-bold text-white text-lg drop-shadow-sm leading-tight">
            {name}
          </h3>
          <p className="text-xs text-white/90 font-medium flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-primary-300" />
            {country}
          </p>
        </div>

        {/* Add button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className={cn(
              "absolute top-3.5 right-3.5 h-8 w-8 rounded-xl flex items-center justify-center",
              "transition-all duration-300 shadow-md backdrop-blur-md",
              added
                ? "bg-primary text-white scale-105"
                : "bg-white/90 text-neutral-700 hover:bg-primary hover:text-white"
            )}
            title={added ? "Added to trip" : "Add to trip"}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        {description && (
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
          <span className="text-neutral-400 font-medium">Price level</span>
          {priceLevel ? (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={cn(
                    "text-xs font-bold",
                    level <= priceLevel ? "text-accent font-extrabold" : "text-neutral-200"
                  )}
                >
                  $
                </span>
              ))}
            </div>
          ) : (
            <span className="text-neutral-400 text-xs">Moderate</span>
          )}
        </div>
      </div>
    </div>
  );
}
