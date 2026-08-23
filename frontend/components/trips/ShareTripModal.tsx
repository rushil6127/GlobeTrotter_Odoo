"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import {
  getTripShareStatus,
  createShareLink,
  revokeShareLink,
  type TripShareStatusResponse,
} from "@/lib/api/sharing";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Globe2,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Send,
  Mail,
  Lock,
} from "lucide-react";

export interface ShareTripModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
}

export function ShareTripModal({
  open,
  onClose,
  tripId,
  tripName,
}: ShareTripModalProps) {
  const {
    data: shareStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch,
  } = useApiData<TripShareStatusResponse>(
    () => (open && tripId ? getTripShareStatus(tripId) : Promise.reject()),
    [open, tripId]
  );

  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  const isShared = Boolean(shareStatus?.isShared && shareStatus?.shareLink);
  const shareLink = shareStatus?.shareLink ?? null;

  async function handleGenerateLink(regenerate = false) {
    setGenerating(true);
    setActionError("");
    try {
      await createShareLink(tripId, { regenerate });
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to generate share link.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRevokeLink() {
    setRevoking(true);
    setActionError("");
    try {
      await revokeShareLink(tripId);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to revoke share link.");
    } finally {
      setRevoking(false);
    }
  }

  function getFullShareUrl(): string {
    if (!shareLink) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/shared/${shareLink.shareKey}`;
  }

  async function handleCopy() {
    const url = getFullShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      alert(`Share Link: ${url}`);
    }
  }

  function openShare(platform: "whatsapp" | "telegram" | "email") {
    const url = getFullShareUrl();
    const text = encodeURIComponent(`Check out my trip itinerary for "${tripName}" on GlobeTrotter: ${url}`);
    const tripTitle = encodeURIComponent(`GlobeTrotter Trip: ${tripName}`);

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out my trip "${tripName}" on GlobeTrotter!`)}`, "_blank");
    } else if (platform === "email") {
      window.open(`mailto:?subject=${tripTitle}&body=${text}`, "_blank");
    }
  }

  if (!open) return null;

  const displayError = actionError || (statusError ? statusError.message : "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share Trip Itinerary"
      size="md"
    >
      <div className="space-y-5">
        {/* Trip Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 p-4 sm:p-5 text-white shadow-md">
          <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center font-bold shrink-0 border border-white/20 shadow-xs">
              <Globe2 className="h-5 w-5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary-200 uppercase tracking-widest">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Public Itinerary Link
              </div>
              <h3 className="text-base font-display font-bold text-white truncate drop-shadow-xs">
                {tripName}
              </h3>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Loading State */}
        {statusLoading && (
          <div className="space-y-3 py-3">
            <Skeleton variant="rounded" height={45} />
            <Skeleton variant="rounded" height={100} />
          </div>
        )}

        {/* Active Shared State */}
        {!statusLoading && isShared && shareLink && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Copyable Link Input with Satisfying Copied State */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Public Share URL
                </label>
                {copied && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-1 duration-150">
                    <Check className="h-3.5 w-3.5" />
                    Copied to clipboard!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  className={cn(
                    "flex-1 h-11 px-3.5 rounded-xl border text-xs font-mono font-bold transition-all focus:outline-none select-all",
                    copied
                      ? "border-emerald-400 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-400/20"
                      : "border-neutral-200 bg-neutral-50 text-neutral-800 focus:border-primary focus:bg-white"
                  )}
                />
                <Button
                  variant={copied ? "primary" : "secondary"}
                  size="md"
                  leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  onClick={handleCopy}
                  className={cn(
                    "shrink-0 transition-all font-bold",
                    copied && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm shadow-emerald-600/30"
                  )}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>

            {/* Quick Share to Social Channels */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Share Directly
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openShare("whatsapp")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => openShare("telegram")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-sky-200 bg-sky-50/60 hover:bg-sky-100/80 text-sky-800 text-xs font-bold transition-all"
                >
                  <Send className="h-4 w-4 text-sky-600" />
                  <span>Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => openShare("email")}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-all"
                >
                  <Mail className="h-4 w-4 text-neutral-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Quick Management Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <a
                href={getFullShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Public Preview
              </a>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  loading={generating}
                  onClick={() => handleGenerateLink(true)}
                  className="text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Regenerate
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                  loading={revoking}
                  onClick={handleRevokeLink}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  Revoke
                </Button>
              </div>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <Lock className="h-3 w-3" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="font-bold text-emerald-950">Privacy Protected</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Anyone with this link can view destination stops and scheduled activities. Your trip budget, logged expenses, and collaborator accounts are safely redacted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not Shared State */}
        {!statusLoading && !isShared && (
          <div className="p-8 rounded-3xl bg-neutral-50/90 border border-dashed border-neutral-200/90 text-center space-y-4 animate-in fade-in duration-200">
            <div className="h-14 w-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-2xs">
              <Share2 className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-display font-bold text-neutral-900">
                Share Itinerary with the World
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Generate a unique, read-only public web link so travel companions, family, or followers can view your itinerary without logging in.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
              loading={generating}
              onClick={() => handleGenerateLink(false)}
              className="shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            >
              Generate Public Share Link
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
