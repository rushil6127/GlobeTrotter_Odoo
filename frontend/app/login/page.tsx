"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loader";
import { ApiError } from "@/lib/api/client";
import { Globe, AlertCircle, Sparkles, Mail, Lock } from "lucide-react";

function LoginForm() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate() {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format (e.g., jane@example.com).";
    }
    if (!password) {
      errors.password = "Please enter your password.";
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
      await login(email.trim(), password);
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError("Incorrect email or password. Please check your credentials and try again.");
        } else {
          setFormError(err.message ?? "Login failed. Please try again.");
        }
      } else {
        setFormError("Unable to connect to the server. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50/90 border border-red-200/80 rounded-2xl p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <p className="flex-1 leading-snug">{formError}</p>
        </div>
      )}

      <Input
        id="login-email"
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
        id="login-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={fieldErrors.password}
        leftIcon={<Lock className="h-4 w-4 text-neutral-400" />}
        autoComplete="current-password"
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
        Sign In to GlobeTrotter
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-50 px-4 py-8">
      {/* Background Gradient & Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1920&q=80')",
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
              Welcome back
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Sign in to manage your itineraries, collaborate, and track budgets.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex justify-center items-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>

          <div className="pt-6 mt-6 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary font-semibold hover:text-primary-600 transition-colors"
              >
                Create one now
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
