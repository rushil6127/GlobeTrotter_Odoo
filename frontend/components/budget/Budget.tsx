"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingDown,
  AlertTriangle,
  Utensils,
  Car,
  BedDouble,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";

/* ═════════════════════════════════════════
   EXPENSE CATEGORY BADGE
   ═════════════════════════════════════════ */

export type ExpenseCategory =
  | "transport"
  | "food"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

const expenseCategoryConfig: Record<
  ExpenseCategory,
  { icon: React.ReactNode; color: string; bgColor: string; label: string }
> = {
  transport: {
    icon: <Car className="h-4 w-4" />,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    label: "Transport",
  },
  food: {
    icon: <Utensils className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Food",
  },
  accommodation: {
    icon: <BedDouble className="h-4 w-4" />,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    label: "Accommodation",
  },
  activities: {
    icon: <Ticket className="h-4 w-4" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Activities",
  },
  shopping: {
    icon: <ShoppingBag className="h-4 w-4" />,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    label: "Shopping",
  },
  other: {
    icon: <Wallet className="h-4 w-4" />,
    color: "text-neutral-600",
    bgColor: "bg-neutral-50",
    label: "Other",
  },
};

export function ExpenseCategoryBadge({
  category,
  className,
}: {
  category: ExpenseCategory;
  className?: string;
}) {
  const config = expenseCategoryConfig[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

/* ═════════════════════════════════════════
   BUDGET PROGRESS BAR
   ═════════════════════════════════════════ */

export interface BudgetProgressBarProps {
  spent: number;
  total: number;
  currency?: string;
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BudgetProgressBar({
  spent,
  total,
  currency = "₹",
  showLabels = true,
  size = "md",
  className,
}: BudgetProgressBarProps) {
  const percentage = total > 0 ? Math.round((spent / total) * 100) : 0;
  const isOver = spent > total;
  const isWarning = percentage > 80 && !isOver;

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabels && (
        <div className="flex justify-between text-xs text-neutral-500">
          <span>
            {currency}{spent.toLocaleString()} of {currency}{total.toLocaleString()}
          </span>
          <span className={cn("font-semibold", isOver ? "text-error" : isWarning ? "text-amber-600" : "text-primary")}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={cn("bg-neutral-100 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isOver
              ? "bg-gradient-to-r from-red-400 to-red-500"
              : isWarning
              ? "bg-gradient-to-r from-amber-400 to-amber-500"
              : "bg-gradient-to-r from-primary to-primary-400"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   EXPENSE ROW
   ═════════════════════════════════════════ */

export interface ExpenseRowProps {
  description: string;
  amount: number;
  currency?: string;
  category: ExpenseCategory;
  date: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ExpenseRow({
  description,
  amount,
  currency = "₹",
  category,
  date,
  onEdit,
  onDelete,
  className,
}: ExpenseRowProps) {
  const config = expenseCategoryConfig[category];

  return (
    <div
      className={cn(
        "flex items-center gap-4 py-3 px-4 rounded-xl",
        "hover:bg-neutral-50 transition-colors group",
        className
      )}
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", config.bgColor, config.color)}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">
          {description}
        </p>
        <p className="text-xs text-neutral-400">{date}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-neutral-900">
          {currency}{amount.toLocaleString()}
        </p>
        <p className="text-[10px] text-neutral-400 uppercase">{config.label}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={onEdit}
            className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/5"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-error hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   BUDGET SUMMARY CARD
   ═════════════════════════════════════════ */

export interface BudgetSummaryCardProps {
  totalBudget: number;
  spent: number;
  currency?: string;
  categories: { category: ExpenseCategory; amount: number }[];
  className?: string;
}

export function BudgetSummaryCard({
  totalBudget,
  spent,
  currency = "₹",
  categories,
  className,
}: BudgetSummaryCardProps) {
  const remaining = totalBudget - spent;
  const isOver = remaining < 0;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-100 overflow-hidden",
        "shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-neutral-900">Budget Summary</h3>
          {isOver && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-error bg-red-50 px-2 py-1 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              Over budget
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-neutral-50 rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Budget</p>
            <p className="text-base font-bold text-neutral-900">{currency}{totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Spent</p>
            <p className="text-base font-bold text-neutral-900">{currency}{spent.toLocaleString()}</p>
          </div>
          <div className={cn("rounded-xl p-3 text-center", isOver ? "bg-red-50" : "bg-emerald-50")}>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
              {isOver ? "Over" : "Left"}
            </p>
            <p className={cn("text-base font-bold", isOver ? "text-error" : "text-emerald-600")}>
              {currency}{Math.abs(remaining).toLocaleString()}
            </p>
          </div>
        </div>

        <BudgetProgressBar spent={spent} total={totalBudget} currency={currency} />
      </div>

      {/* Category breakdown */}
      <div className="border-t border-neutral-100 p-6 pt-4">
        <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          By Category
        </h4>
        <div className="space-y-2.5">
          {categories.map(({ category, amount }) => {
            const config = expenseCategoryConfig[category];
            const pct = spent > 0 ? Math.round((amount / spent) * 100) : 0;
            return (
              <div key={category} className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.bgColor, config.color)}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-700">{config.label}</span>
                    <span className="text-xs font-semibold text-neutral-900">
                      {currency}{amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", config.bgColor.replace("50", "300"))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   CATEGORY BREAKDOWN (simple)
   ═════════════════════════════════════════ */

export function CategoryBreakdown({
  categories,
  total,
  currency = "₹",
  className,
}: {
  categories: { category: ExpenseCategory; amount: number }[];
  total: number;
  currency?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {categories.map(({ category, amount }) => {
        const config = expenseCategoryConfig[category];
        const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
        return (
          <div key={category} className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", config.bgColor, config.color)}>
              {config.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-neutral-700">{config.label}</span>
                <span className="font-semibold text-neutral-900">{currency}{amount.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
