# GlobeTrotter — Product Requirements Document

## 1. Product Overview
GlobeTrotter is a modern travel planning web application that helps users create, organize, customize, budget, visualize, and share multi-city trips.

Core flow:
User → Create Trip → Add Multiple Cities → Discover Activities → Build Day-wise Itinerary → Track Budget → View Calendar/Timeline → Share Trip

## 2. Team
### Backend
- Heer — Backend Lead: authentication, users, database, authorization, trips, infrastructure, API documentation.
- Rushil — Backend Feature Lead: cities, activities, itinerary, budget, sharing, external integrations, AI and standout backend logic.

### Frontend
- Pushp — Frontend Lead: architecture, routing, auth UI, dashboard, trip management, itinerary, calendar, frontend integration.
- Pearl — Frontend Experience Lead: design system, discovery, activity UI, itinerary visuals, budget UI, sharing, responsive design and polish.

## 3. MVP Features
- Signup/login/logout/current user/protected routes
- Dashboard and trip CRUD
- Multi-city planning
- City search
- Activity discovery and filters
- Day-wise itinerary with add/edit/delete/reorder
- Budget, expenses, category totals and warnings
- Calendar/timeline
- Trip sharing
- Profile

## 4. Standout Features — only after MVP
Priority:
1. AI Trip Planner
2. Smart Budget Optimizer
3. Interactive Route Map
4. Collaborative Trip Planning
5. Activity Voting
6. Smart Packing List
7. Weather-aware itinerary
8. Surprise Me Trip Generator
9. Gamification
10. Travel compatibility score

## 5. AI Trip Planner
Inputs: destinations, days, travelers, budget, interests/travel style.
Outputs: suggested cities, activities, day-wise itinerary and estimated costs.
Architecture: Frontend → GlobeTrotter Backend → AI Provider → Backend → Frontend.
Never expose AI provider keys to frontend.

## 6. API Strategy
Primary architecture:
Frontend → GlobeTrotter REST API → PostgreSQL

External integrations are accessed through backend:
Backend → Maps API / AI API / Weather API / Currency API.

For MVP, cities and activities should be seeded into PostgreSQL so the demo does not depend on external travel APIs.

## 7. Internal REST API
Base: /api

Auth:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Users:
GET /api/users/me
PUT /api/users/me

Trips:
GET /api/trips
POST /api/trips
GET /api/trips/:tripId
PUT /api/trips/:tripId
DELETE /api/trips/:tripId

Cities:
GET /api/cities
GET /api/cities/:cityId
GET /api/cities/search?q=
POST /api/trips/:tripId/cities
DELETE /api/trips/:tripId/cities/:cityId
PUT /api/trips/:tripId/cities/reorder

Activities:
GET /api/activities
GET /api/activities/:activityId
GET /api/activities?cityId=
GET /api/activities?category=
GET /api/activities?maxCost=
GET /api/activities?duration=

Itinerary:
GET /api/trips/:tripId/itinerary
POST /api/trips/:tripId/itinerary
PUT /api/itinerary/:itemId
DELETE /api/itinerary/:itemId
PUT /api/trips/:tripId/itinerary/reorder

Budget:
GET /api/trips/:tripId/budget
POST /api/trips/:tripId/expenses
PUT /api/expenses/:expenseId
DELETE /api/expenses/:expenseId

Sharing:
POST /api/trips/:tripId/share
DELETE /api/trips/:tripId/share
GET /api/shared/:shareId

AI:
POST /api/ai/generate-itinerary

Weather:
GET /api/weather

## 8. API Contract
Every endpoint must document HTTP method, URL, auth requirement, request body, query params, response and errors.

Success:
{
  "success": true,
  "data": {},
  "message": "Success"
}

Error:
{
  "success": false,
  "data": null,
  "message": "Human readable message",
  "error": { "code": "ERROR_CODE" }
}

Keep field names consistent; use trip.name, not a mixture of title/tripName.

## 9. Success Criteria
A judge can:
Signup → Login → Create trip → Add cities → Add activities → Build itinerary → Set budget → Add expenses → View calendar → Share trip.

## 10. Non-goals
Not initially a flight booking platform, hotel booking platform, payment platform, complete navigation app, social network or travel agency.
