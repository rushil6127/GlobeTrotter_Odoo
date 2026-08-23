import React from "react";
import {
  Utensils,
  Mountain,
  Landmark,
  TreePine,
  ShoppingBag,
  Camera,
  Moon,
  Palmtree,
  Car,
  BedDouble,
  Ticket,
  Wallet,
} from "lucide-react";

/* ═════════════════════════════════════════
   ACTIVITY CATEGORIES
   ═════════════════════════════════════════ */

export type ActivityCategory =
  | "food"
  | "adventure"
  | "culture"
  | "nature"
  | "shopping"
  | "sightseeing"
  | "nightlife"
  | "relaxation";

export interface ActivityCategoryConfig {
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const activityCategoryMap: Record<ActivityCategory, ActivityCategoryConfig> = {
  food: {
    label: "Food & Dining",
    emoji: "🍽️",
    icon: Utensils,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  adventure: {
    label: "Adventure",
    emoji: "🏔️",
    icon: Mountain,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  culture: {
    label: "Culture & History",
    emoji: "🏛️",
    icon: Landmark,
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  nature: {
    label: "Nature & Outdoors",
    emoji: "🌿",
    icon: TreePine,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  shopping: {
    label: "Shopping",
    emoji: "🛍️",
    icon: ShoppingBag,
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  sightseeing: {
    label: "Sightseeing",
    emoji: "📸",
    icon: Camera,
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  nightlife: {
    label: "Nightlife",
    emoji: "🌙",
    icon: Moon,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  relaxation: {
    label: "Relaxation & Wellness",
    emoji: "🧘",
    icon: Palmtree,
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
};

export function getActivityCategoryConfig(category: string): ActivityCategoryConfig {
  const key = category?.toLowerCase() as ActivityCategory;
  return (
    activityCategoryMap[key] || {
      label: category || "Activity",
      emoji: "📍",
      icon: Landmark,
      color: "text-neutral-700",
      bgColor: "bg-neutral-50",
      borderColor: "border-neutral-200",
    }
  );
}

/* ═════════════════════════════════════════
   EXPENSE CATEGORIES
   ═════════════════════════════════════════ */

export type ExpenseCategory =
  | "transport"
  | "food"
  | "accommodation"
  | "activities"
  | "shopping"
  | "other";

export interface ExpenseCategoryConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const expenseCategoryMap: Record<ExpenseCategory, ExpenseCategoryConfig> = {
  transport: {
    label: "Transport",
    icon: Car,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  food: {
    label: "Food",
    icon: Utensils,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  accommodation: {
    label: "Accommodation",
    icon: BedDouble,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  activities: {
    label: "Activities",
    icon: Ticket,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  other: {
    label: "Other",
    icon: Wallet,
    color: "text-neutral-600",
    bgColor: "bg-neutral-50",
    borderColor: "border-neutral-200",
  },
};

export function getExpenseCategoryConfig(category: string): ExpenseCategoryConfig {
  const key = category?.toLowerCase() as ExpenseCategory;
  return (
    expenseCategoryMap[key] || {
      label: category || "Other",
      icon: Wallet,
      color: "text-neutral-600",
      bgColor: "bg-neutral-50",
      borderColor: "border-neutral-200",
    }
  );
}
