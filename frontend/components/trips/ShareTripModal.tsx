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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-50/80 to-purple-50/60 border border-primary/15">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Globe2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
              Public Itinerary Preview
            </p>
            <h3 className="text-sm font-bold text-neutral-900 truncate">{tripName}</h3>
          </div>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Loading State */}
        {statusLoading && (
          <div className="space-y-3 py-2">
            <Skeleton variant="rounded" height={45} />
            <Skeleton variant="rounded" height={80} />
          </div>
        )}

        {/* Active Shared State */}
        {!statusLoading && isShared && shareLink && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Public Share URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  className="flex-1 h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-800 font-bold focus:outline-none select-all"
                />
                <Button
                  variant={copied ? "primary" : "secondary"}
                  size="md"
                  leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={getFullShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                Open Public Preview
              </a>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                loading={generating}
                onClick={() => handleGenerateLink(true)}
                className="text-xs text-neutral-600 hover:text-neutral-900"
              >
                Regenerate Link
              </Button>

              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5 text-red-500" />}
                loading={revoking}
                onClick={handleRevokeLink}
                className="text-xs text-red-600 hover:bg-red-50 ml-auto"
              >
                Revoke Link
              </Button>
            </div>

            {/* Privacy Protection Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-800 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Privacy Guard Active</p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Anyone with this link can view destination stops and scheduled activities. Your trip budget, expenses, and private account data are never exposed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not Shared State */}
        {!statusLoading && !isShared && (
          <div className="p-6 rounded-3xl bg-neutral-50/90 border border-dashed border-neutral-200 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Share2 className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-neutral-900">Share with Friends &amp; Family</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Generate a unique, read-only public web link so anyone can explore your itinerary without logging into an account.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
              loading={generating}
              onClick={() => handleGenerateLink(false)}
              className="shadow-sm shadow-primary/20"
            >
              Generate Public Link
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
