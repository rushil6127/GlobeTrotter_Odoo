"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CalendarDays, MapPin, Activity, MoreHorizontal, Heart, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";

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
        "group bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "cursor-pointer",
        className
      )}
      onClick={onView}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={sc.variant} size="sm" dot>
            {sc.label}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:text-red-500 transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:text-primary transition-colors shadow-sm"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMore?.(); }}
            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:text-primary transition-colors shadow-sm"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Destination on image */}
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
            {name}
          </h3>
          <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5" />
            {destination}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date and stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <CalendarDays className="h-4 w-4" />
            {startDate} – {endDate}
          </span>
          {budget && (
            <span className="font-semibold text-neutral-700">
              {currency}{budget.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {citiesCount} {citiesCount === 1 ? "city" : "cities"}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-accent" />
            {activitiesCount} activities
          </span>
        </div>

        {/* Progress bar */}
        {typeof progress === "number" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Planning progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Members */}
        {members && members.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <AvatarGroup
              avatars={members.map((m) => ({ name: m.name, src: m.avatar }))}
              max={3}
              size="xs"
            />
            <span className="text-xs text-neutral-400">
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
