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
  const baseClass = "bg-neutral-200 animate-pulse";

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
        "bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        className
      )}
    >
      <Skeleton variant="rounded" height={200} className="rounded-none" />
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
