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
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

/* ═════════════════════════════════════════
   EXPENSE CATEGORY CONFIGURATION & BADGES
   ═════════════════════════════════════════ */

export type ExpenseCategory =
  | "transport"
  | "food"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

export const expenseCategoryConfig: Record<
  ExpenseCategory,
  {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    barColor: string;
    label: string;
  }
> = {
  transport: {
    icon: <Car className="h-3.5 w-3.5" />,
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    barColor: "bg-sky-500",
    label: "Transport",
  },
  food: {
    icon: <Utensils className="h-3.5 w-3.5" />,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    barColor: "bg-amber-500",
    label: "Food & Dining",
  },
  accommodation: {
    icon: <BedDouble className="h-3.5 w-3.5" />,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    barColor: "bg-indigo-500",
    label: "Accommodation",
  },
  activities: {
    icon: <Ticket className="h-3.5 w-3.5" />,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
    label: "Activities",
  },
  shopping: {
    icon: <ShoppingBag className="h-3.5 w-3.5" />,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    barColor: "bg-pink-500",
    label: "Shopping",
  },
  other: {
    icon: <Wallet className="h-3.5 w-3.5" />,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    barColor: "bg-slate-500",
    label: "Other Expenses",
  },
};

export function ExpenseCategoryBadge({
  category,
  className,
}: {
  category: ExpenseCategory | string;
  className?: string;
}) {
  const catKey = (category?.toLowerCase() as ExpenseCategory) in expenseCategoryConfig
    ? (category.toLowerCase() as ExpenseCategory)
    : "other";
  const config = expenseCategoryConfig[catKey];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border",
        config.bgColor,
        config.color,
        config.borderColor,
        className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
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

  const heights = { sm: "h-2", md: "h-3", lg: "h-4" };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-neutral-900">
              {currency}{spent.toLocaleString()}
            </span>
            <span className="text-neutral-400">of</span>
            <span className="text-neutral-700">
              {currency}{total.toLocaleString()}
            </span>
          </div>
          <span
            className={cn(
              "font-bold px-2 py-0.5 rounded-full text-[11px]",
              isOver
                ? "bg-red-100 text-red-700"
                : isWarning
                ? "bg-amber-100 text-amber-800"
                : "bg-primary/10 text-primary"
            )}
          >
            {percentage}% Used
          </span>
        </div>
      )}
      <div className={cn("bg-neutral-100/90 rounded-full overflow-hidden p-0.5 border border-neutral-200/60", heights[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out shadow-xs",
            isOver
              ? "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse"
              : isWarning
              ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : "bg-gradient-to-r from-primary to-primary-600"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   CATEGORY DISTRIBUTION BAR (MULTI-SEGMENT)
   ═════════════════════════════════════════ */

export interface CategoryBreakdownItem {
  category: ExpenseCategory | string;
  amount: number;
  count?: number;
}

export function CategoryDistributionBar({
  categories,
  totalSpent,
  selectedCategory,
  onSelectCategory,
  className,
}: {
  categories: CategoryBreakdownItem[];
  totalSpent: number;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  className?: string;
}) {
  if (!categories || categories.length === 0 || totalSpent <= 0) {
    return (
      <div className={cn("h-3 bg-neutral-100 rounded-full", className)} />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Multi-segment bar */}
      <div className="h-3.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-neutral-200/60 shadow-inner">
        {categories.map(({ category, amount }) => {
          const catKey = (category.toLowerCase() as ExpenseCategory) in expenseCategoryConfig
            ? (category.toLowerCase() as ExpenseCategory)
            : "other";
          const config = expenseCategoryConfig[catKey];
          const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
          if (pct <= 0) return null;

          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory?.(isSelected ? null : category)}
              title={`${config.label}: ${Math.round(pct)}%`}
              style={{ width: `${pct}%` }}
              className={cn(
                "h-full rounded-sm transition-all duration-300 relative group cursor-pointer focus:outline-none",
                config.barColor,
                isSelected ? "ring-2 ring-neutral-900 ring-offset-1 z-10 brightness-110" : "hover:brightness-110"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════
   EXPENSE ROW COMPONENT
   ═════════════════════════════════════════ */

export interface ExpenseRowProps {
  id?: string;
  description: string;
  amount: number;
  currency?: string;
  category: ExpenseCategory | string;
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
  const catKey = (category.toLowerCase() as ExpenseCategory) in expenseCategoryConfig
    ? (category.toLowerCase() as ExpenseCategory)
    : "other";
  const config = expenseCategoryConfig[catKey];

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 py-3.5 px-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs",
        "hover:border-neutral-300 hover:shadow-sm transition-all duration-200 group",
        className
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
          config.bgColor,
          config.color,
          config.borderColor
        )}
      >
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-neutral-900 truncate">
          {description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] font-medium text-neutral-400">
            {date}
          </span>
          <span className="text-neutral-300">•</span>
          <span className={cn("text-[11px] font-semibold", config.color)}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-extrabold text-neutral-900">
          {currency}{amount.toLocaleString()}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pl-1">
          {onEdit && (
            <button
              onClick={onEdit}
              title="Edit Expense"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete Expense"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-error hover:bg-red-50 transition-colors"
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
  tripDays?: number;
  averagePerDay?: number;
  dailyBudgetAllowance?: number;
  categories: { category: ExpenseCategory | string; amount: number }[];
  className?: string;
}

export function BudgetSummaryCard({
  totalBudget,
  spent,
  currency = "₹",
  tripDays = 1,
  averagePerDay,
  dailyBudgetAllowance,
  categories,
  className,
}: BudgetSummaryCardProps) {
  const remaining = totalBudget - spent;
  const isOver = remaining < 0;
  const avgDay = averagePerDay ?? (tripDays > 0 ? spent / tripDays : 0);
  const allowDay = dailyBudgetAllowance ?? (tripDays > 0 ? totalBudget / tripDays : 0);

  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-xl rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-neutral-900 text-lg">Financial Overview</h3>
              <p className="text-xs text-neutral-500">Real-time trip expenditure & allowances</p>
            </div>
          </div>

          {isOver ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              Over Budget by {currency}{Math.abs(remaining).toLocaleString()}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              On Track · {currency}{remaining.toLocaleString()} left
            </span>
          )}
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-neutral-50/80 border border-neutral-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Budget</span>
            <p className="text-lg font-display font-bold text-neutral-900 mt-0.5">
              {currency}{totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="bg-neutral-50/80 border border-neutral-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Spent</span>
            <p className="text-lg font-display font-bold text-neutral-900 mt-0.5">
              {currency}{spent.toLocaleString()}
            </p>
          </div>
          <div className="bg-neutral-50/80 border border-neutral-100 rounded-2xl p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Daily Allowance</span>
            <p className="text-lg font-display font-bold text-neutral-800 mt-0.5">
              {currency}{Math.round(allowDay).toLocaleString()}
              <span className="text-xs font-normal text-neutral-400">/day</span>
            </p>
          </div>
          <div className={cn("border rounded-2xl p-3.5", isOver ? "bg-red-50/60 border-red-100" : "bg-emerald-50/60 border-emerald-100")}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              {isOver ? "Over Budget" : "Remaining"}
            </span>
            <p className={cn("text-lg font-display font-bold mt-0.5", isOver ? "text-red-700" : "text-emerald-700")}>
              {currency}{Math.abs(remaining).toLocaleString()}
            </p>
          </div>
        </div>

        <BudgetProgressBar spent={spent} total={totalBudget} currency={currency} size="md" />
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-neutral-100 p-6 pt-5 bg-neutral-50/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Category Distribution
            </h4>
            <span className="text-xs text-neutral-400 font-medium">
              {categories.length} categories logged
            </span>
          </div>

          <CategoryDistributionBar categories={categories} totalSpent={spent} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
            {categories.map(({ category, amount }) => {
              const catKey = (category.toLowerCase() as ExpenseCategory) in expenseCategoryConfig
                ? (category.toLowerCase() as ExpenseCategory)
                : "other";
              const config = expenseCategoryConfig[catKey];
              const pct = spent > 0 ? Math.round((amount / spent) * 100) : 0;

              return (
                <div
                  key={category}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-neutral-200/70 shadow-2xs"
                >
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border", config.bgColor, config.color, config.borderColor)}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{config.label}</p>
                    <p className="text-[11px] font-bold text-neutral-900">
                      {currency}{amount.toLocaleString()} <span className="text-[10px] text-neutral-400 font-normal">({pct}%)</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
