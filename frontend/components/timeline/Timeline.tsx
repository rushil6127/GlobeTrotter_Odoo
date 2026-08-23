"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Plus, MoreHorizontal, GripVertical, ArrowRight } from "lucide-react";
import { getActivityCategoryConfig } from "@/lib/categories";

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
        "flex items-center justify-between py-3 px-3 sm:px-4 rounded-xl",
        "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
        "border border-primary/10 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          {dayNumber}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
            Day {dayNumber}
          </h3>
          <p className="text-xs text-neutral-500 truncate">
            {date}
            {city && (
              <>
                <span className="mx-1">·</span>
                <span className="text-primary font-medium">{city}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {activityCount !== undefined && (
        <span className="text-xs font-medium text-neutral-600 bg-white/80 border border-neutral-200 px-2.5 py-1 rounded-full shrink-0 ml-2 shadow-2xs">
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
        "absolute left-4 sm:left-5 top-10 bottom-0 w-0.5 bg-neutral-200",
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
        "relative z-10 h-3.5 w-3.5 rounded-full border-2 shrink-0 shadow-2xs",
        "transition-all duration-200",
        completed
          ? "bg-primary border-primary"
          : active
          ? "bg-white border-primary ring-4 ring-primary/20"
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
  category,
  image,
  active,
  completed,
  onMore,
  className,
}: ActivityTimelineCardProps) {
  const catConfig = category ? getActivityCategoryConfig(category) : null;

  return (
    <div className={cn("flex gap-2.5 sm:gap-4 group", className)}>
      {/* Timeline column */}
      <div className="flex flex-col items-center pt-2 sm:pt-1.5 shrink-0">
        <TimelineMarker active={active} completed={completed} />
        <div className="flex-1 w-0.5 bg-neutral-200/80 mt-2" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 bg-white rounded-xl border p-3.5 sm:p-4 mb-3 sm:mb-4",
          "transition-all duration-200 shadow-2xs",
          active
            ? "border-primary/40 shadow-sm shadow-primary/10 ring-1 ring-primary/20"
            : "border-neutral-100 hover:border-neutral-200 hover:shadow-xs"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Time */}
            <span className="text-xs font-semibold text-primary">{time}</span>

            {/* Title */}
            <h4 className="font-semibold text-neutral-900 mt-0.5 sm:mt-1 text-sm sm:text-base leading-snug">
              {title}
            </h4>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-neutral-500">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-neutral-400 shrink-0" />
                  <span>{duration}</span>
                </span>
              )}
            </div>
          </div>

          {/* Image thumbnail */}
          {image && (
            <img
              src={image}
              alt={title}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover shrink-0 shadow-2xs"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-50">
          {catConfig ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border",
                catConfig.bgColor,
                catConfig.color,
                catConfig.borderColor
              )}
            >
              <span>{catConfig.emoji}</span>
              <span>{catConfig.label}</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
              aria-label="Reorder activity"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onMore}
              className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
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
        "flex items-center gap-1.5 text-xs font-semibold text-primary",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{time}</span>
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
        "flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 px-3 sm:px-4 my-2 rounded-xl",
        "bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10",
        "border border-dashed border-accent/40 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-neutral-700 truncate">
        <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="truncate">{fromCity}</span>
        <ArrowRight className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="truncate">{toCity}</span>
      </div>
      {transportMode && (
        <span className="text-[11px] sm:text-xs text-neutral-500 ml-auto shrink-0 font-medium">
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
        "flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 px-4 rounded-xl",
        "border-2 border-dashed border-neutral-200",
        "text-neutral-400 text-sm font-medium",
        "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
        "transition-all duration-200",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      <span>Add activity</span>
    </button>
  );
}
