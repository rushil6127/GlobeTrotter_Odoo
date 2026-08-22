# Globe Trotter Frontend (current state)

This is currently a standalone vanilla HTML/CSS/JS build (cinematic
scroll parallax landing page + glassmorphic login), not the
Next.js/React/TypeScript/Tailwind stack specified in the root
architecture.md. This was built before that decision was enforced.
Team needs to decide: keep as a static shell, incrementally wrap into
Next.js, or treat as a prototype to be replaced. See PR description
for details.

## Running locally
npx serve -l 3000 frontend
(requires backend running separately with CLIENT_URL=http://localhost:3000)
