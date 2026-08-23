"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import {
  getTripComments,
  createTripComment,
  type GetCommentsResponse,
  type TripComment,
} from "@/lib/api/collaboration";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  User,
  Sparkles,
  MapPin,
  Smile,
} from "lucide-react";

export interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  itineraryItemId?: string;
  itemTitle?: string;
}

function timeAgo(dateString: string) {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function CommentsModal({
  open,
  onClose,
  tripId,
  tripName,
  itineraryItemId,
  itemTitle,
}: CommentsModalProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error: loadError,
    refetch,
  } = useApiData<GetCommentsResponse>(
    () => (open && tripId ? getTripComments(tripId, itineraryItemId) : Promise.reject()),
    [open, tripId, itineraryItemId]
  );

  const comments = data?.comments || [];

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments, open]);

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setPosting(true);
    setPostError("");
    try {
      await createTripComment(tripId, {
        text: commentText.trim(),
        itineraryItemId,
      });
      setCommentText("");
      refetch();
    } catch (err) {
      setPostError(err instanceof ApiError ? err.message : "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePostComment(e as unknown as React.FormEvent);
    }
  }

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={itemTitle ? `Activity Discussion` : `Trip Discussion`}
      size="md"
    >
      <div className="space-y-4">
        {/* Context Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-white flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
              <MessageSquare className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-200 block">
                {itemTitle ? "Activity Thread" : "General Trip Notes"}
              </span>
              <h4 className="text-xs font-bold text-white truncate">
                {itemTitle || tripName}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-bold text-primary-200 bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>

        {/* Thread Chat Feed */}
        <div
          ref={scrollRef}
          className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1.5 scroll-smooth"
        >
          {isLoading && (
            <div className="space-y-3 py-2">
              <Skeleton variant="rounded" height={56} />
              <Skeleton variant="rounded" height={56} />
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <div className="py-10 text-center space-y-2 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-neutral-800">No thoughts shared yet</p>
              <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                Leave a recommendation, note, or question for your travel group!
              </p>
            </div>
          )}

          {!isLoading &&
            comments.map((comment) => {
              const isCurrentUser = Boolean(user?.id && comment.userId === user.id);

              return (
                <div
                  key={comment.id}
                  className={cn(
                    "flex items-start gap-2.5",
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* User Avatar */}
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-2xs border",
                      isCurrentUser
                        ? "bg-primary text-white border-primary"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    )}
                  >
                    {comment.user.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      comment.user.name.charAt(0)
                    )}
                  </div>

                  {/* Comment Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-3 shadow-2xs space-y-1",
                      isCurrentUser
                        ? "bg-primary-50 border border-primary-200/80 rounded-tr-xs"
                        : "bg-white border border-neutral-200/80 rounded-tl-xs"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px]">
                      <span className={cn("font-bold", isCurrentUser ? "text-primary-900" : "text-neutral-900")}>
                        {comment.user.name}
                        {isCurrentUser && " (You)"}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium shrink-0">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-800 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Error message */}
        {postError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{postError}</span>
          </div>
        )}

        {/* Composer Form */}
        <form onSubmit={handlePostComment} className="pt-2 border-t border-neutral-100 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={itemTitle ? `Add a thought on ${itemTitle}…` : "Share a note with your travel group…"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-11 pl-4 pr-3 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-primary bg-neutral-50/70 focus:bg-white transition-all shadow-2xs"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={posting}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="h-11 px-4 shrink-0 shadow-sm font-bold"
            >
              Send
            </Button>
          </div>
          <p className="text-[10px] text-neutral-400 pl-1">
            Press <kbd className="px-1 py-0.5 rounded bg-neutral-100 border text-[9px] font-mono">Enter</kbd> to post your comment
          </p>
        </form>
      </div>
    </Modal>
  );
}
