"use client";

import React from "react";
import { Navbar, MobileNav } from "@/components/navigation/Navbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

export interface PageShellProps {
  currentPath: string;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  className?: string;
  children: React.ReactNode;
}

/* ───────── Component ───────── */

export function PageShell({
  currentPath,
  userName = "Traveler",
  userAvatar,
  notificationCount = 0,
  className,
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
        <Navbar
          currentPath={currentPath}
          userName={userName}
          userAvatar={userAvatar}
          notificationCount={notificationCount}
        />

        {/* Scrollable Container */}
        <main
          className={cn(
            "flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12",
            className
          )}
        >
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav currentPath={currentPath} />
      </div>
    </div>
  );
}
