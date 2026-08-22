"use client";

import React from "react";
import Link from "next/link";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <PageShell currentPath="/calendar" userName={user?.name ?? undefined}>
      <div className="max-w-3xl mx-auto pt-8 pb-32">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-sm p-10 sm:p-14 text-center space-y-5">
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
            <CalendarDays className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-neutral-900">Trip Calendar</h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
              A unified calendar view of all your planned trips and daily itineraries is coming soon.
              For now, manage your schedule from the Trips page.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-4 py-2 rounded-full">
            Coming Soon
          </div>
          <div className="pt-2">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary/20"
            >
              View My Trips
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
