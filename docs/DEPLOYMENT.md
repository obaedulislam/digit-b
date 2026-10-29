# Deployment Guide

Target: a single Linux VPS (Ubuntu 22.04/24.04) running **nginx + php-fpm 8.3 + MySQL 8**, with the SPA and the API on **one origin** (`https://digit-b.com`). Everything below also applies to other hosts; adjust paths.

> `backend/README.md` has the API-level checklist, queue/cron/supervisor snippets and security notes. This document covers how the pieces fit together in production.

## 1. Architecture (recommended: one origin)

```
Browser ── https://digit-b.com ──► nginx
                                    ├─ /                → frontend/dist (static SPA, index.html fallback)
                                    ├─ /assets/*        → static, immutable cache
                                    ├─ /api/*           → php-fpm → backend/public/index.php
                                    ├─ /sanctum/*       → php-fpm  (CSRF cookie)
                                    ├─ /sitemap.xml, /robots.txt → php-fpm (generated from the DB)
                                    └─ /storage/*       → backend/storage/app/public (admin-uploaded images)
```

Why one origin: the admin session is an **HttpOnly Sanctum cookie** (no tokens in JavaScript). Same-origin removes CORS, third-party-cookie and `SameSite` problems. A split `api.` sub-domain also works — see `backend/README.md` "Cookie / SPA auth".

Résumés are **not** under `/storage`: they live in `backend/storage/app/private/` and are only downloadable through the authenticated, permission-checked admin endpoint.

## 2. Server prerequisites

```bash
sudo apt install nginx mysql-server php8.3-fpm php8.3-{mysql,mbstring,xml,curl,zip,intl,gd,sqlite3} composer supervisor
# Node is needed only on the build machine (CI or your laptop): Node 20+
```
Enable OPcache in `php.ini` (`opcache.enable=1`, `opcache.validate_timestamps=0` in production) — it is the single biggest PHP speed-up.

Create the database and a least-privilege user:
```sql
CREATE DATABASE digit_b CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'digitb'@'localhost' IDENTIFIED BY '<strong-password>';
GRANT ALL PRIVILEGES ON digit_b.* TO 'digitb'@'localhost';
```

## 3. Build and release

```bash
# --- frontend (build machine) ---
cd frontend
npm ci
echo "VITE_SITE_URL=https://digit-b.com" > .env.production.local   # canonical URLs / OG tags
npm run build
grep -c "@apply" dist/assets/*.css        # must print 0 for every file
rsync -a --delete dist/ deploy@server:/var/www/digit-b/frontend/dist/

# --- backend (server) ---
cd /var/www/digit-b/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env && nano .env         # see §4
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force               # first deploy only (see §7)
php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan event:cache && php artisan view:cache
php artisan queue:restart                 # on every later deploy
sudo chown -R www-data:www-data storage bootstrap/cache
```

Order on later releases: put new `dist/` in place → `composer install` → `php artisan migrate --force` → re-cache → `queue:restart`. Keep the previous `dist/` and `vendor/` for a quick rollback; migrations are forward-only, so take a DB backup first.

## 4. Production `.env` (backend)

| Key | Value |
|---|---|
| `APP_ENV` / `APP_DEBUG` | `production` / `false` (**never** `true`: it exposes stack traces) |
| `APP_URL` / `FRONTEND_URL` | `https://digit-b.com` |
| `DB_*` | the least-privilege user above |
| `SANCTUM_STATEFUL_DOMAINS` | `digit-b.com,www.digit-b.com` |
| `SESSION_DOMAIN` | empty (same origin) |
| `SESSION_SECURE_COOKIE` | `true` |
| `SESSION_SAME_SITE` | `lax` |
| `CORS_ALLOWED_ORIGINS` | `https://digit-b.com` (not needed for same origin, keep tight) |
| `QUEUE_CONNECTION` | `database` + supervisor worker (`backend/README.md`) |
| `MAIL_*`, `NOTIFICATION_EMAIL` | real SMTP (Postmark, SES, …); without it nobody is notified of applications |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | the first super-admin; **change the password after first login** |
| `LOG_LEVEL` | `warning` |

Secrets live only in `backend/.env` (git-ignored, mode `600`). The frontend has **no** secrets: only `VITE_*` values, which are public by design.

## 5. nginx (single origin)

```nginx
server {
    listen 80;
    server_name digit-b.com www.digit-b.com;
    return 301 https://digit-b.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digit-b.com;
    # ssl_certificate / ssl_certificate_key: certbot (--nginx) manages these

    root /var/www/digit-b/frontend/dist;
    index index.html;
    client_max_body_size 8m;                 # résumés are limited to 5 MB by the API

    # ---- security headers for the SPA shell ----
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # Fonts are self-hosted; Mantine injects a <style> tag for CSS variables, hence 'unsafe-inline' for styles only.
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # ---- hashed build assets: cache forever ----
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    # ---- API, CSRF cookie, crawler files -> Laravel (php-fpm) ----
    location ~ ^/(api|sanctum)/ { include snippets/digit-b-php.conf; }
    location = /sitemap.xml     { include snippets/digit-b-php.conf; }
    location = /robots.txt      { include snippets/digit-b-php.conf; }

    # ---- admin-uploaded images (public disk) ----
    location /storage/ {
        alias /var/www/digit-b/backend/storage/app/public/;
        add_header Cache-Control "public, max-age=2592000";
        add_header X-Content-Type-Options nosniff always;
        try_files $uri =404;
    }

    # ---- SPA: everything else falls back to index.html (never cache the shell) ----
    location / {
        add_header Cache-Control "no-cache";
        # headers set here replace those inherited from the server block, so repeat the important ones
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
        try_files $uri /index.html;
    }

    location ~ /\.(?!well-known) { deny all; }
}
```

`/etc/nginx/snippets/digit-b-php.conf`:
```nginx
include fastcgi_params;
fastcgi_pass unix:/run/php/php8.3-fpm.sock;
fastcgi_param SCRIPT_FILENAME /var/www/digit-b/backend/public/index.php;
fastcgi_param SCRIPT_NAME /index.php;
fastcgi_read_timeout 30s;
```

Note: nginx drops inherited `add_header` directives in any block that defines its own — that is why `location /` repeats the key headers. Verify with `curl -sI https://digit-b.com/ | grep -i -E 'content-security|x-frame|strict'`.

Reverse proxy / CDN in front (Cloudflare, a load balancer)? Laravel then sees the proxy's IP, which breaks **per-IP rate limiting** and the IP stored with consent records. Configure trusted proxies in `backend/bootstrap/app.php` (`$middleware->trustProxies(at: [...])`) and forward `X-Forwarded-For` / `X-Forwarded-Proto`.

## 6. Post-deploy verification

```bash
curl -s https://digit-b.com/api/v1/settings | head -c 200          # JSON, 200
curl -sI https://digit-b.com/sitemap.xml | head -1                   # 200, application/xml
curl -s  https://digit-b.com/robots.txt                              # points at the sitemap
curl -sI https://digit-b.com/vacancies | head -1                     # 200 (SPA fallback)
curl -s -o /dev/null -w "%{http_code}\n" https://digit-b.com/api/v1/admin/dashboard   # 401 (guests)
curl -s -o /dev/null -w "%{http_code}\n" https://digit-b.com/.env                    # not 200
curl -s -o /dev/null -w "%{http_code}\n" https://digit-b.com/storage/../.env         # not 200
```
**Untested assumption:** the Content-Security-Policy in §5 was written for this stack (self-hosted fonts, Mantine's inline `<style>`, no third-party scripts) but has not been exercised on a live HTTPS deployment. Open DevTools on `/`, `/vacancies`, `/apply` and `/admin` first and confirm there are **no CSP violations** in the console; loosen only the specific directive that a violation names.

Then by hand: submit the contact form, the newsletter and an application (with a PDF); confirm they appear in `/admin`, the notification e-mail arrives, the résumé downloads **only** when logged in, and `/api/v1/*` JSON errors never show stack traces. Run Lighthouse (mobile) on `/`, `/vacancies` and a job page.

## 7. Content and launch checklist

- [ ] `ADMIN_PASSWORD` rotated; demo users do not exist (`APP_ENV=production` skips them).
- [ ] **Settings** (admin → Settings): real address, phone, email, hours, social URLs, stats, SEO defaults. These feed the whole site, the footer and the sitemap.
- [ ] **Review seeded launch content** — it is placeholder-quality in places: jobs (Dhaka / Ireland, USD assumed), mentorship **prices** (`$9.82`, `$7.25`, `$9,500`, `$15,000` carried over from the old site and likely template leftovers), testimonials (names from the old site, quotes written as placeholders), the "Most popular" flag, About-page founder wording.
- [ ] **Privacy / Terms reviewed by counsel** (retention periods, processors and governing law in the draft were not supplied by the client).
- [ ] Real SMTP + queue worker running (`supervisorctl status`).
- [ ] Backups scheduled: nightly `mysqldump` **and** `backend/storage/app/private` (résumés); test a restore.
- [ ] HTTPS certificate auto-renewal (`certbot renew --dry-run`).
- [ ] Submit `https://digit-b.com/sitemap.xml` to Google Search Console; add 301s at the web server only if you need them beyond the built-in client redirects (see §8).
- [ ] Uptime check on `/up` (Laravel health) and on the home page.
- [ ] Logs: `storage/logs/laravel.log` rotated (logrotate) and watched.

## 8. SEO

- **Metadata:** every page sets its title, description, canonical, Open Graph and JSON-LD (`Organization`, `JobPosting`, `Article`/`BlogPosting`, `Service`, breadcrumbs). Google renders JavaScript and reads these.
- **Sitemap / robots:** generated by Laravel from the database using `FRONTEND_URL`, so new jobs and posts appear automatically.
- **Legacy URLs:** the old WordPress paths are handled by client-side redirects (they return `200` + redirect in the browser, not a server `301`). For link-equity-sensitive migration add server-side 301s in nginx for the high-value ones, for example:
  ```nginx
  location = /about-us/        { return 301 /about; }
  location = /contact-us/      { return 301 /contact; }
  location = /apply-now/       { return 301 /apply; }
  location ^~ /eazyrecruitz_jobs/ { rewrite ^/eazyrecruitz_jobs/(.*?)/?$ /vacancies/$1 permanent; }
  ```
- **Known gap — link previews:** LinkedIn/Facebook/X scrapers do **not** execute JavaScript, so shared job/article links show the generic site preview. Options, cheapest first: (1) a prerender service for crawler user-agents; (2) an nginx `map` on `$http_user_agent` that proxies bot requests for `/vacancies/*` and `/articles/*` to a small Laravel route returning HTML with the right `<meta>` tags; (3) migrate the frontend to SSR (React Router framework mode). This is the one real limitation of choosing a client-rendered SPA.

## 9. Performance

- Build output is code-split per route; the admin app and its CSS load only on `/admin`. Fonts are self-hosted WOFF2 with `font-display: swap`.
- Public API GETs currently carry `Cache-Control: no-store`. If traffic warrants it, cache them in nginx with `fastcgi_cache` (keyed on URI, ~30–60 s) and purge on admin writes, or put a CDN in front for `/assets` and `/storage`. Do **not** cache `/api/v1/admin/*`, `/api/v1/auth/*` or anything carrying a session cookie.
- Local development is slower than production: `php artisan serve` is single-threaded on Windows and OPcache is usually off in Laragon's CLI PHP.

## 10. Operations

- **Logs:** application `storage/logs/laravel.log`; nginx `error.log`; queue `/var/log/digit-b-queue.log`.
- **Rollback:** switch the `dist/` symlink / rsync the previous build; for the API redeploy the previous release and, only if a migration must be reverted, restore the pre-deploy DB backup.
- **Updates:** `composer audit` and `npm audit` monthly; keep PHP, nginx and MySQL patched.
- **Data protection:** applications and inquiries are personal data. Restrict admin accounts to people who need them (roles: `recruiter`, `editor`, `super-admin`), and delete data according to the retention periods in the (reviewed) Privacy policy.
