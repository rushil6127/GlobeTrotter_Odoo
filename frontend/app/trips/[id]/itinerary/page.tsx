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
  getTripItinerary, createItineraryItem, updateItineraryItem, deleteItineraryItem,
  reorderItinerary, type ItineraryItem, type ItineraryDay, type ItineraryResponse,
} from "@/lib/api/itinerary";
import { getTrip, type Trip } from "@/lib/api/trips";
import {
  Plus, Clock, DollarSign, Pencil, Trash2, AlertCircle, RefreshCw,
  CalendarDays, ChevronDown, ChevronUp, GripVertical,
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
  Sightseeing: "text-sky-600 bg-sky-50",
  Food: "text-amber-600 bg-amber-50",
  Adventure: "text-orange-600 bg-orange-50",
  "Water Sports": "text-blue-600 bg-blue-50",
  Culture: "text-purple-600 bg-purple-50",
  Shopping: "text-pink-600 bg-pink-50",
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
  const catClass = item.activity?.category
    ? (categoryColors[item.activity.category] ?? "text-neutral-600 bg-neutral-100")
    : "text-neutral-600 bg-neutral-100";

  return (
    <div className="flex gap-3 group bg-white rounded-xl border border-neutral-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      {canEdit && (
        <div className="flex flex-col gap-1 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(item, -1)}
            disabled={idx === 0}
            className="h-5 w-5 rounded flex items-center justify-center text-neutral-300 hover:text-primary disabled:opacity-20 transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMove(item, 1)}
            disabled={idx === total - 1}
            className="h-5 w-5 rounded flex items-center justify-center text-neutral-300 hover:text-primary disabled:opacity-20 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
          {canEdit && (
            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {item.startTime && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Clock className="h-3 w-3" />
              {item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}
            </span>
          )}
          {item.estimatedCost != null && item.estimatedCost > 0 && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <DollarSign className="h-3 w-3" />
              {item.estimatedCost.toLocaleString()}
            </span>
          )}
          {item.activity?.category && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", catClass)}>
              {item.activity.category}
            </span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">{item.notes}</p>
        )}
      </div>
    </div>
  );
}

/* ── Add / Edit Item Modal ── */
function ItemModal({
  open,
  onClose,
  tripId,
  editItem,
  totalDays,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  editItem?: ItineraryItem;
  totalDays: number;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(editItem?.title ?? "");
  const [dayNumber, setDayNumber] = useState(editItem?.dayNumber ?? 1);
  const [startTime, setStartTime] = useState(editItem?.startTime ?? "");
  const [endTime, setEndTime] = useState(editItem?.endTime ?? "");
  const [cost, setCost] = useState(editItem?.estimatedCost != null ? String(editItem.estimatedCost) : "");
  const [notes, setNotes] = useState(editItem?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (open) {
      setTitle(editItem?.title ?? "");
      setDayNumber(editItem?.dayNumber ?? 1);
      setStartTime(editItem?.startTime ?? "");
      setEndTime(editItem?.endTime ?? "");
      setCost(editItem?.estimatedCost != null ? String(editItem.estimatedCost) : "");
      setNotes(editItem?.notes ?? "");
      setError("");
    }
  }, [open, editItem]);

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(),
        dayNumber,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        estimatedCost: cost ? parseFloat(cost) : undefined,
        notes: notes.trim() || undefined,
      };
      if (editItem) {
        await updateItineraryItem(editItem.id, payload);
      } else {
        await createItineraryItem(tripId, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save item.");
    } finally { setSaving(false); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? "Edit Itinerary Item" : "Add Itinerary Item"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            {editItem ? "Save Changes" : "Add Item"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          id="item-title"
          label="Activity / Title"
          placeholder="e.g. Visit Senso-ji Temple"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Day</label>
          <select
            value={dayNumber}
            onChange={(e) => setDayNumber(Number(e.target.value))}
            className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="item-start" label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <Input id="item-end" label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <Input
          id="item-cost"
          label="Estimated Cost (optional)"
          type="number"
          min="0"
          placeholder="0"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          leftIcon={<DollarSign className="h-4 w-4" />}
        />
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any details, reminders, or tips…"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      </div>
    </Modal>
  );
}

/* ── Day Group ── */
function DayGroup({
  day,
  canEdit,
  onEdit,
  onDelete,
  onMove,
}: {
  day: ItineraryDay;
  canEdit: boolean;
  onEdit: (item: ItineraryItem) => void;
  onDelete: (item: ItineraryItem) => void;
  onMove: (item: ItineraryItem, dir: -1 | 1) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white/60 rounded-xl border border-neutral-100 hover:bg-white/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{day.dayNumber}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-neutral-900">Day {day.dayNumber}</p>
            <p className="text-xs text-neutral-500">{fmtDate(day.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {day.dayEstimatedCost > 0 && (
            <Badge variant="default" size="sm">₹{day.dayEstimatedCost.toLocaleString()}</Badge>
          )}
          <Badge variant="info" size="sm">{day.itemsCount} item{day.itemsCount !== 1 ? "s" : ""}</Badge>
          {collapsed ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronUp className="h-4 w-4 text-neutral-400" />}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-2 pl-3">
          {day.items.length === 0 ? (
            <p className="text-sm text-neutral-400 px-4 py-2">No items yet for this day.</p>
          ) : (
            day.items.map((item, idx) => (
              <ItineraryItemCard
                key={item.id}
                item={item}
                idx={idx}
                total={day.items.length}
                canEdit={canEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data: trip } = useApiData<Trip>(() => getTrip(id), [id]);
  const { data: itin, isLoading, error, refetch } = useApiData<ItineraryResponse>(
    () => getTripItinerary(id), [id]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItineraryItem | undefined>();
  const [deleteItem, setDeleteItem] = useState<ItineraryItem | undefined>();
  const [deleting, setDeleting] = useState(false);
  const [moveError, setMoveError] = useState("");

  const canEdit = !trip || user?.id === trip?.userId ||
    trip?.tripMembers?.some((m) => m.user?.id === user?.id && m.role !== "VIEWER");

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteItineraryItem(deleteItem.id);
      setDeleteItem(undefined);
      refetch();
    } catch { setDeleting(false); }
  }

  async function handleMove(item: ItineraryItem, dir: -1 | 1) {
    if (!itin) return;
    const day = itin.days.find((d) => d.dayNumber === item.dayNumber);
    if (!day) return;
    const sorted = [...day.items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[idx], reordered[nextIdx]] = [reordered[nextIdx], reordered[idx]];
    const itemOrders = reordered.map((i, pos) => ({ itemId: i.id, order: pos }));

    setMoveError("");
    try {
      await reorderItinerary(id, itemOrders);
      refetch();
    } catch (err) {
      setMoveError(err instanceof ApiError ? err.message : "Reorder failed.");
    }
  }

  const totalDays = itin?.trip.totalDays ?? 1;
  const totalCost = itin?.totalEstimatedCost ?? 0;

  return (
    <PageShell currentPath="/trips">
      <div className="max-w-4xl mx-auto pt-2 md:pt-6 pb-32 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/trips" className="hover:text-primary transition-colors">Trips</Link>
          <span>/</span>
          {trip && (
            <>
              <Link href={`/trips/${id}`} className="hover:text-primary transition-colors">{trip.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-900 font-medium">Itinerary</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">
              {trip?.name ?? "Itinerary"}
            </h1>
            {itin && (
              <p className="text-neutral-500 text-sm mt-0.5">
                {itin.totalItems} items · {totalDays} days ·{" "}
                {totalCost > 0 ? `₹${totalCost.toLocaleString()} estimated` : "No cost tracked yet"}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => { setEditItem(undefined); setAddOpen(true); }}
              >
                Add Item
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${id}`)}
            >
              Trip Details
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
            <p className="text-sm text-neutral-700 flex-1">{error.message}</p>
            <Button size="sm" variant="outline" leftIcon={<RefreshCw className="h-3 w-3" />} onClick={refetch}>Retry</Button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="rounded" height={44} />
                <Skeleton variant="rounded" height={64} className="ml-3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && itin?.totalItems === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-100 p-10 shadow-sm">
            <EmptyState
              title="No itinerary items yet"
              description="Add activities, meals, or transport stops to plan your days."
              action={
                canEdit ? (
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setAddOpen(true)}
                  >
                    Add First Item
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}

        {/* Days */}
        {!isLoading && !error && itin && itin.days.length > 0 && (
          <div className="space-y-4">
            {itin.days.map((day) => (
              <DayGroup
                key={day.dayNumber}
                day={day}
                canEdit={!!canEdit}
                onEdit={(item) => { setEditItem(item); setAddOpen(true); }}
                onDelete={(item) => setDeleteItem(item)}
                onMove={handleMove}
              />
            ))}
          </div>
        )}

        {moveError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{moveError}</p>
        )}

        {/* Discover CTA */}
        {!isLoading && !error && (
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl border border-accent/20 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900 text-sm">Need activity ideas?</p>
              <p className="text-xs text-neutral-500">Browse our catalog and add activities directly to this itinerary.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/discover/activities")}
            >
              Discover
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <ItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tripId={id}
        editItem={editItem}
        totalDays={totalDays}
        onSaved={refetch}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(undefined)}
        onConfirm={handleDelete}
        title="Delete item"
        message={`Remove "${deleteItem?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </PageShell>
  );
}
