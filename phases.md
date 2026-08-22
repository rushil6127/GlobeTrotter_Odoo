# GlobeTrotter — Development Phases

## Strategy
Phase 0 Planning
Phase 1 Foundation
Phase 2 Authentication + Dashboard
Phase 3 Trip Management
Phase 4 City + Activity Discovery
Phase 5 Itinerary
Phase 6 Budget
Phase 7 Calendar
Phase 8 Sharing + Profile
Phase 9 MVP Integration
Phase 10 Testing
Phase 11 Standout Features
Phase 12 Final Polish

Do not enter Phase 11 until MVP is complete.

## Phase 0 — Planning
Heer + Rushil:
- confirm stack
- database schema
- API contracts
- Swagger/OpenAPI
Pushp + Pearl:
- design system
- reusable components
- responsive rules
Everyone:
- read project docs
- configure Git

## Phase 1 — Foundation
Heer:
backend, PostgreSQL, Prisma, env, auth foundation, schema, migrations, Swagger.
Rushil:
API/service structure, validation, seed data, City and Activity models.
Pushp:
Next.js/React, routing, Tailwind, API client, auth state, shared components.
Pearl:
design system, buttons, inputs, cards, modals, loading, empty/error states.

## Phase 2 — Auth + Dashboard
Backend:
register, login, logout, current user, auth middleware, profile.
Frontend:
login, signup, protected routes, dashboard.
Checkpoint: user can signup, login and reach dashboard.

## Phase 3 — Trip Management
Backend:
GET/POST/GET-by-id/PUT/DELETE trips.
Frontend:
My Trips, Create, Details, Edit, Delete.
Checkpoint: full trip CRUD.

## Phase 4 — City + Activity Discovery
Backend:
city search/details/add/remove/reorder; activity search/filter.
Frontend:
destination search, cards, filters, add-to-trip.
Checkpoint: multiple cities and activities can be added.

## Phase 5 — Itinerary
Backend:
create/update/delete/reorder with date/time validation.
Frontend:
day tabs, timeline, activity details, edit/delete/reorder.
Checkpoint: complete day-wise itinerary.

## Phase 6 — Budget
Backend:
budget, expenses, calculations, category totals, over-budget.
Frontend:
budget dashboard, expense form, breakdown, progress, warning.
Checkpoint: accurate budget.

## Phase 7 — Calendar
Backend:
date-based itinerary query.
Frontend:
monthly calendar, day view, timeline.
Checkpoint: itinerary correctly appears by date.

## Phase 8 — Sharing + Profile
Backend:
profile, update profile, share link, revoke, public trip.
Frontend:
profile, share modal, copy link, public page.
Checkpoint: safe shareable trip.

## Phase 9 — MVP Integration
End-to-end:
Signup → Login → Dashboard → Create Trip → Add City → Add Activities → Itinerary → Budget → Calendar → Share.
Fix integration bugs. No new features.

## Phase 10 — Testing
Test auth, permissions, CRUD, discovery, itinerary, budget, calendar, sharing and responsive design.
Edge cases:
empty trip, invalid dates, zero budget, over-budget, deleted activity, unauthorized trip, invalid share link, mobile, slow API, failed API.

## Phase 11 — Standout
Priority:
1. AI Trip Planner — Rushil backend; Pushp + Pearl frontend
2. Smart Budget Optimizer — Rushil backend; Pearl frontend
3. Route Map — Rushil backend; Pushp frontend
4. Collaboration — Heer + Rushil; Pushp + Pearl
5. Voting
6. Packing List
7. Weather
8. Surprise Me

## Phase 12 — Final Polish
Everyone:
- critical bugs
- responsive testing
- loading/empty/error states
- console errors
- environment/deployment verification
- demo data/account
- presentation flow
Freeze architecture.

## Time-based rule
Very limited: MVP only.
Limited: MVP + AI.
Good: MVP + AI + budget optimizer + map.
Excellent: MVP + major standout features.
