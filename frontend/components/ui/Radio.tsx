"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  direction?: "horizontal" | "vertical";
  className?: string;
}

/* ───────── Component ───────── */

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  direction = "vertical",
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      {label && (
        <legend className="text-sm font-medium text-neutral-700 mb-1">
          {label}
        </legend>
      )}

      <div
        className={cn(
          "flex gap-3",
          direction === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-start gap-3 cursor-pointer group",
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                onChange={() => onChange?.(option.value)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  "transition-all duration-200",
                  "border-neutral-300 bg-white",
                  "group-hover:border-primary/60",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-1",
                  "peer-checked:border-primary",
                  error && "border-error"
                )}
              >
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-all duration-200",
                    value === option.value
                      ? "bg-primary scale-100"
                      : "bg-transparent scale-0"
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-700 select-none">
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-neutral-500 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </fieldset>
  );
}
