"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Compass,
  PackageOpen,
  Search,
  Wallet,
  CalendarDays,
  Clock,
  AlertCircle,
} from "lucide-react";

/* ───────── Types ───────── */

export type EmptyStateVariant =
  | "default"
  | "search"
  | "trips"
  | "activities"
  | "budget"
  | "calendar"
  | "itinerary"
  | "error";

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/* ───────── Variant icons ───────── */

const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <PackageOpen className="h-10 w-10 sm:h-12 sm:w-12" />,
  search: <Search className="h-10 w-10 sm:h-12 sm:w-12" />,
  trips: <Compass className="h-10 w-10 sm:h-12 sm:w-12" />,
  activities: <MapPin className="h-10 w-10 sm:h-12 sm:w-12" />,
  budget: <Wallet className="h-10 w-10 sm:h-12 sm:w-12" />,
  calendar: <CalendarDays className="h-10 w-10 sm:h-12 sm:w-12" />,
  itinerary: <Clock className="h-10 w-10 sm:h-12 sm:w-12" />,
  error: <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-error" />,
};

/* ───────── Component ───────── */

export function EmptyState({
  variant = "default",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4 sm:px-8",
        className
      )}
    >
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/60 mb-5 shadow-xs">
        {icon || variantIcons[variant]}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
