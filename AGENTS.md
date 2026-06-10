<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version may contain breaking changes in APIs, conventions, and
file structure.

Always consult the relevant documentation in
`node_modules/next/dist/docs/`
before generating code.

Pay attention to deprecations and unstable APIs.

---

# Skill Routing

Use skills intentionally. Do not load every skill at once.
Choose the minimum set of relevant skills for the task.

## Authentication

Available skills:

- `auth/better-auth-best-practices`
- `auth/create-auth-skill`
- `auth/email-and-password-best-practices`
- `auth/organization-best-practices`
- `auth/two-factor-authentication-best-practices`

Use when:

- implementing authentication
- login/signup flows
- sessions
- permissions
- RBAC
- password reset
- email/password auth
- MFA / 2FA
- auth architecture

---

## CMS

Available skills:

- `cms/payload`
- `cms/audit-dependencies`
- `cms/generate-translations`

Use when:

- working with Payload CMS
- collections
- globals
- hooks
- access control
- uploads/media
- admin UI customization
- localization
- content workflows
- dependency auditing for CMS integrations

---

## Database

Available skills:

- `db/drizzle-best-practices`

Use when:

- schema modeling
- migrations
- querying
- relations
- performance optimization
- database architecture

---

## Documentation & Research

Available skills:

- `docs/context7-cli`
- `docs/context7-mcp`
- `docs/find-docs`

Use when:

- retrieving library documentation
- verifying APIs
- checking breaking changes
- researching unfamiliar libraries
- validating implementation details

Always prefer documentation lookup before guessing APIs.

---

## Email

Available skills:

- `email/email-best-practices`
- `email/react-email`
- `email/resend`
- `email/resend-cli`

Use when:

- transactional emails
- email templates
- React Email
- Resend integration
- email deliverability
- email workflows

---

## Frontend

Available skills:

- `frontend/frontend-design`
- `frontend/ui4-convert-tests`
- `frontend/ui4-review`
- `frontend/web-design-guidelines`

Use when:

- building interfaces
- improving UX
- implementing responsive layouts
- reviewing UI quality
- converting designs into implementation
- accessibility
- design consistency

---

## Next.js

Available skills:

- `next/next-best-practices`
- `next/next-browser`
- `next/next-cache-components`
- `next/webapp-testing`

Use when:

- App Router
- Server Components
- Client Components
- Route Handlers
- Server Actions
- metadata
- caching
- rendering strategies
- browser APIs
- testing Next.js applications

Always prefer server-first patterns unless interactivity requires client components.

---

## Quality & Architecture

Available skills:
- `quality/diagnose`
- `quality/site-architecture`
- `quality/vercel-composition-patterns`
- `quality/vercel-optimize`
- `quality/vercel-react-best-practices`
- `quality/vercel-react-view-transitions`

Use when:

- defining project structure
- architecture decisions
- performance optimization
- React patterns
- Vercel deployment concerns
- transitions and navigation UX
- composition strategies

Favor maintainability, performance, and clear separation of concerns.

---

## SEO

Available skills:

- `seo/ai-seo`
- `seo/copy-editing`
- `seo/copywriting`
- `seo/programmatic-seo`
- `seo/seo-audit`

Use when:

- metadata
- structured data
- SEO optimization
- content generation
- landing pages
- copy improvement
- content audits
- programmatic SEO
- search visibility

Prefer technically correct SEO over keyword stuffing.

---

## Styling & Design System

Available skills:

- `style/shadcn`
- `style/tailwind-best-practices`
- `style/tailwind-v4-shadcn`

Use when:

- styling interfaces
- creating design systems
- component composition
- Tailwind CSS usage
- shadcn/ui components
- Tailwind v4 migration
- design tokens
- spacing systems
- responsive styling
- utility-first CSS architecture

Rules:

- Prefer consistent spacing and typography scales.
- Reuse existing shadcn patterns before creating custom components.
- Avoid unnecessary utility duplication.
- Prefer composition over component overengineering.
- Follow Tailwind v4 conventions when applicable.

# Decision Rules

Before implementing:

1. Identify the domain of the task.
2. Load only the relevant skills.
3. Consult docs before assuming APIs.
4. Follow existing project architecture.
5. Prefer maintainable solutions over clever ones.
6. Prefer server-side solutions in Next.js when possible.
7. Avoid deprecated APIs.

## Search tools

Use `rg` for text search and `rg --files` for file discovery.
Do not use `grep` or `find` unless `rg` is unavailable.

## Browser testing

Use Python Playwright for browser verification when testing UI flows.
Activate `.venv` first, then run `pytest`.
Prefer Chromium unless another browser is explicitly needed.

<!-- END:nextjs-agent-rules -->
