# DIGIT-B Rebuild — Progress Log

Living history of the project. **Append a new entry at the top of the Log after every meaningful step** (newest first). Never rewrite past entries; add a correction entry instead.

## ▶ RESUME HERE (keep this block current — overwrite it, do not append)

**Last updated:** 2026-10-29 · **ALL SIX PHASES ARE BUILT AND VERIFIED.** What is left is not engineering: it is client decisions, real content, legal review and a real deployment (see "Before launch" below). No agents are running.

**Final gates (all re-run by the orchestrator on 2026-10-29):** backend `php artisan test` **125 passed / 862 assertions**, Pint clean · frontend `npm run lint` clean, `npm test` **76 passed**, production build with **0** raw `@apply`/`@reference`/`@import` in the CSS · **axe-core (WCAG 2 A/AA + best-practice) clean on all 16 public routes and all 21 admin screens** · real-browser E2E of the newsletter→unsubscribe journey: 13/13 checks · DB re-seeded to a pristine state.

### Before launch (human work)
1. **Client facts** — real address / phone / email / hours / social URLs → admin → Settings. Mentorship **prices** (`$9.82`, `$7.25`, `$9,500`, `$15,000` are likely template leftovers). Jobs (Dhaka / Ireland, USD assumed). Testimonials (names from the old site, invented quotes). "Most popular" flag on First Job. About-page founder wording.
2. **Legal** — counsel must review Privacy + Terms (the retention periods 24 months / 90 days and "a recruiter reads every application personally" were invented by the drafting agent).
3. **Infrastructure** — real SMTP + `NOTIFICATION_EMAIL` + queue worker; rotate `ADMIN_PASSWORD`; HTTPS, backups of DB **and** `backend/storage/app/private` (résumés). Follow `docs/DEPLOYMENT.md` (its nginx config + CSP have NOT been exercised on a live HTTPS host).
4. **Manual accessibility pass** — real screen-reader and keyboard-only walkthroughs, 200–400 % zoom (automated axe is clean but cannot cover these).
5. **Optional improvements** — social-share previews for jobs/articles need prerender or server-side meta (client-rendered SPA limit, see DEPLOYMENT §8); nginx `fastcgi_cache` for public GETs; lazy-load Mantine Drawer/Notifications (first load ≈ 282 KB gz); real cover photos for posts (generated art is used until then).

### State of the repo
| Area | Status |
|---|---|
| `docs/` | `01-audit.md` (done), `02-api-contract.md` (binding API spec), this log |
| `backend/` | **DONE & verified**: Laravel 13 API per the contract (public + auth + admin), MySQL schema + seeders, `php artisan test` = 117 passed / 817 assertions, `backend/README.md`. See the Phase 4 log entry for deviations (all written into the contract under "Implementation notes"). API dev server **port 8001** (8000 is taken on this machine); Vite proxy default updated to 8001. |
| `frontend/` build pipeline | **Verified working** (see the Phase 2 log entry): Vite 8 + React 19 + Tailwind 4 (PostCSS) + SCSS + Mantine 9. |
| `frontend/src/api`, `lib`, `hooks`, `theme`, `config` | Written (axios client with Sanctum CSRF, public API + query builders, formatters, form-submit hook, settings hook, Mantine theme, nav config incl. legacy redirects). |
| `frontend/src/components/ui`, `components/layout` | **Done & styled**: Button, Container/Section/SectionHeader/Eyebrow/Badge, Logo, NodeField, BinaryTicker, BitText, Reveal, Markdown, Seo, States, Pager, CoverImage, PageHero, FormAlert/Honeypot; Header (+mobile drawer), Footer, NewsletterForm, SiteLayout, PageLoader, RouteError. Catalogue in `docs/03-design-system.md`. |
| `frontend/src/styles` | **Done**: tokens, root, global, all component + layout partials registered in `main.scss`; empty per-page partials in `styles/pages/`; `admin.scss` + `vendors/mantine-admin.css` ready. |
| `frontend/src/app` | **Done**: `routes.jsx` (lazy routes, all legacy WordPress redirects), `providers.jsx`, `queryClient.js`, `legacy.jsx`; `main.jsx` wired. |
| Pages | **ALL DONE & verified:** Home, About, Services, ServiceDetail, Mentorship, Vacancies, JobDetail, Apply, Articles, Blog, PostDetail, Contact, Privacy, Terms, NotFound. Frontend gates: lint clean, 71 tests, build OK. |
| Admin dashboard | **DONE & verified**: login/guard/permission-aware nav, dashboard (SVG chart), applications pipeline (status, notes, timeline, résumé download, CSV), jobs (+Markdown editor), inquiries, mentorship requests, posts/categories/services/testimonials/FAQs/programmes, subscribers, settings, users & roles. Lazy chunk; its CSS (~50 KB) loads only on `/admin`. |
| Newsletter | Subscribe → welcome mail with unsubscribe link → `/unsubscribe?token=` confirmation page → `POST /newsletter/unsubscribe`. Admin CSV export has an `Unsubscribe URL` merge column. |
| Tooling | `frontend/scripts/browser-check.mjs` (screenshots, overflow, console errors; flags `--full --reduce --slices --drawer`). axe/E2E scripts used for verification lived in the session scratchpad (not in the repo) — recreate with `puppeteer-core` + `axe-core` if needed. |

### If you are resuming
Nothing is in flight. To verify the whole project: `cd backend && php artisan test && vendor/bin/pint --test`; `cd frontend && npm run lint && npm test && npm run build` then `grep -c "@apply" dist/assets/*.css` (each must be 0). To browse locally see "How to run" below; local admin credentials are in the git-ignored `backend/.env`.

### How to run
```
# 1. MySQL 8.4 (Laragon, not on PATH) — database `digit_b`. PowerShell:
Start-Process "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" -ArgumentList '--defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"','--console' -WindowStyle Hidden
# 2. API (port 8001 — 8000 is occupied on this machine)
cd backend  && php artisan serve --port=8001      # → http://127.0.0.1:8001   (re-seed: php artisan migrate:fresh --seed)
# 3. SPA
cd frontend && npm run dev                        # → http://localhost:5173 (proxies /api, /sanctum, /storage → 8001)
# Tests
cd backend && php artisan test      cd frontend && npm test && npm run lint
```

### Conventions to keep (so work can resume consistently)
- Styling: **SCSS partials only, strict BEM** (`block__element--modifier`), Tailwind via `@apply` inside SCSS; almost no utility classes in JSX. One partial per component/page, registered in `styles/main.scss`. No `@reference` inside partials (see Phase 2 findings).
- Never put contact data or secrets in the frontend; contact details come from `GET /settings`.
- API shapes are defined only in `docs/02-api-contract.md`; change it first if the contract must change.
- Write markdown with the Write/Edit tools, not shell heredocs (backticks get eaten).
- Log discipline: after each step, add a dated entry under "Log" and refresh this block.

## Phase checklist

- [x] **1. Audit & URL inventory** — see [01-audit.md](01-audit.md)
- [x] **2. Design system** — tokens, SCSS architecture, base UI components, verified Tailwind + SCSS + Mantine build — see [03-design-system.md](03-design-system.md)
- [x] **3. Frontend (public site)** — all routes in the inventory (15 pages, verified)
- [x] **4. Laravel API + MySQL** — migrations, models, policies, resources, seeders, tests (125 green)
- [x] **5. Integration + admin dashboard** — admin built; end-to-end checks against the live API (forms, auth, résumé download, CSV, unsubscribe)
- [x] **6. Testing, docs, deployment guidance** — 125 backend + 76 frontend tests, axe sweep, README, DEPLOYMENT.md, env templates

## Decisions (and why)

| # | Decision | Reason |
|---|----------|--------|
| D1 | Rebuild content rather than copy it 1:1 | Live site is an unfinished WordPress template: lorem-ipsum copy, 3 conflicting sets of contact details, links to `el.commonsupport.com`, forms rendered as images, empty Mentorship page. |
| D2 | Contact details, hours, socials live in `site_settings` (DB), served by `GET /settings` | One source of truth; fixes the conflicting header/footer/contact data; editable from admin. |
| D3 | Sanctum **cookie/SPA** auth, Vite dev proxy makes `/api` same-origin | HttpOnly session cookie is safer than a bearer token kept in JS storage. |
| D4 | `spatie/laravel-permission` for roles/permissions | Battle-tested; avoids hand-rolled RBAC. |
| D5 | Article/blog/service bodies stored as Markdown, rendered client-side with `marked` + `DOMPurify` | No raw-HTML storage, no heavy rich-text editor, XSS-safe. |
| D6 | `/articles` and `/blog` both preserved (single `posts` table, `type` = article\|blog) | Both exist on the live site and in its footer nav. |
| D7 | Legacy WordPress URLs get client redirects (`/eazyrecruitz_jobs/*`, `/eazyrecruitz_service/*`, root-slug posts, `/temporary-staffing`, `/direct-hire`) | Preserves inbound links/SEO. |
| D8 | Self-hosted fonts via `@fontsource` | No third-party font requests (privacy, speed). |
| D9 | Did **not** spoof browser headers to bypass the site's ModSecurity (it returns 406 to curl) | Respect the access control; WebFetch was sufficient for the audit. |

## Open items needing client confirmation

- Which office address / phone is canonical (live site shows Columbus OH, Chicago, Los Angeles, New Orleans, Minneapolis; phones `+3522569875`, `+88 01682648101`, `(800) 456-1234`, `0167-989-8990`).
- Mentorship pricing (`$9.82` / `$7.25` per person/month; `$9.5k` / `$15k` per role/month) looks like template leftovers — seeded as editable data only.
- Seeded jobs (Dhaka / County Wexford, Ireland) are carried over from the old site; review before launch.
- Article bodies were only available as summaries; full copy was rewritten from those summaries.
- Testimonials (Jessica Brown, Michael Thompson, Emily Davis, David Lee, John Wick) look like demo content.
- Social URLs are generic `facebook.com` / `twitter.com` / `linkedin.com` — real company profiles needed.

## Log (newest first)

### 2026-10-29 — Final integration pass: newsletter unsubscribe, cleanup, all gates re-run
**Added (closing the last known backend gap):** `POST /newsletter/unsubscribe` (token, idempotent, 404 on unknown, 422 on malformed, `throttle:forms`); `NewsletterWelcome` mailable (queued, after-commit) with the unsubscribe link, sent only to new or returning subscribers (repeat sign-ups of an active address send nothing → no way to spam a third party's inbox); admin subscriber CSV gains an `Unsubscribe URL` column; SPA page `/unsubscribe` that **requires a confirmation click** (mail scanners prefetch links, so unsubscribing on load would silently remove people). 8 backend tests + 5 frontend tests; contract updated.
**Verified end to end in a real browser (13/13):** footer form → subscriber stored with 64-char token → welcome mail in the log contains the link and recipient → opening the link does NOT unsubscribe → page is `noindex` → confirm click unsubscribes (UI + DB) → second visit idempotent, first timestamp kept → malformed/missing token show the invalid-link state → re-subscribing reactivates the same row.
**Other fixes found by looking/auditing:**
- axe on the admin: Markdown editor preview pane scrolled but was not keyboard-focusable → `tabIndex=0` (WCAG 2.1.1). axe on `/nope`: giant lime "404" had 1.32:1 contrast → ink text with a lime offset shadow.
- "1 years" on the application detail → correct pluralisation. `Logo` `label` props removed from the two admin call sites.
- Seeder: `cover_image` now `null` (the `/images/posts/*.webp` files never existed → a 404 per post card; generated art is used instead, and the fake photo alt texts are no longer served). `LocalDemoSeeder` now writes real, well-formed placeholder PDFs so "Download résumé" works for demo applications (xref offsets verified byte-by-byte; I first shipped a single-quoted `'\n'` bug and caught it by checking offsets).
- **Process lessons:** an axe run that audits while a page is still in its auth-loading state reports phantom `landmark`/`h1` violations — wait for `main h1`, then audit. Git Bash rewrites bare `/path` CLI args to Windows paths (`MSYS_NO_PATHCONV=1`). The Home page has its own newsletter band, so test selectors must be scoped (`footer .newsletter …`).
**Cleanup:** dev DB re-seeded (`migrate:fresh --seed`: 7 jobs incl. 1 draft, 4 posts, 11 services, 13 FAQs, local demo users + sample submissions), agents' test résumés/uploads/log removed, build artefacts and screenshots deleted.
**Gates:** backend 125 tests / 862 assertions + Pint clean · frontend lint clean, 76 tests, prod build 0 raw `@apply` · first load ≈ 282 KB gz (Mantine 107, React/Router 95, UI 32, app 10, CSS 36) · axe clean on 16 public + 21 admin screens.

### 2026-10-29 — Admin dashboard done (report merged by orchestrator)
**Built** (`frontend/src/admin/**`, `styles/admin.scss` + `styles/admin/*.scss`): auth (login with 422/401/429 handling, `?next=` sanitised against open redirects, expired-session notice via the `auth:unauthenticated` event), permission-aware nav + route guards + 403 screen, shell (ink sidebar, mobile drawer, breadcrumbs, skip link), dashboard (stat tiles, dependency-free accessible SVG chart + "show as table"), applications (server-side table, URL-synced filters, detail with status/notes/timeline, authorised résumé blob download, delete, CSV export), jobs (full form, Markdown editor with preview, repeatable lists, duplicate), inquiries + mentorship requests (drawer, status workflow, mailto reply; opening a `new` message marks it `read`), posts/categories/services/testimonials/FAQs/programmes (shared `ResourceTable`/`ResourceForm`), subscribers, settings (tabs, dirty indicator, og-image upload), users & roles. Admin CSS only in the lazy chunk (~50 KB, no preflight re-emitted).
**Verified by the agent against the live API:** logins as super-admin/editor/recruiter (nav filtered per role, direct API call to `/admin/users` → 403), full application workflow (status change, notes, résumé download, filtered CSV, delete), create/edit/delete of every resource type, job duplicate, post cover upload, weak-password rejection, "cannot delete yourself", settings save visible on the public API, session-expiry redirect, unsaved-changes modal; 28 new unit tests. **Orchestrator:** visual review of dashboard / application detail / mobile applications list; axe sweep of all 21 admin screens (see the final entry).
**Deviations from the contract:** the backend stores no note on a status change (`PATCH` takes `status` and `notes` only, `notes` = the single internal-notes field) so the UI has a status control and a notes box, each notes change appearing in the timeline; `roles` is an array, the UI offers a single-role select and sends `[role]`.
**Known/accepted:** a guest hitting `/admin/login` logs one console line for the 401 from `GET /auth/me` (unavoidable without knowing session state). Not verified by the agent: keyboard-only / screen-reader walkthroughs.

### 2026-10-29 — Accessibility audit (axe-core, WCAG 2 A/AA + best-practice) on all 13 public routes
- Ran axe-core 4 through puppeteer on `/`, `/about`, `/services`, `/services/temporary-staffing`, `/vacancies`, `/vacancies/software-engineer`, `/apply`, `/articles`, `/blog`, `/mentorship`, `/contact`, `/privacy`, `/terms` (reduced motion on, data loaded). **No colour-contrast, label, landmark or ARIA violations.**
- Found and fixed 2 real issues: (1) `Logo` had `aria-label="DIGIT-B home"` which doesn't contain the visible text (the SVG "B" glyph counts as visible text) → label removed, the link is named by its visible text (WCAG 2.5.3); (2) Articles/Blog skipped from `h1` to the post-card `h3` → added a screen-reader-only `h2` before the results. Re-run on affected pages: clean.
- **Still to do:** re-run the full axe sweep as a final gate after the admin is merged; run axe on the admin screens (needs a login); `Logo` no longer accepts `label` — two admin call sites (`admin/layout/SidebarNav.jsx`, `admin/pages/Login`) still pass it (ignored, harmless; remove once the admin agent is done).
- **Not covered by automated checks:** real screen-reader and keyboard-only walkthroughs, zoom/reflow at 200–400 %, and `prefers-reduced-motion: no-preference` behaviour. Do these manually before launch.

### 2026-10-29 — Phase 6 (docs): root README, DEPLOYMENT guide, env templates
- Wrote `README.md` (overview, quick start, commands, testing incl. the "no raw `@apply`" build check, architecture, known limitations), `docs/DEPLOYMENT.md` (single-origin architecture, build/release order, production env table, full nginx config with security headers + CSP + SPA fallback + Laravel via php-fpm, post-deploy verification, launch checklist, SEO, performance, operations) and `frontend/.env.example`.
- **Decision — did not change API cache headers:** public GETs carry `Cache-Control: no-store`. A naive `public` header would risk stale content right after an admin edit and is mostly defeated by the Sanctum session cookie on SPA requests. Documented a safe approach instead (nginx `fastcgi_cache` + purge on writes). Local slowness is a dev-server artefact, not a code issue.
- **Not verified (stated in the docs):** the CSP and nginx config have not been exercised on a real HTTPS deployment; server-side 301 snippets for legacy URLs are optional extras.

### 2026-10-29 — Phase 3 / Frontend B done: Vacancies, JobDetail, Apply, Articles, Blog, PostDetail, Contact, Privacy, Terms
**Built:** Vacancies (URL-synced debounced search, facet filters with counts, removable chips, sort, Pager, mobile filter Drawer, loading/empty/error states); JobDetail (Markdown + lists, sticky side card, share, related, closed-role handling, `JobPosting` + breadcrumb JSON-LD); Apply (4 stages: Basic → Qualification → Work status → Review & submit; tag input for skills, radio cards for work status, résumé `FileInput` with type/size checks, per-step validation, a 422 jumps to the step owning the field, `?job=` banner with graceful fallback, success screen, nothing stored in the browser); Articles + Blog (one shared `PostsPage`, featured first post, category chips, search); PostDetail (canonical redirect when type ≠ URL section, share, related, newsletter band, `Article`/`BlogPosting` JSON-LD); Contact (details from settings only, `?type=` pre-select); Privacy + Terms (11 sections each, sticky TOC).
**New shared files (new only, none edited):** `components/ui/{ShareLinks,Breadcrumbs,TagInput,SearchBox}.jsx`, `styles/components/{_share,_breadcrumbs,_tag-input,_search-box}.scss`, `lib/{jsonld,tags,seoTitle}.js`, `hooks/useUrlSearch.js`.
**Verified — agent:** real submissions (3 applications with a generated PDF → 201; duplicate → 422 on `email` and the UI returns to step 1; contact 201; newsletter 201), URL/back-button behaviour, mobile filter drawer, redirect `/articles/<blog-slug>` → `/blog/<slug>`, no overflow at 390/768/1280. **Verified — orchestrator:** `npm test` 71/71, `npm run lint` fully clean, **database check: applications persisted with applicant + résumé flag, `application_events` rows written, résumé PDFs exist on the PRIVATE disk and none under the public disk**; visual review of Vacancies (desktop) and Apply (390).
**Fix by orchestrator:** the shared `PageHero` was ~730 px tall so no job listing was visible above the fold on Vacancies. Tightened padding, title clamp and gap in `styles/layout/_page-hero.scss` (filters/search now start in the first viewport).
**Gotchas the agent handled:** API `seo.title` already ends in "| DIGIT-B" (`stripSiteName()`), API `location` already contains the country (`jobPlace()`). Privacy page lists two strictly-necessary cookies (CSRF + admin session) because form submits call `/sanctum/csrf-cookie`.
**NEEDS A HUMAN (legal/claims — do not launch without):** retention periods in the Privacy page (24 months applications/enquiries, 90 days logs) were **invented by the agent**; processor wording and governing law are unreviewed; the success page/policy say "a recruiter reads every application personally" and promise a confirmation email (backend does send an acknowledgement mail, but only with real SMTP configured). Counsel must review Privacy + Terms.
**Cleanup owed:** agents' end-to-end tests left junk in the dev DB (e.g. "Flow Test Engineer" jobs, `*@example.test` applicants). **Run `php artisan migrate:fresh --seed` and delete `backend/storage/app/private/resumes/*` before delivery/demo.**

### 2026-10-29 — Phase 3 / Frontend A done: Home, About, Services, ServiceDetail, Mentorship
**Built** (agent report, spot-checked by the orchestrator): Home with all 13 sections from one `queries.home()` call (hero with `<em>` accent, stats, mission, reasons, solutions, working style, testimonials, mentorship tabs, featured jobs, contact cards, quick contact form, latest posts, newsletter); About; Services index (Solutions vs Hiring models) + ServiceDetail (Markdown body, process, advantages, sticky "what's included", related, JSON-LD); Mentorship (programmes in Standard/Premium tabs, request form with `?program=slug#request` pre-fill, FAQ). No clients section and no video (assets weren't ours). Organization / Service / ItemList JSON-LD via `Seo`.
**New shared pieces (import by file path, not exported from `ui/index.js`):** `components/ui/{QueryBoundary,CtaBand,ServiceCard,ProgramTabs,FaqList,StatsBand}.jsx`, `lib/{formRules,icons,price}.js`, `styles/components/_catalog.scss`. No existing shared file was modified.
**Verified:** agent — lint clean in its files, `npm test` 14/14, build with no raw `@apply`, 390/768/1280 screenshots, no overflow, **real submissions** `POST /contact` → 201 and `POST /mentorship/requests` → 201. Orchestrator — re-captured Home at 1280 against the live API after data loaded: hero, solutions header, mentorship price cards render correctly; zero overflow and zero console errors.
**Design decisions made by the agent:** stats/step numbers use JetBrains Mono (serif "1" reads as "l"); looser tracking on the hero h1; job cards drop a duplicated country ("County Wexford, Ireland, Ireland").
**Not verified:** keyboard / screen-reader pass; the newsletter form submit (shared component, not yet exercised end-to-end); motion with reduced-motion off (all captures use `--reduce`).
**Needs a human:** the About "founder story" wording was written around "over a decade of experience" — read it. "Most popular" badge on First Job comes from the seeded `is_featured` flag and is an invented claim — confirm or unflag in admin.
**Environment findings:** (1) API calls take ~2–4 s on this machine: `artisan serve` is single-threaded on Windows with no OPcache and several agents were hitting it; even `/up` took ~1 s. Not an app bug, but → **performance follow-up: add server-side caching + `Cache-Control` for the public GET endpoints and enable OPcache for local PHP**. (2) `scripts/browser-check.mjs` now waits for skeletons to disappear and has `--reduce` (emulate reduced motion so scroll-reveal content is visible) and `--slices` (readable per-viewport slices of long pages).

### 2026-10-29 — Phase 4: Laravel API + MySQL built and verified
**What was built** (`/backend`, Laravel 13 / PHP 8.3, Sanctum cookie auth, spatie/laravel-permission; nothing else installed):
- Every endpoint in `02-api-contract.md` (public, auth, admin), 63 admin routes, FormRequests, API Resources with the exact contract shapes (computed `salary.display`, `experience.display`, `*_label`, `reading_minutes`), permission gates + `ApplicationPolicy` / `UserPolicy`, rate limiters `api` 120, `forms` 5, `login` 5 (email+IP), `admin` 240, honeypot middleware, security-headers middleware, JSON-only errors for `api/*` + `sanctum/*` (no model names / traces in 404/500).
- Schema: 14 domain tables (+ users, spatie permission, queue/cache/session tables) with FKs, indexes on every filter/sort/search column, utf8mb4, soft deletes on jobs/posts/applications. Search = escaped, indexed `LIKE` (no FULLTEXT: portable to the SQLite test DB).
- Application submission is a transaction (applicant upsert by lower-cased email + application + event + résumé on the **private** disk, random name, extension from sniffed MIME); file is removed on rollback. 30-day duplicate guard. Mail (4 queueable Mailables) never fails a request.
- CSV exports are streamed and formula-injection-safe; `GET /sitemap.xml` + `GET /robots.txt` (no middleware group) built from the DB and `FRONTEND_URL`.
- Seeders: real content (site settings with the canonical contact data, 6 solutions + 5 hiring models, 7 jobs, 4 articles of ~500–650 words, 5 testimonials, 4 mentorship programs, 13 FAQs). Roles/permissions are seeded in **every** environment (the super-admin needs them); demo editor/recruiter users and sample submissions only when `APP_ENV=local`.
- `backend/README.md` (install, env table, queue/scheduler, nginx + supervisor snippets, deployment checklist, security notes).

**Verification:** `php artisan test` → 117 tests / 817 assertions, all green (SQLite in-memory). `migrate:fresh --seed` runs clean on real MySQL 8.4.3. Smoke-tested with `artisan serve` + curl: `/settings`, `/home`, `/jobs?search=engineer`, `/jobs/filters`, `/sitemap.xml`, `/robots.txt`, csrf-cookie → login (cookie jar) → `/auth/me` → `/admin/dashboard`, multipart `POST /applications` with a real PDF (201, duplicate → 422), résumé download + CSV export as recruiter, recruiter `GET /admin/users` → 403. Pint clean.

**Deviations from the contract** (all written into the contract file under "Implementation notes"): table `job_postings` (queue owns `jobs`); `logout` → 204; `/home.faqs` = group `about`; honeypot hit → `201` with `id: 0`; non-stateful login → 400; `/post-categories?type=` also returns type-less categories; pagination `meta` is Laravel's superset; admin dashboard payload and detail shapes documented.

**How to run**
- MySQL (Laragon, not on PATH; data dir `C:\laragon\data\mysql-8.4` already existed, only `digit_b` was created/touched): `Start-Process "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" -ArgumentList '--defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"','--console' -WindowStyle Hidden` — it was left **running**; root user, blank password (local `.env` only).
- API: `cd backend && php artisan serve --port=8001`. **Port 8000 is occupied on this machine** (HTTP.sys/IIS answers with a Next.js 404), so the Vite proxy target must be `http://127.0.0.1:8001` (or free port 8000).
- Local admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` come from `backend/.env` (git-ignored; read them there — credentials are deliberately not recorded in docs). If `ADMIN_PASSWORD` is empty the seeder generates a random password and prints it once. Demo users (local env only): `editor@digit-b.test`, `recruiter@digit-b.test` (password is in `DemoUsersSeeder`). **Change `ADMIN_PASSWORD` before any non-local deploy.**
- Tests: `php artisan test`.

**Open items raised by this step** (also see the list above)
- Mentorship prices seeded as on the live site: Career Switch **$9.82**, First Job **$7.25** (per person / month, individuals, tier standard) and Temporary **$9,500**, Contract **$15,000** (per role / month, employers, tier premium) — these look like template leftovers; edit in admin before launch.
- Original jobs had no currency/period for salaries: Dhaka roles (30–40k, 20–30k) and the $85–90k Ireland roles are all seeded as USD / year; Dhaka jobs, the accountant and software-engineer-2 hide salary where the original did. Confirm real currency. The "Manager", "Accountant" and "People Manager" descriptions are written generically (originals had no content). The Ireland Project Manager has no reference code (only `2019ER` for Software Engineer was known).
- Testimonial quotes/companies are written placeholders for the five audit names; replace with real, approved quotes.
- Social links are the generic root profiles (`linkedin.com`, `facebook.com`, `x.com`); instagram is `null`.
- Post cover images are referenced as `/images/posts/<slug>.webp` — the frontend must ship them (or upload via `POST /admin/media` and edit the post).
- Newsletter unsubscribe: tokens are stored but no public unsubscribe endpoint/UI exists (out of scope per contract).
- Mail is `MAIL_MAILER=log`; real SMTP credentials + `NOTIFICATION_EMAIL` are needed in production, plus a queue worker if `QUEUE_CONNECTION=database`.
- Not verified: behaviour behind a real nginx/php-fpm with HTTPS and cross-sub-domain cookies (documented in the README, only tested locally and in the PHPUnit suite).

### 2026-10-29 — Phase 2 complete: design system, app shell, tooling
- Built the full design system and shell (see the Resume block for the inventory) and verified it in a real browser via puppeteer-core + system Chrome.
- **Bug caught by looking:** Instrument Serif renders "1" like a lowercase "l" ("0 and l to B-coming"). Added `BitText` (standalone 0/1 digits set in mono). Brand copy containing 0/1 must use it.
- **False alarm worth remembering:** headless Chrome has a ~500px minimum window width, so `--window-size=390` screenshots are cropped layouts. Use puppeteer device emulation (`scripts/browser-check.mjs`) for mobile.
- **Lint caught a real anti-pattern:** `setState` inside an effect to close the drawer. Replaced with derived state (`openPath === pathname`). Moved `queryClient` out of `providers.jsx` for fast refresh.
- Added: ESLint flat config, Vitest setup + 8 unit tests (Button, BitText, markdown sanitising, formatters, error parsing), favicon, legacy-URL redirects (`/eazyrecruitz_jobs/*`, `/eazyrecruitz_service/*`, root-slug posts → resolved through the API).
- Mantine's per-component layer CSS: public bundle CSS now ≈ 143 KB (27 KB gzip) including all design-system partials.
- `docs/03-design-system.md` written for whoever builds pages next (humans or agents).

### 2026-10-29 — Phase 2: styling pipeline verified (Tailwind v4 + SCSS + Mantine 9)
- **Versions:** Vite 8.3 (Rolldown), React 19.3, Tailwind 4.3.3, Sass 1.107, Mantine 9.7.4, React Router 7.18, TanStack Query 5.
- **Finding 1 — silent failure:** `@tailwindcss/vite` does NOT process Sass output; the build passed but `@apply` stayed raw in the CSS. Switched to `@tailwindcss/postcss` (runs after Sass). Always inspect `dist/assets/*.css` for leftover `@apply`.
- **Finding 2:** Sass inlines partials into the entry, so `@reference` resolves relative to the *entry*, not the partial. One entry (`styles/main.scss`) pulls Tailwind in through plain-CSS `@import`s, so partials need no `@reference`. Secondary entries (admin) use `@reference './reference.css'`.
- **Finding 3:** Sass hoists plain `@import`s out of `@use`d modules, which scrambled cascade-layer order (mantine before base, so preflight would override Mantine). Mantine imports now live in `vendors/mantine-public.css`, imported from `main.scss` in position. Verified order: `theme → base → mantine → utilities`, then our unlayered SCSS wins.
- **Finding 4:** Sass cannot add `rem + vw`; the middle terms of the fluid-type `clamp()` values are quoted strings in `_tokens.scss`.
- **Finding 5:** Vite 8 uses Rolldown, so `manualChunks` must be a function, not an object.
- Mantine is imported per component via `*.layer.css` (public CSS about 100 KB / 17 KB gzipped instead of 297 KB).
- Design direction: **"0 → 1 → B"** — ink-black + warm paper + signal-lime accent; Instrument Serif display, Hanken Grotesk body, JetBrains Mono micro-labels; binary/node motif. Fonts self-hosted via @fontsource.
- Backend agent dispatched in parallel (implements `docs/02-api-contract.md`).
- Note to self: write markdown containing backticks with the Write/Edit tools, never via a shell heredoc (bash ate the backticks the first time).

### 2026-10-29 — Phase 1 complete, tooling checked
- Environment: Node 24.11, npm 11.6, PHP 8.3.30, Composer 2.10, MySQL 8.4.3 bundled in Laragon (not running at this point, not on PATH).
- Audited homepage, robots.txt, sitemap index + 9 nested sitemaps, About, Contact, Apply Now, Vacancies, job detail, Mentorship, Articles, Blog, 4 article details, Temporary Staffing, Direct Hire, Coming Soon.
- Findings and full URL inventory written to `docs/01-audit.md`.
- Started `composer create-project laravel/laravel backend` in the background.
- User asked for a markdown history log → this file created.
