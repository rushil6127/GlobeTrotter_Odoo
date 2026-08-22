"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { Globe, AlertCircle, User, Mail, Lock, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }
    if (!email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format (e.g., jane@example.com).";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFieldErrors({ email: "An account with this email already exists." });
        } else {
          setFormError(err.message ?? "Registration failed. Please try again.");
        }
      } else {
        setFormError("Unable to connect to the server. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-50 px-4 py-8">
      {/* Background Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/60 via-neutral-900/40 to-neutral-900/70 backdrop-blur-sm" />

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-2xl shadow-neutral-950/20 p-6 sm:p-8 md:p-10 transition-all">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-md shadow-primary/25">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-display font-bold text-neutral-900 tracking-tight block">
                GlobeTrotter
              </span>
              <span className="text-xs text-neutral-500 font-medium tracking-wide uppercase">
                Travel Planning
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
              Create your account
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Join GlobeTrotter to build day-wise itineraries, track budgets, and explore.
            </p>
          </div>

          {formError && (
            <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50/90 border border-red-200/80 rounded-2xl p-4 mb-5 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <p className="flex-1 leading-snug">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="Jane Traveler"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={fieldErrors.name}
              leftIcon={<User className="h-4 w-4 text-neutral-400" />}
              autoComplete="name"
              inputSize="lg"
              fullWidth
              disabled={isSubmitting}
            />

            <Input
              id="register-email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
              leftIcon={<Mail className="h-4 w-4 text-neutral-400" />}
              autoComplete="email"
              inputSize="lg"
              fullWidth
              disabled={isSubmitting}
            />

            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
              leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
              helperText="Must be at least 6 characters long."
              autoComplete="new-password"
              inputSize="lg"
              fullWidth
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              className="mt-3 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Get Started Free
            </Button>
          </form>

          <div className="pt-6 mt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary font-semibold hover:text-primary-600 transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
