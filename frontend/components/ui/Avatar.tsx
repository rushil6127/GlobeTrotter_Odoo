"use client";

import React from "react";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/* ───────── Size map ───────── */

const sizeMap: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: "h-6 w-6", text: "text-[10px]", status: "h-2 w-2 border" },
  sm: { container: "h-8 w-8", text: "text-xs", status: "h-2.5 w-2.5 border-[1.5px]" },
  md: { container: "h-10 w-10", text: "text-sm", status: "h-3 w-3 border-2" },
  lg: { container: "h-12 w-12", text: "text-base", status: "h-3.5 w-3.5 border-2" },
  xl: { container: "h-16 w-16", text: "text-lg", status: "h-4 w-4 border-2" },
};

const statusColors: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-neutral-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
};

/* ───────── Helpers ───────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-primary/15 text-primary",
  "bg-accent/15 text-accent-700",
  "bg-secondary/15 text-secondary-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ───────── Avatar ───────── */

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  const s = sizeMap[size];
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      {src && !imgError ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setImgError(true)}
          className={cn(
            "rounded-full object-cover ring-2 ring-white",
            s.container
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold ring-2 ring-white",
            s.container,
            s.text,
            name ? getColorFromName(name) : "bg-neutral-200 text-neutral-500"
          )}
        >
          {name ? getInitials(name) : "?"}
        </div>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-white",
            s.status,
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

/* ───────── AvatarGroup ───────── */

export function AvatarGroup({
  avatars,
  max = 4,
  size = "md",
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const s = sizeMap[size];

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((avatar, i) => (
        <Avatar key={i} {...avatar} size={size} />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-semibold",
            "bg-neutral-200 text-neutral-600 ring-2 ring-white",
            s.container,
            s.text
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
