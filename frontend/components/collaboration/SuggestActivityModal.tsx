"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { suggestActivity, type ActivitySuggestion } from "@/lib/api/collaboration";
import { getTrips, type Trip } from "@/lib/api/trips";
import { useApiData } from "@/lib/hooks/useApiData";
import { ApiError } from "@/lib/api/client";
import {
  Lightbulb,
  Check,
  AlertCircle,
  CalendarDays,
  Send,
  Sparkles,
} from "lucide-react";

export interface SuggestActivityModalProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  activityName: string;
  defaultTripId?: string;
  onSuggested?: () => void;
}

export function SuggestActivityModal({
  open,
  onClose,
  activityId,
  activityName,
  defaultTripId,
  onSuggested,
}: SuggestActivityModalProps) {
  const { data: trips } = useApiData<Trip[]>(() => (open ? getTrips() : Promise.reject()), [open]);

  const [selectedTripId, setSelectedTripId] = useState(defaultTripId || "");
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const activeTrip = trips?.find((t) => t.id === (selectedTripId || defaultTripId)) || trips?.[0];
  const tripToUse = selectedTripId || defaultTripId || activeTrip?.id || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tripToUse) {
      setError("Please select a trip.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await suggestActivity(tripToUse, activityId, {
        notes: notes.trim() || undefined,
        dayNumber: Number(dayNumber) || 1,
      });
      setSuccess(true);
      if (onSuggested) {
        onSuggested();
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to suggest activity.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="💡 Suggest Activity to Group"
      size="sm"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <Check className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-neutral-900">Activity Suggested!</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Your recommendation for <strong>{activityName}</strong> has been shared with your travel group.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                Activity Suggestion
              </span>
              <h4 className="text-xs font-bold text-neutral-900 truncate">{activityName}</h4>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Trip Selector */}
          {!defaultTripId && trips && trips.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Target Trip</label>
              <select
                value={tripToUse}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold bg-white text-neutral-800 focus:outline-none focus:border-primary shadow-2xs"
                required
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preferred Day */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Preferred Day
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={dayNumber}
              onChange={(e) => setDayNumber(Math.max(1, Number(e.target.value)))}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold bg-white text-neutral-800 focus:outline-none focus:border-primary shadow-2xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">Why you recommend this (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Highly rated on TripAdvisor, great sunset view!"
              rows={2}
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 focus:outline-none focus:border-primary bg-white shadow-2xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="font-bold shadow-xs"
            >
              Send Suggestion
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
