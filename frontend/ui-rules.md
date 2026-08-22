# GlobeTrotter UI Rules

These rules are mandatory.

1. Existing UI wins: Dashboard and Login are approved references.
2. Inspect before creating: search components, global styles, tokens, and similar pages.
3. No random styling: do not invent colors, fonts, gradients, shadows, radii, spacing, or animations.
4. No duplicate components: never create TripCard2/NewTripCard/etc. when TripCard exists.
5. Pages are compositions: use reusable components instead of huge page files.
6. Keep API logic out of visual components; use the project's data/API layer.
7. Remove mock data once real backend integration exists. Never silently mix fake and real data.
8. Every API feature needs loading, success, empty, and error handling.
9. Mobile is mandatory.
10. Do not overanimate.
11. Preserve clear visual hierarchy: location, importance, actions, status, next step.
12. Keep product terminology and interactions consistent.
13. Do not casually modify shared/global styles because they affect the whole app.
14. Frontend tasks must not silently change backend behavior. Report API issues to the backend team.
15. Never guess. Inspect the existing implementation.

FINAL UI TEST:
“Does this look like it belongs beside Dashboard and Login?”
If NO, do not merge.
