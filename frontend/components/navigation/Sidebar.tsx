"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  Compass,
  CalendarDays,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "./Navbar";
import { useAuth } from "@/context/AuthContext";

/* ───────── Types ───────── */

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  currentPath?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

/* ───────── Items ───────── */

const mainItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Trips", href: "/trips", icon: <Map className="h-5 w-5" /> },
  { label: "Discover", href: "/discover", icon: <Compass className="h-5 w-5" /> },
  { label: "Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
];

const bottomItems: SidebarItem[] = [
  { label: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

/* ───────── Component ───────── */

export function Sidebar({
  currentPath = "/dashboard",
  collapsed = false,
  onToggle,
  className,
}: SidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-neutral-100",
        "transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]",
        className
      )}
    >
      {/* Logo */}
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "px-5")}>
        <Logo collapsed={collapsed} />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm",
                "transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 space-y-1 border-t border-neutral-100">
        {bottomItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm",
                "transition-all duration-200",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && item.label}
            </a>
          );
        })}

        <button
          onClick={() => { void logout(); }}
          title={collapsed ? "Log Out" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <span className="shrink-0">
            <LogOut className="h-5 w-5" />
          </span>
          {!collapsed && "Log Out"}
        </button>
      </div>

      {/* Toggle button */}
      <div className="px-3 py-3 border-t border-neutral-100">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm",
            "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600",
            "transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
