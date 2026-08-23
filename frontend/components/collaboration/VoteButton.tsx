"use client";

import React, { useState } from "react";
import { voteActivity, removeVote, type VoteStats } from "@/lib/api/collaboration";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Heart } from "lucide-react";

export interface VoteButtonProps {
  tripId: string;
  activityId: string;
  initialScore?: number;
  initialUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  className?: string;
  size?: "sm" | "md";
}

export function VoteButton({
  tripId,
  activityId,
  initialScore = 0,
  initialUserVote = null,
  className,
  size = "sm",
}: VoteButtonProps) {
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(initialUserVote);
  const [score, setScore] = useState<number>(initialScore);
  const [loading, setLoading] = useState(false);

  async function handleVote(targetVote: "UPVOTE" | "DOWNVOTE") {
    if (loading) return;
    setLoading(true);

    const prevVote = userVote;
    const prevScore = score;

    // Optimistic calculation
    if (userVote === targetVote) {
      // Removing vote
      setUserVote(null);
      setScore((s) => (targetVote === "UPVOTE" ? s - 1 : s + 1));
      try {
        const res = await removeVote(tripId, activityId);
        if (res.stats) {
          setScore(res.stats.score);
        }
      } catch {
        setUserVote(prevVote);
        setScore(prevScore);
      } finally {
        setLoading(false);
      }
    } else {
      // Adding or changing vote
      setUserVote(targetVote);
      const scoreDelta =
        targetVote === "UPVOTE"
          ? prevVote === "DOWNVOTE"
            ? 2
            : 1
          : prevVote === "UPVOTE"
          ? -2
          : -1;
      setScore((s) => s + scoreDelta);
      try {
        const res = await voteActivity(tripId, activityId, targetVote);
        if (res.stats) {
          setScore(res.stats.score);
        }
      } catch {
        setUserVote(prevVote);
        setScore(prevScore);
      } finally {
        setLoading(false);
      }
    }
  }

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl bg-white border border-neutral-200/90 p-0.5 shadow-2xs transition-all hover:border-neutral-300",
        userVote === "UPVOTE" && "ring-1 ring-emerald-500/30 bg-emerald-50/40 border-emerald-200",
        userVote === "DOWNVOTE" && "ring-1 ring-rose-500/30 bg-rose-50/40 border-rose-200",
        className
      )}
    >
      {/* Upvote Reaction Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote("UPVOTE")}
        className={cn(
          "flex items-center justify-center rounded-xl transition-all active:scale-90",
          isSmall ? "h-6 px-1.5 gap-1 text-[11px]" : "h-7 px-2 gap-1.5 text-xs font-bold",
          userVote === "UPVOTE"
            ? "bg-emerald-500 text-white font-extrabold shadow-xs"
            : "text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50"
        )}
        title="Upvote activity (I want to do this!)"
      >
        <ThumbsUp className={cn(isSmall ? "h-3 w-3" : "h-3.5 w-3.5", userVote === "UPVOTE" && "fill-current")} />
      </button>

      {/* Net Score Reaction Tally */}
      <span
        className={cn(
          "font-mono font-extrabold px-1.5 text-center min-w-[20px] select-none",
          isSmall ? "text-[11px]" : "text-xs",
          score > 0
            ? "text-emerald-700"
            : score < 0
            ? "text-rose-600"
            : "text-neutral-500"
        )}
      >
        {score > 0 ? `+${score}` : score}
      </span>

      {/* Downvote Reaction Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote("DOWNVOTE")}
        className={cn(
          "flex items-center justify-center rounded-xl transition-all active:scale-90",
          isSmall ? "h-6 px-1.5 text-[11px]" : "h-7 px-2 text-xs font-bold",
          userVote === "DOWNVOTE"
            ? "bg-rose-500 text-white font-extrabold shadow-xs"
            : "text-neutral-500 hover:text-rose-700 hover:bg-rose-50"
        )}
        title="Downvote activity (Prefer to skip)"
      >
        <ThumbsDown className={cn(isSmall ? "h-3 w-3" : "h-3.5 w-3.5", userVote === "DOWNVOTE" && "fill-current")} />
      </button>
    </div>
  );
}
