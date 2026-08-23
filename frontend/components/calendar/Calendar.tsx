"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ═════════════════════════════════════════
   CALENDAR HEADER
   ═════════════════════════════════════════ */

export interface CalendarHeaderProps {
  month: string;
  year: number;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  className?: string;
}

export function CalendarHeader({
  month,
  year,
  onPrev,
  onNext,
  onToday,
  className,
}: CalendarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 sm:py-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 font-display">
          {month} {year}
        </h2>
        {onToday && (
          <button
            onClick={onToday}
            className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Today
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR EVENT
   ═════════════════════════════════════════ */

export type CalendarEventType = "trip" | "activity" | "flight" | "hotel";

export interface CalendarEventData {
  id: string;
  title: string;
  type: CalendarEventType;
  color?: string;
}

const eventTypeColors: Record<CalendarEventType, string> = {
  trip: "bg-primary/15 text-primary border-l-primary",
  activity: "bg-accent/15 text-accent-700 border-l-accent",
  flight: "bg-sky-50 text-sky-700 border-l-sky-500",
  hotel: "bg-violet-50 text-violet-700 border-l-violet-500",
};

export function CalendarEvent({
  event,
  className,
}: {
  event: CalendarEventData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium border-l-2 truncate cursor-pointer",
        "hover:opacity-80 transition-opacity shadow-2xs",
        eventTypeColors[event.type],
        className
      )}
    >
      <span className="truncate block">{event.title}</span>
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR DAY
   ═════════════════════════════════════════ */

export interface CalendarDayProps {
  day: number;
  isToday?: boolean;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
  events?: CalendarEventData[];
  onClick?: () => void;
  className?: string;
}

export function CalendarDay({
  day,
  isToday,
  isSelected,
  isCurrentMonth = true,
  events = [],
  onClick,
  className,
}: CalendarDayProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[64px] sm:min-h-[96px] p-1 sm:p-2 border border-neutral-100/80 cursor-pointer",
        "transition-colors duration-150",
        isCurrentMonth ? "bg-white" : "bg-neutral-50/60",
        isSelected && "ring-2 ring-primary ring-inset",
        !isSelected && "hover:bg-neutral-50/90",
        className
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-xs sm:text-sm font-medium",
            isToday
              ? "h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-2xs"
              : isCurrentMonth
              ? "text-neutral-700"
              : "text-neutral-300"
          )}
        >
          {day}
        </span>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        {events.slice(0, 2).map((event) => (
          <CalendarEvent key={event.id} event={event} />
        ))}
        {events.length > 2 && (
          <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium pl-1 block truncate">
            +{events.length - 2} more
          </span>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR GRID
   ═════════════════════════════════════════ */

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface CalendarGridProps {
  days: CalendarDayProps[];
  className?: string;
}

export function CalendarGrid({ days, className }: CalendarGridProps) {
  return (
    <div className={cn("rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs bg-white", className)}>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-neutral-50/90 border-b border-neutral-200/80">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((dayProps, i) => (
          <CalendarDay key={i} {...dayProps} />
        ))}
      </div>
    </div>
  );
}
