"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api/client";
import "@/styles/cinematic.css";

interface CinematicLandingProps {
  initialSignUp?: boolean;
  initialAuthOpen?: boolean;
}

export function CinematicLanding({
  initialSignUp = false,
  initialAuthOpen = false,
}: CinematicLandingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const { user, login, register, isLoading: authLoading } = useAuth();

  /* ── DOM Refs ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const loginPanelRef = useRef<HTMLDivElement>(null);

  /* ── Auth State ── */
  const [isSignUpMode, setIsSignUpMode] = useState(initialSignUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});

  /* ── Scroll Physics & Animation State Refs ── */
  const stateRef = useRef({
    targetMouseX: 0,
    targetMouseY: 0,
    mouseX: 0,
    mouseY: 0,
    targetScroll: 0,
    smoothScroll: 0,
    initialized: false,
    rafPending: false,
  });

  /* ── Math Helpers ── */
  const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = (e0: number, e1: number, v: number) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const segmentInOut = (s: number, a: number, b: number, c: number, d: number) => {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  };

  /* ── Per-frame update loop ── */
  const updateRef = useRef<() => void>(() => {});

  const update = useCallback(() => {
    const state = stateRef.current;
    state.rafPending = false;

    if (!sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const scrollDistance = clamp(
      -section.getBoundingClientRect().top,
      0,
      section.offsetHeight - window.innerHeight
    );

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    state.targetScroll = scrollDistance;
    if (!state.initialized || reduceMotion) {
      state.smoothScroll = state.targetScroll;
      state.initialized = true;
    } else {
      state.smoothScroll = lerp(state.smoothScroll, state.targetScroll, 0.14);
    }
    if (Math.abs(state.smoothScroll - state.targetScroll) < 0.08) {
      state.smoothScroll = state.targetScroll;
    }

    state.mouseX = lerp(state.mouseX, state.targetMouseX, 0.12);
    state.mouseY = lerp(state.mouseY, state.targetMouseY, 0.12);

    const { smoothScroll, mouseX, mouseY, targetScroll, targetMouseX, targetMouseY } = state;

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
    const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700);
    const introExit = smoothstep(90, 650, smoothScroll);
    const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
    const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
    const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const splitDrift = Math.pow(frame2.enter, 1.5);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active * (1 - frame3.exit);
    const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;
    const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
    const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

    const mxVal = reduceMotion ? 0 : mouseX;
    const myVal = reduceMotion ? 0 : mouseY;

    /* ── Variable writes to container style ── */
    const s = containerRef.current.style;

    s.setProperty("--mx", mxVal.toFixed(4));
    s.setProperty("--my", myVal.toFixed(4));

    s.setProperty("--back-opacity", (1 - frame2.active * 0.06).toString());
    s.setProperty("--back-x", `${mouseX * -12}px`);
    s.setProperty("--back-y", `${mouseY * -4}px`);
    s.setProperty("--back-scale", backScale.toString());
    s.setProperty("--four-y", `${10 + progress * 10}vh`);
    s.setProperty("--four-scale", (0.78 + progress * 0.16).toString());
    s.setProperty("--bazaar-y", `${20 - progress * 8}vh`);
    s.setProperty("--blur-px", `${blurActive * 14}px`);
    s.setProperty("--back-brightness", (1 - blurActive * 0.255).toString());
    s.setProperty("--bazaar-blur-px", `${frame2.active * 14}px`);
    s.setProperty("--bazaar-brightness", (1 - frame2.active * 0.255 - frame3.active * 0.06).toString());
    s.setProperty("--bazaar-saturation", (1 + frame3.active * 0.18).toString());
    s.setProperty("--shade-opacity", "1");
    s.setProperty("--shade-z", frame2.active > 0.02 ? "2" : "0");
    s.setProperty("--shade-top-alpha", (blurActive * 0.465).toString());
    s.setProperty("--shade-mid-alpha", (blurActive * 0.42).toString());
    s.setProperty("--shade-bottom-alpha", (blurActive * 0.51).toString());

    s.setProperty("--title-y", `${introExit * -210}px`);
    s.setProperty("--title-scale", (1 - introExit * 0.08).toString());
    s.setProperty("--title-opacity", (1 - introExit).toString());

    s.setProperty("--bridge-x", `calc(-50% + ${mouseX * 18}px)`);
    s.setProperty("--bridge-y", `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
    s.setProperty("--bridge-bottom", `${5 - frame2.enter * 13}vh`);
    s.setProperty("--bridge-width", `${67.2 + frame2.enter * 37.8}vw`);
    s.setProperty("--bridge-scale", (1.02 + sharedHeroScale + frame2.exit * 0.46).toString());

    s.setProperty("--split-left-x", `calc(-50% + ${-splitDrift * 46}vw + ${mouseX * 22}px)`);
    s.setProperty("--split-left-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    s.setProperty("--split-left-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toString());
    s.setProperty("--split-right-x", `calc(-50% + ${splitDrift * 46}vw + ${mouseX * 22}px)`);
    s.setProperty("--split-right-y", `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
    s.setProperty("--split-right-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toString());

    s.setProperty("--frame2-opacity", frame2Opacity.toString());
    s.setProperty("--frame2-x", `calc(-50% + ${mouseX * 10}px)`);
    s.setProperty("--frame2-y", `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
    s.setProperty("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toString());

    s.setProperty("--intro-copy-y", `${introExit * 90}px`);
    s.setProperty("--intro-copy-opacity", (1 - introExit).toString());
    s.setProperty("--panel2-opacity", panel2Opacity.toString());
    s.setProperty("--panel2-y", `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
    s.setProperty("--panel3-opacity", panel3Opacity.toString());
    s.setProperty("--panel3-y", `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);

    s.setProperty("--sights-opacity", sightsEnter.toString());
    s.setProperty("--sights-controls-opacity", sightsControlsEnter.toString());
    s.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    s.setProperty("--sights-y", "0px");
    s.setProperty("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
    s.setProperty("--sights-scale", (1 / backScale).toString());
    s.setProperty("--sights-top", `${sightsParentTop}px`);
    s.setProperty("--sights-screen-top", `${sightsScreenTop}px`);

    /* ── Login Overlay Visibility Transition ── */
    const loginPanel = loginPanelRef.current;
    if (loginPanel) {
      if (smoothScroll > 2500 || initialAuthOpen) {
        loginPanel.style.display = "flex";
        loginPanel.style.pointerEvents = "auto";
        const op = initialAuthOpen ? 1 : (smoothScroll - 2500) / 200;
        loginPanel.style.opacity = Math.min(Math.max(op, 0), 1).toString();
      } else {
        loginPanel.style.pointerEvents = "none";
        loginPanel.style.opacity = "0";
        loginPanel.style.display = "none";
      }
    }

    /* ── Continue RAF if still interpolating ── */
    if (
      Math.abs(state.smoothScroll - targetScroll) > 0.08 ||
      Math.abs(state.mouseX - targetMouseX) > 0.001 ||
      Math.abs(state.mouseY - targetMouseY) > 0.001
    ) {
      if (!stateRef.current.rafPending) {
        stateRef.current.rafPending = true;
        requestAnimationFrame(() => updateRef.current());
      }
    }
  }, [initialAuthOpen]);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  const requestTick = useCallback(() => {
    if (!stateRef.current.rafPending) {
      stateRef.current.rafPending = true;
      requestAnimationFrame(() => updateRef.current());
    }
  }, []);

  /* ── Navigation helpers ── */
  const scrollToSection = (targetY: number) => {
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const scrollToAuth = () => {
    window.scrollTo({ top: 3200, behavior: "smooth" });
  };

  /* ── Event Listeners ── */
  useEffect(() => {
    const handleScroll = () => requestTick();
    const handleResize = () => requestTick();
    const handlePointerMove = (e: PointerEvent) => {
      stateRef.current.targetMouseX = e.clientX / window.innerWidth - 0.5;
      stateRef.current.targetMouseY = e.clientY / window.innerHeight - 0.5;
      requestTick();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    requestTick();

    if (initialAuthOpen) {
      scrollToAuth();
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [requestTick, initialAuthOpen]);

  /* ── Auth Form Submission ── */
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: { name?: string; email?: string; password?: string; general?: string } = {};

    if (isSignUpMode && (!name.trim() || name.trim().length < 2)) {
      errors.name = "Please enter your full name (at least 2 characters).";
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUpMode) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      setAuthSuccess(true);

      setTimeout(() => {
        router.push(redirectTo);
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFieldErrors({ password: "Invalid email or password. Please check your credentials." });
        } else if (err.status === 409) {
          setFieldErrors({ email: "An account with this email already exists." });
        } else {
          setFieldErrors({ general: err.message || "Authentication failed." });
        }
      } else {
        setFieldErrors({
          general: "Unable to connect to the backend server. Please verify the backend is running.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@example.com");
    setPassword("password123");
    setFieldErrors({});
  };

  return (
    <div className="site-shell-cinematic" ref={containerRef}>
      <section className="cinema-scroll" id="cinema" ref={sectionRef} aria-label="GlobeTrotter Story">
        <div className="stage">
          <div className="world">
            {/* Sky Background */}
            <img
              className="scene-img sky-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png"
              alt=""
            />

            {/* Cinematic Header */}
            <header className="site-header" aria-label="Primary navigation">
              <a
                className="site-logo"
                href="#cinema"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(0);
                }}
              >
                GlobeTrotter
              </a>

              <nav className="site-nav" aria-label="Main menu">
                <button type="button" onClick={() => scrollToSection(0)}>
                  Intro
                </button>
                <button type="button" onClick={() => scrollToSection(950)}>
                  Bridge
                </button>
                <button type="button" onClick={() => scrollToSection(2150)}>
                  Bazaar
                </button>
                <button type="button" onClick={() => scrollToSection(3200)}>
                  Explore
                </button>
              </nav>

              <div className="site-header-actions">
                {user ? (
                  <button
                    type="button"
                    className="btn-nav-auth"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard →
                  </button>
                ) : (
                  <button type="button" className="btn-nav-auth" onClick={scrollToAuth}>
                    Sign In
                  </button>
                )}

                <button className="language-switcher" aria-label="Language selector">
                  <span>EN</span>
                  <span aria-hidden="true">⌄</span>
                </button>
              </div>
            </header>

            {/* Back Stack Layers */}
            <div className="back-stack">
              <img
                className="scene-img back-img back-four"
                src="https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png"
                alt=""
              />
              <img
                className="scene-img back-img back-bazaar"
                src="https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png"
                alt=""
              />
            </div>

            {/* Hero Main Title */}
            <h1 className="hero-title">Globe Trotter</h1>

            {/* Splitframe Foreground Images */}
            <img
              className="scene-img splitframe-img splitframe-left"
              src="https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png"
              alt=""
            />
            <img
              className="scene-img splitframe-img splitframe-right"
              src="https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png"
              alt=""
            />
            <img
              className="scene-img bridge-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png"
              alt=""
            />
            <img
              className="scene-img frame-two-img"
              src="https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png"
              alt=""
            />

            <div className="shade"></div>
          </div>

          {/* Intro Story Copy */}
          <section className="intro-copy" aria-label="Mostar overview">
            <p>
              Experience the energy of vibrant cities, from bustling streets and iconic landmarks to local
              markets, shopping, nightlife, and delicious cuisine. Discover the unique charm that makes every
              destination worth exploring.
            </p>
            <div className="hero-tags" aria-label="Highlights">
              <span>Old Bridge</span>
              <span>Neretva River</span>
              <span>UNESCO old city</span>
            </div>
          </section>

          {/* Bridge Story Panel */}
          <section className="story-panel story-panel-bridge" aria-label="Story details">
            <h2>Explore Cities full of stories</h2>
            <p>Go beyond the usual tourist spots and experience the city through its people, culture, and hidden gems.</p>
            <dl className="facts">
              <div>
                <dt>50K+</dt>
                <dd>Travel Community</dd>
              </div>
              <div>
                <dt>2,500+</dt>
                <dd>Memorable Journeys</dd>
              </div>
            </dl>
          </section>

          {/* Bazaar Story Panel */}
          <section className="story-panel story-panel-bazaar" aria-label="Old town details">
            <h2>Experience vibrant cities & local culture.</h2>
            <p>Stone lanes, historic courtyards, artisan copper stalls, and riverside coffee along your curated route.</p>
            <button className="note-button" type="button" onClick={scrollToAuth}>
              <span aria-hidden="true">↗</span>
              <span>{user ? "Go to Dashboard" : "Start Your Journey"}</span>
            </button>
          </section>

          {/* Glassmorphism Authentication Container */}
          <div
            className="login-overlay-container"
            ref={loginPanelRef}
            style={{ display: "none", opacity: 0, pointerEvents: "none" }}
          >
            <div className="glass-login-card">
              {/* Success Celebration State */}
              {authSuccess ? (
                <div className="login-success-state">
                  <svg
                    className="success-icon animate-bounce"
                    viewBox="0 0 24 24"
                    width="56"
                    height="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2 className="success-title">
                    {isSignUpMode ? "Welcome to GlobeTrotter!" : "Welcome Back!"}
                  </h2>
                  <p className="success-desc">
                    Your adventure awaits. Preparing your travel dashboard and itineraries...
                  </p>
                  <div className="success-loader-line"></div>
                </div>
              ) : (
                /* Interactive Form State */
                <div>
                  <div className="login-header">
                    <div className="logo-badge">
                      <svg
                        className="logo-badge-icon"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="m12 3-1.912 5.886L4 10l5.886 1.912L12 21l1.912-5.886L20 12l-5.886-1.912Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2>{isSignUpMode ? "Create Account" : "Sign In"}</h2>
                    <p>
                      {isSignUpMode
                        ? "Join GlobeTrotter to plan and share your journeys"
                        : "Connect and customize your global itineraries"}
                    </p>
                  </div>

                  {fieldErrors.general && (
                    <div className="mb-4 text-xs text-red-300 bg-red-950/50 border border-red-500/40 rounded-xl p-3 text-center">
                      {fieldErrors.general}
                    </div>
                  )}

                  <form className="login-form" onSubmit={handleAuthSubmit} noValidate>
                    {/* Full Name (Sign Up only) */}
                    {isSignUpMode && (
                      <div className="form-group">
                        <label htmlFor="auth-name">Full Name</label>
                        <div className="input-wrapper">
                          <svg
                            className="input-icon"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <input
                            type="text"
                            id="auth-name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            className={fieldErrors.name ? "input-error" : ""}
                            disabled={isSubmitting}
                          />
                        </div>
                        {fieldErrors.name && <span className="error-text">{fieldErrors.name}</span>}
                      </div>
                    )}

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="auth-email">Email Address</label>
                      <div className="input-wrapper">
                        <svg
                          className="input-icon"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path
                            d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          type="email"
                          id="auth-email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                          }}
                          className={fieldErrors.email ? "input-error" : ""}
                          disabled={isSubmitting}
                        />
                      </div>
                      {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                      <label htmlFor="auth-password">Password</label>
                      <div className="input-wrapper">
                        <svg
                          className="input-icon"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          type="password"
                          id="auth-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                          }}
                          className={fieldErrors.password ? "input-error" : ""}
                          disabled={isSubmitting}
                        />
                      </div>
                      {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
                    </div>

                    {/* Actions Row */}
                    {!isSignUpMode && (
                      <div className="login-actions">
                        <div className="remember-me">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <label htmlFor="remember">Remember me</label>
                        </div>
                        <a
                          href="#forgot"
                          className="forgot-link"
                          onClick={(e) => {
                            e.preventDefault();
                            fillDemoCredentials();
                          }}
                        >
                          Need demo login?
                        </a>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button type="submit" className="btn-login-submit" disabled={isSubmitting}>
                      <span>
                        {isSubmitting
                          ? isSignUpMode
                            ? "Creating Account..."
                            : "Signing In..."
                          : isSignUpMode
                          ? "Create Account"
                          : "Sign In to Globe Trotter"}
                      </span>
                      {isSubmitting && (
                        <svg
                          className="animate-spin"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginLeft: 8 }}
                        >
                          <circle cx="12" cy="12" r="10" stroke="rgba(253,241,225,0.2)" />
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>

                    {/* 1-Click Demo Credentials Filler */}
                    {!isSignUpMode && (
                      <button
                        type="button"
                        className="btn-demo-quick"
                        onClick={fillDemoCredentials}
                        title="Auto-fill with demo credentials"
                      >
                        ✨ Fill Demo Credentials (demo@example.com)
                      </button>
                    )}

                    {/* Auth Toggle */}
                    <div className="auth-toggle-footer">
                      <span>{isSignUpMode ? "Already have an account?" : "Don't have an account?"}</span>
                      <button
                        type="button"
                        className="btn-toggle-auth"
                        onClick={() => {
                          setIsSignUpMode(!isSignUpMode);
                          setFieldErrors({});
                        }}
                      >
                        {isSignUpMode ? "Sign In" : "Create Account"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
