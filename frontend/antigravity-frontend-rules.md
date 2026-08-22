# ANTIGRAVITY FRONTEND RULES — GLOBETROTTER

## READ THIS BEFORE MODIFYING FRONTEND CODE

This is an EXISTING frontend, not a greenfield project.

Dashboard and Login already establish the approved GlobeTrotter visual identity.

Your job is to EXTEND the existing product, not create a new visual identity for each page.

## Mandatory Pre-Coding Process
Before any frontend task:
1. Read design-system.md
2. Read ui-rules.md
3. Read component-rules.md
4. Read page-guidelines.md
5. Inspect Dashboard
6. Inspect Login
7. Inspect global styles/theme
8. Search existing components
9. Search similar implementations
10. Only then code

## Visual Reference
Dashboard + Login = APPROVED REFERENCE.

If unsure about font, color, spacing, radius, shadow, button, input, card, icon, or animation: inspect the approved pages first. Do not guess.

## NEVER
- Introduce another font
- Introduce another UI framework
- Introduce another icon library
- Invent a new color palette
- Create random gradients
- Create random card styles
- Create duplicate components
- Redesign existing pages without permission
- Delete working components
- Replace working implementation unnecessarily
- Invent API contracts
- Keep fake data when real API data is available

## ALWAYS
- Reuse components
- Reuse design tokens
- Reuse typography
- Reuse spacing
- Reuse interaction patterns
- Support responsive layouts
- Support loading, empty, and error states
- Maintain accessibility
- Run lint/build/type checks

## Adding a Page
Before implementation identify:
1. Page purpose
2. Primary user action
3. Reusable components
4. API dependencies
5. Loading state
6. Empty state
7. Error state
8. Mobile layout
9. Desktop layout

## Adding a Component
Ask:
“Does an equivalent component already exist?”
YES → reuse it.
ALMOST → extend it.
NO → create it.

## Unclear Design
Do not guess. Inspect Dashboard, Login, global CSS, and components. If still unclear, stop and report the design decision requiring confirmation.

## Unclear API
Do not guess. Inspect API client, backend route, Swagger, validator, and controller. If still unclear, stop and report it.

## Quality Gate
A task is complete only when:
- Functionality works
- Existing design language is preserved
- Existing components are reused
- No duplicate components exist
- Real API is integrated
- Loading/empty/error states exist
- Responsive behavior works
- Accessibility is acceptable
- No TypeScript errors
- No lint errors
- Build succeeds

## Final Question
“Would a user believe this page was designed by the same team that designed Dashboard and Login?”

If not, revise the UI before finishing.
