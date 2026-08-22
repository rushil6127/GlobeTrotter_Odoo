# GlobeTrotter Frontend Audit & Status Report

**Author:** Pushp (Frontend Application Lead)  
**Branch:** `feature/frontend-audit-foundation`  
**Date:** August 22, 2026  

---

## Executive Summary

The GlobeTrotter frontend is built with **Next.js (App Router), TypeScript, and Tailwind CSS**. Pearl (Frontend Experience Lead) has established a design system (`components/ui`, `components/cards`, `components/timeline`, `components/budget`, `components/calendar`).

However, most Next.js App Router pages are currently **placeholders** using `EmptyState.tsx`, and the Dashboard relies on static mock data (`lib/mockTrips.ts`). There is currently **no active API client layer** connecting the Next.js frontend to the backend REST API (`http://localhost:5000/api`).

This document outlines the current status of every route, component inventory, API dependencies, missing features, and the recommended priority order for implementation.

---

## Route-by-Route Status Audit

| Route | Page File | Current Status | Existing Components Used | Mock Data Used | Required Backend Endpoints | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Functional Showcase | `Navbar`, `Sidebar`, `Button`, `Input`, `Card`, `Modal`, `Toast`, `Badges` | Static showcase props | None (Internal design system showcase) | Low |
| `/dashboard` | `app/dashboard/page.tsx` | Partial (Mock-driven) | `PageShell`, `TripCard`, `Button`, `Badge` | `mockTrips.ts` (`mockTrips`, `getUpcomingTrip`) | `GET /api/auth/me`<br>`GET /api/trips` | **P0 (Critical)** |
| `/trips` | `app/trips/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None (Placeholder text) | `GET /api/trips` | **P0 (Critical)** |
| `/trips/new` | `app/trips/new/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `POST /api/trips` | **P0 (Critical)** |
| `/trips/[id]` | `app/trips/[id]/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/trips/:id`<br>`GET /api/trips/:id/cities`<br>`POST /api/trips/:id/cities`<br>`DELETE /api/trips/:id/cities/:cityId`<br>`PUT /api/trips/:id/cities/reorder`<br>`DELETE /api/trips/:id` | **P0 (Critical)** |
| `/discover` | `app/discover/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/cities`<br>`GET /api/activities` | **P1 (High)** |
| `/discover/cities` | `app/discover/cities/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/cities`<br>`GET /api/cities/search?q=` | **P1 (High)** |
| `/discover/activities` | `app/discover/activities/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/activities`<br>`GET /api/activities/search?q=` | **P1 (High)** |
| `/trips/[id]/itinerary` | `app/trips/[id]/itinerary/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/trips/:id/itinerary`<br>`POST /api/trips/:id/itinerary`<br>`PUT /api/trips/:id/itinerary/reorder`<br>`DELETE /api/itinerary/:itemId` | **P1 (High)** |
| `/trips/[id]/budget` | `app/trips/[id]/budget/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/trips/:id/budget`<br>`POST /api/trips/:id/expenses`<br>`DELETE /api/expenses/:expenseId` | **P2 (Medium)** |
| `/calendar` | `app/calendar/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/trips` | **P2 (Medium)** |
| `/profile` | `app/profile/page.tsx` | Placeholder | `PageShell`, `EmptyState`, `Button` | None | `GET /api/users/me`<br>`PUT /api/users/me` | **P3 (Low)** |

---

## Detailed Route Analysis

### 1. Dashboard (`/dashboard`)
- **Current Status:** UI layout complete with banner, quick actions grid, and trip cards, but hardcoded to `mockTrips.ts` and username `"Pushp"`.
- **Missing Functionality:** Real API integration, loading skeletons during fetch, error boundaries, auth protection check (`requireAuth`).
- **Backend Endpoints Needed:**
  - `GET /api/auth/me`
  - `GET /api/trips`

### 2. My Trips & Trip Builder (`/trips`, `/trips/new`, `/trips/[id]`)
- **Current Status:** Pure `EmptyState` placeholders.
- **Existing Components Ready to Connect:**
  - `TripCard.tsx` in `components/cards/`
  - `CityCard.tsx` in `components/cards/`
  - `Modal.tsx`, `ConfirmModal.tsx` in `components/ui/`
  - `Input.tsx`, `Select.tsx`, `Textarea.tsx` in `components/ui/`
- **Missing Functionality:**
  - `/trips`: Fetching & rendering real trips grid, filtering by status (Upcoming, Ongoing, Completed).
  - `/trips/new`: Multi-step form/wizard to submit name, description, dates, budget, and currency.
  - `/trips/[id]`: Full trip header, stats counter, city search/add modal, city list reordering & deletion.
- **Backend Endpoints Needed:**
  - `GET /api/trips`, `POST /api/trips`, `GET /api/trips/:id`, `PUT /api/trips/:id`, `DELETE /api/trips/:id`
  - `GET /api/trips/:id/cities`, `POST /api/trips/:id/cities`, `DELETE /api/trips/:id/cities/:cityId`, `PUT /api/trips/:id/cities/reorder`

### 3. Discovery (`/discover`, `/discover/cities`, `/discover/activities`)
- **Current Status:** `EmptyState` placeholders.
- **Existing Components Ready to Connect:**
  - `CityCard.tsx` in `components/cards/`
  - `ActivityCard.tsx` in `components/cards/`
  - `TravelBadges.tsx` in `components/travel/`
- **Missing Functionality:** Search input with debouncing, city and activity list grids, category filters, "Add to Trip" action modal.
- **Backend Endpoints Needed:**
  - `GET /api/cities`, `GET /api/cities/search?q=`
  - `GET /api/activities`, `GET /api/activities/search?q=`

### 4. Itinerary & Timeline (`/trips/[id]/itinerary`)
- **Current Status:** Placeholder page.
- **Existing Components Ready to Connect:**
  - `Timeline.tsx` (`DayHeader`, `ActivityTimelineCard`, `CityTransition`, `AddActivityButton`)
- **Missing Functionality:** Connecting day timeline to `GET /api/trips/:id/itinerary`, add activity modal, delete activity item handler.

### 5. Budget & Expenses (`/trips/[id]/budget`)
- **Current Status:** Placeholder page.
- **Existing Components Ready to Connect:**
  - `Budget.tsx` (`ExpenseCategoryBadge`, `BudgetProgressBar`, `ExpenseRow`, `BudgetSummaryCard`, `CategoryBreakdown`)
  - `BudgetCard.tsx`
- **Missing Functionality:** Real budget summary calculations from `GET /api/trips/:id/budget`, adding new expense via `POST /api/trips/:id/expenses`.

---

## Architectural Principles to Preserve

1. **Design System Integrity:** Reuse Pearl's established UI primitives (`components/ui/`, `components/cards/`, `components/travel/`, `components/timeline/`, `components/budget/`). Do not write ad-hoc raw inputs or custom buttons.
2. **Standard API Envelope:** All backend API calls must handle the unified response shape:
   ```json
   { "success": true, "data": { ... }, "message": "..." }
   ```
   and error shape:
   ```json
   { "success": false, "data": null, "message": "...", "error": { "code": "..." } }
   ```
3. **Cookie-Based Authentication:** All `fetch()` calls must include `credentials: "include"` for HttpOnly cookie authentication against `http://localhost:5000/api`.

---

## Ordered Frontend Implementation Roadmap

### Phase 1: Core API Client & Auth Integration
1. Create `lib/api/client.ts` as a unified fetch wrapper supporting `credentials: 'include'` and envelope parsing.
2. Create `lib/api/auth.ts` and `context/AuthContext.tsx` to provide `user` state and `requireAuth` protection.

### Phase 2: Trips & Dashboard (P0)
1. Wire `/dashboard` to fetch real user info (`GET /api/auth/me`) and real trips (`GET /api/trips`).
2. Implement `/trips` list page using `TripCard`.
3. Implement `/trips/new` form using `Input`, `Select`, `Textarea` posting to `POST /api/trips`.
4. Implement `/trips/[id]` details page with city search (`CitySearch`), city list reordering (`PUT /api/trips/:id/cities/reorder`), and deletion modal (`ConfirmModal`).

### Phase 3: City & Activity Discovery (P1)
1. Implement `/discover/cities` with search bar (`GET /api/cities/search?q=`) and `CityCard` grid.
2. Implement `/discover/activities` with category filter badges and `ActivityCard` grid.

### Phase 4: Itinerary & Budget Features (P2)
1. Wire `/trips/[id]/itinerary` to `Timeline.tsx` and `GET/POST /api/trips/:id/itinerary`.
2. Wire `/trips/[id]/budget` to `Budget.tsx` and `GET/POST /api/trips/:id/expenses`.

### Phase 5: Calendar, Profile & Sharing (P3)
1. Wire `/calendar` using `Calendar.tsx`.
2. Wire `/profile` user settings form to `GET/PUT /api/users/me`.
