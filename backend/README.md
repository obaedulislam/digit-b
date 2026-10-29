# DIGIT-B API (Laravel)

REST API + admin back end for the DIGIT-B recruitment website. Laravel 13, PHP 8.3, MySQL 8.4, Laravel Sanctum (cookie / SPA authentication) and `spatie/laravel-permission`.

The API contract that the React frontend is built against is **[`../docs/02-api-contract.md`](../docs/02-api-contract.md)** (binding; deviations are listed at the bottom of that file).

## Requirements

- PHP 8.3+ with extensions: `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `ctype`, `json`, `tokenizer`, `xml` (tests also use `pdo_sqlite`)
- Composer 2
- MySQL 8.x (utf8mb4) – tests run on in-memory SQLite and need no database
- Web server for production (nginx + php-fpm recommended)

## Install

```bash
cd backend
composer install
cp .env.example .env          # then edit (see the table below)
php artisan key:generate
# create the database once (MySQL):
#   CREATE DATABASE digit_b CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
php artisan migrate --seed    # or: php artisan migrate:fresh --seed (DESTROYS data)
php artisan storage:link      # exposes storage/app/public at /storage
```

### What the seeder creates

| Always (every environment) | Local only (`APP_ENV=local`) |
|---|---|
| Roles + permissions (`super-admin`, `editor`, `recruiter`) | Demo users `editor@digit-b.test`, `recruiter@digit-b.test` (password `password`) |
| **Super-admin** from `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Sample applications, inquiries, mentorship request, subscribers |
| Site settings, 11 services, 7 jobs, 4 posts, testimonials, 4 mentorship programmes, FAQs | |

If `ADMIN_PASSWORD` is empty the seeder generates a random password and **prints it once** to the console. Existing accounts are never overwritten, so re-running the seeder is safe (content is upserted by slug).

## Environment variables

Everything is documented inline in [`.env.example`](.env.example). The ones that matter most:

| Variable | Purpose |
|---|---|
| `APP_ENV`, `APP_DEBUG` | `production` / `false` in production (no stack traces; JSON errors are generic) |
| `APP_URL` | Public URL of this API |
| `FRONTEND_URL` | Public URL of the React site: used by `sitemap.xml`, `robots.txt` and e-mail links |
| `DB_*` | MySQL connection (use a least-privilege user in production) |
| `SANCTUM_STATEFUL_DOMAINS` | Hosts (with port) of the SPA that get cookie sessions, e.g. `localhost:5173` locally, `digit-b.com,www.digit-b.com` in production |
| `CORS_ALLOWED_ORIGINS` | Origins allowed to call the API with credentials (`supports_credentials` is `true`) |
| `SESSION_DRIVER`, `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`, `SESSION_SAME_SITE` | Cookie session settings (see "Cookie / SPA auth" below) |
| `MAIL_*`, `NOTIFICATION_EMAIL` | `MAIL_MAILER=log` by default. `NOTIFICATION_EMAIL` receives new-application / inquiry alerts (falls back to `ADMIN_EMAIL`) |
| `QUEUE_CONNECTION` | `sync` locally; `database` in production together with a worker |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Super-admin created by the seeder |
| `RESUME_DISK`, `MEDIA_DISK` | `private` (résumés, never public) and `public` (images) |

No real credentials are tracked in the repository. `.env` is git-ignored.

### Cookie / SPA auth

Sanctum's stateful (cookie) mode is used; no bearer tokens are stored in browser JS.

1. Client calls `GET /sanctum/csrf-cookie` (sets `XSRF-TOKEN` and the session cookie).
2. Client calls `POST /api/v1/auth/login` with the `X-XSRF-TOKEN` header (axios does this automatically with `withCredentials: true`).
3. Requests are recognised as "SPA requests" through the `Origin` / `Referer` header, which must match `SANCTUM_STATEFUL_DOMAINS`.

* **Local dev:** keep `SESSION_DOMAIN` empty and let the Vite dev server proxy `/api`, `/sanctum`, `/storage` to Laravel so everything is same-origin.
* **Production, same registrable domain** (e.g. `digit-b.com` + `api.digit-b.com`): `SESSION_DOMAIN=.digit-b.com`, `SESSION_SECURE_COOKIE=true`, `SESSION_SAME_SITE=lax`, `SANCTUM_STATEFUL_DOMAINS=digit-b.com,www.digit-b.com`, `CORS_ALLOWED_ORIGINS=https://digit-b.com,https://www.digit-b.com`.
* Simplest production layout: serve the SPA and proxy `/api`, `/sanctum`, `/storage`, `/sitemap.xml`, `/robots.txt` to Laravel from the **same host**; then `SESSION_DOMAIN` can stay empty.

## Running

```bash
php artisan serve --port=8000      # API at http://localhost:8000/api/v1
```

> On the machine this was built on, port 8000 was already taken by another service (IIS / HTTP.sys), so it was verified with `--port=8001`. If you use a different port, point the Vite proxy target and `APP_URL` at it.

Useful URLs: `/api/v1/settings`, `/api/v1/home`, `/api/v1/jobs`, `/sitemap.xml`, `/robots.txt`, `/up` (health check).

### Queue and scheduler

Mailables are queueable (`ShouldQueue`, dispatched after the DB transaction commits). Mail failures are caught and logged; they never fail an HTTP request.

```bash
php artisan queue:work --tries=3 --timeout=60     # needed when QUEUE_CONNECTION=database
* * * * * cd /var/www/digit-b/backend && php artisan schedule:run >> /dev/null 2>&1   # cron
```

The scheduler prunes failed jobs and expired Sanctum tokens daily.

### Storage

* Résumés → `storage/app/private/resumes/YYYY/MM/<40 random chars>.<ext>` (private disk, **never** web-accessible; downloaded only through `GET /api/v1/admin/applications/{id}/resume`, which checks permissions).
* Admin uploads → public disk, served from `/storage/uploads/...` (requires `php artisan storage:link`).

## Tests

```bash
php artisan test            # PHPUnit, in-memory SQLite, no external services
vendor/bin/pint             # code style
```

The suite covers public listing/filters/pagination/detail, application submission (success, validation, duplicates, honeypot, bad MIME, transaction rollback, mail failure), forms and rate limits, auth (login/logout/me/throttle/session regeneration), the role/permission matrix, admin CRUD, status-change audit events, résumé download authorization, CSV export escaping, user-protection rules and the seeders.

## Endpoint index

The full request/response specification lives in [`../docs/02-api-contract.md`](../docs/02-api-contract.md). Summary:

| Area | Endpoints |
|---|---|
| Public content | `GET /settings`, `/home`, `/services`, `/services/{slug}`, `/jobs`, `/jobs/filters`, `/jobs/{slug}`, `/posts`, `/posts/{slug}`, `/post-categories`, `/mentorship/programs`, `/testimonials`, `/faqs` |
| Public forms (`throttle:forms`, honeypot `website`) | `POST /applications` (multipart), `/contact`, `/newsletter`, `/mentorship/requests` |
| Auth | `GET /sanctum/csrf-cookie`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Admin (`/admin/...`, `auth:sanctum`) | `dashboard`; `jobs` (+`POST jobs/{id}/duplicate`); `applications` (+`/export`, `/{id}/resume`); `inquiries`; `mentorship-requests`; `mentorship-programs`; `posts`; `post-categories`; `services`; `testimonials`; `faqs`; `subscribers` (+`/export`); `media`; `settings`; `users`; `roles` |
| Crawlers (outside `/api`) | `GET /sitemap.xml`, `GET /robots.txt` |

Roles: `super-admin` (all), `editor` (content + dashboard), `recruiter` (jobs, applications, inquiries, mentorship requests, subscribers + dashboard).

## Code layout

```
app/Enums               backed enums (statuses, types, labels)
app/Models              Eloquent models with scopes (published/open/filter) and casts
app/Http/Controllers    thin controllers; Api/V1 (public) and Api/V1/Admin (CrudController base)
app/Http/Requests       FormRequests (public forms, Admin/*)
app/Http/Resources      API resources matching the contract shapes (Admin/* for back-office)
app/Actions             SubmitApplication (transaction), UpdateApplication (audit events)
app/Services            SiteSettings (cached key/value), Notifier (safe mail sending)
app/Support             Formatters, QueryHelpers (search/sort allow-lists), CsvExport, Access
app/Policies            ApplicationPolicy (résumé access), UserPolicy (self / last-super-admin rules)
database/seeders        launch content + roles, admin, local demo data
```

The queue's own table is `jobs`, so job postings live in `job_postings` (model `JobPosting`); the public/admin API still calls them `jobs`.

## Deployment checklist

1. `composer install --no-dev --optimize-autoloader`
2. Create `.env` from `.env.example`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, `FRONTEND_URL`, DB credentials, `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`, `SESSION_SECURE_COOKIE=true`, `SESSION_DOMAIN` (if sub-domains), `QUEUE_CONNECTION=database`, real `MAIL_*`, `NOTIFICATION_EMAIL`, `LOG_LEVEL=warning`; run `php artisan key:generate --force`.
3. `php artisan migrate --force && php artisan db:seed --force` (note the generated admin password if `ADMIN_PASSWORD` is empty, then change it).
4. `php artisan storage:link`
5. `php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache`
6. Permissions: `storage/` and `bootstrap/cache/` writable by the php-fpm user; **only `public/` is web-exposed**.
7. Cron: `* * * * * php /var/www/digit-b/backend/artisan schedule:run`
8. Supervisor for the queue worker (below).
9. HTTPS everywhere; make sure `X-Forwarded-Proto` is passed if behind a proxy (configure trusted proxies if needed).
10. Back up the database **and** `storage/app/private` (résumés).

### nginx + php-fpm (API on its own host)

```nginx
server {
    listen 443 ssl http2;
    server_name api.digit-b.com;
    root /var/www/digit-b/backend/public;
    index index.php;

    client_max_body_size 8m;               # résumés are limited to 5 MB

    location / { try_files $uri $uri/ /index.php?$query_string; }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known) { deny all; }
}
```

If the SPA host should also serve the Laravel-generated crawler files and proxy the API (recommended), add to the SPA server block:

```nginx
location ~ ^/(api|sanctum|storage)/ { proxy_pass https://api.digit-b.com; proxy_set_header Host api.digit-b.com; proxy_set_header X-Forwarded-Proto https; }
location = /sitemap.xml { proxy_pass https://api.digit-b.com/sitemap.xml; }
location = /robots.txt  { proxy_pass https://api.digit-b.com/robots.txt; }
```

### Supervisor (queue worker)

```ini
[program:digit-b-queue]
command=php /var/www/digit-b/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
user=www-data
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/digit-b-queue.log
stopwaitsecs=3600
```

Restart workers after each deploy: `php artisan queue:restart`.

## Security notes

- **Authentication:** Sanctum cookie sessions (HttpOnly, SameSite), CSRF protection through `X-XSRF-TOKEN`, session id regenerated on login and invalidated on logout, login throttled to 5/min per e-mail+IP, passwords hashed (bcrypt, 12 rounds) with a strong-password rule for admin-created users.
- **Authorization:** every admin route is behind `auth:sanctum` plus a permission gate; résumé access additionally goes through `ApplicationPolicy`. Users cannot delete themselves, remove their own super-admin role, or remove/delete the last super-admin.
- **Input:** all input goes through FormRequests; mass assignment is limited with explicit `$fillable`; list sorting is limited to allow-lists; search escapes `%`/`_` and always uses bound parameters (no user input in raw SQL).
- **Uploads:** résumés accept only `pdf/doc/docx` ≤ 5 MB, validated by sniffed MIME **and** extension, stored on the private disk under a random name (extension from the sniffed type); admin images accept `jpg/png/webp/avif` ≤ 4 MB (SVG is rejected) and are renamed randomly.
- **Spam:** honeypot field `website` (answers 201 and stores nothing) and `throttle:forms` (5/min/IP) on all public POSTs; public GETs 120/min/IP; admin API 240/min/user.
- **Errors:** all `api/*` and `sanctum/*` responses are JSON; 404/500 messages never expose model names, SQL or stack traces (`APP_DEBUG=false` in production).
- **Headers:** `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, a locked-down `Content-Security-Policy` and `Cache-Control: no-store` on API responses, HSTS over HTTPS.
- **CSV exports:** cells starting with `=`, `+`, `-`, `@`, tab or CR are prefixed with `'` to defuse spreadsheet formula injection.
- **Privacy:** consent timestamp and IP are stored with each submission; personal data (applications, inquiries) is only visible to roles with the matching permission.
- **Secrets:** nothing sensitive is committed; the seeded admin password comes from the environment or is generated and shown once.
