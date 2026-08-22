"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ItineraryPage() {
  return (
    <PageShell currentPath="/trips" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          title="Itinerary"
          description="Build your day-by-day itinerary with activities, food stops, and transport. Coming soon!"
          action={
            <Button
              variant="outline"
              onClick={() => { window.location.href = "/dashboard"; }}
            >
              Back to Dashboard
            </Button>
          }
        />
      </div>
    </PageShell>
  );
}
