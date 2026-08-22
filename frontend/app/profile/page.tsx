"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <PageShell currentPath="/profile" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          title="Profile"
          description="Manage your account settings and preferences. Profile management is coming soon!"
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
