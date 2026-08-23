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
} from "lucide-react";

/* ── Category icon config ── */
const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  transport: <Car className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  accommodation: <BedDouble className="h-4 w-4" />,
  activities: <Ticket className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  other: <Wallet className="h-4 w-4" />,
};

const categoryOptions = [
  { value: "transport", label: "Transport" },
  { value: "food", label: "Food & Dining" },
  { value: "accommodation", label: "Accommodation" },
  { value: "activities", label: "Activities & Tours" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other / Misc" },
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function currencySymbol(c: string) {
  return c === "INR" ? "₹" : c === "USD" ? "$" : c === "EUR" ? "€" : c || "₹";
}

/* ═════════════════════════════════════════
   EXPENSE FORM COMPONENT
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
        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200/60">
          {error}
        </p>
      )}

      <div>
        <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
          Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value as ExpenseCategory)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left",
                category === opt.value
                  ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <span className="shrink-0">{categoryIcons[opt.value as ExpenseCategory]}</span>
              <span className="truncate">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Input
        id="expense-amount"
        label={`Amount (${sym})`}
        type="number"
        step="any"
        min="0.01"
        placeholder="e.g. 1200"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Input
        id="expense-date"
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-700">Description / Note</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="e.g. Seafood lunch at Beach Shack"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={saving}>
          {editExpense ? "Save Changes" : "Record Expense"}
        </Button>
      </div>
    </form>
  );
}

/* ═════════════════════════════════════════
   FREE ACTIVITY ADD MODAL
   ═════════════════════════════════════════ */
function AddFreeActivityModal({
  open,
  onClose,
  tripId,
  activity,
  totalDays,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  activity: FreeAlternativeActivity | null;
  totalDays: number;
  onAdded: () => void;
}) {
  const [dayNumber, setDayNumber] = useState(1);
  const [startTime, setStartTime] = useState("10:00");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  if (!activity) return null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!activity) return;
    setAdding(true);
    setError("");
    try {
      await createItineraryItem(tripId, {
        title: activity.name,
        activityId: activity.activityId,
        dayNumber: Number(dayNumber),
        startTime: startTime || undefined,
        estimatedCost: 0,
        notes: activity.description || "Free activity added via Smart Budget Optimizer",
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add activity.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add "${activity.name}" to Itinerary`}
      size="md"
    >
      <form onSubmit={handleAdd} className="space-y-4">
        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
            FREE
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">{activity.name}</p>
            <p className="text-xs text-neutral-500">
              {activity.city.name} · {activity.category} {activity.duration ? `· ${activity.duration} mins` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Choose Day</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: Math.max(1, totalDays) }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDayNumber(i + 1)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  dayNumber === i + 1
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                Day {i + 1}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="free-start-time"
          label="Estimated Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={adding}>
            Schedule Free Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ═════════════════════════════════════════
   SMART OPTIMIZER MODAL
   ═════════════════════════════════════════ */
function OptimizerModal({
  open,
  onClose,
  tripId,
  currency,
  totalDays,
  onApplied,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  currency: string;
  totalDays: number;
  onApplied: () => void;
}) {
  const {
    data: optimization,
    isLoading,
    error,
    refetch,
  } = useApiData<BudgetOptimizationResponse>(
    () => getBudgetOptimization(tripId),
    [tripId]
  );

  const [applyingItemId, setApplyingItemId] = useState<string | null>(null);
  const [appliedItemIds, setAppliedItemIds] = useState<Record<string, boolean>>({});
  const [actionSuccess, setActionSuccess] = useState<string>("");
  const [freeActModal, setFreeActModal] = useState<FreeAlternativeActivity | null>(null);

  const sym = currencySymbol(currency);

  async function handleApplySuggestion(sug: OptimizationSuggestion) {
    setApplyingItemId(sug.itineraryItemId);
    setActionSuccess("");
    try {
      await updateItineraryItem(sug.itineraryItemId, {
        title: sug.alternative.name,
        activityId: sug.alternative.activityId,
        estimatedCost: sug.alternative.cost,
        notes: `Replaced with alternative saving ${sym}${sug.potentialSavings.toLocaleString()}: ${sug.alternative.description || ""}`,
      });
      setAppliedItemIds((prev) => ({ ...prev, [sug.itineraryItemId]: true }));
      setActionSuccess(`Successfully replaced "${sug.currentActivity}" with "${sug.alternative.name}"!`);
      onApplied();
      refetch();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to apply optimization.");
    } finally {
      setApplyingItemId(null);
    }
  }

  const suggestions = optimization?.suggestions ?? [];
  const freeActivities = optimization?.freeAlternatives ?? [];
  const totalSavings = optimization?.totalPotentialSavings ?? 0;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="✨ Smart Budget Optimizer"
        size="lg"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {isLoading && (
            <div className="space-y-4 py-4">
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={120} />
              <Skeleton variant="rounded" height={120} />
            </div>
          )}

          {!isLoading && error && (
            <div className="bg-red-50 p-6 rounded-2xl text-center space-y-3">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-neutral-800">
                Failed to generate budget optimization suggestions
              </p>
              <p className="text-xs text-neutral-500">{error.message}</p>
              <Button size="sm" variant="outline" onClick={refetch}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && optimization && (
            <>
              {/* Savings Overview Banner */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Cost Optimizer
                    </span>
                    <h3 className="text-xl font-display font-bold text-neutral-900 pt-1">
                      Potential Savings: {sym}
                      {totalSavings.toLocaleString()}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Projected spending with optimizations:{" "}
                      <span className="font-bold text-neutral-900">
                        {sym}
                        {optimization.projectedSpentWithOptimizations.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  {optimization.isOverBudget && (
                    <div
                      className={cn(
                        "px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0",
                        optimization.canResolveOverBudget
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      )}
                    >
                      {optimization.canResolveOverBudget
                        ? "✓ Resolves Over-Budget"
                        : "⚠️ Reduces Budget Deficit"}
                    </div>
                  )}
                </div>
              </div>

              {actionSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {/* Cheaper Activity Alternatives Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                    <span>💡 Cheaper Activity Alternatives</span>
                    <span className="text-xs font-normal text-neutral-400">
                      ({suggestions.length})
                    </span>
                  </h4>
                </div>

                {suggestions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-center">
                    <p className="text-xs text-neutral-500 font-medium">
                      No expensive activities found to replace. Your itinerary is already cost-effective!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((sug) => {
                      const isApplied = appliedItemIds[sug.itineraryItemId];
                      const isApplying = applyingItemId === sug.itineraryItemId;

                      return (
                        <div
                          key={sug.itineraryItemId}
                          className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm space-y-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                            <div>
                              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                                Day {sug.dayNumber} · {sug.city.name}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-semibold text-neutral-700 line-through">
                                  {sug.currentActivity}
                                </span>
                                <span className="text-xs text-neutral-400">
                                  ({sym}{sug.currentCost.toLocaleString()})
                                </span>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                              Save {sym}
                              {sug.potentialSavings.toLocaleString()}
                            </div>
                          </div>

                          {/* Recommended Alternative Card */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary">
                                  Alternative:
                                </span>
                                <span className="text-sm font-bold text-neutral-900">
                                  {sug.alternative.name}
                                </span>
                              </div>
                              {sug.alternative.description && (
                                <p className="text-xs text-neutral-500 line-clamp-2">
                                  {sug.alternative.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 pt-1 text-xs text-neutral-600 font-medium">
                                <span>
                                  New Cost:{" "}
                                  <strong className="text-neutral-900">
                                    {sym}
                                    {sug.alternative.cost.toLocaleString()}
                                  </strong>
                                </span>
                                {sug.alternative.duration && (
                                  <span>· {sug.alternative.duration} mins</span>
                                )}
                                <span>· {sug.alternative.category}</span>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isApplied ? "outline" : "primary"}
                              loading={isApplying}
                              disabled={isApplied}
                              onClick={() => handleApplySuggestion(sug)}
                              className="shrink-0"
                              leftIcon={isApplied ? <Check className="h-4 w-4 text-emerald-600" /> : <Sparkles className="h-3.5 w-3.5" />}
                            >
                              {isApplied ? "Applied" : "Apply Replacement"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Free Activities Suggestions Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                  <span>🏖️ Free Attractions &amp; Walking Tours</span>
                  <span className="text-xs font-normal text-neutral-400">
                    ({freeActivities.length})
                  </span>
                </h4>

                {freeActivities.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-500">
                    No complimentary activities found for this destination.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {freeActivities.map((act) => (
                      <div
                        key={act.activityId}
                        className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              Free
                            </span>
                            <span className="text-xs text-neutral-400">{act.city.name}</span>
                          </div>
                          <h5 className="text-sm font-bold text-neutral-900 leading-snug">
                            {act.name}
                          </h5>
                          {act.description && (
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                              {act.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Plus className="h-3.5 w-3.5" />}
                          onClick={() => setFreeActModal(act)}
                          className="w-full justify-center"
                        >
                          Add to Itinerary
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Free Activity Modal */}
      {freeActModal && (
        <AddFreeActivityModal
          open={Boolean(freeActModal)}
          onClose={() => setFreeActModal(null)}
          tripId={tripId}
          activity={freeActModal}
          totalDays={totalDays}
          onAdded={() => {
            onApplied();
            refetch();
          }}
        />
      )}
    </>
  );
}

/* ═════════════════════════════════════════
   MAIN BUDGET PAGE COMPONENT
   ═════════════════════════════════════════ */
export default function BudgetPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const tripId = params.id;

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useApiData<Trip>(() => getTrip(tripId), [tripId]);

  const {
    data: budget,
    isLoading: budgetLoading,
    error: budgetError,
    refetch: refetchBudget,
  } = useApiData<BudgetSummary>(() => getTripBudget(tripId), [tripId]);

  const { data: itinData, refetch: refetchItin } = useApiData<ItineraryResponse>(
    () => getTripItinerary(tripId),
    [tripId]
  );

  /* Modal States */
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpenseItem, setDeleteExpenseItem] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [optimizerOpen, setOptimizerOpen] = useState(false);

  /* Filtering & Search */
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">(
    "date-desc"
  );

  const rawExpenses = budget?.expenses;
  const expenses = useMemo(() => rawExpenses ?? [], [rawExpenses]);

  const currency = budget?.currency || trip?.currency || "INR";
  const sym = currencySymbol(currency);

  const totalBudget = budget?.budget || trip?.budget || 0;
  const spent = budget?.spent ?? 0;
  const remaining = budget?.remaining ?? totalBudget - spent;
  const isOver = budget?.overBudget ?? spent > totalBudget;
  const overAmount = budget?.overBudgetAmount ?? (isOver ? spent - totalBudget : 0);
  const percentUsed = budget?.percentageUsed ?? (totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0);

  const totalDays = itinData?.days.length || budget?.tripDays || 1;

  async function handleDeleteConfirm() {
    if (!deleteExpenseItem) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteExpenseItem.id);
      setDeleteExpenseItem(null);
      refetchBudget();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete expense.");
    } finally {
      setDeleting(false);
    }
  }

  /* Filtered and sorted expenses list */
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (selectedCategory !== "all" && exp.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const desc = (exp.description || "").toLowerCase();
          const cat = exp.category.toLowerCase();
          return desc.includes(q) || cat.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === "amount-desc") return b.amount - a.amount;
        if (sortBy === "amount-asc") return a.amount - b.amount;
        return 0;
      });
  }, [expenses, selectedCategory, searchQuery, sortBy]);

  const categoriesMap = budget?.categories ?? {
    transport: 0,
    food: 0,
    accommodation: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  };

  const categoryList: { category: ExpenseCategory; amount: number }[] = (
    Object.keys(categoriesMap) as ExpenseCategory[]
  ).map((cat) => ({
    category: cat,
    amount: categoriesMap[cat] || 0,
  }));

  const isLoading = tripLoading || budgetLoading;

  return (
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Navigation Breadcrumb Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href={`/trips/${tripId}`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0"
          >
            Overview &amp; Stops
          </Link>
          <Link
            href={`/trips/${tripId}/itinerary`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Clock className="h-4 w-4 text-primary" />
            Day-by-Day Itinerary
          </Link>
          <div className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-sm shrink-0 flex items-center gap-1.5">
            <Wallet className="h-4 w-4" />
            Budget &amp; Expenses
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
              {trip?.name ? `${trip.name} Budget` : "Budget & Expenses"}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Track travel expenses, analyze category breakdown, and optimize spending.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />}
              onClick={() => setOptimizerOpen(true)}
              className="bg-gradient-to-r from-amber-50/70 to-orange-50/70 border-amber-200/80 text-amber-900 hover:bg-amber-100/60 shadow-sm"
            >
              ✨ Optimize My Trip
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => {
                setEditExpense(null);
                setExpenseModalOpen(true);
              }}
              className="shadow-md shadow-primary/20"
            >
              Log Expense
            </Button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
            </div>
            <Skeleton variant="rounded" height={200} />
          </div>
        )}

        {/* Error State */}
        {!isLoading && (tripError || budgetError) && (
          <div className="bg-red-50/90 border border-red-200 rounded-3xl p-8 text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <h3 className="font-bold text-neutral-900">Failed to load budget details</h3>
            <p className="text-xs text-neutral-600">
              {budgetError?.message || tripError?.message || "Please check your network."}
            </p>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetchBudget}>
              Try Again
            </Button>
          </div>
        )}

        {/* Main Budget Dashboard */}
        {!isLoading && !budgetError && budget && (
          <div className="space-y-8">
            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Budget Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-neutral-200/70 p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-primary" /> Total Budget
                </span>
                <p className="text-2xl font-display font-bold text-neutral-900">
                  {sym}{totalBudget.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  {budget.tripDays} days · {sym}
                  {budget.dailyBudgetAllowance.toLocaleString()} / day
                </p>
              </div>

              {/* Total Spent Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-neutral-200/70 p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-secondary-600" /> Total Spent
                </span>
                <p className="text-2xl font-display font-bold text-neutral-900">
                  {sym}{spent.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg",
                      isOver
                        ? "bg-red-100 text-red-700"
                        : percentUsed > 80
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {percentUsed}% used
                  </span>
                  <span className="text-xs text-neutral-400">{budget.expensesCount} expenses</span>
                </div>
              </div>

              {/* Remaining / Over Budget Card */}
              <div
                className={cn(
                  "rounded-3xl border p-5 shadow-sm space-y-1",
                  isOver
                    ? "bg-red-50/90 border-red-200/80 text-red-950"
                    : "bg-white/90 backdrop-blur-md border-neutral-200/70"
                )}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  {isOver ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                  )}
                  {isOver ? "Over Budget" : "Remaining"}
                </span>
                <p
                  className={cn(
                    "text-2xl font-display font-bold",
                    isOver ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {sym}{Math.abs(remaining).toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 font-medium">
                  {isOver
                    ? `Exceeded by ${sym}${overAmount.toLocaleString()}`
                    : `Average spent: ${sym}${budget.averagePerDay.toLocaleString()} / day`}
                </p>
              </div>

              {/* Optimizer Quick Card */}
              <div
                onClick={() => setOptimizerOpen(true)}
                className="bg-gradient-to-br from-amber-500/10 via-primary/5 to-secondary/10 rounded-3xl border border-amber-200/80 p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600" /> Smart Optimizer
                  </span>
                  <p className="text-sm font-bold text-neutral-900 mt-1">Find Cheaper Alternatives</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Reduce costs with free &amp; budget activities.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 pt-2 group-hover:translate-x-0.5 transition-transform">
                  <span>Run Optimizer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Visual Budget Progress Bar Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Spending Overview</h3>
                  <p className="text-xs text-neutral-500">
                    {sym}{spent.toLocaleString()} spent of {sym}{totalBudget.toLocaleString()} budget
                  </p>
                </div>
                {isOver && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" /> Over Budget
                  </span>
                )}
              </div>
              <BudgetProgressBar spent={spent} total={totalBudget} currency={sym} size="lg" />
            </div>

            {/* 2-Column: Category Breakdown & Expense Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Category Breakdown */}
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-neutral-900">Category Breakdown</h3>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {categoryList.map(({ category, amount }) => {
                      const pct = spent > 0 ? Math.round((amount / spent) * 100) : 0;
                      const isSelected = selectedCategory === category;

                      return (
                        <div
                          key={category}
                          onClick={() => setSelectedCategory(isSelected ? "all" : category)}
                          className={cn(
                            "p-3 rounded-2xl border transition-all cursor-pointer",
                            isSelected
                              ? "bg-primary/10 border-primary shadow-sm"
                              : "bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/80"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-lg bg-neutral-100 text-neutral-700">
                                {categoryIcons[category]}
                              </span>
                              <span className="text-xs font-bold text-neutral-800 capitalize">
                                {category}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-neutral-900">
                                {sym}{amount.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-neutral-400 ml-1.5">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70 transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Expense Table & List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Logged Expenses</h3>
                      <p className="text-xs text-neutral-500">
                        {filteredExpenses.length} of {expenses.length} expenses shown
                      </p>
                    </div>

                    {/* Filter & Sort Controls */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                          type="text"
                          placeholder="Search expenses…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-neutral-50/50"
                        />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(
                            e.target.value as
                              | "date-desc"
                              | "date-asc"
                              | "amount-desc"
                              | "amount-asc"
                          )
                        }
                        className="h-9 px-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-neutral-50/50 text-neutral-700 font-medium"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Pills Filter */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0",
                        selectedCategory === "all"
                          ? "bg-primary text-white shadow-sm"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      All
                    </button>
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedCategory(opt.value)}
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                          selectedCategory === opt.value
                            ? "bg-primary text-white shadow-sm"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        )}
                      >
                        <span>{categoryIcons[opt.value as ExpenseCategory]}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Expenses List */}
                  {filteredExpenses.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-neutral-50/60 rounded-2xl border border-dashed border-neutral-200">
                      <Wallet className="h-8 w-8 text-neutral-300 mx-auto" />
                      <p className="text-xs text-neutral-500 font-medium">
                        {expenses.length === 0
                          ? "No expenses logged yet. Click 'Log Expense' to record your trip spending."
                          : "No expenses match your search filter."}
                      </p>
                      {expenses.length === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Plus className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setEditExpense(null);
                            setExpenseModalOpen(true);
                          }}
                        >
                          Log First Expense
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {filteredExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-neutral-50/80 transition-colors group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="p-2.5 rounded-xl bg-neutral-100 text-neutral-700 shrink-0">
                              {categoryIcons[exp.category] || <Wallet className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-neutral-900 truncate">
                                {exp.description || (
                                  <span className="capitalize text-neutral-600">
                                    {exp.category} Expense
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                                <span>{fmtDate(exp.date)}</span>
                                <span>·</span>
                                <ExpenseCategoryBadge category={exp.category} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-base font-bold text-neutral-900">
                                {sym}{exp.amount.toLocaleString()}
                              </p>
                            </div>

                            {/* Edit / Delete Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditExpense(exp);
                                  setExpenseModalOpen(true);
                                }}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Edit Expense"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteExpenseItem(exp)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Expense"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            setEditExpense(null);
          }}
          title={editExpense ? "Edit Expense" : "Log New Expense"}
          size="md"
        >
          <ExpenseForm
            tripId={tripId}
            editExpense={editExpense}
            currency={currency}
            onClose={() => {
              setExpenseModalOpen(false);
              setEditExpense(null);
            }}
            onSaved={refetchBudget}
          />
        </Modal>
      )}

      {/* Delete Expense Confirm Modal */}
      {deleteExpenseItem && (
        <ConfirmModal
          open={Boolean(deleteExpenseItem)}
          title="Delete Expense?"
          message={`Are you sure you want to remove this ${sym}${deleteExpenseItem.amount.toLocaleString()} expense?`}
          confirmLabel="Delete Expense"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteExpenseItem(null)}
        />
      )}

      {/* ✨ Smart Budget Optimizer Modal */}
      <OptimizerModal
        open={optimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        tripId={tripId}
        currency={currency}
        totalDays={totalDays}
        onApplied={() => {
          refetchBudget();
          refetchItin();
        }}
      />
    </PageShell>
  );
}
