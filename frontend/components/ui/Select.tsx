"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/* ───────── Types ───────── */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/* ───────── Size styles ───────── */

const sizeStyles = {
  sm: "h-8 text-sm pl-3 pr-8",
  md: "h-10 text-sm pl-4 pr-10",
  lg: "h-12 text-base pl-4 pr-10",
};

/* ───────── Component ───────── */

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      placeholder,
      selectSize = "md",
      fullWidth = true,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full rounded-xl border bg-white appearance-none",
              "text-neutral-900 transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              "border-neutral-200 hover:border-neutral-300",
              "focus:border-primary focus:ring-primary/20",
              sizeStyles[selectSize],
              error &&
                "border-error focus:border-error focus:ring-error/20",
              props.disabled &&
                "opacity-50 cursor-not-allowed bg-neutral-50",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        </div>

        {(helperText || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-error" : "text-neutral-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
