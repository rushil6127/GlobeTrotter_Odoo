"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { Globe } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

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
    if (!name.trim() || name.trim().length < 2)
      errors.name = "Name must be at least 2 characters.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password || password.length < 6)
      errors.password = "Password must be at least 6 characters.";
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
          setFieldErrors({ email: "This email is already registered." });
        } else {
          setFormError(err.message ?? "Registration failed. Please try again.");
        }
      } else {
        setFormError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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
            Create your account
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            Start planning your next adventure in minutes.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="Jane Traveler"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
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
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
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
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
