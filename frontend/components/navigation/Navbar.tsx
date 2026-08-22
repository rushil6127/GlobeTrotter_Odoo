"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Globe,
  LayoutDashboard,
  Map,
  Compass,
  CalendarDays,
  User,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

/* ───────── Types ───────── */

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
}

export interface NavbarProps {
  currentPath?: string;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
  onSearch?: () => void;
  className?: string;
}

/* ───────── Nav items ───────── */

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Trips", href: "/trips", icon: <Map className="h-5 w-5" /> },
  { label: "Discover", href: "/discover", icon: <Compass className="h-5 w-5" /> },
  { label: "Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
];

/* ───────── Logo ───────── */

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
        <Globe className="h-5 w-5 text-white" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-neutral-900 tracking-tight">
          Globe<span className="text-primary">Trotter</span>
        </span>
      )}
    </Link>
  );
}

/* ───────── Desktop Navbar ───────── */

export function Navbar({
  currentPath = "/dashboard",
  userName = "Traveler",
  userAvatar,
  notificationCount = 0,
  onSearch,
  className,
}: NavbarProps) {
  const { logout } = useAuth();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-neutral-100",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Logo />

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                  "transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                {item.icon}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearch}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            className="relative h-10 w-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-neutral-200 mx-1 hidden md:block" />

          <a
            href="/profile"
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <Avatar
              src={userAvatar}
              name={userName}
              size="sm"
              status="online"
            />
            <span className="hidden lg:block text-sm font-medium text-neutral-700">
              {userName}
            </span>
          </a>

          <button
            onClick={() => { void logout(); }}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ───────── Mobile Bottom Nav ───────── */

export function MobileNav({
  currentPath = "/dashboard",
  className,
}: {
  currentPath?: string;
  className?: string;
}) {
  const mobileItems = [
    ...navItems,
    { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:hidden",
        "bg-white/90 backdrop-blur-xl border-t border-neutral-100",
        "safe-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {mobileItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl min-w-[56px]",
                "transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-6 bg-primary rounded-full" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
