"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Plus, MoreHorizontal, GripVertical, ArrowRight, DollarSign } from "lucide-react";

/* ═════════════════════════════════════════
   DAY HEADER
   ═════════════════════════════════════════ */

export interface DayHeaderProps {
  dayNumber: number;
  date: string;
  city?: string;
  activityCount?: number;
  className?: string;
}

export function DayHeader({
  dayNumber,
  date,
  city,
  activityCount,
  className,
}: DayHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3.5 px-5 rounded-2xl",
        "bg-white/80 backdrop-blur-md border border-neutral-200/60 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
          {dayNumber}
        </div>
        <div>
          <h3 className="font-display font-bold text-neutral-900 text-base">Day {dayNumber}</h3>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            {date}
            {city && (
              <>
                <span className="mx-1.5 text-neutral-300">·</span>
                <span className="text-primary font-semibold">{city}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {activityCount !== undefined && (
        <span className="text-xs text-neutral-600 bg-neutral-100/80 font-medium px-3 py-1 rounded-full border border-neutral-200/50">
          {activityCount} {activityCount === 1 ? "activity" : "activities"}
        </span>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════
   TIMELINE LINE + MARKER
   ═════════════════════════════════════════ */

export function TimelineLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute left-5 top-10 bottom-0 w-0.5 bg-neutral-200/80",
        className
      )}
    />
  );
}

export function TimelineMarker({
  active,
  completed,
  className,
}: {
  active?: boolean;
  completed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-10 h-3.5 w-3.5 rounded-full border-2 shrink-0 shadow-sm",
        "transition-all duration-200",
        completed
          ? "bg-primary border-primary"
          : active
          ? "bg-white border-primary ring-4 ring-primary/20 scale-110"
          : "bg-white border-neutral-300",
        className
      )}
    />
  );
}

/* ═════════════════════════════════════════
   ACTIVITY TIMELINE CARD
   ═════════════════════════════════════════ */

export interface ActivityTimelineCardProps {
  time: string;
  title: string;
  location?: string;
  duration?: string;
  estimatedCost?: number;
  currency?: string;
  category?: string;
  image?: string;
  active?: boolean;
  completed?: boolean;
  onMore?: () => void;
  className?: string;
}

export function ActivityTimelineCard({
  time,
  title,
  location,
  duration,
  estimatedCost,
  currency = "₹",
  category,
  image,
  active,
  completed,
  onMore,
  className,
}: ActivityTimelineCardProps) {
  return (
    <div className={cn("flex gap-4 group", className)}>
      {/* Timeline column */}
      <div className="flex flex-col items-center pt-2">
        <TimelineMarker active={active} completed={completed} />
        <div className="flex-1 w-0.5 bg-neutral-200 mt-2" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 bg-white/90 backdrop-blur-sm rounded-2xl border p-4 sm:p-5 mb-4",
          "shadow-sm hover:shadow-md transition-all duration-200",
          active
            ? "border-primary/40 ring-2 ring-primary/10 shadow-md"
            : "border-neutral-200/70 hover:border-primary/30"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Time badge */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span>{time}</span>
            </div>

            {/* Title */}
            <h4 className="font-bold text-neutral-900 text-base leading-snug">{title}</h4>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 font-medium pt-0.5">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  {location}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                  {duration}
                </span>
              )}
              {estimatedCost !== undefined && estimatedCost > 0 && (
                <span className="font-semibold text-neutral-800 flex items-center gap-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
                  {currency}{estimatedCost.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Image thumbnail */}
          {image && (
            <img
              src={image}
              alt={title}
              className="h-16 w-16 rounded-xl object-cover shrink-0 border border-neutral-100 shadow-sm"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100">
          {category && (
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
              {category}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
              <GripVertical className="h-4 w-4" />
            </button>
            {onMore && (
              <button
                onClick={onMore}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   TIME INDICATOR
   ═════════════════════════════════════════ */

export function TimeIndicator({
  time,
  className,
}: {
  time: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-semibold text-primary",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {time}
    </div>
  );
}

/* ═════════════════════════════════════════
   CITY TRANSITION
   ═════════════════════════════════════════ */

export function CityTransition({
  fromCity,
  toCity,
  transportMode,
  className,
}: {
  fromCity: string;
  toCity: string;
  transportMode?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3.5 px-5 my-3 rounded-2xl",
        "bg-gradient-to-r from-accent/10 via-accent/5 to-transparent",
        "border border-dashed border-accent/40 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
        <MapPin className="h-4 w-4 text-accent" />
        <span>{fromCity}</span>
        <ArrowRight className="h-4 w-4 text-accent" />
        <span>{toCity}</span>
      </div>
      {transportMode && (
        <span className="text-xs text-neutral-500 font-medium ml-auto bg-white/80 px-2.5 py-1 rounded-lg border border-neutral-200/50">
          via {transportMode}
        </span>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════
   ADD ACTIVITY BUTTON
   ═════════════════════════════════════════ */

export function AddActivityButton({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl",
        "border-2 border-dashed border-neutral-300/80 bg-white/50",
        "text-neutral-500 text-sm font-semibold",
        "hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm",
        "transition-all duration-200 cursor-pointer",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      Schedule Activity
    </button>
  );
}
