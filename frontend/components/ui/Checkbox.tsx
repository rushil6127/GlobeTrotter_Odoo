"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

/* ───────── Types ───────── */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
  error?: string;
}

/* ───────── Component ───────── */

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, indeterminate, error, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      const el = innerRef.current;
      if (el) el.indeterminate = !!indeterminate;
    }, [indeterminate]);

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={(node) => {
              (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-5 rounded-md border-2 flex items-center justify-center cursor-pointer",
              "transition-all duration-200",
              "border-neutral-300 bg-white",
              "peer-hover:border-primary/60",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/20 peer-focus-visible:ring-offset-1",
              "peer-checked:bg-primary peer-checked:border-primary",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              error && "border-error"
            )}
            onClick={() => innerRef.current?.click()}
          >
            {props.checked && !indeterminate && (
              <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
            )}
            {indeterminate && (
              <Minus className="h-3.5 w-3.5 text-white stroke-[3]" />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm font-medium text-neutral-700 cursor-pointer select-none",
                  props.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            )}
            {error && <p className="text-xs text-error mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
