"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/* ───────── Size map ───────── */

const sizes = {
  sm: { track: "w-8 h-5", thumb: "h-3.5 w-3.5", translate: "translate-x-3" },
  md: { track: "w-10 h-6", thumb: "h-4.5 w-4.5", translate: "translate-x-4" },
  lg: { track: "w-12 h-7", thumb: "h-5.5 w-5.5", translate: "translate-x-5" },
};

/* ───────── Component ───────── */

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled,
  size = "md",
  className,
}: ToggleProps) {
  const s = sizes[size];

  return (
    <label
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
          s.track,
          checked ? "bg-primary" : "bg-neutral-300"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
            "translate-x-0.5 mt-[3px]",
            s.thumb,
            checked && s.translate
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-neutral-700">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-neutral-500">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
