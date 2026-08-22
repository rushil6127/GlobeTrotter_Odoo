"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function NewTripPage() {
  return (
    <PageShell currentPath="/trips" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          variant="trips"
          title="Plan a New Trip"
          description="The trip builder wizard is coming soon. You'll be able to pick destinations, set dates, and plan your itinerary."
          action={
            <div className="flex gap-3">
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                disabled
              >
                Coming Soon
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
