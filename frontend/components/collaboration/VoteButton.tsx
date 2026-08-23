"use client";

import React, { useState } from "react";
import { voteActivity, removeVote, type VoteStats } from "@/lib/api/collaboration";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";

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
      const scoreDelta = targetVote === "UPVOTE" ? (prevVote === "DOWNVOTE" ? 2 : 1) : prevVote === "UPVOTE" ? -2 : -1;
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
        "inline-flex items-center rounded-xl bg-neutral-100/80 border border-neutral-200/80 p-0.5 shadow-2xs",
        className
      )}
    >
      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote("UPVOTE")}
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          isSmall ? "h-6 w-6" : "h-7 w-7",
          userVote === "UPVOTE"
            ? "bg-emerald-500 text-white shadow-2xs"
            : "text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50"
        )}
        title="Upvote activity"
      >
        <ThumbsUp className={cn(isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
      </button>

      <span
        className={cn(
          "font-mono font-bold px-1.5 text-center min-w-[20px]",
          isSmall ? "text-[11px]" : "text-xs",
          score > 0 ? "text-emerald-700" : score < 0 ? "text-red-600" : "text-neutral-600"
        )}
      >
        {score > 0 ? `+${score}` : score}
      </span>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleVote("DOWNVOTE")}
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          isSmall ? "h-6 w-6" : "h-7 w-7",
          userVote === "DOWNVOTE"
            ? "bg-red-500 text-white shadow-2xs"
            : "text-neutral-500 hover:text-red-700 hover:bg-red-50"
        )}
        title="Downvote activity"
      >
        <ThumbsDown className={cn(isSmall ? "h-3 w-3" : "h-3.5 w-3.5")} />
      </button>
    </div>
  );
}
