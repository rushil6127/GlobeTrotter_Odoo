"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function CalendarPage() {
  return (
    <PageShell currentPath="/calendar" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          title="Calendar"
          description="View your trip schedule at a glance. The calendar view is coming soon!"
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
