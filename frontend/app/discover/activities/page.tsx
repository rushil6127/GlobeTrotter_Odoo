"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ActivitiesPage() {
  return (
    <PageShell currentPath="/discover" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          variant="activities"
          title="Discover Activities"
          description="Find things to do at your favourite destinations. Activity discovery is coming soon!"
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
