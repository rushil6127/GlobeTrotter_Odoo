# GlobeTrotter — Data Model & Seed Data Proposal (Phase 2)

**Author:** Rushil (Backend Feature Lead)  
**Reviewer:** Heer (Backend Lead)  
**Target:** Parallel preparation during Phase 2 (Authentication & Foundation)  
**Status:** Proposal / Draft (No live migrations until Phase 3 Trip foundation merges)

---

## 1. Context & Repository Status

### 1.1 Current Phase & Boundary
- **Current Phase:** Phase 2 — Authentication + Dashboard.
- **Ownership Division:**
  - **Heer (Backend Lead):** Auth, Users, Security, Base PostgreSQL + Prisma setup, Trip model (Phase 3).
  - **Rushil (Backend Feature Lead):** City, Activity, TripCity, ItineraryItem, Expense, ShareLink models, Seed Data architecture, and subsequent feature controllers/services.
- **Rule Compliance:** No modifications to `User`, `Auth`, or `Trip` entities; no Prisma migration executions until Heer merges the base database schema and Trip model.

### 1.2 Prisma Schema Status Inspection
- **Current State:** Base repository initialized with project documentation (`PRD.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`, `memory.md`). Prisma schema file (`backend/prisma/schema.prisma`) is slated to be initialized by Heer in the foundation setup.
- **Purpose of this Document:** Provide the finalized Prisma schema definitions and seed data specification for all feature entities so Heer can seamlessly incorporate or cross-reference them during Phase 1/2 foundation and Phase 3 Trip rollout.

---

## 2. Proposed Prisma Schema (Feature Models)

Below is the draft Prisma schema DSL representing `City`, `Activity`, `TripCity`, `ItineraryItem`, `Expense`, and `ShareLink`. Future references to Heer's `User` and `Trip` models are explicitly annotated.

```prisma
// ==========================================
// GLOBETROTTER FEATURE MODELS SCHEMA PROPOSAL
// ==========================================

// Enums for Feature Models
enum ActivityCategory {
  SIGHTSEEING
  ADVENTURE
  CULTURE
  FOOD
  NATURE
  RELAXATION
  NIGHTLIFE
  SHOPPING
  ENTERTAINMENT
  OTHER
}

enum ItineraryItemStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum ExpenseCategory {
  ACCOMMODATION
  TRANSPORT
  FOOD
  ACTIVITIES
  SHOPPING
  MISCELLANEOUS
}

enum SharePermission {
  VIEW
  EDIT
}

// ------------------------------------------
// 1. City Model (Curated Global & Regional Destinations)
// ------------------------------------------
model City {
  id                 String     @id @default(cuid())
  name               String     // e.g. "Paris", "Goa", "Tokyo"
  country            String     // e.g. "France", "India", "Japan"
  state              String?    // Optional state / province (e.g. "Maharashtra")
  description        String     @db.Text
  imageUrl           String     // High-res hero image URL
  latitude           Float      // For interactive route map & geospatial features
  longitude          Float      // For interactive route map & geospatial features
  currency           String     @default("USD") // Primary local currency code (e.g. "EUR", "INR")
  timezone           String     @default("UTC") // IANA Timezone (e.g. "Europe/Paris")
  averageDailyBudget Float?     // Estimated daily cost for baseline calculations
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt

  // Relationships
  activities         Activity[]
  tripCities         TripCity[]

  @@index([name])
  @@index([country])
  @@map("cities")
}

// ------------------------------------------
// 2. Activity Model (Curated Destination Activities)
// ------------------------------------------
model Activity {
  id             String           @id @default(cuid())
  cityId         String
  name           String           // e.g. "Louvre Museum Guided Tour"
  description    String           @db.Text
  imageUrl       String           // Activity image URL
  category       ActivityCategory @default(SIGHTSEEING)
  estimatedCost  Float            @default(0.0) // Cost in city local currency
  duration       Int              @default(120) // Duration in minutes (e.g., 120 = 2 hours)
  rating         Float?           @default(4.5) // Display rating (1.0 - 5.0)
  reviewsCount   Int?             @default(0)   // Total reviews count for social proof
  latitude       Float?           // Specific venue coordinate
  longitude      Float?           // Specific venue coordinate
  address        String?          // Physical address / landmark
  openingHours   String?          // e.g. "09:00 - 18:00"
  bookingUrl     String?          // Optional external link
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  // Relationships
  city           City             @relation(fields: [cityId], references: [id], onDelete: Cascade)
  itineraryItems ItineraryItem[]

  @@index([cityId])
  @@index([category])
  @@map("activities")
}

// ------------------------------------------
// 3. TripCity Model (Multi-city routing & order join table)
// ------------------------------------------
model TripCity {
  id             String          @id @default(cuid())
  tripId         String          // Reference to Heer's Trip model
  cityId         String          // Reference to City model
  order          Int             // Stop index: 1 for first city, 2 for second, etc.
  arrivalDate    DateTime?       // City arrival date/time
  departureDate  DateTime?       // City departure date/time
  notes          String?         @db.Text
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  // Relationships
  city           City            @relation(fields: [cityId], references: [id], onDelete: Cascade)
  itineraryItems ItineraryItem[]

  // [FUTURE RELATION]: Connected to Heer's Trip model
  // trip        Trip            @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@unique([tripId, cityId])
  @@index([tripId, order])
  @@map("trip_cities")
}

// ------------------------------------------
// 4. ItineraryItem Model (Day-wise scheduled items)
// ------------------------------------------
model ItineraryItem {
  id             String              @id @default(cuid())
  tripId         String              // Reference to Heer's Trip model
  tripCityId     String?             // Optional link to specific city stop
  activityId     String?             // Optional link to predefined Activity (null if custom user item)
  dayNumber      Int                 // Day number in trip (Day 1, Day 2, etc.)
  date           DateTime            // Explicit calendar date
  startTime      String?             // e.g. "09:30" (24-hour format string for simple UI handling)
  endTime        String?             // e.g. "11:30"
  title          String              // e.g. "Breakfast at Cafe" or "Eiffel Tower Visit"
  description    String?             @db.Text
  location       String?             // Custom address or venue name
  estimatedCost  Float               @default(0.0)
  actualCost     Float?              // Actual expense logged
  status         ItineraryItemStatus @default(PLANNED)
  order          Int                 @default(0) // Order sequence within the specific day
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  // Relationships
  activity       Activity?           @relation(fields: [activityId], references: [id], onDelete: SetNull)
  tripCity       TripCity?           @relation(fields: [tripCityId], references: [id], onDelete: SetNull)
  expenses       Expense[]

  // [FUTURE RELATION]: Connected to Heer's Trip model
  // trip        Trip                @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId, date])
  @@index([tripId, dayNumber])
  @@map("itinerary_items")
}

// ------------------------------------------
// 5. Expense Model (Trip budget tracking & breakdowns)
// ------------------------------------------
model Expense {
  id                   String          @id @default(cuid())
  tripId               String          // Reference to Heer's Trip model
  itineraryItemId      String?         // Optional link if logged directly from an itinerary item
  title                String          // e.g. "Hotel Le Meurice", "Metro Day Pass"
  amount               Float           // Transaction amount (non-negative)
  category             ExpenseCategory @default(MISCELLANEOUS)
  currency             String          @default("USD") // Currency of transaction
  exchangeRate         Float           @default(1.0)   // Rate to convert to trip base currency
  amountInBaseCurrency Float?          // Precalculated amount in Trip's main currency
  date                 DateTime        @default(now()) // Date expense occurred
  paidBy               String?         // Reference or label for payer
  receiptUrl           String?         // Image URL of receipt
  notes                String?         @db.Text
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt

  // Relationships
  itineraryItem        ItineraryItem?  @relation(fields: [itineraryItemId], references: [id], onDelete: SetNull)

  // [FUTURE RELATION]: Connected to Heer's Trip model
  // trip              Trip            @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId, category])
  @@index([tripId, date])
  @@map("expenses")
}

// ------------------------------------------
// 6. ShareLink Model (Public / Collaborative access tokens)
// ------------------------------------------
model ShareLink {
  id             String          @id @default(cuid())
  tripId         String          // Reference to Heer's Trip model
  shareCode      String          @unique // Cryptographically secure token (e.g. nanoid)
  permission     SharePermission @default(VIEW)
  isActive       Boolean         @default(true)
  expiresAt      DateTime?       // Optional TTL
  viewCount      Int             @default(0)
  createdBy      String?         // User ID of the creator
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  // [FUTURE RELATION]: Connected to Heer's Trip model
  // trip        Trip            @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([shareCode])
  @@index([tripId])
  @@map("share_links")
}
```

---

## 3. Model-by-Model Analysis

### 3.1 Model: `City`
- **Purpose:** Central catalog of curated destinations for search, card display, route mapping, and weather lookups.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique identifier.
  - `name` (`String`): City name (e.g., "Paris").
  - `country` (`String`): Country name (e.g., "France").
  - `state` (`String?`): Optional regional subdivision (e.g., "Goa", "California").
  - `description` (`String` @db.Text): Summary overview for discovery.
  - `imageUrl` (`String`): High quality landscape photo URL.
  - `latitude` / `longitude` (`Float`): Coordinates for route mapping (Standout feature 3).
  - `currency` (`String`): Default currency code (e.g., "EUR", "INR").
  - `timezone` (`String`): IANA timezone string for itinerary local time calculations.
  - `averageDailyBudget` (`Float?`): Benchmark daily budget to assist the AI/budget advisor.
- **Relationships:**
  - `activities`: `Activity[]` (1:N)
  - `tripCities`: `TripCity[]` (1:N)

### 3.2 Model: `Activity`
- **Purpose:** Curated catalog of things to do within each city, filterable by category, duration, and cost.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique identifier.
  - `cityId` (`String`): Foreign key to `City`.
  - `name` (`String`): Activity title (e.g., "Eiffel Tower Summit Tour").
  - `description` (`String` @db.Text): Details, tips, and highlights.
  - `imageUrl` (`String`): Activity thumbnail/card image.
  - `category` (`ActivityCategory` enum): `SIGHTSEEING`, `ADVENTURE`, `CULTURE`, `FOOD`, `NATURE`, `RELAXATION`, `NIGHTLIFE`, `SHOPPING`, `ENTERTAINMENT`, `OTHER`.
  - `estimatedCost` (`Float`): Cost in city's local currency.
  - `duration` (`Int`): Estimated duration in minutes.
  - `rating` (`Float?`): Rating between 1.0 and 5.0.
  - `reviewsCount` (`Int?`): Number of reviews.
  - `latitude` / `longitude` (`Float?`): Pinpoint coordinate for detailed map visualization.
  - `address` (`String?`): Street address or landmark instructions.
  - `openingHours` (`String?`): Hours of operation.
  - `bookingUrl` (`String?`): Optional ticket or official booking link.
- **Relationships:**
  - `city`: `City` (N:1, `onDelete: Cascade`)
  - `itineraryItems`: `ItineraryItem[]` (1:N)

### 3.3 Model: `TripCity`
- **Purpose:** Join table linking a `Trip` to multiple `City` records, retaining stop order and city-specific arrival/departure dates.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique record ID.
  - `tripId` (`String`): Foreign key referencing Heer's future `Trip` model.
  - `cityId` (`String`): Foreign key referencing `City`.
  - `order` (`Int`): Sequence index of the city stop (1, 2, 3...).
  - `arrivalDate` / `departureDate` (`DateTime?`): Sub-dates within the overall trip window.
  - `notes` (`String?`): User notes for this particular leg.
- **Relationships & Constraints:**
  - `city`: `City` (N:1, `onDelete: Cascade`)
  - `itineraryItems`: `ItineraryItem[]` (1:N)
  - `trip`: Reference to future `Trip` model (`onDelete: Cascade`).
  - Unique index on `[tripId, cityId]` ensures a city is not duplicated under the same trip unless re-routed.

### 3.4 Model: `ItineraryItem`
- **Purpose:** Represents a scheduled item on a specific day/time in the trip timeline.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique identifier.
  - `tripId` (`String`): Foreign key to future `Trip`.
  - `tripCityId` (`String?`): Optional foreign key to `TripCity`.
  - `activityId` (`String?`): Foreign key to `Activity` (nullable for custom user activities like "Dinner with family").
  - `dayNumber` (`Int`): Day 1, Day 2, etc.
  - `date` (`DateTime`): Explicit calendar date.
  - `startTime` / `endTime` (`String?`): 24h format strings (e.g. `"09:00"`, `"11:30"`).
  - `title` (`String`): Display name.
  - `description` (`String?`): Notes or instructions.
  - `location` (`String?`): Custom place/location name.
  - `estimatedCost` (`Float`): Projected expense.
  - `actualCost` (`Float?`): Actual recorded cost.
  - `status` (`ItineraryItemStatus` enum): `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`.
  - `order` (`Int`): Sequence ordering within the day.
- **Relationships:**
  - `activity`: `Activity?` (N:1, `onDelete: SetNull`)
  - `tripCity`: `TripCity?` (N:1, `onDelete: SetNull`)
  - `expenses`: `Expense[]` (1:N)
  - `trip`: Reference to future `Trip` model (`onDelete: Cascade`).

### 3.5 Model: `Expense`
- **Purpose:** Records granular spending items against a trip for real-time budget calculations, category breakdowns, and over-budget warnings.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique identifier.
  - `tripId` (`String`): Foreign key to future `Trip`.
  - `itineraryItemId` (`String?`): Optional link if logged from an itinerary activity.
  - `title` (`String`): Expense name (e.g., "Train ticket Paris to Lyon").
  - `amount` (`Float`): Expense amount.
  - `category` (`ExpenseCategory` enum): `ACCOMMODATION`, `TRANSPORT`, `FOOD`, `ACTIVITIES`, `SHOPPING`, `MISCELLANEOUS`.
  - `currency` (`String`): Currency code for this specific expense.
  - `exchangeRate` (`Float` @default(1.0)): Conversion factor to Trip base currency.
  - `amountInBaseCurrency` (`Float?`): Cached value in Trip's main currency.
  - `date` (`DateTime`): Transaction date.
  - `paidBy` (`String?`): Name or user ID of payer.
  - `receiptUrl` (`String?`): Image upload link.
  - `notes` (`String?`): Additional details.
- **Relationships:**
  - `itineraryItem`: `ItineraryItem?` (N:1, `onDelete: SetNull`)
  - `trip`: Reference to future `Trip` model (`onDelete: Cascade`).

### 3.6 Model: `ShareLink`
- **Purpose:** Cryptographically generated access links enabling public read-only or collaborative shared access to a trip without exposing private user data.
- **Fields:**
  - `id` (`String` @id @default(cuid())): Unique identifier.
  - `tripId` (`String`): Foreign key to future `Trip`.
  - `shareCode` (`String` @unique): Secure random token (e.g., 10-12 character nanoid).
  - `permission` (`SharePermission` enum): `VIEW` (default) or `EDIT`.
  - `isActive` (`Boolean` @default(true)): Instant revocation switch.
  - `expiresAt` (`DateTime?`): Optional time-to-live.
  - `viewCount` (`Int` @default(0)): Analytics counter for trip views.
  - `createdBy` (`String?`): User ID who generated the link.
- **Relationships:**
  - `trip`: Reference to future `Trip` model (`onDelete: Cascade`).

---

## 4. Seed Data Plan

### 4.1 Objective & Policy
- **Requirement:** 15–30 cities and 5–10 activities per major city.
- **Zero External API Dependency:** MVP demo relies completely on seeded local PostgreSQL records.
- **Data Source:** Curated static TypeScript dataset (`backend/src/config/seedData.ts`) to be executed via `prisma/seed.ts`.

### 4.2 Target Volume
| Entity | Target Count | Coverage |
| :--- | :--- | :--- |
| **Cities** | 20 Cities | Top Global & Indian destinations across Europe, Asia, Americas, Middle East |
| **Activities** | 140 Activities (avg 7/city) | Distributed across all 9 categories with realistic pricing, duration, and coordinates |

### 4.3 Proposed Seed Cities Catalog (20 Destinations)
1. **Paris (France)** — Europe / Iconic / Culture & Dining
2. **Rome (Italy)** — Europe / History & Sightseeing
3. **Barcelona (Spain)** — Europe / Architecture & Beach
4. **London (United Kingdom)** — Europe / Museums & Royalty
5. **Amsterdam (Netherlands)** — Europe / Canals & Cycling
6. **Tokyo (Japan)** — Asia / Futuristic & Culinary
7. **Kyoto (Japan)** — Asia / Traditional & Temples
8. **Bangkok (Thailand)** — Asia / Street Food & Nightlife
9. **Bali / Denpasar (Indonesia)** — Asia / Tropical & Wellness
10. **Singapore (Singapore)** — Asia / Modern Garden City
11. **Dubai (United Arab Emirates)** — Middle East / Luxury & Desert Adventure
12. **New York City (United States)** — Americas / Skylines & Shows
13. **San Francisco (United States)** — Americas / Coastal & Tech
14. **Rio de Janeiro (Brazil)** — Americas / Beaches & Carnivals
15. **Sydney (Australia)** — Oceania / Harbour & Coast
16. **Goa (India)** — India / Beaches, Water Sports & Portuguese heritage
17. **Jaipur (India)** — India / Royal Palaces, Forts & Handicrafts
18. **Manali (India)** — India / Himalayas, Trekking & Snow Sports
19. **Varanasi (India)** — India / Spiritual Ghats & Heritage
20. **Kerala / Kochi (India)** — India / Backwaters, Ayurvedic Spas & Nature

### 4.4 Sample Seed Data Structure (Preview)

```typescript
export const SEED_CITIES = [
  {
    id: "city-paris",
    name: "Paris",
    country: "France",
    state: "Île-de-France",
    description: "The City of Light captivates with its iconic monuments, world-class art collections, charming bistros, and romantic Seine riverbanks.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    latitude: 48.8566,
    longitude: 2.3522,
    currency: "EUR",
    timezone: "Europe/Paris",
    averageDailyBudget: 150.0,
    activities: [
      {
        id: "act-paris-1",
        name: "Eiffel Tower Summit Experience",
        description: "Ascend to the top of Paris's landmark monument for breathtaking panoramic vistas of the capital.",
        imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
        category: "SIGHTSEEING",
        estimatedCost: 35.0,
        duration: 150,
        rating: 4.8,
        reviewsCount: 3240,
        latitude: 48.8584,
        longitude: 2.2945,
        address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris",
        openingHours: "09:00 - 23:45"
      },
      {
        id: "act-paris-2",
        name: "Louvre Masterpieces Guided Tour",
        description: "Explore the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian.",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        category: "CULTURE",
        estimatedCost: 65.0,
        duration: 180,
        rating: 4.9,
        reviewsCount: 2100,
        latitude: 48.8606,
        longitude: 2.3376,
        address: "Rue de Rivoli, 75001 Paris",
        openingHours: "09:00 - 18:00 (Closed Tuesdays)"
      },
      {
        id: "act-paris-3",
        name: "Seine River Dinner Cruise",
        description: "Enjoy a 3-course gourmet French meal while gliding past illuminated monuments along the river Seine.",
        imageUrl: "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?auto=format&fit=crop&w=800&q=80",
        category: "FOOD",
        estimatedCost: 95.0,
        duration: 120,
        rating: 4.7,
        reviewsCount: 1450,
        latitude: 48.8590,
        longitude: 2.2930,
        address: "Port de la Bourdonnais, 75007 Paris",
        openingHours: "19:30 - 22:30"
      }
    ]
  },
  {
    id: "city-goa",
    name: "Goa",
    country: "India",
    state: "Goa",
    description: "Sun-kissed coastline, historic Portuguese architecture, vibrant beach shacks, and exhilarating water sports.",
    imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    latitude: 15.2993,
    longitude: 74.1240,
    currency: "INR",
    timezone: "Asia/Kolkata",
    averageDailyBudget: 3500.0,
    activities: [
      {
        id: "act-goa-1",
        name: "Scuba Diving & Water Sports at Grand Island",
        description: "Boat ride, dolphin spotting, underwater scuba dive with instructor, jet ski, and parasailing.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        category: "ADVENTURE",
        estimatedCost: 2500.0,
        duration: 360,
        rating: 4.7,
        reviewsCount: 1820,
        latitude: 15.3522,
        longitude: 73.7667,
        address: "Grand Island, Vasco da Gama",
        openingHours: "07:00 - 15:00"
      },
      {
        id: "act-goa-2",
        name: "Old Goa Heritage Walk & Basilica of Bom Jesus",
        description: "Explore UNESCO World Heritage churches, Se Cathedral, and Latin Quarter Fontainhas.",
        imageUrl: "https://images.unsplash.com/photo-1587975899981-d13c7bb61c6b?auto=format&fit=crop&w=800&q=80",
        category: "CULTURE",
        estimatedCost: 500.0,
        duration: 150,
        rating: 4.8,
        reviewsCount: 950,
        latitude: 15.5009,
        longitude: 73.9116,
        address: "Old Goa, Panaji 403402",
        openingHours: "09:00 - 17:30"
      }
    ]
  }
];
```

### 4.5 Seeding Script Mechanism (`backend/prisma/seed.ts`)
- Uses `prisma.city.upsert` and `prisma.activity.upsert` with deterministic IDs so seed runs can be re-executed idempotently.
- No network requests during seeding.

---

## 5. Decision Matrix & Change Proposals for Heer

The following items highlight decisions and conventions to finalize with Heer during Phase 1/2:

| # | Topic | Proposed Approach | Alternative Option | Heer Confirmation Needed? |
| :--- | :--- | :--- | :--- | :--- |
| **CP-1** | **Primary Key Strategy** | `String @id @default(cuid())` for all entities | `UUIDv4` or Auto-increment `Int` | **Yes** — Confirm if User and Trip models use CUID or UUID. |
| **CP-2** | **Trip Model Foreign Keys** | `tripId String` on `TripCity`, `ItineraryItem`, `Expense`, and `ShareLink` | Same | **Yes** — Confirm exact naming on `Trip` (e.g. `Trip.id: String`). |
| **CP-3** | **Time Representation** | `startTime` / `endTime` as `"HH:mm"` string (e.g. `"14:00"`) | Dedicated `DateTime` or time object | **Yes** — String format is easiest for frontend Day-view tabs; confirm backend validation preference. |
| **CP-4** | **Currency Conversion** | Keep `amount`, `currency`, `exchangeRate`, `amountInBaseCurrency` on `Expense` | Normalize all amounts to Trip base currency on insertion | **Yes** — Confirm if multi-currency support is desired in MVP or if single currency suffices. |
| **CP-5** | **ShareLink Scope** | Token-based model (`shareCode`) with `permission: VIEW \| EDIT` | Full user-to-trip membership table only | **Yes** — Confirm if ShareLink is standalone or linked to `TripMember`. |

---

## 6. Next Steps for Rushil (Backend Feature Lead)
1. Commit and push this proposal to `feature/backend-seed-data`.
2. Prepare the static dataset in `backend/src/config/seedData.ts` once repository folder structure is established.
3. Coordinate with Heer on [CHANGE PROPOSAL] items CP-1 through CP-5.
4. Prepare City & Activity controller/service logic in parallel for Phase 4.
