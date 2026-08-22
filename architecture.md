# GlobeTrotter — System Architecture

## 1. Architecture
Frontend → REST API → Backend → PostgreSQL
Backend → External APIs when required

## 2. Recommended Stack
Frontend:
- Next.js / React
- TypeScript
- Tailwind CSS
- Reusable component system
- Fetch or Axios
- React Hook Form
- Zod if desired

Backend:
- Node.js
- TypeScript
- Express

Database:
- PostgreSQL
- Prisma ORM

API documentation:
- OpenAPI / Swagger

## 3. Repository
GlobeTrotter/
├── frontend/
├── backend/
├── docs/
├── PRD.md
├── architecture.md
├── rules.md
├── phases.md
├── design.md
├── memory.md
└── README.md

Backend:
backend/src/controllers
backend/src/routes
backend/src/services
backend/src/middleware
backend/src/validators
backend/src/utils
backend/src/config
backend/prisma/schema.prisma

Frontend:
frontend/app
frontend/components
frontend/features
frontend/lib
frontend/hooks
frontend/types
frontend/styles

## 4. Backend layering
Route → Controller → Service → Database.
Do not put all business logic into routes.

## 5. Core entities
User, Trip, City, TripCity, Activity, ItineraryItem, Expense, TripMember, ShareLink, Vote.

## 6. Relationships
User 1→N Trips
Trip 1→N TripCities
City 1→N TripCities
City 1→N Activities
Trip 1→N ItineraryItems
Activity 1→N ItineraryItems
Trip 1→N Expenses
Trip 1→N TripMembers
Trip 1→N ShareLinks

## 7. Core API examples
Trip creation:
POST /api/trips
{
  "name": "Goa Adventure",
  "description": "Beach trip",
  "startDate": "2026-09-01",
  "endDate": "2026-09-05",
  "budget": 50000,
  "currency": "INR"
}

Budget response:
{
  "budget": 50000,
  "spent": 25000,
  "remaining": 25000,
  "averagePerDay": 5000,
  "categories": {
    "transport": 5000,
    "food": 7000,
    "activities": 10000,
    "accommodation": 3000
  },
  "overBudget": false
}

AI:
POST /api/ai/generate-itinerary
{
  "destination": "Goa",
  "days": 5,
  "travelers": 2,
  "budget": 50000,
  "interests": ["beaches", "food", "adventure"]
}

## 8. External API abstraction
Create:
MapService
AIService
WeatherService
CurrencyService

The rest of the app should not depend directly on a provider.

## 9. Seed data
Seed 15–30 cities and 5–10 activities per major city.
Core MVP must work without external travel APIs.

## 10. Security
Use .env and .env.example.
Never commit API keys, DB passwords, JWT secrets or provider credentials.

Example:
DATABASE_URL=
JWT_SECRET=
AI_API_KEY=
MAPS_API_KEY=
WEATHER_API_KEY=

## 11. Authorization
Owner: full access
Editor: modify itinerary/trip content
Viewer: read-only

Backend must enforce authorization.

## 12. Frontend API client
Centralize API functions:
api/auth.ts
api/trips.ts
api/cities.ts
api/activities.ts
api/itinerary.ts
api/budget.ts
api/sharing.ts

Do not scatter fetch calls across components.

## 13. Error statuses
200 success
201 creation
400 invalid request
401 unauthenticated
403 unauthorized
404 not found
409 conflict
500 server error

## 14. Principle
Prefer simple, understandable, maintainable and demo-safe architecture over unnecessary complexity.
