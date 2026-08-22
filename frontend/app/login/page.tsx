"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loader";
import { ApiError } from "@/lib/api/client";
import { Globe } from "lucide-react";

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
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
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
          setFormError("Incorrect email or password. Please try again.");
        } else {
          setFormError(err.message ?? "Login failed. Please try again.");
        }
      } else {
        setFormError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Input
        id="login-email"
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
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
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        autoComplete="current-password"
        inputSize="lg"
        fullWidth
        disabled={isSubmitting}
      />

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        className="mt-2"
      >
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-50">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/nature-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-2xl shadow-neutral-900/10 p-8 md:p-10">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-neutral-900">
              GlobeTrotter
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            Sign in to your account to continue planning.
          </p>

          <Suspense fallback={<Spinner size="md" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
