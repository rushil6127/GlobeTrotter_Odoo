"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Loader";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  getTripItinerary,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItinerary,
  type ItineraryItem,
  type ItineraryDay,
  type ItineraryResponse,
} from "@/lib/api/itinerary";
import { getTrip, type Trip } from "@/lib/api/trips";
import { ShareTripModal } from "@/components/trips/ShareTripModal";
import {
  Plus,
  Clock,
  DollarSign,
  Pencil,
  Trash2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  GripVertical,
  MapPin,
  Sparkles,
  ArrowRight,
  Wallet,
  Share2,
} from "lucide-react";

/* ── helpers ── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatCost(n: number | null | undefined) {
  if (!n) return null;
  return `₹${n.toLocaleString()}`;
}

/* ── Category badge color ── */
const categoryColors: Record<string, string> = {
  Sightseeing: "text-sky-700 bg-sky-50 border-sky-200/60",
  Food: "text-amber-700 bg-amber-50 border-amber-200/60",
  Adventure: "text-orange-700 bg-orange-50 border-orange-200/60",
  "Water Sports": "text-blue-700 bg-blue-50 border-blue-200/60",
  Culture: "text-purple-700 bg-purple-50 border-purple-200/60",
  Shopping: "text-pink-700 bg-pink-50 border-pink-200/60",
  Nightlife: "text-indigo-700 bg-indigo-50 border-indigo-200/60",
  Relaxation: "text-teal-700 bg-teal-50 border-teal-200/60",
};

/* ── Itinerary Item Card ── */
function ItineraryItemCard({
  item,
  idx,
  total,
  canEdit,
  onEdit,
  onDelete,
  onMove,
}: {
  item: ItineraryItem;
  idx: number;
  total: number;
  canEdit: boolean;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (item: ItineraryItem) => void;
  onMove: (item: ItineraryItem, dir: -1 | 1) => void;
}) {
  const cat = item.activity?.category;
  const catClass = cat
    ? categoryColors[cat] ?? "text-neutral-700 bg-neutral-100 border-neutral-200"
    : "text-neutral-700 bg-neutral-100 border-neutral-200";

  return (
    <div className="flex items-start gap-3.5 group bg-white/90 backdrop-blur-sm rounded-2xl border border-neutral-200/70 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
      {/* Move Up/Down Controls */}
      {canEdit && (
        <div className="flex flex-col gap-1 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(item, -1)}
            disabled={idx === 0}
            className="h-6 w-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-20 transition-colors"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(item, 1)}
            disabled={idx === total - 1}
            className="h-6 w-6 rounded-md flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-neutral-100 disabled:opacity-20 transition-colors"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Item Details */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-primary transition-colors">
              {item.title}
            </h4>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit item"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Time, Cost & Category Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {item.startTime && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              <Clock className="h-3.5 w-3.5" />
              {item.startTime}
              {item.endTime ? ` – ${item.endTime}` : ""}
            </span>
          )}
          {item.estimatedCost != null && item.estimatedCost > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-lg">
              <DollarSign className="h-3.5 w-3.5 text-secondary-600" />
              {item.estimatedCost.toLocaleString()}
            </span>
          )}
          {cat && (
            <span className={cn("text-xs px-2.5 py-1 rounded-lg font-semibold border", catClass)}>
              {cat}
            </span>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-xs text-neutral-600 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-100 mt-1 leading-relaxed">
            {item.notes}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Add / Edit Item Form ── */
function ItemForm({
  tripId,
  editItem,
  defaultDayNumber = 1,
  totalDays = 1,
  onClose,
  onSaved,
}: {
  tripId: string;
  editItem: ItineraryItem | null;
  defaultDayNumber?: number;
  totalDays?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [dayNumber, setDayNumber] = useState(editItem?.dayNumber ?? defaultDayNumber);
  const [startTime, setStartTime] = useState(editItem?.startTime ?? "");
  const [endTime, setEndTime] = useState(editItem?.endTime ?? "");
  const [estimatedCost, setEstimatedCost] = useState(
    editItem?.estimatedCost != null ? String(editItem.estimatedCost) : ""
  );
  const [notes, setNotes] = useState(editItem?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (editItem) {
        await updateItineraryItem(editItem.id, {
          title: title.trim(),
          dayNumber: Number(dayNumber) || 1,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await createItineraryItem(tripId, {
          title: title.trim(),
          dayNumber: Number(dayNumber) || 1,
          startTime: startTime || undefined,
          endTime: endTime || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
          notes: notes.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save itinerary item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
      <Input
        id="item-title"
        label="Activity Title"
        placeholder="e.g. Scuba Diving at Grand Island"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-700">Select Day</label>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: totalDays }).map((_, i) => (
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
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="item-start"
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          id="item-end"
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <Input
        id="item-cost"
        label="Estimated Cost (₹)"
        type="number"
        min="0"
        placeholder="e.g. 1500"
        value={estimatedCost}
        onChange={(e) => setEstimatedCost(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-700">Notes &amp; Tips</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Booking confirmation, what to pack, meeting point…"
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={saving}>
          {editItem ? "Save Changes" : "Schedule Activity"}
        </Button>
      </div>
    </form>
  );
}

function ItemModal({
  open,
  onClose,
  tripId,
  editItem,
  defaultDayNumber = 1,
  totalDays = 1,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  editItem: ItineraryItem | null;
  defaultDayNumber?: number;
  totalDays?: number;
  onSaved: () => void;
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? "Edit Scheduled Item" : "Schedule New Activity"}
      size="md"
    >
      <ItemForm
        tripId={tripId}
        editItem={editItem}
        defaultDayNumber={defaultDayNumber}
        totalDays={totalDays}
        onClose={onClose}
        onSaved={onSaved}
      />
    </Modal>
  );
}

/* ── Main Itinerary Page ── */
export default function ItineraryPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const router = useRouter();
  const { user } = useAuth();

  const { data: trip, isLoading: tripLoading } = useApiData<Trip>(() => getTrip(tripId), [tripId]);
  const {
    data: itinData,
    isLoading,
    error,
    refetch,
  } = useApiData<ItineraryResponse>(() => getTripItinerary(tripId), [tripId]);

  const [selectedDayNum, setSelectedDayNum] = useState<number | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<ItineraryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const days = itinData?.days ?? [];
  const totalItems = itinData?.totalItems ?? 0;
  const totalDaysCount = days.length || (trip ? Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1) : 1);
  const filteredDays = selectedDayNum === "all" ? days : days.filter((d) => d.dayNumber === selectedDayNum);

  async function handleDeleteConfirm() {
    if (!deleteItem) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteItineraryItem(deleteItem.id);
      setDeleteItem(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleMove(day: ItineraryDay, item: ItineraryItem, dir: -1 | 1) {
    const items = [...day.items];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const [moved] = items.splice(idx, 1);
    items.splice(target, 0, moved);
    try {
      await reorderItinerary(
        tripId,
        items.map((i, o) => ({ itemId: i.id, order: o }))
      );
      refetch();
    } catch {
      /* noop */
    }
  }

  return (
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-5xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Navigation Breadcrumb Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href={`/trips/${tripId}`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0"
          >
            Overview & Stops
          </Link>
          <Link
            href={`/trips/${tripId}/itinerary`}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Clock className="h-4 w-4" />
            Day-by-Day Itinerary
          </Link>
          <Link
            href={`/trips/${tripId}/budget`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 bg-white border border-neutral-200/80 shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <Wallet className="h-4 w-4 text-primary" />
            Budget &amp; Expenses
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 tracking-tight">
              {trip?.name ? `${trip.name} Itinerary` : "Trip Itinerary"}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {totalItems} scheduled activities across {days.length} days
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Share2 className="h-4 w-4 text-primary" />}
              onClick={() => setShareOpen(true)}
              className="bg-white shadow-xs font-bold"
            >
              Share
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
              className="shadow-md shadow-primary/20 hover:shadow-lg transition-all shrink-0"
            >
              Add Activity
            </Button>
          </div>
        </div>

        {/* Day Selector Tabs */}
        {days.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDayNum("all")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                selectedDayNum === "all"
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
              )}
            >
              All Days ({totalItems})
            </button>
            {days.map((d) => (
              <button
                key={d.dayNumber}
                onClick={() => setSelectedDayNum(d.dayNumber)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
                  selectedDayNum === d.dayNumber
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                )}
              >
                <span>Day {d.dayNumber}</span>
                <span className="text-[10px] opacity-75 font-normal">({d.itemsCount})</span>
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={80} />
            <Skeleton variant="rounded" height={100} />
            <Skeleton variant="rounded" height={100} />
          </div>
        )}

        {/* Error Alert */}
        {!isLoading && error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/80 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <div>
              <h3 className="font-bold text-neutral-900">Failed to load itinerary</h3>
              <p className="text-xs text-neutral-600 mt-1">{error.message}</p>
            </div>
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refetch}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && totalItems === 0 && (
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 p-10 sm:p-14 shadow-sm text-center">
            <EmptyState
              variant="activities"
              title="No activities scheduled yet"
              description="Build your day-wise plan. Schedule sightseeing, excursions, beach visits, and dining."
              action={
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Plus className="h-5 w-5" />}
                  onClick={() => {
                    setEditItem(null);
                    setModalOpen(true);
                  }}
                  className="shadow-md shadow-primary/20"
                >
                  Schedule First Activity
                </Button>
              }
            />
          </div>
        )}

        {/* Days List */}
        {!isLoading && !error && filteredDays.length > 0 && (
          <div className="space-y-8">
            {filteredDays.map((day) => (
              <div key={day.dayNumber} className="space-y-4">
                {/* Day Header Banner */}
                <div className="flex items-center justify-between py-3.5 px-5 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/70 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
                      {day.dayNumber}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-neutral-900 text-base">
                        Day {day.dayNumber}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {fmtDate(day.date)}
                        {day.dayEstimatedCost > 0 && (
                          <span className="ml-2 font-bold text-neutral-800">
                            · Estimated {formatCost(day.dayEstimatedCost)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditItem(null);
                      setModalOpen(true);
                    }}
                  >
                    Add to Day {day.dayNumber}
                  </Button>
                </div>

                {/* Day Items */}
                {day.items.length === 0 ? (
                  <div className="bg-neutral-50/60 rounded-2xl p-6 text-center border border-dashed border-neutral-200 text-neutral-400 text-xs">
                    No activities scheduled for Day {day.dayNumber}. Click &quot;Add to Day {day.dayNumber}&quot; to plan this day.
                  </div>
                ) : (
                  <div className="space-y-3 pl-2 sm:pl-4">
                    {day.items.map((item, idx) => (
                      <ItineraryItemCard
                        key={item.id}
                        item={item}
                        idx={idx}
                        total={day.items.length}
                        canEdit={true}
                        onEdit={(i) => {
                          setEditItem(i);
                          setModalOpen(true);
                        }}
                        onDelete={(i) => setDeleteItem(i)}
                        onMove={(i, dir) => handleMove(day, i, dir)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        tripId={tripId}
        editItem={editItem}
        defaultDayNumber={typeof selectedDayNum === "number" ? selectedDayNum : 1}
        totalDays={totalDaysCount}
        onSaved={refetch}
      />

      {/* Delete Item Confirmation Modal */}
      {deleteItem && (
        <ConfirmModal
          open={Boolean(deleteItem)}
          title={`Delete "${deleteItem.title}"?`}
          message="Are you sure you want to remove this activity from your itinerary?"
          confirmLabel="Delete Activity"
          cancelLabel="Cancel"
          variant="danger"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setDeleteItem(null);
            setDeleteError("");
          }}
        />
      )}

      {/* Share Trip Modal */}
      {trip && (
        <ShareTripModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          tripId={trip.id}
          tripName={trip.name}
        />
      )}
    </PageShell>
  );
}
