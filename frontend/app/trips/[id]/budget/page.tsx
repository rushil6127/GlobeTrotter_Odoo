"use client";

import { PageShell } from "@/components/navigation/PlaceholderPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function BudgetPage() {
  return (
    <PageShell currentPath="/trips" userName="Pushp">
      <div className="max-w-6xl mx-auto pt-8 pb-32">
        <EmptyState
          title="Budget & Expenses"
          description="Track your trip spending, set budgets per category, and stay on target. Coming soon!"
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
