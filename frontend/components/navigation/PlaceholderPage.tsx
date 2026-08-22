"use client";

import React from "react";
import { Navbar, MobileNav } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
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
        <Navbar currentPath={currentPath} userName={displayName} />

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
