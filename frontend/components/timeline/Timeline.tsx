"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Plus, MoreHorizontal, GripVertical, ArrowRight } from "lucide-react";

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
        "flex items-center justify-between py-3 px-4 rounded-xl",
        "bg-gradient-to-r from-primary/5 to-transparent",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
          {dayNumber}
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">Day {dayNumber}</h3>
          <p className="text-xs text-neutral-500">
            {date}
            {city && (
              <>
                <span className="mx-1">·</span>
                <span className="text-primary">{city}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {activityCount !== undefined && (
        <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
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
        "absolute left-5 top-10 bottom-0 w-0.5 bg-neutral-200",
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
        "relative z-10 h-3 w-3 rounded-full border-2 shrink-0",
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
  return (
    <div className={cn("flex gap-4 group", className)}>
      {/* Timeline column */}
      <div className="flex flex-col items-center pt-1.5">
        <TimelineMarker active={active} completed={completed} />
        <div className="flex-1 w-0.5 bg-neutral-200 mt-2" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "flex-1 bg-white rounded-xl border p-4 mb-4",
          "transition-all duration-200",
          active
            ? "border-primary/30 shadow-sm shadow-primary/5"
            : "border-neutral-100 hover:border-neutral-200 hover:shadow-sm"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Time */}
            <span className="text-xs font-semibold text-primary">{time}</span>

            {/* Title */}
            <h4 className="font-semibold text-neutral-900 mt-1">{title}</h4>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {duration}
                </span>
              )}
            </div>
          </div>

          {/* Image thumbnail */}
          {image && (
            <img
              src={image}
              alt={title}
              className="h-14 w-14 rounded-lg object-cover shrink-0"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-50">
          {category && (
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              {category}
            </span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50">
              <GripVertical className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onMore}
              className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
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
        "flex items-center gap-3 py-3 px-4 my-2 rounded-xl",
        "bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5",
        "border border-dashed border-accent/30",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
        <MapPin className="h-4 w-4 text-accent" />
        {fromCity}
        <ArrowRight className="h-4 w-4 text-accent" />
        {toCity}
      </div>
      {transportMode && (
        <span className="text-xs text-neutral-500 ml-auto">
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
        "flex items-center gap-2 w-full py-3 px-4 rounded-xl",
        "border-2 border-dashed border-neutral-200",
        "text-neutral-400 text-sm font-medium",
        "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
        "transition-all duration-200",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      Add activity
    </button>
  );
}
