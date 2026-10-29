# API Contract (v1)

Single source of truth shared by `/backend` (implements) and `/frontend` (consumes). **If you must deviate, change this file in the same change and note it in `PROGRESS.md`.**

Base path: `/api/v1`. JSON only. All JSON keys `snake_case`. Dates ISO-8601 UTC. Money = integers in minor-free whole currency units (e.g. `85000`).

## Conventions

- Success (single): `{ "data": { … } }` · Success (list): `{ "data": [ … ], "meta": { "current_page", "last_page", "per_page", "total" }, "links": { … } }` (Laravel resource pagination; `per_page` default 12, max 50).
- Validation error `422`: `{ "message": "…", "errors": { "field": ["msg"] } }`.
- Other errors: `401 / 403 / 404 / 429 / 500` → `{ "message": "…" }` (never leak stack traces / SQL; in production 500 message is generic).
- Public form POSTs return `201 { "data": { "id": …, "message": "…" } }` (or `200` for idempotent newsletter re-subscribe).
- **Spam protection on every public POST:** honeypot field `website` must be empty/absent (if filled → respond `201` success but store nothing) + rate limits below.
- **Rate limits:** public GET 120/min/IP · public POST forms 5/min/IP (`throttle:forms`) · login 5/min per email+IP · admin 240/min/user.
- **Auth:** Laravel Sanctum cookie (SPA) auth. Client first calls `GET /sanctum/csrf-cookie` (outside `/api`), then `POST /api/v1/auth/login`. Axios must send `withCredentials`, `X-XSRF-TOKEN` (axios does this via `xsrfCookieName`). In dev the Vite proxy forwards `/api`, `/sanctum`, `/storage` to Laravel so everything is same-origin.
- Uploaded résumés: private disk, never publicly linked. Images: `public` disk, served at `/storage/...`; resources return **relative** URLs like `/storage/posts/abc.webp`.

## Public endpoints

### `GET /settings`
```json
{ "data": {
  "company": { "name": "DIGIT-B", "tagline": "Moving Beyond 0 and 1 to B-coming Digital", "description": "…" },
  "contact": { "email": "", "phone": "", "address_lines": ["…"], "hours": [{ "days": "Mon–Sat", "time": "10:00 – 18:00" }, { "days": "Sunday", "time": "Closed" }], "map_url": null },
  "social": { "linkedin": "", "facebook": "", "x": "", "instagram": null },
  "stats": [{ "value": "10+", "label": "Years in retail supply chain tech" }, { "value": "30–45", "label": "Days average time to fill" }],
  "seo": { "site_title": "", "default_description": "", "og_image": null }
} }
```
### `GET /home`
`{ data: { services: Service[6], featured_jobs: JobSummary[3], testimonials: Testimonial[], mentorship_programs: MentorshipProgram[], latest_posts: PostSummary[3], faqs: Faq[] } }`

### Services
- `GET /services` → `Service[]` (published, ordered). Query `group=solution|hiring_model`.
- `GET /services/{slug}` → `ServiceDetail`.

`Service`: `{ id, slug, title, summary, icon, group, features: string[] , image }`
`ServiceDetail` = Service + `{ body_markdown, process_steps: [{title, description}], advantages: [{title, description}], seo: Seo }`

### Jobs
- `GET /jobs?search=&employment_type=&work_mode=&location=&department=&sort=newest|salary_desc|title&page=&per_page=` → `JobSummary[]` (status=published and not past `closes_at`).
- `GET /jobs/filters` → `{ data: { employment_types: [{value,label,count}], work_modes: [...], locations: [...], departments: [...] } }`
- `GET /jobs/{slug}` → `JobDetail` (also `related: JobSummary[3]`).

`JobSummary`: `{ id, slug, title, reference_code, summary, department, employment_type, employment_type_label, work_mode, work_mode_label, location, country, salary: { min, max, currency, period, display } | null, experience: { min, max, display } | null, is_featured, published_at, closes_at }`
`JobDetail` = JobSummary + `{ description_markdown, responsibilities: string[], requirements: string[], nice_to_have: string[], benefits: string[], seo: Seo }`
`employment_type` ∈ `full_time | part_time | contract | contract_to_hire | direct_hire | temporary`. `work_mode` ∈ `remote | hybrid | onsite`. `salary` is `null` when `show_salary=false`.

### Applications — `POST /applications` (multipart/form-data) · `throttle:forms`
| field | rules |
|---|---|
| `job` | optional, job slug (published) — omit for general talent-pool application |
| `first_name`, `last_name` | required, ≤80 |
| `email` | required, email |
| `phone` | required, 7–20 chars, phone-ish |
| `location` | required, ≤120 |
| `linkedin_url` | optional, url |
| `current_title` | required, ≤120 |
| `current_company` | optional |
| `years_experience` | required, int 0–60 |
| `highest_education` | required, in `high_school,diploma,bachelor,master,doctorate,other` |
| `skills` | optional, array ≤15 of strings ≤40 (or comma string) |
| `work_status` | required, `remote | hybrid | onsite` (the live site's "Remote / Hybrid / In person") |
| `expected_salary` | optional, int |
| `available_from` | optional, date ≥ today |
| `cover_letter` | optional, ≤4000 |
| `resume` | required file, `pdf,doc,docx`, ≤5 MB (mime-validated) |
| `consent` | required accepted (privacy policy) |
| `website` | honeypot |

Behaviour: in a DB transaction upsert `applicants` by lower-cased email, create `applications` (status `new`) + an `application_events` row, store résumé on private disk with a random name. Duplicate application to the same job by the same applicant within 30 days → `422` on `email`. Queue/send acknowledgement mail to applicant and notification to admin inbox (mail failure must not fail the request — log it).

### Contact — `POST /contact`
`name*, email*, phone?, company?, inquiry_type* (hiring|candidate|mentorship|partnership|general), subject?, message* (10–3000), consent*, website(honeypot)`

### Newsletter — `POST /newsletter`
`email*, website(honeypot)`. Re-subscribe is idempotent (`200`). A new (or returning) subscriber is sent a welcome e-mail containing the unsubscribe link; repeat sign-ups of an active address send nothing.

### Newsletter unsubscribe — `POST /newsletter/unsubscribe` (`throttle:forms`)
`token*` — the 64-character alphanumeric `unsubscribe_token`. Idempotent (`200`, first `unsubscribed_at` is kept). Malformed token → `422`; unknown token → `404` (generic message). The link in e-mails is `{FRONTEND_URL}/unsubscribe?token=…`; the SPA page asks for a confirmation click and then calls this endpoint (it must **not** unsubscribe on page load, because mail scanners prefetch links). The admin subscribers CSV export includes an `Unsubscribe URL` column to merge into campaigns sent from an external tool.

### Mentorship
- `GET /mentorship/programs` → `MentorshipProgram[]` : `{ id, slug, name, tier (standard|premium), audience, summary, price: { amount, currency, unit_label, display } | null, features: string[], is_featured, cta_label }`
- `POST /mentorship/requests` : `program* (slug), name*, email*, phone?, current_role?, goal* (10–2000), consent*, website`

### Posts (articles + blog)
- `GET /posts?type=article|blog&category=<slug>&search=&page=&per_page=` → `PostSummary[]`
- `GET /posts/{slug}` → `PostDetail` (+ `related: PostSummary[3]`) — `type` tells the client the canonical URL (`/articles/:slug` or `/blog/:slug`). Used by the legacy root-slug redirect.
- `GET /post-categories?type=` → `[{ id, slug, name, type, posts_count }]`

`PostSummary`: `{ id, slug, type, title, excerpt, cover_image, cover_image_alt, category: {slug,name}|null, author: {name}, reading_minutes, published_at }`
`PostDetail` = PostSummary + `{ body_markdown, seo: Seo }`

### Testimonials — `GET /testimonials` → `[{ id, name, role, company, quote, rating, avatar }]`
### FAQs — `GET /faqs?group=about|employers|candidates` → `[{ id, group, question, answer }]`

### SEO helpers (not under /api)
- `GET /sitemap.xml` (generated from DB + static routes, using `FRONTEND_URL`) and `GET /robots.txt` served by Laravel; deploy docs route them via the web server.

`Seo` = `{ title, description, og_image }` (nullable fields; client falls back to site defaults).

## Auth endpoints
- `GET /sanctum/csrf-cookie`
- `POST /api/v1/auth/login` `{ email, password, remember? }` → `{ data: AdminUser }` · session regenerated · throttled.
- `POST /api/v1/auth/logout` · `GET /api/v1/auth/me` → `{ data: AdminUser }` (`401` if guest).
`AdminUser`: `{ id, name, email, roles: string[], permissions: string[] }`

## Admin endpoints — prefix `/api/v1/admin`, middleware `auth:sanctum` + per-permission policies

Roles: `super-admin` (everything), `editor` (content), `recruiter` (jobs, applications, inquiries, mentorship requests).
Permissions: `manage-jobs, manage-content, manage-applications, manage-inquiries, manage-users, manage-settings, view-dashboard`.

| Resource | Endpoints | Permission |
|---|---|---|
| Dashboard | `GET /dashboard` → counts (new applications, open jobs, unread inquiries, subscribers, mentorship requests), 14-day applications series, recent applications/inquiries | `view-dashboard` |
| Jobs | `apiResource /jobs` (+ `POST /jobs/{id}/duplicate`) | `manage-jobs` |
| Applications | `GET /applications` (filters: `status, job, search, date_from, date_to`), `GET /applications/{id}` (with applicant, job, events), `PATCH /applications/{id}` `{status?, notes?}` (writes event), `DELETE`, `GET /applications/{id}/resume` (authorized streamed download), `GET /applications/export` (CSV) | `manage-applications` |
| Inquiries | `GET /inquiries`, `GET/PATCH/DELETE /inquiries/{id}` (`status`: new\|read\|replied\|archived) | `manage-inquiries` |
| Mentorship requests | `GET /mentorship-requests`, `GET/PATCH/DELETE` | `manage-inquiries` |
| Mentorship programs | `apiResource /mentorship-programs` | `manage-content` |
| Posts | `apiResource /posts`, `apiResource /post-categories` | `manage-content` |
| Services | `apiResource /services` | `manage-content` |
| Testimonials | `apiResource /testimonials` | `manage-content` |
| FAQs | `apiResource /faqs` | `manage-content` |
| Subscribers | `GET /subscribers`, `DELETE`, `GET /subscribers/export` | `manage-inquiries` |
| Media | `POST /media` (image ≤4 MB, jpg/png/webp/avif, stored `public`) → `{ data: { url, path } }` | `manage-content` |
| Settings | `GET /settings` · `PUT /settings` (validated per group: company, contact, social, stats, seo) | `manage-settings` |
| Users | `apiResource /users`, `GET /roles` | `manage-users` (cannot delete/demote self or the last super-admin) |

Admin list endpoints: `page`, `per_page`, `search`, `sort` (`field` or `-field`), plus resource-specific filters. Admin resources expose all editable columns (including `status`, `is_published`, `sort_order`, SEO fields, timestamps). Content resources accept `status = draft|published` and `published_at`.

Application `status` ∈ `new | reviewing | shortlisted | interview | offered | hired | rejected`.

---

## Implementation notes (backend, added when the API was built)

Clarifications and small deviations made by the backend; the frontend should rely on these.

- **Pagination `meta`/`links`:** list endpoints return Laravel's standard resource pagination, which is a superset of the contract (`meta` also has `from`, `to`, `path`, `links`; `links` has `first/last/prev/next`). `per_page` is clamped to 1..50 (never a 422).
- **`GET /home`:** `faqs` contains the published FAQs of group `about`; `featured_jobs` are featured open jobs, topped up with the newest open jobs to reach 3.
- **`GET /post-categories?type=`:** a category without a `type` belongs to both sections and is returned for either filter.
- **Honeypot hit:** responds `201 { "data": { "id": 0, "message": "..." } }` without touching the database.
- **`POST /auth/login`:** wrong credentials → `422` with `errors.email`. Too many attempts → `429`. If the request is not "stateful" (no allowed `Origin`/`Referer`, so no session) → `400 { message }`. Always call `GET /sanctum/csrf-cookie` first.
- **`POST /auth/logout`:** returns `204 No Content`.
- **Newsletter:** `201` for a new subscriber, `200` for an existing one (an unsubscribed address is re-activated).
- **Duplicate application:** `422` with `errors.email`. Unknown / closed / unpublished `job` slug: `422` with `errors.job`.
- **Admin `GET /dashboard`** returns
  `{ data: { counts: { new_applications, open_jobs, unread_inquiries, subscribers, mentorship_requests }, applications_series: [{ date: "YYYY-MM-DD", count }] (14 entries), recent_applications: Application[5], recent_inquiries: Inquiry[5] } }`.
  Sections the signed-in role may not see are `null` (counts) or `[]` (lists).
- **Admin application detail** adds `applicant` (full profile), `job`, `cover_letter`, `notes`, `expected_salary`, `available_from`, `resume { original_name, mime, size, download_url }` and `events[{ id, type: created|status_changed|note_updated, from_status, to_status, note, user, created_at }]`.
- **Admin `PUT /settings`** accepts any subset of `company`, `contact`, `social`, `stats`, `seo`; the response is the full settings object (same shape as the public `GET /settings`).
- **Admin content flags:** jobs, posts and services use `status` (+`published_at`) and also expose a derived `is_published`; testimonials, FAQs and mentorship programs use `is_published` + `sort_order`.
- **Admin sorting/filters:** `sort=field` or `sort=-field` limited to an allow-list per resource (unknown fields are ignored). Filters: jobs `status, employment_type, work_mode, is_featured`; posts `status, type, category` (slug); services `group, status`; faqs `group, is_published`; inquiries `status, inquiry_type`; mentorship-requests `status, program`; subscribers `status=active|unsubscribed`; users `role`.
- **Table name:** job postings are stored in `job_postings` (the queue owns `jobs`); the API still uses the `jobs` URLs.
- **Moderation rules:** `403` with a descriptive `message` when deleting yourself, removing your own super-admin role, or deleting/demoting the last super-admin.
- **Local dev port:** the backend was verified on `php artisan serve --port=8001` because port 8000 was occupied on the dev machine; point the Vite proxy at whichever port Laravel runs on.
