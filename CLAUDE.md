# DrupalWatch — Claude Project Rules

## Stack
- Next.js 15 (App Router)
- Payload CMS 3
- PostgreSQL as the database
- TypeScript (strict)
- Tailwind CSS

## Styling Rules
- Use **Tailwind CSS utility classes only** — no custom CSS files unless absolutely necessary
- No UI component libraries (no shadcn, no MUI, no Chakra)
- Keep it clean and minimal — this is a dev tool, not a marketing site
- Dark mode by default (`dark` class on `<html>`)
- Use Tailwind's default color palette (slate, zinc, emerald for accents)
- Mobile responsive but desktop-first

## Code Rules
- TypeScript everywhere — no `any` types
- Use `async/await` — no `.then()` chains
- API routes live in `/app/api/`
- Payload collections live in `/src/collections/`
- Keep components small and focused
- No unnecessary dependencies — if it can be done with native Node.js or Next.js built-ins, do that

## Environment Variables
- Never hardcode secrets
- Always read from `process.env`
- Keep `.env.example` up to date

## Naming Conventions
- Components: PascalCase
- Files: kebab-case
- Variables/functions: camelCase
- Types/interfaces: PascalCase prefixed with `T` or `I` (e.g. `TIssueUpdate`)

## Comments
- Add `// TODO:` comments where business logic needs to be filled in
- Keep comments short and meaningful