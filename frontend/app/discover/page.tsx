"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function DiscoverPage() {
  return (
    <PageShell currentPath="/discover" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          variant="activities"
          title="Discover"
          description="Explore cities and activities around the world. This page is coming soon!"
          action={
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => { window.location.href = "/discover/cities"; }}
              >
                Explore Cities
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = "/discover/activities"; }}
              >
                Discover Activities
              </Button>
            </div>
          }
        />
      </div>
    </PageShell>
  );
}
