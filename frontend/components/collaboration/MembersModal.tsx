"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import {
  getTripMembers,
  inviteTripMember,
  updateTripMemberRole,
  removeTripMember,
  type TripMembersResponse,
  type MemberRole,
} from "@/lib/api/collaboration";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Trash2,
  AlertCircle,
  Check,
  Mail,
  Send,
} from "lucide-react";

export interface MembersModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
}

export function MembersModal({
  open,
  onClose,
  tripId,
  tripName,
}: MembersModalProps) {
  const { user: currentUser } = useAuth();

  const {
    data,
    isLoading,
    error: loadError,
    refetch,
  } = useApiData<TripMembersResponse>(
    () => (open && tripId ? getTripMembers(tripId) : Promise.reject()),
    [open, tripId]
  );

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [actionError, setActionError] = useState("");

  // Managing member state
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const owner = data?.owner;
  const members = data?.members || [];

  // Current user is OWNER if their id matches trip owner's id
  const isOwner = Boolean(currentUser?.id && owner?.id && currentUser.id === owner.id);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setActionError("Please enter an email address.");
      return;
    }

    setIsInviting(true);
    setActionError("");
    setInviteSuccess(false);

    try {
      await inviteTripMember(tripId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteSuccess(true);
      refetch();
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to invite collaborator.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRoleChange(memberId: string, newRole: "EDITOR" | "VIEWER") {
    setUpdatingMemberId(memberId);
    setActionError("");
    try {
      await updateTripMemberRole(tripId, memberId, newRole);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update role.");
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function handleRemove(memberId: string) {
    setRemovingMemberId(memberId);
    setActionError("");
    try {
      await removeTripMember(tripId, memberId);
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to remove collaborator.");
    } finally {
      setRemovingMemberId(null);
    }
  }

  if (!open) return null;

  const displayError = actionError || (loadError ? loadError.message : "");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Trip Collaborators &amp; Access"
      size="md"
    >
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-neutral-900 truncate">{tripName}</h4>
            <p className="text-xs text-neutral-500">
              {members.length + 1} {members.length === 0 ? "person" : "collaborators"} on this trip
            </p>
          </div>
        </div>

        {/* Error message */}
        {displayError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Invite Member Section (OWNER only) */}
        {isOwner && (
          <form onSubmit={handleInvite} className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Invite Collaborator
              </span>
              {inviteSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Invitation sent!
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-primary bg-white"
                  required
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "EDITOR" | "VIEWER")}
                className="h-10 px-3 rounded-xl border border-neutral-200 text-xs font-bold bg-white text-neutral-700 focus:outline-none focus:border-primary"
              >
                <option value="EDITOR">Editor (Can edit)</option>
                <option value="VIEWER">Viewer (Read-only)</option>
              </select>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isInviting}
                leftIcon={<Send className="h-3.5 w-3.5" />}
                className="h-10 px-4 shrink-0 shadow-xs"
              >
                Invite
              </Button>
            </div>
          </form>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton variant="rounded" height={45} />
            <Skeleton variant="rounded" height={45} />
          </div>
        )}

        {/* Member List */}
        {!isLoading && owner && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Trip Collaborators
            </span>

            {/* Owner Row */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs uppercase border border-amber-500/20 shrink-0">
                  {owner.avatar ? (
                    <img src={owner.avatar} alt={owner.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    owner.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 truncate">{owner.name}</span>
                    {currentUser?.id === owner.id && (
                      <span className="text-[10px] text-neutral-400 font-bold">(You)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate">{owner.email}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold shrink-0">
                <Crown className="h-3 w-3 text-amber-600" />
                Owner
              </span>
            </div>

            {/* Collaborator Members */}
            {members.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20 shrink-0">
                    {m.user.avatar ? (
                      <img src={m.user.avatar} alt={m.user.name} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      m.user.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-900 truncate">{m.user.name}</span>
                      {currentUser?.id === m.userId && (
                        <span className="text-[10px] text-neutral-400 font-bold">(You)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">{m.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* If Owner: Role dropdown selector */}
                  {isOwner ? (
                    <select
                      value={m.role}
                      disabled={updatingMemberId === m.id}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as "EDITOR" | "VIEWER")}
                      className="h-8 px-2 rounded-lg border border-neutral-200 text-xs font-bold bg-neutral-50 text-neutral-700 focus:outline-none focus:border-primary"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                        m.role === "EDITOR"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      )}
                    >
                      {m.role === "EDITOR" ? <Shield className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {m.role === "EDITOR" ? "Editor" : "Viewer"}
                    </span>
                  )}

                  {/* If Owner: Remove button */}
                  {isOwner && (
                    <button
                      type="button"
                      disabled={removingMemberId === m.id}
                      onClick={() => handleRemove(m.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove collaborator"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
