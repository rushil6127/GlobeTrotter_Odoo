"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function TripDetailPage() {
  return (
    <PageShell currentPath="/trips" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          variant="trips"
          title="Trip Details"
          description="View and manage your trip details, itinerary, and budget. Trip management is coming soon!"
          action={
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => { window.location.href = "/trips"; }}
              >
                My Trips
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = "/dashboard"; }}
              >
                Dashboard
              </Button>
            </div>
          }
        />
      </div>
    </PageShell>
  );
}
