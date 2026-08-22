"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function TripsPage() {
  return (
    <PageShell currentPath="/trips" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          variant="trips"
          title="My Trips"
          description="Your full trips list is coming soon. Head back to the dashboard to see your current adventures."
          action={
            <div className="flex gap-3">
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => { window.location.href = "/trips/new"; }}
              >
                Plan a Trip
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
