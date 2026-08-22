"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { useAuth } from "@/context/AuthContext";
import { useApiData } from "@/lib/hooks/useApiData";
import { getTrip, type Trip } from "@/lib/api/trips";
import { Wallet, ArrowLeft, Clock } from "lucide-react";

export default function BudgetPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const { data: trip } = useApiData<Trip>(() => getTrip(tripId), [tripId]);

  return (
    <PageShell currentPath="/trips" userName={user?.name ?? undefined}>
      <div className="max-w-3xl mx-auto pt-8 pb-32">
        {/* Breadcrumb nav tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none mb-8">
          <Link
            href={`/trips/${tripId}`}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {trip?.name ?? "Trip"}
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-sm font-semibold text-neutral-900">Budget &amp; Expenses</span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1 scrollbar-none">
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

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-sm p-10 sm:p-14 text-center space-y-5">
          <div className="h-20 w-20 rounded-3xl bg-secondary/15 flex items-center justify-center mx-auto text-secondary-700">
            <Wallet className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">Budget &amp; Expenses</h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
              Track your trip spending by category, log expenses on the go, and get AI-powered budget
              optimization suggestions. This feature is coming in the next release.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-4 py-2 rounded-full">
            Coming Soon
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/trips/${tripId}/itinerary`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary/20"
            >
              View Itinerary
            </Link>
            <Link
              href={`/trips/${tripId}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Trip Overview
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
