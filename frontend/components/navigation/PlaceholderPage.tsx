"use client";

import React from "react";
import { Navbar, MobileNav } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";

/* ───────── Types ───────── */

export interface PageShellProps {
  currentPath: string;
  userName?: string;
  children: React.ReactNode;
}

/* ───────── Component ───────── */

export function PageShell({
  currentPath,
  userName = "Traveler",
  children,
}: PageShellProps) {
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
        <Navbar currentPath={currentPath} userName={userName} />

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
