(() => {
  /* ── Queries ── */
  const section = document.querySelector(".cinema-scroll");
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const track = document.querySelector(".sights-track");
  const sightsControls = document.querySelector(".sights-controls");
  const prevBtn = document.querySelector(".sight-prev");
  const nextBtn = document.querySelector(".sight-next");
  const originalCards = [...document.querySelectorAll(".sight-card")];

  /* ── State ── */
  let targetMouseX = 0, targetMouseY = 0;
  let mouseX = 0, mouseY = 0;
  let targetScroll = 0, smoothScroll = 0;
  let initialized = false;
  let rafPending = false;
  let sightCards = [];
  const originalSightCount = originalCards.length;
  let activeSight = originalSightCount;

  /* ── Helpers ── */
  function clamp(v, min = 0, max = 1) {
    return Math.min(max, Math.max(min, v));
  }
  function smoothstep(e0, e1, v) {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function segmentInOut(s, a, b, c, d) {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  }
  function getScrollDistance() {
    return clamp(
      -section.getBoundingClientRect().top,
      0,
      section.offsetHeight - window.innerHeight
    );
  }

  /* ── Per-frame update ── */
  function update() {
    rafPending = false;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

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

    const mxVal = reduceMotion.matches ? 0 : mouseX;
    const myVal = reduceMotion.matches ? 0 : mouseY;

    /* ── Variable writes ── */
    const s = root.style;

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
    if (sightsControls) sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
    s.setProperty("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    s.setProperty("--sights-y", "0px");
    s.setProperty("--sights-enter-x", `${(1 - sightsEnter) * 420}vw`);
    s.setProperty("--sights-scale", (1 / backScale).toString());
    s.setProperty("--sights-top", `${sightsParentTop}px`);
    s.setProperty("--sights-screen-top", `${sightsScreenTop}px`);

    const loginPanel = document.getElementById("login-panel");
    if (loginPanel) {
      if (smoothScroll > 2500) {
        if (loginPanel.style.display === "none") loginPanel.style.display = "flex";
        loginPanel.style.pointerEvents = "auto";
        let op = (smoothScroll - 2500) / 200;
        loginPanel.style.opacity = Math.min(Math.max(op, 0), 1).toString();
      } else {
        loginPanel.style.pointerEvents = "none";
        loginPanel.style.opacity = "0";
        loginPanel.style.display = "none";
      }
    }

    /* ── Continue if animating ── */
    if (
      Math.abs(smoothScroll - targetScroll) > 0.08 ||
      Math.abs(mouseX - targetMouseX) > 0.001 ||
      Math.abs(mouseY - targetMouseY) > 0.001
    ) {
      requestTick();
    }
  }

  function requestTick() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }

  /* ── Listeners ── */
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    updateSightSlider();
    requestTick();
  });
  window.addEventListener("pointermove", (e) => {
    targetMouseX = e.clientX / window.innerWidth - 0.5;
    targetMouseY = e.clientY / window.innerHeight - 0.5;
    requestTick();
  }, { passive: true });

  if (prevBtn) prevBtn.addEventListener("click", () => moveSightSlider(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => moveSightSlider(1));

  const API_BASE_URL = window.__API_BASE_URL__ || "http://localhost:5000/api";

  let isSignUpMode = false;
  const loginForm = document.getElementById("login-form");
  const btnToggleAuth = document.getElementById("btn-toggle-auth");
  const authTitle = document.getElementById("auth-title");
  const authSubtitle = document.getElementById("auth-subtitle");
  const nameGroup = document.getElementById("name-group");
  const loginActions = document.getElementById("login-actions");
  const togglePrompt = document.getElementById("toggle-prompt");

  if (btnToggleAuth) {
    btnToggleAuth.addEventListener("click", () => {
      isSignUpMode = !isSignUpMode;

      // Clear errors & input values
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const nameError = document.getElementById("name-error");
      const emailError = document.getElementById("email-error");
      const passwordError = document.getElementById("password-error");

      if (nameInput) { nameInput.value = ""; nameInput.classList.remove("input-error"); }
      if (emailInput) { emailInput.value = ""; emailInput.classList.remove("input-error"); }
      if (passwordInput) { passwordInput.value = ""; passwordInput.classList.remove("input-error"); }
      if (nameError) nameError.textContent = "";
      if (emailError) emailError.textContent = "";
      if (passwordError) passwordError.textContent = "";

      const btnText = document.getElementById("btn-text");

      if (isSignUpMode) {
        if (authTitle) authTitle.textContent = "Create Account";
        if (authSubtitle) authSubtitle.textContent = "Join Globe Trotter to plan your journeys";
        if (nameGroup) nameGroup.style.display = "flex";
        if (loginActions) loginActions.style.display = "none";
        if (btnText) btnText.textContent = "Create Account";
        if (togglePrompt) togglePrompt.textContent = "Already have an account?";
        if (btnToggleAuth) btnToggleAuth.textContent = "Sign In";
      } else {
        if (authTitle) authTitle.textContent = "Sign In";
        if (authSubtitle) authSubtitle.textContent = "Connect and customize your global itineraries";
        if (nameGroup) nameGroup.style.display = "none";
        if (loginActions) loginActions.style.display = "flex";
        if (btnText) btnText.textContent = "Sign In to Globe Trotter";
        if (togglePrompt) togglePrompt.textContent = "Don't have an account?";
        if (btnToggleAuth) btnToggleAuth.textContent = "Create Account";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const nameError = document.getElementById("name-error");
      const emailError = document.getElementById("email-error");
      const passwordError = document.getElementById("password-error");
      const btn = document.getElementById("btn-login-submit");
      const btnText = document.getElementById("btn-text");
      const btnSpinner = document.getElementById("btn-spinner");
      const successState = document.getElementById("success-state");
      const formState = document.getElementById("form-state");

      // Reset previous error messages and styles
      if (nameError) nameError.textContent = "";
      if (emailError) emailError.textContent = "";
      if (passwordError) passwordError.textContent = "";
      if (nameInput) nameInput.classList.remove("input-error");
      if (emailInput) emailInput.classList.remove("input-error");
      if (passwordInput) passwordInput.classList.remove("input-error");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      let hasClientError = false;

      if (isSignUpMode) {
        if (!name || name.length < 2) {
          if (nameError) nameError.textContent = "Please enter your full name (at least 2 characters).";
          if (nameInput) nameInput.classList.add("input-error");
          hasClientError = true;
        }
      }

      if (!email || !email.includes("@")) {
        if (emailError) emailError.textContent = "Please enter a valid email address.";
        if (emailInput) emailInput.classList.add("input-error");
        hasClientError = true;
      }
      if (!password || password.length < 6) {
        if (passwordError) passwordError.textContent = "Password must be at least 6 characters.";
        if (passwordInput) passwordInput.classList.add("input-error");
        hasClientError = true;
      }
      if (hasClientError) return;

      // Activate loading spinner state
      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = isSignUpMode ? "Creating Account..." : "Signing In...";
      if (btnSpinner) btnSpinner.style.display = "inline-block";

      const endpoint = isSignUpMode ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/login`;
      const requestBody = isSignUpMode ? { name, email, password } : { email, password };

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        const result = await response.json().catch(() => null);

        if (response.ok && result && result.success) {
          // Trigger success animation
          const successTitle = successState ? successState.querySelector(".success-title") : null;
          const successDesc = successState ? successState.querySelector(".success-desc") : null;

          if (isSignUpMode) {
            if (successTitle) successTitle.textContent = "Welcome to Globe Trotter!";
            if (successDesc) successDesc.textContent = "Your account has been created successfully. Preparing your dashboard...";
          } else {
            if (successTitle) successTitle.textContent = "Welcome Back!";
            if (successDesc) successDesc.textContent = "Your journey awaits. Preparing the dashboard to plan your next memorable trip...";
          }

          if (formState) formState.style.display = "none";
          if (successState) successState.style.display = "flex";
          // TODO(team): redirect to dashboard once frontend routing exists — do not invent a dashboard route.
        } else {
          const errorMessage = (result && result.message) || (isSignUpMode ? "Registration failed. Please check your information." : "Authentication failed. Please check your credentials.");
          if (passwordError) {
            passwordError.textContent = errorMessage;
          }
          if (passwordInput) {
            passwordInput.classList.add("input-error");
          }
        }
      } catch (err) {
        console.error("Auth request failed:", err);
        if (passwordError) {
          passwordError.textContent = "Unable to connect to the server. Please ensure the backend is running.";
        }
      } finally {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = isSignUpMode ? "Create Account" : "Sign In to Globe Trotter";
        if (btnSpinner) btnSpinner.style.display = "none";
      }
    });
  }

  /* ── Init ── */
  // setupSightSlider();
  requestTick();
})();
