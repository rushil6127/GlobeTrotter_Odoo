"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoader } from "@/components/ui/Loader";

/**
 * Root route `/` — redirect to /dashboard if logged in, /login if not.
 * The actual design-system showcase has been moved to /dev/showcase (for internal use only).
 */
export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <FullPageLoader message="Loading GlobeTrotter…" />
    </div>
  );
}
