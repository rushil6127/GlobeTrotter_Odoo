"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ───────── Types ───────── */

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

/* ───────── Component ───────── */

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content. Please check your connection and try again.",
  onRetry,
  retryLabel = "Try Again",
  className,
  icon,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        "bg-white/60 backdrop-blur-sm rounded-2xl border border-red-100",
        className
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4 shadow-sm">
        {icon || <AlertCircle className="h-8 w-8" />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-md mb-6">{description}</p>
      )}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
