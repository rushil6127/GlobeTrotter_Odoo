"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Search, Eye, EyeOff } from "lucide-react";

/* ───────── Types ───────── */

export type InputVariant = "default" | "search";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: InputVariant;
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

/* ───────── Size styles ───────── */

const sizeStyles = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-sm px-4",
  lg: "h-12 text-base px-4",
};

/* ───────── Component ───────── */

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = "default",
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      inputSize = "md",
      fullWidth = true,
      type,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {/* Left icon or search icon */}
          {(leftIcon || variant === "search") && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {variant === "search" ? (
                <Search className="h-4 w-4" />
              ) : (
                leftIcon
              )}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              // Base
              "w-full rounded-xl border bg-white",
              "text-neutral-900 placeholder:text-neutral-400",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-offset-0",
              // Default state
              "border-neutral-200 hover:border-neutral-300",
              "focus:border-primary focus:ring-primary/20",
              // Size
              sizeStyles[inputSize],
              // Left icon padding
              (leftIcon || variant === "search") && "pl-10",
              // Right icon padding
              (rightIcon || isPassword) && "pr-10",
              // Error state
              error &&
                "border-error focus:border-error focus:ring-error/20 text-error",
              // Success state
              success &&
                "border-success focus:border-success focus:ring-success/20",
              // Disabled
              props.disabled &&
                "opacity-50 cursor-not-allowed bg-neutral-50",
              className
            )}
            {...props}
          />

          {/* Right icon or password toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <span className="text-neutral-400 pointer-events-none">
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Helper / Error text */}
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

Input.displayName = "Input";
