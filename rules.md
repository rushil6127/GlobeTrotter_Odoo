# GlobeTrotter — Development Rules

## 1. Source of truth
PRD.md, architecture.md, rules.md, phases.md, design.md and memory.md are project-level source of truth.

## 2. MVP first
Complete MVP → test → fix → then standout features.

## 3. No random features
Unplanned ideas go into a future list rather than being implemented immediately.

## 4. Backend/frontend contract
Agree on method, endpoint, request, response, auth and errors before implementation.
Frontend must not guess responses. Backend must not unexpectedly rename fields.

## 5. Naming
Use:
name, startDate, endDate, budget, estimatedCost, tripId, cityId, activityId, itineraryItemId.
Avoid inconsistent aliases.

## 6. REST
GET = retrieve
POST = create
PUT = update
DELETE = remove

## 7. Response format
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

## 8. Security
Never commit secrets. Use environment variables.
Frontend must never expose secret external API credentials.

## 9. Authentication and authorization
Protected resources require authentication.
Never trust a userId supplied by the frontend.
Backend determines identity and permissions.

## 10. External API
MVP city/activity data comes from our own database. External services are enhancements.

## 11. UI states
Every API-driven screen must handle loading, success, empty and error states.

## 12. Validation
Validate on frontend for UX and backend for security.
Trip startDate <= endDate.
City arrival < departure.
Itinerary dates must be inside trip dates.
Amounts must be non-negative.

## 13. Code quality
Prefer small functions, reusable components, meaningful names and no duplicated logic.

## 14. Frontend
Centralize API calls. Shared UI components belong in the shared component system.

## 15. Git
Use feature branches such as feature/auth, feature/trips, feature/itinerary, feature/budget, feature/ai-planner.
Use meaningful commits such as feat: add trip creation API.

## 16. AI coding agents
Before coding, read all six documents, identify current phase and implement only the requested scope.
Do not invent API contracts or database fields.
Do not expose secrets.
Run appropriate checks after implementation.

## 17. Architecture changes
Large changes require team approval:
- database technology
- authentication architecture
- framework
- API contracts
- core data model

## 18. No overengineering
Do not add microservices, Kubernetes, queues, complex caching or unnecessary services without a real need.

## 19. Demo stability
Before final demo, freeze architecture. Only fix bugs, polish, performance and critical validation issues.

## 20. Definition of done
Implemented + integrated + tested + error handled + responsive when frontend + documented when backend + no known critical bug + matches design.
