"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar, MobileNav } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { FullPageLoader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Globe, LogIn, UserPlus } from "lucide-react";

/* ───────── Types ───────── */

export interface PageShellProps {
  currentPath: string;
  /**
   * @deprecated Pass userName only when you need to override the name from AuthContext.
   * Prefer the auth-aware default which reads the real user name.
   */
  userName?: string;
  children: React.ReactNode;
}

/* ───────── Component ───────── */

export function PageShell({
  currentPath,
  userName,
  children,
}: PageShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      const target = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
      router.replace(target);
    }
  }, [isLoading, user, router, currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <FullPageLoader message="Loading your travel dashboard..." />
      </div>
    );
  }

  if (!user) {
    const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 max-w-md w-full text-center space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mx-auto shadow-md shadow-primary/25 text-white">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900">Sign in required</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Please sign in or create an account to view your GlobeTrotter dashboard and trips.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<LogIn className="h-4 w-4" />}
              onClick={() => {
                window.location.href = loginUrl;
              }}
            >
              Sign In to GlobeTrotter
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
                window.location.href = "/register";
              }}
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fall back chain: explicit override → real user name → generic label
  const displayName = userName ?? user?.name ?? "Traveler";

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nature-bg.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-[2px]" />

      {/* Sidebar — Desktop Only */}
      <div className="hidden md:block relative z-10 bg-white/40">
        <Sidebar currentPath={currentPath} className="bg-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Navbar */}
        <Navbar
          currentPath={currentPath}
          userName={displayName}
          userAvatar={user?.avatar ?? undefined}
        />

        {/* Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav currentPath={currentPath} />
      </div>
    </div>
  );
}
