# DIGIT-B

Recruitment website for **DIGIT-B** — headhunting and talent acquisition in retail supply chain technology. A ground-up rebuild of the old WordPress site as a React single-page app with a Laravel REST API, a MySQL database and a built-in admin dashboard.

```
digit-b/
├─ frontend/   React 19 · Vite · React Router · Tailwind 4 + SCSS (BEM) · Mantine 9 · TanStack Query · Axios
├─ backend/    Laravel 13 · PHP 8.3 · Sanctum (cookie auth) · spatie/laravel-permission · MySQL 8
└─ docs/       audit, API contract, design system, progress log, deployment guide
```

| Document | What it is |
|---|---|
| [docs/PROGRESS.md](docs/PROGRESS.md) | **Start here when resuming work**: current state, decisions, history, open items |
| [docs/01-audit.md](docs/01-audit.md) | Audit of the old site: every URL, form and defect |
| [docs/02-api-contract.md](docs/02-api-contract.md) | The binding API contract (frontend ↔ backend) |
| [docs/03-design-system.md](docs/03-design-system.md) | Design concept, tokens, styling rules, component catalogue |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production architecture, build, web-server config, checklist |
| [backend/README.md](backend/README.md) | API install, env, queue, storage, security notes |

## What's in it

- **Public site (15 routes):** Home, About, Services (+ detail), Vacancies (search, filters, pagination, detail), Apply (4-step form with résumé upload), Articles, Blog (+ detail), Mentorship (programmes + request form), Contact, Privacy, Terms.
- **Old WordPress URLs keep working** (`/about-us`, `/eazyrecruitz_jobs/…`, root-level post slugs, …) through client-side redirects.
- **Admin dashboard (`/admin`):** applications pipeline with status workflow, notes, authorised résumé download and CSV export; jobs; contact inquiries; mentorship requests; articles/blog (Markdown + image upload); services; testimonials; FAQs; mentorship programmes; subscribers; site settings (company, **contact details**, social, stats, SEO); users and roles.
- **One source of truth for contact data:** address, phone, email, hours and social links are database settings served by `GET /api/v1/settings` and editable in the admin. They are never hard-coded in the frontend (the old site contradicted itself in five places).
- **Security:** cookie (HttpOnly) Sanctum sessions + CSRF, role/permission gates, FormRequest validation, rate limits, honeypots, private résumé storage, MIME-sniffed uploads, CSV formula-injection defence, security headers, JSON-only errors.

## Quick start (local)

Requirements: **Node 20+**, **PHP 8.3+**, **Composer 2**, **MySQL 8**.

```bash
# 1. Database (MySQL) — create once
#    CREATE DATABASE digit_b CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. API
cd backend
composer install
cp .env.example .env            # set DB_*, ADMIN_EMAIL, ADMIN_PASSWORD
php artisan key:generate
php artisan migrate --seed      # roles, super-admin, launch content
php artisan storage:link
php artisan serve --port=8001   # → http://127.0.0.1:8001

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                     # → http://localhost:5173  (proxies /api, /sanctum, /storage → :8001)
```

- Public site: <http://localhost:5173> · Admin: <http://localhost:5173/admin>
- The super-admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` (if the password is empty, the seeder generates one and prints it once).
- **Windows / Laragon:** MySQL ships at `C:\laragon\bin\mysql\mysql-<ver>\bin\mysqld.exe`. Port 8000 is frequently occupied on Windows (HTTP.sys/IIS), which is why the project uses **8001**. To use another port set `VITE_PROXY_TARGET` (see `frontend/.env.example`).
- Re-seed from scratch (destroys data): `php artisan migrate:fresh --seed`.

## Commands

| Where | Command | Purpose |
|---|---|---|
| `frontend` | `npm run dev` | Dev server with API proxy |
| | `npm run build` | Production build → `dist/` |
| | `npm run lint` · `npm test` | ESLint · Vitest unit/component tests |
| | `node scripts/browser-check.mjs <url> <w> <h> <out> [--full] [--reduce] [--slices] [--drawer]` | Real-browser screenshot + overflow + console-error check (needs Chrome; set `CHROME_PATH` if not at the default location) |
| `backend` | `php artisan test` | PHPUnit suite (in-memory SQLite, no services needed) |
| | `vendor/bin/pint` | Code style |
| | `php artisan queue:work` | Mail queue worker (needed when `QUEUE_CONNECTION=database`) |

## Testing

```bash
cd backend  && php artisan test          # API: auth, authorization matrix, validation, uploads, exports, seeders
cd frontend && npm test && npm run lint  # components, form rules, URL/filter mapping, JSON-LD, markdown sanitising
```

After a production build, check the compiled CSS contains no raw `@apply` (Tailwind runs as a PostCSS step after Sass; a green build can still leave it unprocessed):

```bash
npm run build && grep -c "@apply" dist/assets/*.css   # every file must report 0
```

## Frontend architecture in one minute

- **Styling:** SCSS partials only, strict **BEM**, Tailwind utilities consumed through `@apply` inside SCSS (almost no utility classes in JSX). Design tokens live once in `src/styles/abstracts/_tokens.scss`, are emitted as CSS variables and mapped into Tailwind's theme. Mantine provides behaviour/accessibility and is re-skinned via BEM class names. Details and rules: [docs/03-design-system.md](docs/03-design-system.md).
- **Data:** `src/api/public.js` (typed query builders) + TanStack Query; forms use Mantine `useForm` + `useFormSubmit` (maps Laravel 422 errors onto fields).
- **Routing:** lazy, code-split routes in `src/app/routes.jsx`; the admin is a separate lazy chunk with its own CSS.

## Known limitations and next steps

- **SEO of a client-rendered SPA:** Google renders JavaScript, but social-link scrapers (LinkedIn, Facebook, X) read only the static HTML. For rich link previews on job and article pages add prerendering or server-side meta injection — see "SEO" in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
- **Mail** defaults to the `log` driver; configure real SMTP and a queue worker before launch.
- **Newsletter:** the site collects subscribers, sends a welcome e-mail with a one-click unsubscribe link (`/unsubscribe?token=…`) and exports them to CSV (with an `Unsubscribe URL` merge column). There is no campaign sender: newsletters themselves are sent from an external tool (Mailchimp, Brevo, …) using that export.
- **First-load weight** is about 280 KB gzipped of JS + CSS (Mantine is ~107 KB of it). Acceptable for this feature set; lazy-loading the mobile drawer and notifications is the next saving if needed.
- **Legal pages need counsel review**, and several business facts need client confirmation — the live list is in the "Open items" section of [docs/PROGRESS.md](docs/PROGRESS.md).
