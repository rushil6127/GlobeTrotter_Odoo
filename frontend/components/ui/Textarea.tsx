"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  showCount?: boolean;
  fullWidth?: boolean;
}

/* ───────── Component ───────── */

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      success,
      showCount,
      maxLength,
      fullWidth = true,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-xl border bg-white min-h-[100px] p-4",
            "text-sm text-neutral-900 placeholder:text-neutral-400",
            "transition-all duration-200 ease-out resize-y",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "border-neutral-200 hover:border-neutral-300",
            "focus:border-primary focus:ring-primary/20",
            error &&
              "border-error focus:border-error focus:ring-error/20",
            success &&
              "border-success focus:border-success focus:ring-success/20",
            props.disabled &&
              "opacity-50 cursor-not-allowed bg-neutral-50 resize-none",
            className
          )}
          {...props}
        />

        <div className="flex justify-between items-center">
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
          {showCount && maxLength && (
            <p className="text-xs text-neutral-400 ml-auto">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
