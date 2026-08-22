"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { createTrip } from "@/lib/api/trips";
import { CalendarDays, DollarSign, FileText, Globe, ArrowRight } from "lucide-react";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD"];

export default function NewTripPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("INR");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const trip = await createTrip({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
        budget: parseFloat(budget) || 0,
        currency,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Failed to create trip. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <PageShell currentPath="/trips">
      <div className="max-w-2xl mx-auto pt-4 md:pt-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-500 hover:text-primary transition-colors mb-4 flex items-center gap-1"
          >
            ← Back to trips
          </button>
          <h1 className="text-3xl font-display font-bold text-neutral-900">Plan a New Trip</h1>
          <p className="text-neutral-500 mt-1">Give your adventure a name, dates, and a budget to get started.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-lg p-8 space-y-6">

          <Input
            id="trip-name"
            label="Trip Name"
            placeholder="e.g. Japan Autumn Tour"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputSize="lg"
            leftIcon={<Globe className="h-4 w-4" />}
            disabled={submitting}
          />

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1.5">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your trip..."
              rows={3}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-200 hover:border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="trip-start"
              label="Start Date"
              type="date"
              value={startDate}
              min={todayStr}
              onChange={(e) => setStartDate(e.target.value)}
              required
              inputSize="lg"
              leftIcon={<CalendarDays className="h-4 w-4" />}
              disabled={submitting}
            />
            <Input
              id="trip-end"
              label="End Date"
              type="date"
              value={endDate}
              min={startDate || todayStr}
              onChange={(e) => setEndDate(e.target.value)}
              required
              inputSize="lg"
              leftIcon={<CalendarDays className="h-4 w-4" />}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                id="trip-budget"
                label="Budget"
                type="number"
                min="0"
                placeholder="e.g. 150000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                inputSize="lg"
                leftIcon={<DollarSign className="h-4 w-4" />}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 block mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={submitting}
                className="w-full h-12 rounded-xl border border-neutral-200 hover:border-neutral-300 px-4 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-neutral-400" /> Notes
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="flex-2"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
