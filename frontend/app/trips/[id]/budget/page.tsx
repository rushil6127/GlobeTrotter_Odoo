"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Loader";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/lib/hooks/useApiData";
import { ApiError } from "@/lib/api/client";
import { getTrip, type Trip } from "@/lib/api/trips";
import {
  getTripBudget,
  createExpense,
  updateExpense,
  deleteExpense,
  getBudgetOptimization,
  type BudgetSummary,
  type Expense,
  type ExpenseCategory,
  type BudgetOptimizationResponse,
  type OptimizationSuggestion,
  type FreeAlternativeActivity,
} from "@/lib/api/budget";
import {
  getTripItinerary,
  updateItineraryItem,
  createItineraryItem,
  type ItineraryResponse,
} from "@/lib/api/itinerary";
import {
  ExpenseCategoryBadge,
  BudgetProgressBar,
  CategoryDistributionBar,
  ExpenseRow,
  expenseCategoryConfig,
} from "@/components/budget/Budget";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Car,
  Utensils,
  BedDouble,
  Ticket,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Check,
  Zap,
  ArrowUpDown,
  Filter,
  CalendarDays,
  Tag,
  Flame,
} from "lucide-react";

/* ── Category options for expense forms & filters ── */
const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: "transport", label: "Transport" },
  { value: "food", label: "Food & Dining" },
  { value: "accommodation", label: "Accommodation" },
  { value: "activities", label: "Activities & Tours" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other / Misc" },
];

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c || "₹";
}

/* ═════════════════════════════════════════
   EXPENSE FORM COMPONENT (FOR MODAL)
   ═════════════════════════════════════════ */
function ExpenseForm({
  tripId,
  editExpense,
  currency,
  onClose,
  onSaved,
}: {
  tripId: string;
  editExpense: Expense | null;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(editExpense ? String(editExpense.amount) : "");
  const [category, setCategory] = useState<ExpenseCategory>(
    editExpense ? editExpense.category : "food"
  );
  const [date, setDate] = useState(
    editExpense ? editExpense.date.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(editExpense?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sym = currencySymbol(currency);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editExpense) {
        await updateExpense(editExpense.id, {
          amount: numAmount,
          category,
          date: date || undefined,
          description: description.trim() || undefined,
        });
      } else {
        await createExpense(tripId, {
          amount: numAmount,
          category,
          date: date || undefined,
          description: description.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category selector grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Expense Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categoryOptions.map((opt) => {
            const config = expenseCategoryConfig[opt.value];
            const isSelected = category === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs scale-[1.02]"
                    : "bg-neutral-50/70 border-neutral-200/80 text-neutral-600 hover:bg-neutral-100/70"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary text-white" : "bg-white text-neutral-500 border border-neutral-200"
                  )}
                >
                  {config.icon}
                </div>
                <span className="text-[11px] font-semibold truncate w-full">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
          Amount ({sym})
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-neutral-400">
            {sym}
          </span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-11 pl-8 pr-4 rounded-xl border border-neutral-200 text-base font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Date & Description */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id="expense-date"
          label="Expense Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          id="expense-desc"
          label="Description / Place"
          placeholder="e.g. Dinner at Fisherman's Wharf"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
        <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={saving}>
          {editExpense ? "Update Expense" : "Log Expense"}
        </Button>
      </div>
    </form>
  );
}

/* ═════════════════════════════════════════
   SMART OPTIMIZER MODAL (WOW MOMENT)
   ═════════════════════════════════════════ */
function OptimizationModal({
  open,
  onClose,
  tripId,
  currency,
  overBudget,
  overBudgetAmount,
  onOptimizationApplied,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  currency: string;
  overBudget: boolean;
  overBudgetAmount: number;
  onOptimizationApplied: () => void;
}) {
  const sym = currencySymbol(currency);

  const {
    data: optData,
    isLoading,
    error,
    refetch,
  } = useApiData<BudgetOptimizationResponse>(
    () => (open ? getBudgetOptimization(tripId) : Promise.reject()),
    [open, tripId]
  );

  const { data: itineraryData } = useApiData<ItineraryResponse>(
    () => (open ? getTripItinerary(tripId) : Promise.reject()),
    [open, tripId]
  );

  const [appliedItems, setAppliedItems] = useState<Record<string, boolean>>({});
  const [applyingItemId, setApplyingItemId] = useState<string | null>(null);
  const [selectedDayMap, setSelectedDayMap] = useState<Record<string, number>>({});
  const [addingFreeId, setAddingFreeId] = useState<string | null>(null);
  const [addedFreeMap, setAddedFreeMap] = useState<Record<string, boolean>>({});

  const totalDays = itineraryData?.days?.length ?? 5;

  async function handleApplyReplacement(sug: OptimizationSuggestion) {
    setApplyingItemId(sug.itineraryItemId);
    try {
      await updateItineraryItem(sug.itineraryItemId, {
        title: sug.alternative.name,
        activityId: sug.alternative.activityId,
        estimatedCost: sug.alternative.cost,
        notes: `Smart Optimizer recommendation: ${sug.alternative.description || ""}`.trim(),
      });
      setAppliedItems((prev) => ({ ...prev, [sug.itineraryItemId]: true }));
      onOptimizationApplied();
      refetch();
    } catch {
      alert("Failed to apply replacement. Please try again.");
    } finally {
      setApplyingItemId(null);
    }
  }

  async function handleAddFreeActivity(act: FreeAlternativeActivity) {
    setAddingFreeId(act.activityId);
    const dayNumber = selectedDayMap[act.activityId] ?? 1;
    try {
      await createItineraryItem(tripId, {
        title: act.name,
        activityId: act.activityId,
        estimatedCost: 0,
        dayNumber,
        startTime: "10:00",
        notes: `Free activity recommendation in ${act.city?.name || "destination"}: ${act.description || ""}`.trim(),
      });
      setAddedFreeMap((prev) => ({ ...prev, [act.activityId]: true }));
      onOptimizationApplied();
    } catch {
      alert("Failed to add free activity.");
    } finally {
      setAddingFreeId(null);
    }
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="space-y-6">
        {/* Hero Header with Sparkle Glow */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-primary-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Smart Travel Optimizer</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
              Maximize Your Adventure, Minimize Your Spend
            </h2>

            <p className="text-xs sm:text-sm text-primary-100/90 max-w-xl leading-relaxed">
              We analyzed your itinerary activities against high-rated local gems and complimentary alternatives to help you stay within your financial goals without missing out on the best experiences.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={160} />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900">Optimization Unavailable</h3>
            <p className="text-xs text-neutral-600">{error.message}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Retry Analysis
            </Button>
          </div>
        )}

        {/* Optimization Results */}
        {!isLoading && !error && optData && (
          <div className="space-y-6">
            {/* Impact Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Potential Savings
                </span>
                <p className="text-2xl font-display font-extrabold text-emerald-700">
                  {sym}{optData.totalPotentialSavings.toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-emerald-600">
                  From {optData.suggestions?.length || 0} suggested swaps
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Projected Spending
                </span>
                <p className="text-2xl font-display font-extrabold text-sky-700">
                  {sym}{optData.projectedSpentWithOptimizations.toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-sky-600">
                  After all optimizations
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  Budget Health Status
                </span>
                <div className="pt-1">
                  {optData.canResolveOverBudget ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Resolves Deficit
                    </span>
                  ) : overBudget ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                      <Flame className="h-3.5 w-3.5 text-amber-600" />
                      Substantial Relief
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      Optimal Value
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Replacement Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  Cheaper Activity Swaps ({optData.suggestions?.length || 0})
                </h3>
                <span className="text-xs text-neutral-500 font-medium">
                  Same category & destination
                </span>
              </div>

              {optData.suggestions?.length === 0 ? (
                <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-center text-xs text-neutral-500 font-medium">
                  🎉 Great news! Your current scheduled activities are already priced competitively. No cheaper direct alternatives found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
                  {optData.suggestions?.map((sug) => {
                    const isApplied = appliedItems[sug.itineraryItemId];
                    const isApplying = applyingItemId === sug.itineraryItemId;

                    return (
                      <div
                        key={sug.itineraryItemId}
                        className={cn(
                          "p-4 sm:p-5 rounded-3xl border transition-all duration-300 space-y-3.5",
                          isApplied
                            ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                            : "bg-white border-neutral-200/90 hover:border-neutral-300 shadow-sm"
                        )}
                      >
                        {/* Comparison Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Current Item */}
                          <div className="flex-1 space-y-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                              Current Scheduled Activity
                            </span>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-neutral-700 line-through">
                                {sug.currentActivity}
                              </p>
                              <span className="text-xs font-bold text-neutral-400">
                                {sym}{sug.currentCost.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Arrow indicator */}
                          <div className="hidden sm:flex h-8 w-8 rounded-full bg-primary/10 text-primary items-center justify-center shrink-0 font-bold">
                            <ArrowRight className="h-4 w-4" />
                          </div>

                          {/* Right: Recommended Alternative */}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                Recommended Alternative
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                Save {sym}{sug.potentialSavings.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-neutral-900">
                                {sug.alternative.name}
                              </p>
                              <span className="text-xs font-extrabold text-emerald-600">
                                {sym}{sug.alternative.cost.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details & Apply Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                            {sug.alternative.category && (
                              <ExpenseCategoryBadge category={sug.alternative.category} />
                            )}
                            {sug.alternative.duration && (
                              <span className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-md font-medium text-neutral-600 text-[11px]">
                                <Clock className="h-3 w-3" />
                                {sug.alternative.duration} mins
                              </span>
                            )}
                          </div>

                          {isApplied ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-4 py-2 rounded-xl shadow-xs">
                              <Check className="h-4 w-4 text-emerald-600" />
                              Applied · Saved {sym}{sug.potentialSavings.toLocaleString()}!
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              loading={isApplying}
                              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
                              onClick={() => handleApplyReplacement(sug)}
                              className="shadow-xs hover:shadow-primary/20"
                            >
                              Apply Swap
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Free Activities Section */}
            {optData.freeAlternatives && optData.freeAlternatives.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Complimentary Local Gems ({optData.freeAlternatives.length})
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">100% Free Activities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[30vh] overflow-y-auto pr-1">
                  {optData.freeAlternatives.map((act) => {
                    const isAdded = addedFreeMap[act.activityId];
                    const isAdding = addingFreeId === act.activityId;
                    const dayVal = selectedDayMap[act.activityId] ?? 1;

                    return (
                      <div
                        key={act.activityId}
                        className="p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">
                              {act.name}
                            </h4>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                              FREE
                            </span>
                          </div>
                          {act.description && (
                            <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                              {act.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                          {/* Day selector */}
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                            <span>Day:</span>
                            <select
                              value={dayVal}
                              onChange={(e) =>
                                setSelectedDayMap((prev) => ({
                                  ...prev,
                                  [act.activityId]: Number(e.target.value),
                                }))
                              }
                              className="h-7 px-2 rounded-lg border border-neutral-200 text-xs font-bold bg-white text-neutral-800"
                            >
                              {Array.from({ length: totalDays }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  Day {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          {isAdded ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <Check className="h-3 w-3" />
                              Added
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              loading={isAdding}
                              leftIcon={<Plus className="h-3.5 w-3.5" />}
                              onClick={() => handleAddFreeActivity(act)}
                            >
                              Add to Trip
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-neutral-100">
          <Button variant="primary" size="md" onClick={onClose}>
            Done Optimizing
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ═════════════════════════════════════════
   MAIN TRIP BUDGET PAGE
   ═════════════════════════════════════════ */
export default function TripBudgetPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const { user } = useAuth();

  // Load Trip Details
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useApiData<Trip>(() => getTrip(tripId), [tripId]);

  // Load Budget & Expenses Data
  const {
    data: budget,
    isLoading: budgetLoading,
    error: budgetError,
    refetch: refetchBudget,
  } = useApiData<BudgetSummary>(() => getTripBudget(tripId), [tripId]);

  // Active filters and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Modal States
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimizerModalOpen, setOptimizerModalOpen] = useState(false);

  const currency = budget?.currency || trip?.currency || "INR";
  const sym = currencySymbol(currency);

  const expenses = budget?.expenses || [];

  // Transformed category array for charts and grids
  const categoryItems = useMemo(() => {
    if (!budget?.categories) return [];
    return (Object.keys(budget.categories) as ExpenseCategory[]).map((cat) => {
      const amount = budget.categories[cat] || 0;
      const pct = budget.spent > 0 ? Math.round((amount / budget.spent) * 100) : 0;
      return {
        category: cat,
        amount,
        percentage: pct,
      };
    });
  }, [budget]);

  // Filtered and Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesCategory =
          !selectedCategoryFilter || exp.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOption === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortOption === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortOption === "amount-desc") {
          return b.amount - a.amount;
        }
        if (sortOption === "amount-asc") {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, selectedCategoryFilter, searchQuery, sortOption]);

  // Handle Delete Action
  async function handleConfirmDelete() {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await deleteExpense(deletingExpense.id);
      setDeleteModalOpen(false);
      setDeletingExpense(null);
      refetchBudget();
    } catch {
      alert("Failed to delete expense.");
    } finally {
      setIsDeleting(false);
    }
  }

  const isLoading = tripLoading || budgetLoading;
  const isOverBudget = Boolean(budget?.overBudget);
  const overBudgetAmount = budget?.overBudgetAmount || 0;

  return (
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Page Header with Breadcrumbs & Action CTAs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <Link href="/trips" className="hover:text-neutral-700 transition-colors">
                Trips
              </Link>
              <span>/</span>
              <Link href={`/trips/${tripId}`} className="hover:text-neutral-700 transition-colors">
                {trip?.name || "Trip Details"}
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">Budget & Expenses</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-neutral-900 tracking-tight">
              {trip?.name ? `${trip.name} Budget` : "Trip Budget"}
            </h1>
            <p className="text-sm text-neutral-500">
              Track real-time trip expenditure, categorize expenses, and optimize activities.
            </p>
          </div>

          {/* Top CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="md"
              variant="outline"
              leftIcon={<Sparkles className="h-4 w-4 text-amber-500" />}
              onClick={() => setOptimizerModalOpen(true)}
              className="bg-gradient-to-r from-amber-500/10 to-primary/10 border-primary/30 hover:border-primary text-neutral-900 font-bold shadow-xs hover:shadow-primary/15 transition-all"
            >
              ✨ Optimize My Trip
            </Button>

            <Button
              size="md"
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditingExpense(null);
                setExpenseModalOpen(true);
              }}
              className="shadow-sm shadow-primary/25"
            >
              Log Expense
            </Button>
          </div>
        </div>

        {/* Tab Navigation Pill Strip */}
        {trip && (
          <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-3">
            <Link
              href={`/trips/${trip.id}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              Overview
            </Link>
            <Link
              href={`/trips/${trip.id}/itinerary`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              Itinerary
            </Link>
            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-xs">
              Budget & Expenses
            </span>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={300} />
          </div>
        )}

        {/* Error State */}
        {!isLoading && (tripError || budgetError) && (
          <div className="bg-red-50/90 border border-red-200 rounded-3xl p-8 text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-neutral-900">Failed to load budget details</h3>
            <p className="text-xs text-neutral-600">
              {budgetError?.message || tripError?.message || "Please check your network and try again."}
            </p>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetchBudget}>
              Try Again
            </Button>
          </div>
        )}

        {/* Loaded Financial Dashboard */}
        {!isLoading && budget && (
          <div className="space-y-6">
            {/* 1. "You're ₹X over budget" Hero Alert / Wow Banner */}
            {isOverBudget ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 sm:p-7 text-white shadow-lg border border-red-400/40">
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white animate-pulse">
                      <Flame className="h-6 w-6 text-amber-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
                          Action Required
                        </span>
                        <span className="text-xs font-semibold text-red-100">
                          {budget.percentageUsed}% of budget used
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                        You&apos;re {sym}{overBudgetAmount.toLocaleString()} over budget!
                      </h3>
                      <p className="text-xs text-red-100/90 max-w-xl">
                        Smart Optimizer identified cheaper activity swaps and complimentary alternatives to bring this trip back on track.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={<Sparkles className="h-4 w-4 text-primary" />}
                    onClick={() => setOptimizerModalOpen(true)}
                    className="bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold shadow-md shrink-0 self-start md:self-center"
                  >
                    ✨ Resolve with Optimizer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 to-indigo-900 p-6 sm:p-7 text-white shadow-md border border-primary-700/50">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 text-emerald-400">
                      <Sparkles className="h-6 w-6 text-amber-300" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        Budget Healthy · {sym}{budget.remaining.toLocaleString()} Available
                      </span>
                      <h3 className="text-xl font-display font-bold text-white">
                        Looking to maximize your itinerary savings?
                      </h3>
                      <p className="text-xs text-primary-200/90 max-w-xl">
                        Discover highly-rated free activities and cost-effective local attractions curated for this trip.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Sparkles className="h-4 w-4 text-primary" />}
                    onClick={() => setOptimizerModalOpen(true)}
                    className="bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold shadow-md shrink-0 self-start md:self-center"
                  >
                    ✨ Run Smart Optimizer
                  </Button>
                </div>
              </div>
            )}

            {/* 2. Top Financial KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Total Budget */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Budget</span>
                  <Wallet className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900">
                  {sym}{budget.budget.toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-neutral-400">Allocated amount</span>
              </div>

              {/* Total Spent */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Spent</span>
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900">
                  {sym}{budget.spent.toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-neutral-400">
                  {budget.expensesCount} expenses logged
                </span>
              </div>

              {/* Remaining / Over Budget */}
              <div
                className={cn(
                  "p-4 sm:p-5 rounded-3xl border shadow-xs space-y-1",
                  isOverBudget
                    ? "bg-red-50/80 border-red-200/80"
                    : "bg-emerald-50/80 border-emerald-200/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-extrabold uppercase tracking-wider",
                      isOverBudget ? "text-red-700" : "text-emerald-700"
                    )}
                  >
                    {isOverBudget ? "Over Budget" : "Remaining"}
                  </span>
                  {isOverBudget ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xl sm:text-2xl font-display font-extrabold",
                    isOverBudget ? "text-red-700" : "text-emerald-700"
                  )}
                >
                  {sym}{Math.abs(budget.remaining).toLocaleString()}
                </p>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    isOverBudget ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {isOverBudget ? `Exceeded by ${budget.percentageUsed}%` : `${100 - budget.percentageUsed}% unused`}
                </span>
              </div>

              {/* Average Daily Spending */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Avg Spent / Day</span>
                  <Clock className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-neutral-900">
                  {sym}{Math.round(budget.averagePerDay).toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-neutral-400">
                  Across {budget.tripDays} trip days
                </span>
              </div>

              {/* Daily Allowance */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-xs space-y-1 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Daily Allowance</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl sm:text-2xl font-display font-extrabold text-primary">
                  {sym}{Math.round(budget.dailyBudgetAllowance).toLocaleString()}
                </p>
                <span className="text-[11px] font-medium text-neutral-400">Target allowance / day</span>
              </div>
            </div>

            {/* 3. Category Breakdown & Visual Distribution Chart */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-neutral-900 text-lg">
                    Spending by Category
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Proportional breakdown across travel verticals. Click any category to filter.
                  </p>
                </div>
                {selectedCategoryFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter(null)}
                    className="text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                  >
                    Clear Filter (Showing all)
                  </button>
                )}
              </div>

              {/* Multi-segment distribution chart */}
              <CategoryDistributionBar
                categories={categoryItems}
                totalSpent={budget.spent}
                selectedCategory={selectedCategoryFilter}
                onSelectCategory={setSelectedCategoryFilter}
              />

              {/* Category card grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categoryItems.map((cat) => {
                  const catKey = (cat.category.toLowerCase() as ExpenseCategory) in expenseCategoryConfig
                    ? (cat.category.toLowerCase() as ExpenseCategory)
                    : "other";
                  const config = expenseCategoryConfig[catKey];
                  const isSelected = selectedCategoryFilter === cat.category;

                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() =>
                        setSelectedCategoryFilter(isSelected ? null : cat.category)
                      }
                      className={cn(
                        "flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-xs scale-[1.02]"
                          : "bg-white border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs"
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-xl flex items-center justify-center mb-2 border",
                          config.bgColor,
                          config.color,
                          config.borderColor
                        )}
                      >
                        {config.icon}
                      </div>
                      <span className="text-xs font-bold text-neutral-800 truncate w-full">
                        {config.label}
                      </span>
                      <p className="text-sm font-extrabold text-neutral-900 mt-0.5">
                        {sym}{cat.amount.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-semibold text-neutral-400 mt-1">
                        {cat.percentage}% of total
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Logged Expenses Table / List */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl border border-neutral-200/80 shadow-sm space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-neutral-900 text-lg">
                    Expense Activity ({filteredExpenses.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Detailed record of logged transactions for this adventure.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Search Bar */}
                  <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search expenses…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    />
                  </div>

                  {/* Sort Filter */}
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(
                        e.target.value as
                          | "date-desc"
                          | "date-asc"
                          | "amount-desc"
                          | "amount-asc"
                      )
                    }
                    className="h-9 px-3 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Highest Amount</option>
                    <option value="amount-asc">Lowest Amount</option>
                  </select>

                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditingExpense(null);
                      setExpenseModalOpen(true);
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Expense Items List */}
              {filteredExpenses.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-neutral-50/70 border border-dashed border-neutral-200 space-y-3">
                  <Wallet className="h-8 w-8 text-neutral-300 mx-auto" />
                  <div>
                    <p className="text-sm font-bold text-neutral-800">No expenses found</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {searchQuery || selectedCategoryFilter
                        ? "Try clearing your filters or search terms."
                        : "Log your first expense to track spending against your trip budget."}
                    </p>
                  </div>
                  {!searchQuery && !selectedCategoryFilter && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<Plus className="h-3.5 w-3.5" />}
                      onClick={() => {
                        setEditingExpense(null);
                        setExpenseModalOpen(true);
                      }}
                    >
                      Log First Expense
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredExpenses.map((exp) => (
                    <ExpenseRow
                      key={exp.id}
                      id={exp.id}
                      description={exp.description || `${exp.category.toUpperCase()} Expense`}
                      amount={exp.amount}
                      currency={sym}
                      category={exp.category}
                      date={fmtDate(exp.date)}
                      onEdit={() => {
                        setEditingExpense(exp);
                        setExpenseModalOpen(true);
                      }}
                      onDelete={() => {
                        setDeletingExpense(exp);
                        setDeleteModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {expenseModalOpen && (
        <Modal
          open={expenseModalOpen}
          onClose={() => {
            setExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? "Edit Logged Expense" : "Log New Expense"}
          size="md"
        >
          <ExpenseForm
            tripId={tripId}
            editExpense={editingExpense}
            currency={currency}
            onClose={() => {
              setExpenseModalOpen(false);
              setEditingExpense(null);
            }}
            onSaved={refetchBudget}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && deletingExpense && (
        <ConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Expense"
          message={`Are you sure you want to delete "${deletingExpense.description || deletingExpense.category}" (${sym}${deletingExpense.amount})? This will immediately update your remaining budget.`}
          confirmLabel="Delete Expense"
          variant="danger"
          loading={isDeleting}
        />
      )}

      {/* Smart Optimizer Modal */}
      {optimizerModalOpen && (
        <OptimizationModal
          open={optimizerModalOpen}
          onClose={() => setOptimizerModalOpen(false)}
          tripId={tripId}
          currency={currency}
          overBudget={isOverBudget}
          overBudgetAmount={overBudgetAmount}
          onOptimizationApplied={refetchBudget}
        />
      )}
    </PageShell>
  );
}
