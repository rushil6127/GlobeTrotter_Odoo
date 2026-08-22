# GlobeTrotter Frontend Design System

## Purpose
This is the visual source of truth for GlobeTrotter. The existing Dashboard and Login pages are the approved visual references.

New pages/components MUST look like they belong to the same product. Do not invent a separate typography, theme, spacing, radius, shadow, button, input, icon, or animation language.

## Golden Rule
Before creating UI, inspect:
1. Dashboard
2. Login
3. Global CSS/theme
4. Existing components

Reuse existing tokens, classes, and components wherever possible.

## Typography
Use the exact font family, weights, heading hierarchy, body sizes, line heights, letter spacing, and text colors already established by Dashboard/Login. Do not introduce a new font or arbitrary text sizes.

## Colors
Reuse the existing GlobeTrotter palette. Do not invent arbitrary colors or random Tailwind colors. Preserve semantic meanings for primary, secondary, background, surface, card, border, text, success, warning, error, and information.

## Cards
Cards must follow the established Dashboard card language: same visual treatment, padding, border, radius, shadow, typography, and hover behavior. Do not create a new card style for each feature.

## Radius, Shadows, Spacing
Use the existing project's values. Do not randomly mix radii, shadows, or spacing values.

## Buttons
Use one consistent button language:
- Primary: main action
- Secondary: alternative action
- Tertiary/Ghost: low-priority action
- Danger: destructive action

Maintain existing typography, radius, padding, hover, active, disabled, and loading states.

## Inputs
Use one consistent form language for height, border, radius, typography, placeholder, focus, error, disabled state, labels, and helper text.

## Icons
Use the existing icon library. Do not introduce another icon library or mix incompatible icon styles.

## Animation
Use animation for feedback, transitions, loading, AI generation, itinerary interactions, and important state changes. Avoid distracting or unnecessary motion. Respect prefers-reduced-motion.

## Responsive Design
Every page must work on mobile, tablet, laptop, and desktop. Responsive behavior must be intentional.

## Accessibility
Use semantic HTML, keyboard accessibility, visible focus, accessible labels, sufficient contrast, and meaningful errors. Never rely on color alone.

## API States
Every API-driven page/component must handle loading, success, empty, and error states.

## Component Reuse
Before creating a component:
- Search the codebase.
- Reuse an equivalent component.
- Extend an almost-correct component.
- Create a new abstraction only when genuinely necessary.

## Consistency Test
A new page should look like another GlobeTrotter page, not another website.
