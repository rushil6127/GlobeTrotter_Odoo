"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  Layers,
  Flame,
  ChevronRight,
  Sliders,
  X,
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

const DESTINATION_PRESETS = [
  { name: "Goa", emoji: "🌴", desc: "Beaches & Nightlife" },
  { name: "Tokyo", emoji: "🗼", desc: "Tech & Ramen" },
  { name: "Paris", emoji: "🥐", desc: "Art & Romance" },
  { name: "London", emoji: "🎡", desc: "History & Royalty" },
  { name: "Kyoto", emoji: "⛩️", desc: "Temples & Tea" },
  { name: "Dubai", emoji: "🏙️", desc: "Luxury & Desert" },
  { name: "Bali", emoji: "🌺", desc: "Villas & Nature" },
  { name: "Rome", emoji: "🏛️", desc: "Colosseum & Pasta" },
];

const STYLE_OPTIONS = [
  { id: "relaxation", label: "Relaxation & Beaches", emoji: "🏖️", color: "from-teal-500/10 to-emerald-500/10 text-teal-800 border-teal-200" },
  { id: "food", label: "Food & Dining", emoji: "🍜", color: "from-amber-500/10 to-orange-500/10 text-amber-800 border-amber-200" },
  { id: "culture", label: "Culture & Heritage", emoji: "🏛️", color: "from-purple-500/10 to-indigo-500/10 text-purple-800 border-purple-200" },
  { id: "adventure", label: "Adventure & Outdoors", emoji: "⛰️", color: "from-blue-500/10 to-cyan-500/10 text-blue-800 border-blue-200" },
  { id: "sightseeing", label: "Iconic Landmarks", emoji: "📸", color: "from-pink-500/10 to-rose-500/10 text-pink-800 border-pink-200" },
  { id: "luxury", label: "Luxury & Wellness", emoji: "✨", color: "from-yellow-500/10 to-amber-500/10 text-yellow-800 border-yellow-200" },
  { id: "backpacker", label: "Budget & Hidden Gems", emoji: "🎒", color: "from-lime-500/10 to-green-500/10 text-lime-800 border-lime-200" },
];

const BUDGET_PRESETS = [
  { label: "₹25k", value: 25000 },
  { label: "₹50k", value: 50000 },
  { label: "₹1 Lakh", value: 100000 },
  { label: "₹2 Lakh", value: 200000 },
];

const LOADING_PHASES = [
  { text: "Scanning destination highlights & top attractions…", icon: "🌍" },
  { text: "Synthesizing optimal daily routes & travel time…", icon: "🗺️" },
  { text: "Curating authentic food stops & hidden gems…", icon: "🍜" },
  { text: "Balancing schedule with your target budget…", icon: "💰" },
  { text: "Finalizing your custom day-by-day itinerary…", icon: "✨" },
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
  // Step: "form" | "generating" | "preview" | "saved"
  const [step, setStep] = useState<"form" | "generating" | "preview" | "saved">("form");

  // Form State
  const [destination, setDestination] = useState(defaultDestination);
  const [days, setDays] = useState(defaultDays);
  const [budget, setBudget] = useState(defaultBudget);
  const [travelers, setTravelers] = useState(2);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["relaxation", "food"]);
  const [currency, setCurrency] = useState("INR");

  // Loading animation phase
  const [loadingPhaseIdx, setLoadingPhaseIdx] = useState(0);

  // Generation & AI Result State
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
  const [activeTabDay, setActiveTabDay] = useState<number | "all">("all");

  // Cycle loading phase text while generating
  useEffect(() => {
    if (step !== "generating") return;
    const interval = setInterval(() => {
      setLoadingPhaseIdx((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 1800);
    return () => {
      clearInterval(interval);
      setLoadingPhaseIdx(0);
    };
  }, [step]);

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

    setStep("generating");
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
      setStep("form");
      if (err instanceof ApiError) {
        if (err.status === 502 || err.status === 503) {
          setGenerationError("AI Service is momentarily busy. Please try again in a few seconds.");
        } else {
          setGenerationError(err.message || "Failed to generate AI itinerary.");
        }
      } else {
        setGenerationError("Network error or AI timeout. Please retry.");
      }
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

    // Recalculate total estimated cost
    const newTotal = updatedDays.reduce(
      (sum, d) => sum + d.items.reduce((s, it) => s + (it.estimatedCost || 0), 0),
      0
    );

    setAiDraft({
      ...aiDraft,
      days: updatedDays,
      totalEstimatedCost: newTotal,
      budgetStatus: newTotal <= aiDraft.budget ? "WITHIN_BUDGET" : "OVER_BUDGET",
    });
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

    const newTotal = updatedDays.reduce(
      (sum, d) => sum + d.items.reduce((s, it) => s + (it.estimatedCost || 0), 0),
      0
    );

    setAiDraft({
      ...aiDraft,
      days: updatedDays,
      totalEstimatedCost: newTotal,
      budgetStatus: newTotal <= aiDraft.budget ? "WITHIN_BUDGET" : "OVER_BUDGET",
    });
    setEditingItemKey(null);
  }

  async function handleSaveToTrip() {
    if (!aiDraft) return;
    setIsSaving(true);
    setSaveError("");

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

      if (!targetTripId) {
        const today = new Date();
        const start = today.toISOString().split("T")[0];
        const end = new Date(today.getTime() + (aiDraft.daysCount - 1) * 86400000)
          .toISOString()
          .split("T")[0];

        const newTrip = await createTrip({
          name: `${aiDraft.destination} Adventure`,
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
      <div className="space-y-5">
        {/* Step Indicator Breadcrumb */}
        <div className="flex items-center justify-between px-1 py-1 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-[11px]",
                step === "form" || step === "generating"
                  ? "bg-primary text-white"
                  : "bg-emerald-500 text-white"
              )}
            >
              {step === "preview" || step === "saved" ? <Check className="h-3.5 w-3.5" /> : "1"}
            </span>
            <span className={step === "form" || step === "generating" ? "text-neutral-900 font-extrabold" : "text-neutral-500"}>
              Trip Preferences
            </span>

            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 mx-1" />

            <span
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-[11px]",
                step === "preview"
                  ? "bg-primary text-white"
                  : step === "saved"
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-100 text-neutral-400"
              )}
            >
              {step === "saved" ? <Check className="h-3.5 w-3.5" /> : "2"}
            </span>
            <span className={step === "preview" ? "text-neutral-900 font-extrabold" : "text-neutral-400"}>
              Preview &amp; Customize
            </span>

            <ChevronRight className="h-3.5 w-3.5 text-neutral-300 mx-1" />

            <span
              className={cn(
                "flex items-center justify-center h-6 w-6 rounded-full text-[11px]",
                step === "saved" ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"
              )}
            >
              3
            </span>
            <span className={step === "saved" ? "text-neutral-900 font-extrabold" : "text-neutral-400"}>
              Saved to Trip
            </span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STEP 1: INPUT FORM
        ───────────────────────────────────────────────────────────── */}
        {step === "form" && (
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Hero Header Banner */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 text-white shadow-md">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  <Sparkles className="h-6 w-6 text-amber-300 animate-pulse" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300/30">
                      Smart AI Engine
                    </span>
                    <span className="text-[11px] text-white/60 font-medium">Instant Synthesis</span>
                  </div>
                  <h3 className="text-base font-display font-extrabold text-white">
                    Where would you like to travel?
                  </h3>
                  <p className="text-xs text-primary-200/80 leading-relaxed">
                    Our AI creates a custom, balanced itinerary tailored to your duration, budget, and travel style.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {generationError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3 shadow-xs">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-bold">{generationError}</p>
                  <p className="text-[11px] text-red-600">You can click below to retry the AI generation without losing your settings.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate()}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    className="mt-1 bg-white text-xs"
                  >
                    Retry Now
                  </Button>
                </div>
              </div>
            )}

            {/* Destination Input + Visual Quick Presets */}
            <div className="space-y-2.5">
              <div className="relative">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span>Destination</span>
                  <span className="text-[11px] text-neutral-400 font-normal lowercase">city, region or country</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <input
                    type="text"
                    placeholder="e.g. Goa, Tokyo, Paris, London, Bali, Rome…"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-neutral-900 bg-white shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Destination Pill Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-neutral-400 mr-1 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" /> Popular:
                </span>
                {DESTINATION_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setDestination(city.name)}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                      destination.toLowerCase() === city.name.toLowerCase()
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
                    )}
                  >
                    <span>{city.emoji}</span>
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numeric Parameters Grid: Duration, Budget, Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Duration Stepper */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-1.5">
                <label className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" /> Duration
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    className="h-8 w-8 rounded-lg bg-white border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-neutral-900">
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDays((d) => Math.min(14, d + 1))}
                    className="h-8 w-8 rounded-lg bg-white border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Budget Field & Quick Selectors */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-1.5">
                <label className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" /> Budget
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold">INR (₹)</span>
                </label>
                <input
                  type="number"
                  min="5000"
                  step="1000"
                  value={budget}
                  onChange={(e) => setBudget(Math.max(1000, Number(e.target.value)))}
                  className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 bg-white font-bold text-xs text-neutral-900 focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              {/* Travelers Stepper */}
              <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-1.5">
                <label className="text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-indigo-600" /> Travelers
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                    className="h-8 w-8 rounded-lg bg-white border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-neutral-900">
                    {travelers} {travelers === 1 ? "Person" : "Guests"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                    className="h-8 w-8 rounded-lg bg-white border border-neutral-200 font-bold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-sm shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Budget Chips */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-neutral-400">Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setBudget(p.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border",
                      budget === p.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center justify-between">
                <span>Travel Style &amp; Vibes</span>
                <span className="text-[11px] text-primary font-bold">{selectedStyles.length} selected</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = selectedStyles.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => toggleStyle(style.id)}
                      className={cn(
                        "p-2.5 rounded-xl text-left text-xs font-bold transition-all border flex items-center gap-2",
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20"
                          : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      <span className="text-base shrink-0">{style.emoji}</span>
                      <span className="truncate">{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <Button type="button" variant="ghost" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
                className="shadow-md shadow-primary/25 font-bold"
              >
                Generate Itinerary
              </Button>
            </div>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 2: SATISFYING GENERATING LOADING STATE
        ───────────────────────────────────────────────────────────── */}
        {step === "generating" && (
          <div className="py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
            {/* Glowing AI Spinner */}
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-secondary animate-spin blur-md opacity-70" />
              <div className="relative h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg border border-neutral-100">
                <Sparkles className="h-9 w-9 text-primary animate-bounce" />
              </div>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider inline-block">
                Synthesizing {destination}
              </span>
              <h3 className="text-xl font-display font-extrabold text-neutral-900">
                Generating your custom trip…
              </h3>
              <p className="text-xs text-neutral-500 font-medium h-6 transition-all duration-300">
                <span className="inline-block mr-1.5">{LOADING_PHASES[loadingPhaseIdx].icon}</span>
                {LOADING_PHASES[loadingPhaseIdx].text}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                style={{ width: `${((loadingPhaseIdx + 1) / LOADING_PHASES.length) * 100}%` }}
              />
            </div>

            {/* Shimmering Day Skeletons */}
            <div className="space-y-3 max-w-lg mx-auto pt-4 text-left">
              <div className="h-16 rounded-2xl bg-neutral-100/80 animate-pulse" />
              <div className="h-16 rounded-2xl bg-neutral-100/60 animate-pulse" />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 3: CLEAN GENERATED-ITINERARY REVEAL & CUSTOMIZATION
        ───────────────────────────────────────────────────────────── */}
        {step === "preview" && aiDraft && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header Trip Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 text-white space-y-3.5 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300/30">
                      Generated Plan
                    </span>
                    <span className="text-xs text-primary-200 font-bold">{aiDraft.destination}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                    {aiDraft.summary}
                  </h3>
                </div>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold self-start sm:self-center border shadow-xs",
                    aiDraft.budgetStatus === "WITHIN_BUDGET"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                  {aiDraft.budgetStatus === "WITHIN_BUDGET" ? "Within Budget" : "Over Budget"}
                </span>
              </div>

              {/* Financial & Duration Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-white/60 font-bold uppercase block">Est. Cost</span>
                  <strong className="text-sm text-white font-extrabold">
                    ₹{aiDraft.totalEstimatedCost.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 font-bold uppercase block">Target Budget</span>
                  <strong className="text-sm text-white font-extrabold">
                    ₹{aiDraft.budget.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 font-bold uppercase block">Duration</span>
                  <strong className="text-sm text-white font-extrabold">
                    {aiDraft.daysCount} Days
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-white/60 font-bold uppercase block">Travelers</span>
                  <strong className="text-sm text-white font-extrabold">
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

            {/* Day Filter Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTabDay("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                    activeTabDay === "all"
                      ? "bg-primary text-white shadow-2xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  All Days ({aiDraft.days.reduce((s, d) => s + d.items.length, 0)})
                </button>
                {aiDraft.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setActiveTabDay(day.dayNumber)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0",
                      activeTabDay === day.dayNumber
                        ? "bg-primary text-white shadow-2xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    Day {day.dayNumber} ({day.items.length})
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-neutral-400 hidden sm:inline-block shrink-0">
                Click ✏️ to customize
              </span>
            </div>

            {/* Day-by-Day Timeline List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {aiDraft.days
                .filter((d) => activeTabDay === "all" || d.dayNumber === activeTabDay)
                .map((day) => (
                  <div
                    key={day.dayNumber}
                    className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden shadow-2xs"
                  >
                    {/* Day Header */}
                    <div className="p-3.5 bg-neutral-50 border-b border-neutral-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 px-2.5 rounded-lg bg-primary text-white text-xs font-extrabold flex items-center justify-center">
                          Day {day.dayNumber}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 truncate">
                          {day.title}
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-neutral-500">
                        {day.items.length} activities
                      </span>
                    </div>

                    {/* Day Activity Items */}
                    <div className="p-3 divide-y divide-neutral-100 space-y-2">
                      {day.items.map((item, itemIdx) => {
                        const itemKey = `${day.dayNumber}-${itemIdx}`;
                        const isEditing = editingItemKey === itemKey;

                        if (isEditing) {
                          return (
                            <div key={itemIdx} className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-primary uppercase">Activity Title</label>
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Activity title"
                                  className="w-full h-8 px-2.5 rounded-lg border border-neutral-300 text-xs font-bold focus:outline-none focus:border-primary bg-white"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Estimated Cost (₹)</label>
                                  <input
                                    type="number"
                                    value={editCost}
                                    onChange={(e) => setEditCost(e.target.value)}
                                    placeholder="Cost"
                                    className="w-full h-8 px-2.5 rounded-lg border border-neutral-300 text-xs font-bold bg-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-extrabold text-neutral-500 uppercase">Notes / Details</label>
                                  <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder="e.g. Try local seafood"
                                    className="w-full h-8 px-2.5 rounded-lg border border-neutral-300 text-xs bg-white"
                                  />
                                </div>
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
                                  Apply Edit
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={itemIdx}
                            className="pt-2 pb-1 flex items-start justify-between gap-3 group"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-neutral-900 group-hover:text-primary transition-colors">
                                  {item.title}
                                </span>
                                {item.startTime && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                    <Clock className="h-2.5 w-2.5" />
                                    {item.startTime}
                                    {item.endTime ? ` – ${item.endTime}` : ""}
                                  </span>
                                )}
                                {item.estimatedCost !== undefined && item.estimatedCost > 0 && (
                                  <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                    ₹{item.estimatedCost.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {item.notes && (
                                <p className="text-[11px] text-neutral-500 line-clamp-2">
                                  {item.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => startEditItem(day.dayNumber, itemIdx, item)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
                                title="Edit item"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(day.dayNumber, itemIdx)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
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

            {/* Clear Edit / Save Action Bar */}
            <div className="flex items-center justify-between pt-3.5 border-t border-neutral-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleReset}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                className="font-bold text-neutral-600"
              >
                Adjust Settings
              </Button>

              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isSaving}
                onClick={handleSaveToTrip}
                leftIcon={<Check className="h-4 w-4" />}
                className="shadow-md shadow-primary/25 font-bold"
              >
                Save Itinerary to Trip
              </Button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 4: CELEBRATORY SAVED CONFIRMATION
        ───────────────────────────────────────────────────────────── */}
        {step === "saved" && (
          <div className="py-10 px-4 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-200/80">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-display font-extrabold text-neutral-900">
                Itinerary Successfully Saved!
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                All generated activities, timing suggestions, and estimated costs have been applied to{" "}
                <strong className="text-neutral-800 font-bold">{savedTripName}</strong>.
              </p>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="lg" onClick={onClose} className="shadow-md shadow-primary/20 font-bold">
                View Updated Itinerary
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
