"use client";

import React, { useState } from "react";
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
import {
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  User,
  Sparkles,
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

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={itemTitle ? `Comments on "${itemTitle}"` : `Trip Discussion — ${tripName}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Comment Thread List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {isLoading && (
            <div className="space-y-2.5 py-2">
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={60} />
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <div className="py-8 text-center space-y-2 bg-neutral-50 rounded-2xl border border-neutral-100">
              <MessageSquare className="h-7 w-7 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                No comments yet. Start the conversation with your travel group!
              </p>
            </div>
          )}

          {!isLoading &&
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
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
                    <span className="text-xs font-bold text-neutral-900">
                      {comment.user.name}
                      {user?.id === comment.userId && " (You)"}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed pl-8">
                  {comment.text}
                </p>
              </div>
            ))}
        </div>

        {/* Error message */}
        {postError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{postError}</span>
          </div>
        )}

        {/* New Comment Input Form */}
        <form onSubmit={handlePostComment} className="pt-2 border-t border-neutral-100 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a thought or note for the group…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-primary bg-neutral-50 focus:bg-white transition-colors"
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={posting}
              leftIcon={<Send className="h-3.5 w-3.5" />}
              className="h-10 px-4 shrink-0 shadow-xs"
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
