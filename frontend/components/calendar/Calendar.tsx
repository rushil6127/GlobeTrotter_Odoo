"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";

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
  children?: React.ReactNode;
}

export function CalendarHeader({
  month,
  year,
  onPrev,
  onNext,
  onToday,
  className,
  children,
}: CalendarHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 tracking-tight">
          {month} <span className="text-primary font-normal">{year}</span>
        </h2>
        {onToday && (
          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all shadow-2xs"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {children}
        <div className="flex items-center gap-1 bg-white border border-neutral-200/80 rounded-2xl p-1 shadow-xs">
          <button
            type="button"
            onClick={onPrev}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR EVENT ITEM
   ═════════════════════════════════════════ */

export interface CalendarEventData {
  id: string;
  title: string;
  category?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  estimatedCost?: number | null;
  dayNumber?: number;
  notes?: string | null;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Sightseeing: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  Food: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Adventure: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  "Water Sports": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  Culture: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  Shopping: { bg: "bg-pink-50", text: "text-pink-800", border: "border-pink-200" },
  Nightlife: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  Relaxation: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
};

export function CalendarEventPill({
  event,
  className,
}: {
  event: CalendarEventData;
  className?: string;
}) {
  const cat = event.category ?? "Sightseeing";
  const colors = categoryColors[cat] || {
    bg: "bg-primary/10",
    text: "text-primary-900",
    border: "border-primary/20",
  };

  return (
    <div
      className={cn(
        "px-2 py-1 rounded-lg text-[11px] font-semibold border truncate flex items-center justify-between gap-1 shadow-2xs transition-all hover:brightness-95",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      title={`${event.title}${event.startTime ? ` (${event.startTime})` : ""}`}
    >
      <span className="truncate">{event.title}</span>
      {event.startTime && (
        <span className="shrink-0 text-[10px] opacity-80 font-mono font-bold">
          {event.startTime}
        </span>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR DAY CELL
   ═════════════════════════════════════════ */

export interface CalendarDayCellProps {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isToday?: boolean;
  isSelected?: boolean;
  isCurrentMonth?: boolean;
  isTripDay?: boolean;
  isTripStart?: boolean;
  isTripEnd?: boolean;
  tripDayNumber?: number;
  events?: CalendarEventData[];
  onClick?: () => void;
  className?: string;
}

export function CalendarDayCell({
  dateStr,
  dayNumber,
  isToday,
  isSelected,
  isCurrentMonth = true,
  isTripDay = false,
  isTripStart = false,
  isTripEnd = false,
  tripDayNumber,
  events = [],
  onClick,
  className,
}: CalendarDayCellProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[110px] sm:min-h-[125px] p-2.5 border border-neutral-100/80 cursor-pointer transition-all duration-150 relative flex flex-col justify-between group",
        isCurrentMonth ? "bg-white" : "bg-neutral-50/40 text-neutral-300",
        isTripDay && isCurrentMonth && "bg-primary/5",
        isToday && "bg-amber-50/40",
        isSelected && "ring-2 ring-primary ring-inset z-10 bg-primary/10",
        !isSelected && "hover:bg-neutral-50/90",
        className
      )}
    >
      {/* Header of Day */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span
          className={cn(
            "text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center transition-colors",
            isToday
              ? "bg-amber-500 text-white font-extrabold shadow-xs"
              : isSelected
              ? "bg-neutral-900 text-white"
              : isCurrentMonth
              ? "text-neutral-700 group-hover:text-neutral-900"
              : "text-neutral-300"
          )}
        >
          {dayNumber}
        </span>

        {isTripDay && tripDayNumber != null && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-tight uppercase shrink-0",
              isTripStart || isTripEnd
                ? "bg-primary text-white shadow-2xs"
                : "bg-primary/15 text-primary"
            )}
          >
            {isTripStart ? "Day 1 · Start" : isTripEnd ? `Day ${tripDayNumber} · End` : `Day ${tripDayNumber}`}
          </span>
        )}
      </div>

      {/* Events inside Day */}
      <div className="space-y-1 flex-1 overflow-hidden">
        {events.slice(0, 3).map((event) => (
          <CalendarEventPill key={event.id} event={event} />
        ))}
        {events.length > 3 && (
          <span className="block text-[10px] text-neutral-500 font-bold pl-1 pt-0.5">
            +{events.length - 3} more
          </span>
        )}
      </div>

      {/* Trip Duration Bottom Accent */}
      {isTripDay && (
        <div
          className={cn(
            "h-1 rounded-full mt-1.5",
            isTripStart || isTripEnd ? "bg-primary" : "bg-primary/30"
          )}
        />
      )}
    </div>
  );
}

/* ═════════════════════════════════════════
   CALENDAR GRID
   ═════════════════════════════════════════ */

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface CalendarGridProps {
  days: CalendarDayCellProps[];
  className?: string;
}

export function CalendarGrid({ days, className }: CalendarGridProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm bg-white",
        className
      )}
    >
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-neutral-50/90 border-b border-neutral-200/80">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100">
        {days.map((dayProps, i) => (
          <CalendarDayCell key={i} {...dayProps} />
        ))}
      </div>
    </div>
  );
}
