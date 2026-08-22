"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CalendarDays, MapPin, Activity, MoreHorizontal, Heart, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AvatarGroup } from "@/components/ui/Avatar";

/* ───────── Types ───────── */

export type TripStatus = "upcoming" | "ongoing" | "completed";

export interface TripCardProps {
  coverImage?: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  citiesCount: number;
  activitiesCount: number;
  status: TripStatus;
  budget?: number;
  currency?: string;
  members?: { name: string; avatar?: string }[];
  progress?: number;
  onView?: () => void;
  onMore?: () => void;
  className?: string;
}

/* ───────── Status config ───────── */

const statusConfig: Record<TripStatus, { label: string; variant: "info" | "success" | "default" }> = {
  upcoming: { label: "Upcoming", variant: "info" },
  ongoing: { label: "Ongoing", variant: "success" },
  completed: { label: "Completed", variant: "default" },
};

/* ───────── Component ───────── */

export function TripCard({
  coverImage,
  name,
  destination,
  startDate,
  endDate,
  citiesCount,
  activitiesCount,
  status,
  budget,
  currency = "₹",
  members,
  progress,
  onView,
  onMore,
  className,
}: TripCardProps) {
  const sc = statusConfig[status];

  return (
    <div
      className={cn(
        "group bg-white rounded-3xl border border-neutral-200/60 overflow-hidden",
        "shadow-sm hover:shadow-xl transition-all duration-300",
        "cursor-pointer hover:-translate-y-1 flex flex-col",
        className
      )}
      onClick={onView}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden shrink-0">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-neutral-100 to-accent/20 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3.5 left-3.5">
          <Badge variant={sc.variant} size="sm" dot>
            {sc.label}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3.5 right-3.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-8 w-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-600 hover:text-red-500 transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-8 w-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-600 hover:text-primary transition-colors shadow-sm"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {onMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
              className="h-8 w-8 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-600 hover:text-primary transition-colors shadow-sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Destination on image */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <h3 className="text-white font-display font-bold text-lg leading-snug drop-shadow-sm line-clamp-1">
            {name}
          </h3>
          <p className="text-white/90 text-xs flex items-center gap-1 mt-0.5 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-300" />
            <span>{destination}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Date and budget */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-neutral-500 font-medium">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {startDate} – {endDate}
            </span>
            {budget !== undefined && budget > 0 && (
              <span className="font-bold text-neutral-800">
                {currency}
                {budget.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3.5 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {citiesCount} {citiesCount === 1 ? "city" : "cities"}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-accent" />
              {activitiesCount} {activitiesCount === 1 ? "activity" : "activities"}
            </span>
          </div>

          {/* Progress bar */}
          {typeof progress === "number" && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Planning progress</span>
                <span className="font-semibold text-neutral-700">{progress}%</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Members */}
        {members && members.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <AvatarGroup
              avatars={members.map((m) => ({ name: m.name, src: m.avatar }))}
              max={3}
              size="xs"
            />
            <span className="text-[11px] text-neutral-400 font-medium">
              {members.length} {members.length === 1 ? "collaborator" : "collaborators"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
