"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

/* ───────── Types ───────── */

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

/* ───────── Variant config ───────── */

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    bg: "bg-white",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    bg: "bg-white",
    border: "border-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bg: "bg-white",
    border: "border-amber-200",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    bg: "bg-white",
    border: "border-sky-200",
    iconColor: "text-sky-500",
  },
};

/* ───────── Toast item ───────── */

export interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const config = variantConfig[toast.variant];

  React.useEffect(() => {
    if (toast.duration === 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg w-full max-w-sm",
        "animate-in slide-in-from-top-2 fade-in duration-300",
        config.bg,
        config.border
      )}
      role="alert"
    >
      <span className={cn("shrink-0 mt-0.5", config.iconColor)}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-neutral-500 mt-0.5">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ───────── Toast container ───────── */

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
