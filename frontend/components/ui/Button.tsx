"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ───────── Types ───────── */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/* ───────── Variant styles ───────── */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary/40 shadow-sm hover:shadow-md",
  secondary:
    "bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary/40 shadow-sm",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10 focus-visible:ring-primary/40",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400/40",
  danger:
    "bg-error text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-error/40 shadow-sm",
  icon: "bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-neutral-400/40 !p-0",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-lg",
  md: "h-10 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-7 text-base gap-2.5 rounded-xl",
};

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-xl",
};

/* ───────── Component ───────── */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const isIcon = variant === "icon";

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center font-semibold",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "select-none whitespace-nowrap",
          // Variant
          variantStyles[variant],
          // Size
          isIcon ? iconSizeStyles[size] : sizeStyles[size],
          // Modifiers
          fullWidth && "w-full",
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        )}
        {!loading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}
        {!isIcon && children && (
          <span className={cn(loading && "opacity-0 invisible", "truncate")}>
            {children}
          </span>
        )}
        {isIcon && !loading && children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
