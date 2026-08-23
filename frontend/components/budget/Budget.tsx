"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Wallet,
  AlertTriangle,
  Trash2,
  Edit,
} from "lucide-react";
import {
  ExpenseCategory,
  getExpenseCategoryConfig,
} from "@/lib/categories";
import { formatCurrency } from "@/lib/formatters";

/* ═════════════════════════════════════════
   EXPENSE CATEGORY BADGE
   ═════════════════════════════════════════ */

export type { ExpenseCategory };

export function ExpenseCategoryBadge({
  category,
  className,
}: {
  category: ExpenseCategory;
  className?: string;
}) {
  const config = getExpenseCategoryConfig(category);
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
        config.bgColor,
        config.color,
        config.borderColor,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
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
          <span className="truncate">
            {formatCurrency(spent, currency)} of {formatCurrency(total, currency)}
          </span>
          <span
            className={cn(
              "font-semibold shrink-0 ml-2",
              isOver ? "text-error" : isWarning ? "text-amber-600" : "text-primary"
            )}
          >
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
  const config = getExpenseCategoryConfig(category);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-xl",
        "hover:bg-neutral-50/80 transition-colors group",
        className
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
          config.bgColor,
          config.color,
          config.borderColor
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">
          {description}
        </p>
        <p className="text-xs text-neutral-400">{date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-neutral-900">
          {formatCurrency(amount, currency)}
        </p>
        <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
          {config.label}
        </p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Edit expense"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-error hover:bg-red-50 transition-colors"
              aria-label="Delete expense"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
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
        "bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-neutral-900 text-base">
            Budget Summary
          </h3>
          {isOver && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-error bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              <AlertTriangle className="h-3 w-3" />
              Over budget
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-neutral-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5 sm:mb-1">
              Budget
            </p>
            <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">
              {formatCurrency(totalBudget, currency)}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5 sm:mb-1">
              Spent
            </p>
            <p className="text-sm sm:text-base font-bold text-neutral-900 truncate">
              {formatCurrency(spent, currency)}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl p-2.5 sm:p-3 text-center",
              isOver ? "bg-red-50" : "bg-emerald-50"
            )}
          >
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5 sm:mb-1">
              {isOver ? "Over" : "Left"}
            </p>
            <p
              className={cn(
                "text-sm sm:text-base font-bold truncate",
                isOver ? "text-error" : "text-emerald-600"
              )}
            >
              {formatCurrency(Math.abs(remaining), currency)}
            </p>
          </div>
        </div>

        <BudgetProgressBar spent={spent} total={totalBudget} currency={currency} />
      </div>

      {/* Category breakdown */}
      {categories && categories.length > 0 && (
        <div className="border-t border-neutral-100 p-4 sm:p-6 pt-4">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            By Category
          </h4>
          <div className="space-y-2.5">
            {categories.map(({ category, amount }) => {
              const config = getExpenseCategoryConfig(category);
              const Icon = config.icon;
              const pct = spent > 0 ? Math.round((amount / spent) * 100) : 0;
              return (
                <div key={category} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                      config.bgColor,
                      config.color,
                      config.borderColor
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-700 truncate">
                        {config.label}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900 ml-2">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-primary/70 transition-all duration-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 w-8 text-right shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
        const config = getExpenseCategoryConfig(category);
        const Icon = config.icon;
        const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
        return (
          <div key={category} className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                config.bgColor,
                config.color,
                config.borderColor
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-neutral-700 truncate">
                  {config.label}
                </span>
                <span className="font-semibold text-neutral-900 ml-2">
                  {formatCurrency(amount, currency)}
                </span>
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
