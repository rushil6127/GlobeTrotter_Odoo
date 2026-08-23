"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ───────── Spinner ───────── */

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        spinnerSizes[size],
        className
      )}
    />
  );
}

/* ───────── FullPageLoader ───────── */

export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-neutral-500 animate-pulse">{message}</p>
      )}
    </div>
  );
}

/* ───────── Skeleton ───────── */

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClass = "bg-neutral-200/80 animate-pulse";

  const variantClass = {
    text: "rounded-md h-4",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  if (lines > 1 && variant === "text") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClass, variantClass.text)}
            style={{
              width: i === lines - 1 ? "75%" : width || "100%",
              height: height || undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClass, variantClass[variant], className)}
      style={{
        width: width || (variant === "circular" ? 40 : "100%"),
        height:
          height || (variant === "circular" ? 40 : variant === "text" ? 16 : 100),
      }}
    />
  );
}

/* ───────── Card Skeleton ───────── */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs",
        className
      )}
    >
      <Skeleton variant="rounded" height={192} className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
        <div className="flex gap-2 pt-1">
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </div>
      </div>
    </div>
  );
}

/* ───────── Dashboard Skeleton ───────── */

export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header skeleton */}
      <div className="space-y-3 pt-4">
        <Skeleton variant="text" width="40%" height={36} />
        <Skeleton variant="text" width="60%" />
      </div>

      {/* Next adventure banner skeleton */}
      <div className="bg-white/80 rounded-2xl border border-neutral-100 p-6 flex flex-col md:flex-row gap-6">
        <Skeleton variant="rounded" width="100%" height={180} className="md:w-72 shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" lines={2} />
          <div className="flex gap-4">
            <Skeleton variant="rounded" width={100} height={20} />
            <Skeleton variant="rounded" width={100} height={20} />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

/* ───────── Itinerary Skeleton ───────── */

export function ItinerarySkeleton() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Day header */}
      <div className="p-4 rounded-xl bg-neutral-100/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" width={40} height={40} />
          <div className="space-y-1.5">
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={120} height={12} />
          </div>
        </div>
        <Skeleton variant="rounded" width={70} height={20} />
      </div>

      {/* Activity items */}
      <div className="pl-6 space-y-4 border-l-2 border-neutral-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-neutral-100 space-y-2">
            <Skeleton variant="text" width={60} height={12} />
            <Skeleton variant="text" width="70%" height={18} />
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Budget Skeleton ───────── */

export function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      {/* 3 stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-neutral-100 space-y-2 text-center">
            <Skeleton variant="text" width="40%" height={12} className="mx-auto" />
            <Skeleton variant="text" width="60%" height={24} className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Progress meter */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-3">
        <div className="flex justify-between">
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={40} />
        </div>
        <Skeleton variant="rounded" height={10} />
      </div>

      {/* Category breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-4">
        <Skeleton variant="text" width={140} height={16} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="rounded" width={32} height={32} />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" width="50%" height={12} />
              <Skeleton variant="rounded" height={6} />
            </div>
            <Skeleton variant="text" width={50} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Calendar Skeleton ───────── */

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Month nav header */}
      <div className="flex justify-between items-center py-2">
        <Skeleton variant="text" width={160} height={24} />
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="rounded" width={32} height={32} />
        </div>
      </div>

      {/* 7-column grid */}
      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-neutral-50 p-2 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="text" height={12} className="mx-auto" />
          ))}
        </div>
        <div className="grid grid-cols-7 p-2 gap-2 bg-white">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[80px] p-1.5 border border-neutral-100 rounded-lg space-y-1">
              <Skeleton variant="circular" width={20} height={20} />
              {i % 3 === 0 && <Skeleton variant="rounded" height={14} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
