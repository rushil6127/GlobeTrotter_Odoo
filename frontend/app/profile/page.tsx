"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageShell } from "@/components/navigation/PlaceholderPage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Loader";
import { useApiData } from "@/lib/hooks/useApiData";
import { getUserProfile, updateUserProfile } from "@/lib/api/users";
import { getTrips, type Trip } from "@/lib/api/trips";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/api/auth";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Plane,
  Clock,
  Check,
  AlertCircle,
  ShieldCheck,
  Save,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
];

const TRAVEL_STYLES = [
  "🎒 Backpacker",
  "🏖️ Beach & Relaxation",
  "⛰️ Mountain Adventure",
  "🍜 Foodie Explorer",
  "🏛️ Cultural & Heritage",
  "✨ Luxury & Comfort",
];

function fmtDate(d: string | null | undefined) {
  if (!d) return "Recently";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function getTripDays(s: string, e: string): number {
  try {
    return Math.max(
      1,
      Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  } catch {
    return 1;
  }
}

/* ═════════════════════════════════════════
   PROFILE EDIT FORM
   ═════════════════════════════════════════ */
function ProfileEditor({
  user,
  onSaved,
}: {
  user: User;
  onSaved: () => void;
}) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "🎒 Backpacker",
    "🍜 Foodie Explorer",
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        avatar: avatar.trim() || null,
      });
      if (res.user) {
        setUser(res.user);
      }
      setSaveSuccess(true);
      onSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  function toggleStyle(style: string) {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-sm space-y-6">
      <div>
        <h3 className="font-display font-bold text-neutral-900 text-lg">
          Edit Personal Information
        </h3>
        <p className="text-xs text-neutral-500">
          Update your public display name and custom profile avatar.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="profile-name"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-neutral-100/70 text-xs text-neutral-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Avatar URL + Presets */}
        <div className="space-y-2.5">
          <Input
            id="profile-avatar"
            label="Avatar Image URL"
            placeholder="https://example.com/your-photo.jpg"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          />

          <div>
            <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
              Or select from travel presets:
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={cn(
                    "h-10 w-10 rounded-xl overflow-hidden border-2 transition-all p-0.5",
                    avatar === preset
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-neutral-200 opacity-70 hover:opacity-100 hover:border-neutral-300"
                  )}
                >
                  <img
                    src={preset}
                    alt="Preset avatar"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </button>
              ))}
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar("")}
                  className="text-xs text-neutral-400 hover:text-neutral-600 font-semibold px-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Travel Styles & Badges */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Travel Interests &amp; Styles
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedStyles.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSaving}
            leftIcon={<Save className="h-4 w-4" />}
            className="shadow-sm shadow-primary/20"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ═════════════════════════════════════════
   MAIN PROFILE PAGE
   ═════════════════════════════════════════ */
export default function ProfilePage() {
  const { user } = useAuth();

  // Load user profile & trips
  const {
    data: profileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useApiData(() => getUserProfile(), []);

  const { data: trips, isLoading: tripsLoading } = useApiData<Trip[]>(
    () => getTrips(),
    []
  );

  const currentUser = profileData?.user || user;

  // Calculated Travel Statistics
  const stats = useMemo(() => {
    const tripList = trips || [];
    const totalTrips = tripList.length;

    let totalStops = 0;
    let totalDays = 0;

    tripList.forEach((t) => {
      totalStops += t.tripCities?.length || t._count?.tripCities || 0;
      totalDays += getTripDays(t.startDate, t.endDate);
    });

    return {
      totalTrips,
      totalStops,
      totalDays,
    };
  }, [trips]);

  const isLoading = profileLoading || tripsLoading;

  return (
    <PageShell currentPath="/profile" userName={currentUser?.name ?? undefined}>
      <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-2 md:pt-4">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-neutral-900 tracking-tight">
            Account &amp; Profile
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your personal traveler details, account preferences, and journey milestones.
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && !currentUser && (
          <div className="space-y-6">
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={320} />
          </div>
        )}

        {/* Profile Content */}
        {currentUser && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* User Profile Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-950 p-6 sm:p-8 text-white shadow-lg border border-primary-700/50">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl overflow-hidden bg-primary-700/60 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || "User Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-display">
                        {(currentUser.name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white truncate">
                      {currentUser.name || "Traveler"}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-primary-200 font-mono">
                    {currentUser.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-primary-200/80">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary-300" />
                      Member since {fmtDate(currentUser.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  <Plane className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Trips Planned
                  </span>
                  <p className="text-2xl font-display font-extrabold text-neutral-900">
                    {stats.totalTrips}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Destinations Visited
                  </span>
                  <p className="text-2xl font-display font-extrabold text-neutral-900">
                    {stats.totalStops}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Days on Adventure
                  </span>
                  <p className="text-2xl font-display font-extrabold text-neutral-900">
                    {stats.totalDays}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Settings Form */}
            <ProfileEditor
              key={currentUser.id + (currentUser.name || "") + (currentUser.avatar || "")}
              user={currentUser}
              onSaved={refetchProfile}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
