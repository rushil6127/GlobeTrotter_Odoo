# GlobeTrotter Component Architecture Rules

## Layers
UI primitives
↓
Reusable feature components
↓
Feature sections
↓
Pages

## UI Primitives
Examples: Button, Input, Select, Textarea, Dialog, Dropdown, Badge, Avatar, Tooltip, Tabs, Skeleton, Toast.

## Feature Components
Examples: TripCard, ActivityCard, CityCard, ExpenseCard, BudgetSummary, ItineraryItem, MemberList, CommentCard, VoteButton, AISuggestionCard.

## Feature Sections
Examples: DashboardTripSection, UpcomingTrips, BudgetOverview, ItineraryTimeline, CollaborationPanel, AIPlannerPanel.

## Pages
Pages should compose sections and components. Avoid giant page files containing reusable UI.

## Before Creating a Component
- Search existing components.
- Search similar components.
- Read design-system.md.
- Read ui-rules.md.
- Decide generic vs domain-specific.
- Identify API dependency.
- Define loading/empty/error states.
- Define responsive behavior.
- Consider accessibility.

## Props
Props should be minimal, meaningful, typed, and reusable.

## Styling
Use the existing styling system. Do not introduce a new styling framework or page-specific global CSS.

## Reuse Principle
If a component appears twice, ask whether it should be reusable.
If the same pattern appears three times, it SHOULD be reusable.
