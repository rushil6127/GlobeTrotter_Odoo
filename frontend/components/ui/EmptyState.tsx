"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Compass, PackageOpen, Search } from "lucide-react";

/* ───────── Types ───────── */

export type EmptyStateVariant = "default" | "search" | "trips" | "activities";

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
  default: <PackageOpen className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  trips: <Compass className="h-12 w-12" />,
  activities: <MapPin className="h-12 w-12" />,
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
        "flex flex-col items-center justify-center text-center py-16 px-8",
        className
      )}
    >
      <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 mb-6">
        {icon || variantIcons[variant]}
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
