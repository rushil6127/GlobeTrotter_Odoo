"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

/* ───────── Types ───────── */

export interface BudgetCardProps {
  totalBudget: number;
  spent: number;
  currency?: string;
  className?: string;
}

/* ───────── Component ───────── */

export function BudgetCard({
  totalBudget,
  spent,
  currency = "₹",
  className,
}: BudgetCardProps) {
  const remaining = totalBudget - spent;
  const percentage = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;
  const isOverBudget = remaining < 0;
  const isWarning = percentage > 80 && !isOverBudget;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-100 p-4 sm:p-6",
        "shadow-xs hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-sm">Budget</h3>
            <p className="text-xs text-neutral-500">Trip spending overview</p>
          </div>
        </div>
        {isOverBudget && (
          <div className="flex items-center gap-1 text-error text-xs font-medium bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Over budget</span>
          </div>
        )}
        {isWarning && (
          <div className="flex items-center gap-1 text-amber-600 text-xs font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Almost full</span>
          </div>
        )}
      </div>

      {/* Amount display */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Total</p>
          <p className="text-sm sm:text-lg font-bold text-neutral-900 truncate">
            {formatCurrency(totalBudget, currency)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Spent</p>
          <p className="text-sm sm:text-lg font-bold text-neutral-900 flex items-center gap-1 truncate">
            <TrendingDown className="h-3.5 w-3.5 text-error shrink-0" />
            <span className="truncate">{formatCurrency(spent, currency)}</span>
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Remaining</p>
          <p
            className={cn(
              "text-sm sm:text-lg font-bold flex items-center gap-1 truncate",
              isOverBudget ? "text-error" : "text-emerald-600"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{formatCurrency(Math.abs(remaining), currency)}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{percentage}% used</span>
          <span>{formatCurrency(remaining >= 0 ? remaining : 0, currency)} left</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isOverBudget
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : isWarning
                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                : "bg-gradient-to-r from-primary to-primary-500"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
