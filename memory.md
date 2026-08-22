# GlobeTrotter — Project Memory

AI coding agents must read this before significant changes.

## Project
GlobeTrotter — travel planning web application.
Goal: plan, organize, budget, visualize and share multi-city trips.
Positioning: "Your intelligent collaborative travel co-pilot."

## Team
Heer — backend lead: auth, users, DB, authorization, trips, infrastructure, API docs.
Rushil — backend feature lead: cities, activities, itinerary, budget, sharing, external integrations, AI.
Pushp — frontend lead: architecture, routing, auth UI, dashboard, trips, itinerary, calendar, integration.
Pearl — frontend experience lead: design system, discovery, activity UI, itinerary visuals, budget, sharing, responsive design and polish.

## Priority
MVP first:
1 auth
2 dashboard
3 trip CRUD
4 multi-city
5 city discovery
6 activity discovery
7 itinerary
8 budget
9 calendar/timeline
10 sharing
11 profile

Then:
AI planner → budget optimizer → route map → collaboration → voting → packing → weather → surprise me → gamification.

## Stack
Frontend: Next.js/React, TypeScript, Tailwind CSS.
Backend: Node.js, TypeScript, Express.
Database: PostgreSQL.
ORM: Prisma.
API: REST.
Docs: OpenAPI/Swagger.

## Architecture
Frontend → GlobeTrotter REST API → PostgreSQL.
Backend → external services only when needed.
Never expose provider secrets to frontend.

## MVP data
Cities and activities are local PostgreSQL seed data.
Do not make MVP dependent on external travel APIs.

## Core entities
User, Trip, City, TripCity, Activity, ItineraryItem, Expense, TripMember, ShareLink, Vote.

## Core endpoints
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
GET/PUT /api/users/me
GET/POST/GET-by-id/PUT/DELETE /api/trips
GET /api/cities
GET /api/cities/:cityId
GET /api/cities/search?q=
POST/DELETE/PUT-reorder /api/trips/:tripId/cities...
GET /api/activities
GET /api/activities/:activityId
GET/POST/PUT/DELETE /api/trips/:tripId/itinerary...
GET/POST/PUT/DELETE /api/trips/:tripId/expenses...
POST/DELETE /api/trips/:tripId/share
GET /api/shared/:shareId
POST /api/ai/generate-itinerary
GET /api/weather

## Response convention
Success:
{
  "success": true,
  "data": {},
  "message": "..."
}

Error:
{
  "success": false,
  "data": null,
  "message": "...",
  "error": {"code": "..."}
}

## Naming
Use name, startDate, endDate, budget, estimatedCost, tripId, cityId, activityId, itineraryItemId consistently.

## Security
Never commit .env, API keys, DB credentials, JWT secrets, AI/map/weather keys.
Use .env.example.
Backend enforces authorization.

Roles:
OWNER, EDITOR, VIEWER.

## Design
Modern, premium, travel-focused, clean, friendly and visual.
Reusable components are mandatory.

## Development
Do not overengineer.
Do not introduce microservices, Kubernetes, unnecessary queues/caching/services without approval.

## AI agent workflow
1 Read all six docs.
2 Identify current phase.
3 Identify requested task.
4 Check dependencies.
5 Implement only requested scope.
6 Run checks.
7 Verify contracts/security/design.
8 Summarize changes and remaining issues.

## Do not assume
Do not invent important business logic when requirements are unclear.
Minor implementation details should use the simplest consistent solution and be documented.

## Current state
CURRENT_PHASE: Phase 0 — Planning
CURRENT_SPRINT: Not started

## Known decisions
REST, PostgreSQL, seeded MVP city/activity data, external APIs secondary, AI is not an MVP dependency, frontend talks to backend.

## Known risks
External API failure → local seed data.
AI delay → finish MVP without AI.
Frontend/backend mismatch → API contracts + Swagger.
Feature creep → phases.md.
Late architecture changes → freeze before demo.

## Demo goal
Discover → Plan → Organize → Budget → Visualize → Share.
If ready: Generate intelligently → Optimize intelligently.

## Final priority
Correctness → Simplicity → MVP completion → Consistency → Security → UX → Performance → Standout features.
