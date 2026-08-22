# GlobeTrotter — Frontend to Backend API Integration Map

> **Author:** Rushil (Full-Stack Integration Lead)  
> **Target Audience:** Pushp (Frontend Lead), Pearl (Frontend Experience Lead), Heer (Backend Lead), Rushil (Backend Feature Lead)  
> **Status:** Final Integration Specification (Phase 10)

This document provides the definitive integration contract mapping every frontend page, state, error, and component to its underlying backend REST API endpoints.

---

## ⚠️ Key Architectural & Schema Alignment Callouts (Discrepancy Analysis)

Before integrating, the frontend team should note the following differences between the initial UI mockups / `mockTrips.ts` and the live Backend API:

1. **Standard Response Envelope:**
   * **Backend:** Every endpoint returns `{ success: true, data: { ... }, message: "..." }` or error `{ success: false, data: null, message: "...", error: { code: "...", details: [...] } }`.
   * **Frontend Action:** The frontend API client (e.g. `lib/api.ts` or Axios/Fetch interceptor) must unwrap `res.data.data` and handle error codes via toast notifications.

2. **Dates & Currency Representation:**
   * **Mock:** Used simplified strings (e.g., `startDate: "Sep 10"`, `currency: "₹"`).
   * **Backend:** Stores full ISO-8601 strings (`2026-09-10T00:00:00.000Z`) and standard currency codes (`"INR"`, `"USD"`, `"EUR"`).
   * **Frontend Action:** Use `date-fns` or `Intl.DateTimeFormat` / `Intl.NumberFormat` to format dates and currency symbols for display.

3. **Multi-Destination Route vs Single Destination:**
   * **Mock:** Stored a single flat string `destination: "Goa, India"`.
   * **Backend:** Uses a relational `TripCity` junction table with ordered stops, arrival/departure dates, and city coordinates.
   * **Frontend Action:** On Trip cards, display destination as the primary city or comma-separated list of cities (e.g. `tripCities.map(tc => tc.city.name).join(' → ')`).

4. **Role-Based Capability Matrix:**
   * **OWNER:** Full access (delete trip, invite/remove members, update member roles, revoke share links, edit itinerary/budget).
   * **EDITOR:** Can modify cities, itinerary items, expenses, post comments, vote, suggest.
   * **VIEWER:** Read-only access to trip, itinerary, budget, comments, voting, and suggestions. Cannot delete/edit trip structure.
   * **Frontend Action:** Conditionally render action buttons and inputs based on `userRole` (`OWNER`, `EDITOR`, `VIEWER`).

---

## Feature Integration Catalog

---

### FEATURE: User Authentication (Register & Login)
* **PAGE:** `/register`, `/login`
* **BACKEND ENDPOINTS:**
  * `POST /api/auth/register` — Create new account
  * `POST /api/auth/login` — Sign in with credentials
  * `POST /api/auth/logout` — Invalidate session / clear cookie
  * `GET /api/auth/me` — Verify active session on app boot
* **AUTH REQUIRED:** No for Register/Login; Yes (`Bearer <token>` or HTTP-only cookie) for Logout/Me
* **REQUEST:**
  * **Register:** `{ email: string, password: string (min 8), name: string }`
  * **Login:** `{ email: string, password: string }`
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Doe", "avatar": null },
      "token": "jwt_token_string"
    },
    "message": "User registered successfully"
  }
  ```
* **FRONTEND STATE:** `AuthContext` / `useAuth` storing `currentUser: User | null`, `token: string | null`, `isAuthenticated: boolean`, `isLoading: boolean`.
* **ERROR STATES:**
  * `400 INVALID_CREDENTIALS` / `VALIDATION_ERROR` (Form inline validation errors).
  * `409 USER_ALREADY_EXISTS` ("Email is already registered").
  * `401 UNAUTHENTICATED` (Redirect to `/login`).
* **COMPONENTS:** `Input`, `Button`, `Toast`, `LoginForm`, `RegisterForm`.
* **INTEGRATION NOTES:** On successful login, store JWT in `localStorage` or cookie, update `AuthContext`, and redirect user to `/dashboard` or previous URL.

---

### FEATURE: User Profile & Account Settings
* **PAGE:** `/profile`
* **BACKEND ENDPOINTS:**
  * `GET /api/users/me` — Get user profile details & account statistics
  * `PUT /api/users/me` — Update name, avatar URL, or change password
* **AUTH REQUIRED:** Yes
* **REQUEST:**
  * **Update Profile:** `{ name?: string, avatar?: string, password?: string, currentPassword?: string }`
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Jane Doe",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2026-08-22T04:30:00.000Z"
    },
    "message": "User profile updated successfully"
  }
  ```
* **FRONTEND STATE:** `userProfile` state object, `isSaving: boolean`, `editMode: boolean`.
* **ERROR STATES:** `400 VALIDATION_ERROR` (Invalid avatar URL or short password), `401 UNAUTHENTICATED`.
* **COMPONENTS:** `Avatar`, `Input`, `Button`, `Badge`, `Toast`.
* **INTEGRATION NOTES:** After updating name or avatar, immediately update the global `AuthContext` so navbar and page header update without full reload.

---

### FEATURE: Travel Dashboard & Trip Overview
* **PAGE:** `/dashboard`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips` — Fetch all user's trips (owned + collaborated)
  * `GET /api/auth/me` — User identity & greeting
* **AUTH REQUIRED:** Yes
* **REQUEST:** None (Header: `Authorization: Bearer <token>`)
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "trip-uuid",
        "name": "Goa Beach & Heritage",
        "description": "5-day relaxing beach trip",
        "startDate": "2026-10-01T00:00:00.000Z",
        "endDate": "2026-10-05T00:00:00.000Z",
        "budget": 45000,
        "currency": "INR",
        "userId": "owner-uuid",
        "tripCities": [
          { "order": 0, "city": { "name": "Goa", "image": "https://img.jpg" } }
        ],
        "tripMembers": [
          { "role": "EDITOR", "user": { "name": "Pearl", "avatar": null } }
        ],
        "_count": { "itineraryItems": 8, "expenses": 3 }
      }
    ],
    "message": "Trips retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `trips: Trip[]`, `upcomingTrip: Trip | null`, `recentTrips: Trip[]`, `stats: { totalTrips, upcomingCount, totalBudget }`, `isLoading: boolean`.
* **ERROR STATES:** `500 INTERNAL_ERROR`, `401 UNAUTHENTICATED` (Redirect to `/login`).
* **COMPONENTS:** `PageShell`, `TripCard`, `Button`, `Badge`, `EmptyState`, `Loader`, `QuickActionCard`.
* **INTEGRATION NOTES:** Determine `upcomingTrip` on client by finding the earliest trip where `startDate >= now` or `now <= endDate`.

---

### FEATURE: Trip Listing & Search / Filter
* **PAGE:** `/trips`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips` — List all user trips
* **AUTH REQUIRED:** Yes
* **REQUEST:** Query (optional client-side filter: status = upcoming, ongoing, completed).
* **RESPONSE:** Array of Trip records with `tripCities`, `tripMembers`, and item counts.
* **FRONTEND STATE:** `trips: Trip[]`, `filterStatus: 'all' | 'upcoming' | 'ongoing' | 'completed'`, `searchQuery: string`.
* **ERROR STATES:** `401 UNAUTHENTICATED`, `EMPTY_STATE` (When user has 0 trips).
* **COMPONENTS:** `TripCard`, `Input` (search), `Badge` (filter chips), `Button` ("Plan a Trip" CTA), `EmptyState`.
* **INTEGRATION NOTES:** Calculate `status` dynamically based on `trip.startDate` and `trip.endDate` relative to `new Date()`.

---

### FEATURE: Create New Trip (Manual & AI Assisted)
* **PAGE:** `/trips/new`
* **BACKEND ENDPOINTS:**
  * `POST /api/trips` — Create core trip record
  * `POST /api/trips/:tripId/cities` — Attach initial destinations
  * `POST /api/ai/generate-itinerary` — Generate AI plan (if AI mode is chosen)
  * `POST /api/trips/:tripId/itinerary/from-ai` — Save AI itinerary to newly created trip
* **AUTH REQUIRED:** Yes
* **REQUEST:**
  ```json
  {
    "name": "Japan Cherry Blossom Explorer",
    "description": "7 days in Tokyo and Kyoto",
    "startDate": "2026-04-01",
    "endDate": "2026-04-07",
    "budget": 120000,
    "currency": "INR"
  }
  ```
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "id": "new-trip-uuid",
      "name": "Japan Cherry Blossom Explorer",
      "startDate": "2026-04-01T00:00:00.000Z",
      "endDate": "2026-04-07T00:00:00.000Z",
      "budget": 120000,
      "currency": "INR",
      "userId": "current-user-uuid"
    },
    "message": "Trip created successfully"
  }
  ```
* **FRONTEND STATE:** Form inputs (`name`, `description`, `dates`, `budget`, `currency`, `selectedCities`), `mode: 'manual' | 'ai'`, `isSubmitting: boolean`.
* **ERROR STATES:** `400 VALIDATION_ERROR` (e.g. `endDate` before `startDate`, empty `name`, negative `budget`).
* **COMPONENTS:** `Input`, `Select`, `Calendar` / DateRangePicker, `Button`, `Toast`, `Modal`.
* **INTEGRATION NOTES:** After trip creation, automatically transition user to `/trips/[id]` or `/trips/[id]/itinerary`.

---

### FEATURE: Trip Details & Destination Route (Trip Stops)
* **PAGE:** `/trips/[id]`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId` — Get comprehensive trip details, members, and counts
  * `GET /api/trips/:tripId/cities` — Get ordered city route
  * `POST /api/trips/:tripId/cities` — Add city destination stop
  * `DELETE /api/trips/:tripId/cities/:cityId` — Remove city stop
  * `PUT /api/trips/:tripId/cities/reorder` — Reorder destination stops
  * `PUT /api/trips/:tripId` — Edit trip name/dates/budget
  * `DELETE /api/trips/:tripId` — Delete trip (`OWNER` only)
* **AUTH REQUIRED:** Yes
* **REQUEST:**
  * **Add City:** `{ cityId: "uuid", arrivalDate?: "2026-10-01", departureDate?: "2026-10-03" }`
  * **Reorder Cities:** `{ cityIds: ["city-uuid-1", "city-uuid-2"] }`
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "trip": { ... },
      "cities": [
        { "id": "tc-uuid", "order": 0, "arrivalDate": "...", "city": { "name": "Goa", "country": "India", "image": "..." } }
      ]
    },
    "message": "Trip details retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `trip: TripDetails`, `cities: TripCity[]`, `userRole: 'OWNER' | 'EDITOR' | 'VIEWER'`, `activeTab: 'overview' | 'itinerary' | 'budget' | 'collaborators'`, `isReordering: boolean`.
* **ERROR STATES:** `404 TRIP_NOT_FOUND`, `403 FORBIDDEN` (Non-member access), `409 CITY_ALREADY_IN_TRIP`.
* **COMPONENTS:** `PageShell`, `Button`, `Badge`, `Avatar`, `Modal`, `CityCard`, `DragAndDropList`.
* **INTEGRATION NOTES:** Restrict delete trip button and member management modals strictly to `OWNER`.

---

### FEATURE: Day-wise Itinerary & Timeline Management
* **PAGE:** `/trips/[id]/itinerary`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId/itinerary` — Day-grouped schedule + flat timeline
  * `POST /api/trips/:tripId/itinerary` — Schedule activity / custom item
  * `PUT /api/itinerary/:itemId` — Update itinerary item
  * `DELETE /api/itinerary/:itemId` — Delete itinerary item
  * `PUT /api/trips/:tripId/itinerary/reorder` — Reorder schedule
* **AUTH REQUIRED:** Yes
* **REQUEST:**
  * **Add Item:**
    ```json
    {
      "title": "Mandovi River Sunset Cruise",
      "date": "2026-10-01",
      "startTime": "17:30",
      "endTime": "19:00",
      "estimatedCost": 600,
      "notes": "Arrive 15 mins before boarding",
      "activityId": "act-uuid-optional"
    }
    ```
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "tripId": "trip-uuid",
      "totalDays": 5,
      "totalItems": 6,
      "days": [
        {
          "dayNumber": 1,
          "date": "2026-10-01T00:00:00.000Z",
          "itemCount": 2,
          "totalCost": 1200,
          "items": [ ... ]
        }
      ],
      "timeline": [ ... ]
    },
    "message": "Itinerary retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `itineraryData: ItineraryResponse`, `selectedDay: number`, `editingItem: ItineraryItem | null`, `isAddModalOpen: boolean`.
* **ERROR STATES:**
  * `400 INVALID_ITINERARY_DATE` (Date falls outside `[startDate, endDate]`).
  * `400 INVALID_TIME_RANGE` (`endTime < startTime`).
  * `403 FORBIDDEN` (VIEWER trying to add/edit items).
* **COMPONENTS:** `Timeline`, `ActivityCard`, `Modal`, `Button`, `Input`, `Textarea`, `Select`, `EmptyState`, `Toast`.
* **INTEGRATION NOTES:** Automatically filter timeline items when user selects a specific Day tab (`Day 1`, `Day 2`, etc.).

---

### FEATURE: City & Activity Discovery (Explore Catalog)
* **PAGE:** `/discover`, `/discover/cities`, `/discover/activities`
* **BACKEND ENDPOINTS:**
  * `GET /api/cities` — Paginated cities (`?page=1&limit=12&country=&search=`)
  * `GET /api/cities/search?q=` — Quick city search
  * `GET /api/cities/:cityId` — City details + associated activities
  * `GET /api/activities` — Filtered activities (`?cityId=&category=&maxCost=&duration=&search=`)
  * `GET /api/activities/:activityId` — Activity details
* **AUTH REQUIRED:** No (Public discovery endpoints)
* **REQUEST:** Query params for filters & pagination.
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "activities": [
        {
          "id": "act-uuid",
          "name": "Eiffel Tower Summit Tour",
          "category": "Sightseeing",
          "duration": 150,
          "estimatedCost": 35,
          "image": "https://img.jpg",
          "city": { "name": "Paris", "country": "France" }
        }
      ],
      "pagination": { "page": 1, "limit": 12, "total": 46, "totalPages": 4 }
    },
    "message": "Activities retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `items: (City | Activity)[]`, `searchQuery: string`, `selectedCategory: string`, `selectedCity: string`, `page: number`, `isLoading: boolean`.
* **ERROR STATES:** `EMPTY_SEARCH_RESULTS`.
* **COMPONENTS:** `CityCard`, `ActivityCard`, `Input`, `Select`, `Badge`, `Button`, `EmptyState`.
* **INTEGRATION NOTES:** Include "Add to Trip" CTA on `ActivityCard` which opens modal allowing selection of user's active trip and target day.

---

### FEATURE: Budget Overview & Expense Tracking
* **PAGE:** `/trips/[id]/budget`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId/budget` — Aggregated budget breakdown & metrics
  * `POST /api/trips/:tripId/expenses` — Log expense
  * `PUT /api/expenses/:expenseId` — Update expense
  * `DELETE /api/expenses/:expenseId` — Remove expense
* **AUTH REQUIRED:** Yes
* **REQUEST:**
  * **Log Expense:** `{ category: "food" | "transport" | "activities" | "accommodation" | "shopping" | "other", amount: number, date?: string, description?: string }`
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "budget": 50000,
      "spent": 38500,
      "remaining": 11500,
      "percentageUsed": 77,
      "overBudget": false,
      "overBudgetAmount": 0,
      "averagePerDay": 7700,
      "dailyBudgetAllowance": 10000,
      "categories": { "food": 12000, "transport": 8000, "accommodation": 15000, "activities": 3500, "shopping": 0, "other": 0 },
      "expenses": [ ... ]
    },
    "message": "Trip budget retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `budgetData: BudgetOverview`, `isAddExpenseModalOpen: boolean`, `selectedExpense: Expense | null`.
* **ERROR STATES:** `400 VALIDATION_ERROR` (e.g. Negative expense amount or invalid category), `403 FORBIDDEN`.
* **COMPONENTS:** `Budget` (Charts, summary cards, category progress bars), `Modal`, `Input`, `Select`, `Button`, `Toast`.
* **INTEGRATION NOTES:** Highlight banner in Red if `overBudget: true` displaying `overBudgetAmount`.

---

### FEATURE: Smart Budget Optimizer (Standout Feature)
* **PAGE:** `/trips/[id]/budget` (Optimizer Panel/Drawer)
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId/budget/optimize` — Get AI/database optimization suggestions
* **AUTH REQUIRED:** Yes
* **REQUEST:** None
* **RESPONSE:**
  ```json
  {
    "success": true,
    "data": {
      "tripId": "trip-uuid",
      "budget": 40000,
      "currentSpent": 45500,
      "isOverBudget": true,
      "overBudgetAmount": 5500,
      "totalPotentialSavings": 8900,
      "projectedSpentWithOptimizations": 36600,
      "canResolveOverBudget": true,
      "suggestions": [
        {
          "itineraryItemId": "item-1",
          "currentActivity": "Luxury Yacht Tour",
          "currentCost": 7500,
          "category": "Sightseeing",
          "alternative": { "name": "Sunset River Cruise", "cost": 600, "duration": 90 },
          "potentialSavings": 6900
        }
      ],
      "freeAlternatives": [
        { "name": "Anjuna Beach Sunset Walk", "category": "Sightseeing", "cost": 0 }
      ]
    },
    "message": "Budget optimization suggestions retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `optimizationData: BudgetOptimizationResponse | null`, `isOptimizing: boolean`, `appliedSuggestions: string[]`.
* **ERROR STATES:** `500 BUDGET_OPTIMIZE_ERROR`.
* **COMPONENTS:** `Badge`, `Button`, `Modal`, `ActivityCard`, `Toast`.
* **INTEGRATION NOTES:** Allow user to click "Apply Suggestion" which calls `PUT /api/itinerary/:itemId` updating the title and cost to the cheaper alternative.

---

### FEATURE: AI Travel Planner (Standout Feature)
* **PAGE:** `/trips/new` (AI Planner Tab), `/trips/[id]/itinerary` (AI Assistant Modal)
* **BACKEND ENDPOINTS:**
  * `POST /api/ai/generate-itinerary` — Generate unsaved travel plan draft
  * `POST /api/trips/:tripId/itinerary/from-ai` — Save customized draft to trip
* **AUTH REQUIRED:** Optional for generation (`/api/ai/generate-itinerary`); Yes for saving to trip (`/api/trips/:tripId/itinerary/from-ai`)
* **REQUEST:**
  * **Generate:** `{ destination: "Goa", budget: 45000, days: 3, style: ["relaxing", "beaches", "food"], currency: "INR", travelers: 2 }`
  * **Save:** `{ items: Array<{ title, dayNumber, date?, startTime?, endTime?, estimatedCost?, notes?, activityId? }> }`
* **RESPONSE:**
  * **Generate:** Structured `destination`, `summary`, `budgetBreakdown`, `routeOrder`, `suggestedActivities`, and `days` schedule.
  * **Save:** Standard `ItineraryResponse` with created itinerary items.
* **FRONTEND STATE:** `step: 'input' | 'generating' | 'preview_and_edit' | 'saved'`, `aiDraft: GeneratedItinerary | null`, `isSaving: boolean`.
* **ERROR STATES:**
  * `504 AI_TIMEOUT` ("AI service is taking longer than expected. Please try again.").
  * `502 AI_GENERATION_ERROR`.
  * `400 INVALID_ITINERARY_DATE` (When saving draft outside trip dates).
* **COMPONENTS:** `Timeline`, `ActivityCard`, `Input`, `Select`, `Checkbox`, `Button`, `Loader`, `Badge`, `Modal`.
* **INTEGRATION NOTES:** Always follow the **Generate $\to$ Customize $\to$ Save** pattern. User can remove or modify draft items before clicking "Confirm & Add to Trip".

---

### FEATURE: Collaborative Trip Planning (Members, Voting, Comments, Suggestions)
* **PAGE:** `/trips/[id]`, `/trips/[id]/itinerary`, `/trips/[id]/collaboration`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId/members` — List collaborators and roles
  * `POST /api/trips/:tripId/members` — Invite collaborator by email (`OWNER` only)
  * `PUT /api/trips/:tripId/members/:memberId` — Update role (`OWNER` only)
  * `DELETE /api/trips/:tripId/members/:memberId` — Remove member (`OWNER` only)
  * `POST /api/trips/:tripId/activities/:activityId/vote` — Upvote/Downvote activity
  * `DELETE /api/trips/:tripId/activities/:activityId/vote` — Remove vote
  * `POST /api/trips/:tripId/comments` — Post comment on trip or itinerary item
  * `GET /api/trips/:tripId/comments` — Get comments (`?itineraryItemId=`)
  * `POST /api/trips/:tripId/activities/:activityId/suggest` — Suggest activity
* **AUTH REQUIRED:** Yes (Any trip collaborator: `OWNER`, `EDITOR`, `VIEWER`)
* **REQUEST:**
  * **Vote:** `{ voteType: "UPVOTE" | "DOWNVOTE" }`
  * **Comment:** `{ text: "Shall we book the morning slot?", itineraryItemId?: "uuid" }`
  * **Suggest:** `{ notes: "Recommended by locals", dayNumber?: 2 }`
* **RESPONSE:**
  * **Vote:** `{ vote: { ... }, stats: { upvotes: 3, downvotes: 0, score: 3, totalVotes: 3 } }`
  * **Comment:** `{ comment: { id: "...", text: "...", user: { name: "Pearl", avatar: "..." }, itineraryItem: { ... } } }`
* **FRONTEND STATE:** `members: TripMember[]`, `votesMap: Record<activityId, VoteStats>`, `comments: Comment[]`, `isInviting: boolean`.
* **ERROR STATES:** `403 FORBIDDEN` (Non-member or non-owner attempting member management), `409 MEMBER_ALREADY_EXISTS`.
* **COMPONENTS:** `Avatar`, `Badge`, `Button`, `Input`, `Textarea`, `Modal`, `Toast`.
* **INTEGRATION NOTES:** Show vote count pills directly on activity cards in discovery and suggestion lists.

---

### FEATURE: Trip Sharing & Public Read-Only View
* **PAGE:** `/trips/[id]` (Share Dialog), `/shared/[shareId]` (Public Shared Itinerary)
* **BACKEND ENDPOINTS:**
  * `GET /api/trips/:tripId/share` — Check share status & URL (`OWNER` / `EDITOR`)
  * `POST /api/trips/:tripId/share` — Generate/regenerate public share token
  * `DELETE /api/trips/:tripId/share` — Revoke share link
  * `GET /api/shared/:shareId` — **Public unauthenticated endpoint** to fetch sanitized trip
* **AUTH REQUIRED:**
  * Manage Share: Yes (`OWNER` / `EDITOR`)
  * View Public Shared Trip: **No authentication required**
* **REQUEST:**
  * **Create Share:** `{ regenerate?: boolean, expiresAt?: string }`
* **RESPONSE (Public Shared View):**
  ```json
  {
    "success": true,
    "data": {
      "trip": { "id": "uuid", "name": "Goa Adventure", "startDate": "...", "endDate": "...", "currency": "INR" },
      "organizer": { "name": "Jane Doe", "avatar": "https://img.jpg" },
      "cities": [ ... ],
      "itinerary": [ ... ]
    },
    "message": "Shared trip retrieved successfully"
  }
  ```
* **FRONTEND STATE:** `shareLink: string | null`, `isPublic: boolean`, `copySuccess: boolean`, `publicTrip: SharedTripData | null`.
* **ERROR STATES:**
  * `404 SHARE_LINK_NOT_FOUND` ("This share link does not exist or has been revoked").
  * `410 SHARE_LINK_EXPIRED` ("This shared trip link has expired").
* **COMPONENTS:** `Modal`, `Button`, `Input`, `Toast`, `Timeline`, `CityCard`, `EmptyState`.
* **INTEGRATION NOTES:** The `/shared/[shareId]` page must render without sidebar or authentication checks, showing a sanitized view with an "Export to PDF" or "Plan Your Own Trip" CTA.

---

### FEATURE: Interactive Calendar View
* **PAGE:** `/calendar`
* **BACKEND ENDPOINTS:**
  * `GET /api/trips` — Fetch all user's trips
  * `GET /api/trips/:tripId/itinerary` — Fetch scheduled items for active trip
* **AUTH REQUIRED:** Yes
* **REQUEST:** None
* **RESPONSE:** Standard Trip and Itinerary response structures.
* **FRONTEND STATE:** `selectedMonth: Date`, `calendarEvents: Array<{ date: string, title: string, tripName: string, tripId: string, time: string }>`, `activeTripId: string | 'all'`.
* **ERROR STATES:** `401 UNAUTHENTICATED`.
* **COMPONENTS:** `Calendar`, `Badge`, `Button`, `Modal`.
* **INTEGRATION NOTES:** Map each `ItineraryItem` onto the calendar cell by matching `item.date`. Clicking an event navigates to `/trips/[id]/itinerary`.

---

## Next Steps for Frontend Implementation

1. **Create `frontend/src/lib/api.ts` (or `frontend/lib/api.ts`):**
   * Configure Axios or Fetch base client pointing to `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'`.
   * Add interceptor to automatically attach `Bearer ${token}` from storage or cookie.
   * Add response unwrapper returning `res.data.data` and capturing standard error codes.

2. **Phase Implementation Order:**
   * Step 1: `AuthContext` + `/login` + `/register` + `/dashboard`
   * Step 2: `/trips`, `/trips/new`, `/trips/[id]`
   * Step 3: `/trips/[id]/itinerary`, `/discover`
   * Step 4: `/trips/[id]/budget` + Smart Optimizer
   * Step 5: AI Travel Planner Modal
   * Step 6: Trip Collaboration + `/shared/[shareId]`
