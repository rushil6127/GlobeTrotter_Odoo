# GlobeTrotter Frontend Design Status & Experience Audit

> **Role:** Pearl (Frontend Experience Lead)  
> **Date:** August 2026  
> **Branch:** `feature/frontend-design-audit`  
> **Reference Standards:** `design-system.md`, `ui-rules.md`, `component-rules.md`, `page-guidelines.md`, `antigravity-frontend-rules.md`

---

## 1. Executive Summary & Audit Verdict

GlobeTrotter possesses an approved visual identity established on the **Landing Page (`/`)** and **Dashboard (`/dashboard`)**. The design tokens in `globals.css` (Pastel Teal `#68bbb6`, Warm Sand `#b59d84`, Pastel Peach `#ee987f`, Plus Jakarta Sans, and Playfair Display) create a distinctive, premium travel aesthetic with glassmorphism and warm tones.

### Key Finding
**The UI components are already 80% built and styled to high fidelity, but most individual pages (`/trips`, `/trips/[id]`, `/trips/[id]/itinerary`, `/trips/[id]/budget`, `/discover`) are currently stubs rendering `EmptyState` placeholder text.**  
Our goal is **not** to redesign or rewrite components from scratch, but to:
1. Compose the existing rich components (`Timeline`, `Budget`, `TripCard`, `ActivityCard`, `CityCard`, `Calendar`) into their respective page routes.
2. Replace hardcoded mock assumptions with dynamic props supporting the live backend API contract.
3. Add robust loading skeletons, error recovery states, and mobile responsive polish.

---

## 2. Visual Language Audit vs `design-system.md`

| Design Element | Current Status | Alignment with Design System | Action Required |
| :--- | :--- | :--- | :--- |
| **Color Palette** | Defined in `@theme` in `globals.css` | 95% aligned. Uses curated pastel teal, warm sand, and peach. | Standardize semantic usage across `Budget.tsx` and `Timeline.tsx` to eliminate arbitrary hardcoded Tailwind colors (`text-orange-600`, `text-violet-600`). |
| **Typography** | Sans: `Plus Jakarta Sans`, Display: `Playfair Display` | 100% aligned. Clear heading and body hierarchy. | Ensure `.font-display` serif font is used consistently for all page `h1` and section `h2` titles. |
| **Glassmorphism & Surfaces** | `bg-white/80 backdrop-blur-xl`, `border-neutral-100` | 95% aligned. Cards feel light and modern. | Maintain consistent border opacity (`border-neutral-200/60`) and subtle shadows across all subpages. |
| **Radii & Spacing** | `rounded-2xl` for cards, `rounded-xl` for buttons/inputs | 100% aligned. | Preserve 16px/24px padding rhythms on cards and modals. |
| **Buttons & Inputs** | `components/ui/Button.tsx`, `Input.tsx`, `Badge.tsx` | 100% aligned. Complete variant matrix (`primary`, `outline`, `ghost`, `danger`). | Use standard button sizes (`sm`, `md`, `lg`) and avoid custom inline button styles. |

---

## 3. Existing Component Audit

### 3.1 UI Primitives (`components/ui/`)
* **`Button.tsx`**: Complete. Supports loading spinner, left/right icons, disabled state, and 5 variants.
* **`Input.tsx` / `Textarea.tsx`**: Complete. Supports label, helper text, error text, and left/right icon slots.
* **`Badge.tsx`**: Complete. Supports dot indicators and 9 theme variants (`primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`, `outline`).
* **`Avatar.tsx` / `AvatarGroup.tsx`**: Complete. Handles image fallbacks, initials generation, and overlap rings.
* **`Modal.tsx`**: Complete. Accessible backdrop, smooth scale transition, size options (`sm`, `md`, `lg`, `xl`, `full`).
* **`EmptyState.tsx`**: Complete. Has preset icon illustrations for trips, itinerary, budget, and search.
* **`Toast.tsx`, `Checkbox.tsx`, `Radio.tsx`, `Select.tsx`, `Toggle.tsx`, `Loader.tsx`**: All complete and ready for integration.

### 3.2 Domain & Feature Cards (`components/cards/`)
* **`TripCard.tsx`**:
  * *Status:* Fully styled with hover zoom, status badge, progress bar, avatar group, cities/activities count.
  * *Gaps:* Hardcoded currency default `₹`; lacks collaborator role pill (`OWNER` / `VIEWER`) and multi-city route text.
* **`ActivityCard.tsx`**:
  * *Status:* Fully styled with photo, category tag, duration, cost, rating, and time slot badge.
  * *Gaps:* Needs "Add to Trip" CTA action button and voting tally pill (`▲ 3`).
* **`CityCard.tsx`**:
  * *Status:* Fully styled with hero image, country badge, activity count pill, and tag chips.
  * *Gaps:* Needs click-through navigation to `/discover/cities/[id]`.
* **`BudgetCard.tsx`**:
  * *Status:* Fully styled with progress bar, spent vs total, and category indicators.
  * *Gaps:* Needs red over-budget state and dynamic currency formatting.

### 3.3 Domain Sections
* **`Timeline.tsx` (`components/timeline/`)**:
  * *Status:* Rich day headers, vertical timeline markers, time chips, activity cards, and drag handles.
  * *Gaps:* Currently isolated; must be wired into `/trips/[id]/itinerary` with Day tabs, comment counts, and delete/edit item triggers.
* **`Budget.tsx` (`components/budget/`)**:
  * *Status:* Full breakdown cards, category progress bars, daily average calculations, and expense table rows.
  * *Gaps:* Currently isolated; must be wired into `/trips/[id]/budget` with "Log Expense" modal and "Smart Budget Optimizer" drawer.
* **`Calendar.tsx` (`components/calendar/`)**:
  * *Status:* Month grid view, day cell badges, event pills, and responsive layout.
  * *Gaps:* Must be mounted in `/calendar` and populated from user trips and itinerary dates.
* **`TravelBadges.tsx` (`components/travel/`)**:
  * *Status:* Complete category, transport, and difficulty tags.

---

## 4. Page-by-Page Status & Visual Hierarchy Audit

| Route | Current Status | Visual Hierarchy Gap | Required Polish per `page-guidelines.md` |
| :--- | :--- | :--- | :--- |
| **`/` (Landing)** | Complete | None (Approved visual baseline) | Connect dynamic navigation links. |
| **`/dashboard`** | Complete | Minor | Connect dynamic user trips from API; replace mock statistics with real backend metrics. |
| **`/trips`** | Placeholder `EmptyState` | Major | Mount page header with "Plan a Trip" primary CTA, filter tabs (`All`, `Upcoming`, `Ongoing`, `Completed`), search bar, and responsive grid of `TripCard` components. |
| **`/trips/new`** | Incomplete | Major | Multi-step form with date range picker, destination selection, budget input, and toggle between Manual planning and AI Travel Planner. |
| **`/trips/[id]`** | Placeholder `EmptyState` | Major | Hero banner with cover image, trip title, destination route breadcrumb, quick stat pills (Days, Budget, Members), and tabbed navigation (`Overview`, `Itinerary`, `Budget`, `Collaborators`, `Settings`). |
| **`/trips/[id]/itinerary`**| Placeholder `EmptyState` | Major | Day selector tabs (`Day 1`, `Day 2`, `All Days`), interactive `Timeline.tsx`, "Add Item" button, and "AI Suggestions" modal trigger. |
| **`/trips/[id]/budget`** | Placeholder `EmptyState` | Major | Mount `Budget.tsx`, display red alert banner if over budget, "Smart Budget Optimizer" side drawer, and "Log Expense" modal. |
| **`/discover`** | Placeholder `EmptyState` | Major | Search bar with filter chips (category, duration, max cost), tabs for `Cities` and `Activities`, and "Add to Trip" modals. |
| **`/calendar`** | Placeholder `EmptyState` | Major | Mount `Calendar.tsx` with trip filter dropdown and scheduled activity popovers. |
| **`/profile`** | Minimal stub | Moderate | User avatar upload card, name/email settings, travel preferences tags, and logout CTA. |
| **`/shared/[shareId]`** | Missing | Critical | Dedicated public view without sidebar, showing sanitized itinerary, organizer badge, and "Copy Link" / "Plan Your Own" CTAs. |

---

## 5. Missing States Audit

1. **Loading & Skeleton States:**
   * Currently, components lack skeleton placeholders. When fetching from backend APIs, users would see jarring layout shifts.
   * **Required:**
     * `TripCardSkeleton` for Dashboard and Trips grid.
     * `TimelineSkeleton` for day-wise itinerary.
     * `BudgetSkeleton` for budget overview cards.
     * `CityCardSkeleton` / `ActivityCardSkeleton` for discovery feeds.

2. **Empty States:**
   * `EmptyState.tsx` exists and is well-designed. Needs to be hooked into lists when `items.length === 0` (e.g. "No expenses logged yet", "No activities scheduled for this day").

3. **Error Recovery States:**
   * Missing global error card with a "Try Again" / "Reload" button when network or API requests fail.

---

## 6. Responsive & Mobile Gaps

1. **Navigation:**
   * Desktop uses `Sidebar.tsx` (fixed left navigation).
   * Mobile hides sidebar, but needs a sticky bottom navigation bar or smooth slide-out hamburger drawer in `Navbar.tsx` for one-thumb mobile navigation (`Dashboard`, `Trips`, `Discover`, `Calendar`, `Profile`).

2. **Wide Data Tables & Horizontal Cards:**
   * The expense table in `Budget.tsx` and the Day tabs in `Timeline.tsx` require horizontal scroll containers (`overflow-x-auto scrollbar-none`) with edge fade masks on mobile screens $< 640\text{px}$.

3. **Modals & Drawers:**
   * On mobile screens, modals should render as bottom sheets (`rounded-t-2xl bottom-0`) rather than centered boxes for better ergonomics.

---

## 7. Mock Data Assumptions in UI

The following mock-data assumptions in existing components need replacement during integration:
1. **Single Flat Destination String:** `TripCard` expects `destination: string`. It must compute `destination` from `trip.tripCities` (e.g. `"Goa → Mumbai"`).
2. **Currency Hardcoding:** Currency symbols must be dynamically rendered from `trip.currency` (`INR` $\to$ `₹`, `USD` $\to$ `$`, `EUR` $\to$ `€`).
3. **Hardcoded User `"Pushp"`:** `Navbar`, `Sidebar`, and `PageShell` must pull `user.name` and `user.avatar` dynamically from `AuthContext`.
4. **Member Avatars:** `TripCard` expects `{ name: string }[]`. Backend returns `TripMember` records with `role` and `user: { name, avatar }`.

---

## 8. Actionable Implementation Plans

### 8.1 Component Reuse Plan
* **Do NOT rebuild:** `Button`, `Input`, `Badge`, `Avatar`, `Modal`, `EmptyState`, `TripCard`, `ActivityCard`, `CityCard`, `Timeline`, `Budget`, `Calendar`.
* **Extend existing components:**
  * Add `role` badge support to `TripCard`.
  * Add `voting` buttons and `comments` counter to `Timeline` items.
  * Add dynamic currency formatting utility (`formatCurrency(amount, currency)`).
* **Create 3 new high-value composite components:**
  1. `AIPlannerModal.tsx`: Multi-step AI travel planner drawer/modal.
  2. `CollaboratorsModal.tsx`: Team member invitation and role management modal.
  3. `SkeletonLoaders.tsx`: Unified skeleton placeholders for cards, timelines, and budget widgets.

### 8.2 Page Polish & Assembly Plan
* **Step 1: Trips Hub (`/trips`)**: Compose `PageShell` + Search Header + Status Filter Chips + Grid of `TripCard` + `EmptyState`.
* **Step 2: Trip Detail Workspace (`/trips/[id]`)**: Hero Header + Breadcrumb Route + Tab Navigation (`Overview`, `Itinerary`, `Budget`, `Collaborators`).
* **Step 3: Itinerary View (`/trips/[id]/itinerary`)**: Day Selector Tabs + `Timeline` component + "Add Activity" Modal + "AI Assistant" trigger.
* **Step 4: Budget & Optimizer (`/trips/[id]/budget`)**: Budget Health Banner + `Budget` component + "Smart Budget Optimizer" Drawer + "Log Expense" Modal.
* **Step 5: Discovery Catalog (`/discover`)**: Search Bar + Category Pills + Grid of `CityCard` / `ActivityCard` + "Add to Trip" Modal.
* **Step 6: Public Shared View (`/shared/[shareId]`)**: Clean standalone layout showcasing trip highlights, itinerary timeline, and organizer badge without private data.

### 8.3 Animation & Micro-Interaction Plan
* **Hover Micro-Interactions:** Subtle card lift (`hover:-translate-y-1 shadow-md`) with 200ms ease.
* **Tab Transitions:** Smooth slide indicator or cross-fade on Day tab switching.
* **AI Generation Pulse:** Smooth pulse and progress steps when AI is synthesizing itineraries.
* **Budget Health Pulse:** Subtle warning glow if trip transitions into over-budget status.
* **Accessible Motion:** Honor `@media (prefers-reduced-motion: reduce)`.

---

## 9. Final Visual Consistency Checklist

- [x] All colors originate from `globals.css` theme tokens (Teal, Sand, Peach, Warm Neutrals).
- [x] All typography uses `Plus Jakarta Sans` for UI and `Playfair Display` for display titles.
- [x] Standard button hierarchy enforced across all pages (Primary, Secondary, Outline, Ghost, Danger).
- [x] Glassmorphic cards use uniform border `border-neutral-200/60` and `backdrop-blur-xl`.
- [x] All pages follow the standard structure: `Navigation → Page Header → Primary Content → Actions`.
- [x] Loading skeleton states prepared for all data-driven components.
- [x] Empty state messages and illustrations defined for 0-data scenarios.
- [x] Error states include user-friendly messages with retry CTAs.
- [x] Mobile bottom bar and responsive table scroll containers verified.
- [x] Public shared trip view is clean, branded, and strictly sanitized.
