# GlobeTrotter — Design System

## 1. Goal
Modern, premium, travel-focused, clean, friendly, intuitive and visually engaging.
Avoid generic CRUD/admin-dashboard appearance.

## 2. Philosophy
"Plan visually, understand instantly."
Users should quickly understand destination, dates, itinerary and spending.

## 3. Visual hierarchy
1. Destination
2. Date
3. Itinerary
4. Budget
5. Actions

## 4. Layout
Desktop: sidebar/navbar + main content.
Mobile: top navigation + single-column content.

## 5. Shared components
Button, Input, Textarea, Select, DatePicker, Modal, Card, Badge, Tabs, Dropdown, Toast, Avatar, Navbar, Sidebar, TripCard, CityCard, ActivityCard, BudgetCard, TimelineItem, Calendar, Chart, EmptyState, LoadingSkeleton, ErrorState.

## 6. Trip Card
Show image, trip name, destinations, dates, number of cities, budget and View Trip action.

## 7. City Card
Show image, city, country, dates, activities and estimated cost.

## 8. Activity Card
Show image, name, category, duration, estimated cost, description and Add to Trip.

## 9. Itinerary
Use Day 1/2/3 tabs and clear time hierarchy.
Example:
09:00 Breakfast
11:00 Fort Visit
14:00 Lunch
17:00 Beach

## 10. Budget
Show Total Budget, Spent and Remaining, then category breakdowns.

## 11. Calendar
Reuse activity card language from itinerary and trip details.

## 12. Sharing
Public trip page should be polished and shareable but must not expose private data.

## 13. AI Planner
Simple form:
Destination, Days, Travelers, Budget, Interests.
CTA: Generate My Trip.
Show progress state, then cities, itinerary, budget and activities.
Allow Save to Trip.

## 14. Budget Optimizer
Use a recommendation panel:
Budget Alert
You are over budget.
Show suggested changes and savings.
[Apply Suggestions]

## 15. Map
Show route, markers, city names and trip order. Do not make it a full navigation product.

## 16. Responsive
Must work on desktop, tablet and mobile.
No horizontal overflow, broken cards, unreadable tables or broken buttons.

## 17. Accessibility
Use semantic HTML, focus states, labels, sufficient contrast and keyboard navigation where practical.

## 18. Forms
Use label + input + validation/error. Do not rely only on placeholders.

## 19. Feedback
Every important action gets success/error feedback. Destructive actions require confirmation.

## 20. Loading and empty states
Prefer skeletons for major content.
Empty states explain the next action.
Example: "No trips yet. Start planning your next adventure. [Create Trip]"

## 21. Consistency
Pushp and Pearl must share spacing, typography, radius, shadows, buttons, inputs and cards. Never create two versions of the same component.

## 22. Final visual principle
Make users feel: "I want to plan a trip here."
