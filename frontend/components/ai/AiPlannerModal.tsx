"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Loader";
import {
  generateAiItinerary,
  saveAiItineraryToTrip,
  type GeneratedAiItinerary,
  type GeneratedAiDay,
  type GeneratedAiItem,
} from "@/lib/api/ai";
import { createTrip } from "@/lib/api/trips";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  MapPin,
  CalendarDays,
  Wallet,
  Users,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Compass,
  CheckCircle2,
} from "lucide-react";

export interface AiPlannerModalProps {
  open: boolean;
  onClose: () => void;
  tripId?: string;
  tripName?: string;
  defaultDestination?: string;
  defaultDays?: number;
  defaultBudget?: number;
  onItinerarySaved?: () => void;
}

const DESTINATION_PRESETS = ["Goa", "Tokyo", "Paris", "London", "Kyoto", "Dubai", "New York", "Rome"];

const STYLE_OPTIONS = [
  { id: "relaxation", label: "🏖️ Relaxation & Beaches" },
  { id: "food", label: "🍜 Food & Dining" },
  { id: "culture", label: "🏛️ Culture & Heritage" },
  { id: "adventure", label: "⛰️ Adventure & Sports" },
  { id: "sightseeing", label: "📸 Iconic Sightseeing" },
  { id: "luxury", label: "✨ Luxury & Comfort" },
  { id: "backpacker", label: "🎒 Budget & Backpacking" },
];

export function AiPlannerModal({
  open,
  onClose,
  tripId,
  tripName,
  defaultDestination = "Goa",
  defaultDays = 4,
  defaultBudget = 50000,
  onItinerarySaved,
}: AiPlannerModalProps) {
  // Step: "form" | "preview" | "saved"
  const [step, setStep] = useState<"form" | "preview" | "saved">("form");

  // Form State
  const [destination, setDestination] = useState(defaultDestination);
  const [days, setDays] = useState(defaultDays);
  const [budget, setBudget] = useState(defaultBudget);
  const [travelers, setTravelers] = useState(2);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["relaxation", "food"]);
  const [currency, setCurrency] = useState("INR");

  // Generation & AI Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [aiDraft, setAiDraft] = useState<GeneratedAiItinerary | null>(null);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedTripName, setSavedTripName] = useState("");

  // Inline edit state
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editNotes, setEditNotes] = useState("");

  function toggleStyle(id: string) {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setGenerationError("Please enter a destination.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");
    try {
      const draft = await generateAiItinerary({
        destination: destination.trim(),
        days: Number(days) || 3,
        budget: Number(budget) || 30000,
        travelers: Number(travelers) || 1,
        style: selectedStyles,
        currency,
      });
      setAiDraft(draft);
      setStep("preview");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 502 || err.status === 503) {
          setGenerationError("AI Service temporarily busy or slow. Please retry in a moment.");
        } else {
          setGenerationError(err.message || "Failed to generate AI itinerary.");
        }
      } else {
        setGenerationError("Network error or AI timeout. Click below to retry.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRemoveItem(dayNumber: number, itemIdx: number) {
    if (!aiDraft) return;
    const updatedDays = aiDraft.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const updatedItems = [...day.items];
      updatedItems.splice(itemIdx, 1);
      return { ...day, items: updatedItems };
    });
    setAiDraft({ ...aiDraft, days: updatedDays });
  }

  function startEditItem(dayNumber: number, itemIdx: number, item: GeneratedAiItem) {
    setEditingItemKey(`${dayNumber}-${itemIdx}`);
    setEditTitle(item.title);
    setEditCost(String(item.estimatedCost ?? 0));
    setEditNotes(item.notes ?? "");
  }

  function saveEditItem(dayNumber: number, itemIdx: number) {
    if (!aiDraft) return;
    const updatedDays = aiDraft.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      const updatedItems = [...day.items];
      updatedItems[itemIdx] = {
        ...updatedItems[itemIdx],
        title: editTitle.trim() || updatedItems[itemIdx].title,
        estimatedCost: Number(editCost) || 0,
        notes: editNotes.trim() || undefined,
      };
      return { ...day, items: updatedItems };
    });
    setAiDraft({ ...aiDraft, days: updatedDays });
    setEditingItemKey(null);
  }

  async function handleSaveToTrip() {
    if (!aiDraft) return;
    setIsSaving(true);
    setSaveError("");

    // Flatten all items across days
    const allItems: GeneratedAiItem[] = [];
    aiDraft.days.forEach((day) => {
      day.items.forEach((item, idx) => {
        allItems.push({
          ...item,
          dayNumber: day.dayNumber,
          order: idx,
        });
      });
    });

    try {
      let targetTripId = tripId;

      // If opening modal without an existing trip, create one first
      if (!targetTripId) {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = new Date(today.getTime() + (aiDraft.daysCount - 1) * 86400000)
          .toISOString()
          .split("T")[0];

        const newTrip = await createTrip({
          name: `${aiDraft.destination} AI Adventure`,
          description: aiDraft.summary,
          startDate: start,
          endDate: end,
          budget: aiDraft.budget,
          currency: aiDraft.currency,
        });
        targetTripId = newTrip.id;
        setSavedTripName(newTrip.name);
      } else {
        setSavedTripName(tripName || "Your Trip");
      }

      await saveAiItineraryToTrip(targetTripId, {
        items: allItems.map((it) => ({
          title: it.title,
          dayNumber: it.dayNumber,
          startTime: it.startTime,
          endTime: it.endTime,
          estimatedCost: it.estimatedCost,
          notes: it.notes,
          activityId: it.activityId,
          order: it.order,
        })),
      });

      setStep("saved");
      if (onItinerarySaved) {
        onItinerarySaved();
      }
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save itinerary.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setStep("form");
    setAiDraft(null);
    setGenerationError("");
    setSaveError("");
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="✨ AI Travel Itinerary Planner"
      size="lg"
    >
      <div className="space-y-6">
        {/* Step 1: Input Form */}
        {step === "form" && (
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Hero Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-950 text-white flex items-center gap-3.5 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold shrink-0 border border-white/20">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary-200">
                  Smart AI Synthesis
                </p>
                <h4 className="text-sm font-bold text-white truncate">
                  Tell AI your dream destination and travel style
                </h4>
              </div>
            </div>

            {/* Error Message */}
            {generationError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{generationError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate()}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    className="mt-1 bg-white text-xs"
                  >
                    Retry Generation
                  </Button>
                </div>
              </div>
            )}

            {/* Destination input + presets */}
            <div className="space-y-2">
              <Input
                id="ai-destination"
                label="Destination City"
                placeholder="e.g. Goa, Tokyo, Paris, London, Bali…"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-neutral-400 mr-1">Popular:</span>
                {DESTINATION_PRESETS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                      destination.toLowerCase() === city.toLowerCase()
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Total Budget (₹)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(Math.max(1000, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Travel Style Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Travel Style &amp; Vibes
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => toggleStyle(style.id)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                        isSelected
                          ? "bg-primary text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isGenerating}
                leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
                className="shadow-sm shadow-primary/20"
              >
                {isGenerating ? "Synthesizing Plan..." : "Generate Itinerary"}
              </Button>
            </div>
          </form>
        )}

        {/* Step 2: Generated AI Plan Preview & Customization */}
        {step === "preview" && aiDraft && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Summary & Budget Health Strip */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-200">
                    Draft AI Proposal
                  </span>
                  <h3 className="text-base font-display font-extrabold text-white">
                    {aiDraft.summary}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold self-start sm:self-center">
                  <Check className="h-3 w-3" />
                  {aiDraft.budgetStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs text-primary-100 font-medium">
                <div>
                  <span className="text-[10px] text-white/60 uppercase block">Est. Total Cost</span>
                  <strong className="text-sm text-white font-bold">
                    ₹{aiDraft.totalEstimatedCost.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 uppercase block">Target Budget</span>
                  <strong className="text-sm text-white font-bold">
                    ₹{aiDraft.budget.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 uppercase block">Duration</span>
                  <strong className="text-sm text-white font-bold">
                    {aiDraft.daysCount} Days
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 uppercase block">Travelers</span>
                  <strong className="text-sm text-white font-bold">
                    {aiDraft.travelers} Guests
                  </strong>
                </div>
              </div>
            </div>

            {/* Error banner on save */}
            {saveError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Day-by-Day Draft Items */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {aiDraft.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-xs"
                >
                  <div className="p-3 bg-neutral-50 border-b border-neutral-200/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary text-white text-xs font-bold">
                        Day {day.dayNumber}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-800 truncate">
                        {day.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {day.items.length} items
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-neutral-100">
                    {day.items.map((item, itemIdx) => {
                      const itemKey = `${day.dayNumber}-${itemIdx}`;
                      const isEditing = editingItemKey === itemKey;

                      if (isEditing) {
                        return (
                          <div key={itemIdx} className="py-2.5 space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Activity title"
                              className="w-full h-8 px-2.5 rounded-lg border border-neutral-300 text-xs font-bold focus:outline-none focus:border-primary"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={editCost}
                                onChange={(e) => setEditCost(e.target.value)}
                                placeholder="Cost (₹)"
                                className="w-28 h-8 px-2.5 rounded-lg border border-neutral-300 text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder="Notes / description"
                                className="flex-1 h-8 px-2.5 rounded-lg border border-neutral-300 text-xs"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItemKey(null)}
                                className="text-xs h-7"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => saveEditItem(day.dayNumber, itemIdx)}
                                className="text-xs h-7"
                              >
                                Save Edit
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={itemIdx}
                          className="py-2.5 flex items-center justify-between gap-3 group"
                        >
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-neutral-900 truncate">
                                {item.title}
                              </span>
                              {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  ₹{item.estimatedCost.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                              {item.startTime && (
                                <span className="font-mono">
                                  {item.startTime}
                                  {item.endTime ? ` – ${item.endTime}` : ""}
                                </span>
                              )}
                              {item.notes && <span className="truncate">• {item.notes}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => startEditItem(day.dayNumber, itemIdx, item)}
                              className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                              title="Edit item"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(day.dayNumber, itemIdx)}
                              className="p-1 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600"
                              title="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleReset}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back &amp; Adjust
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                loading={isSaving}
                onClick={handleSaveToTrip}
                leftIcon={<Check className="h-4 w-4" />}
                className="shadow-sm shadow-primary/20"
              >
                Save Itinerary to Trip
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Saved Success State */}
        {step === "saved" && (
          <div className="p-8 text-center space-y-4 animate-in fade-in duration-200">
            <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-extrabold text-neutral-900">
                Itinerary Saved Successfully!
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                All generated activities, schedule times, and estimated costs have been persisted to{" "}
                <strong className="text-neutral-800">{savedTripName}</strong>.
              </p>
            </div>

            <div className="pt-3">
              <Button variant="primary" size="md" onClick={onClose}>
                View Updated Itinerary
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
