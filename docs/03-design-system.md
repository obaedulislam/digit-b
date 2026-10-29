# Design System & Frontend Conventions

Read this before touching `/frontend`. Authoritative companions: `02-api-contract.md` (API), `PROGRESS.md` (state).

## Concept: "0 → 1 → B"
The brand line is *"Moving beyond 0 and 1 to B-coming digital."* Zero = ink black, one = warm paper, **B** = the signal-lime accent that appears at the moment something becomes real (CTA, active state, hot node). Recruitment for **retail supply-chain technology**: the visual metaphor is a **network of nodes and routes** (`NodeField`) plus a **binary ticker** (`BinaryTicker`). Tone: confident, editorial, precise — not "corporate HR template". Imagery is typographic and generative (no stock photos).

Rules of taste: lots of whitespace; huge serif headlines with one *italic* accent word (`<em>`); mono micro-labels (`Eyebrow`); one lime moment per viewport, never lime-on-paper text (use `accent-deep` for text on light); alternate `paper` / `paper-2` / `ink` sections for rhythm; hairlines (`var(--line)`) instead of heavy borders/shadows; motion is subtle (`Reveal` fade-up, hover translate) and always respects `prefers-reduced-motion`.

## Tokens (`src/styles/abstracts/_tokens.scss` is the single source)
| Group | Names |
|---|---|
| Colour (CSS var `--c-*`, Tailwind `bg-*`/`text-*`) | `ink, ink-2, ink-3, paper, paper-2, paper-3, white, muted, muted-on-ink, accent, accent-strong, accent-deep, success, warning, danger` |
| Semantic (swap inside `.is-dark`) | `--bg --fg --fg-muted --line --surface` |
| Fonts | `--ff-display` Instrument Serif (headings), `--ff-sans` Hanken Grotesk (body), `--ff-mono` JetBrains Mono (labels, digits) |
| Fluid type | `--fs-xs … --fs-5xl` (`text-xs … text-5xl`) |
| Radius | `--r-sm md lg xl pill` · Shadow `--shadow-sm md lg focus` |
| Layout | `--container-max`, `--gutter`, `--section-y`, `--header-h`; breakpoints `sm 640 md 768 lg 1024 xl 1280 2xl 1536` (mixins `up('md')`, `down('md')`) |

## Styling rules (strict)
1. **SCSS partials only.** One partial per component/page. Page partials already exist in `src/styles/pages/` (`_home, _about, _services, _mentorship, _contact, _apply, _jobs, _posts, _legal`) and are registered; **put your page's components inside your page's partial** (or create `components/_x.scss` and `@use` it from your page partial — do **not** edit `main.scss`).
2. **BEM**, always: `block`, `block__element`, `block--modifier`, state as `is-*`. No nesting deeper than one element level (`card__title`, never `card__body__title`). Page-scoped blocks are prefixed by the feature (`job-card`, `post-card`, `home-hero`).
3. **Tailwind via `@apply` inside SCSS** (`@apply flex items-center gap-3 rounded-lg`). Almost no utility classes in JSX (an occasional `sr-only` is fine). Use tokens (`bg-ink`, `text-accent-deep`, `rounded-pill`, `font-mono`), not raw hex.
4. Every partial starts with `@use '../abstracts' as *;` (gives `color()`, `radius()`, mixins `up() down() focus-ring dark-surface motion-safe line-clamp visually-hidden`). Do **not** add `@reference` to partials.
5. Responsive: mobile-first, use `@include up('md') { … }`. Test at **390**, 768 and 1280 widths.
6. Mantine components are for behaviour/a11y; their look comes from the BEM classNames wired in `src/theme/mantine.js` and styled in `components/_forms.scss`, `_disclosure.scss`, etc. To style a *new* Mantine component, add its `classNames` to the theme and import its `*.layer.css` in `styles/vendors/mantine-public.css` (public) or `mantine-admin.css` (admin).
7. JSX stays semantic and thin: landmarks, one `<h1>` per page, headings in order, labels on every input, `aria-*` where needed, visible focus (global ring), images with `alt`, no `div` buttons.
8. **After a build, always inspect the CSS** — a green build can still leave raw `@apply`. (`npm run build`, then check `dist/assets/*.css`.)

## Component catalogue (`@/components/ui/*`)
`Button` (`variant` primary|accent|secondary|ghost|light|danger, `size` sm|lg, `to`/`href`/onClick, `arrow`, `loading`, `block`) · `Container` (`narrow`) · `Section` (`tone` paper|paper-2|white|ink) · `SectionHeader` (`eyebrow index title lead align actions`; `title` can contain `<em>`) · `Eyebrow` · `Badge` (`tone` neutral|accent|ink|soft|success|danger|warning) · `PageHero` (`eyebrow title lead crumbs actions seed`) · `Reveal` (fade-up; wrap blocks) · `NodeField` (generative art) · `BinaryTicker` · `BitText` (**wrap any copy containing standalone 0/1 so digits render in mono**) · `CoverImage` (image with generated fallback — use for every post/service/job image) · `Markdown` (sanitised markdown → HTML) · `Pager` (bound to API `meta`) · `EmptyState` / `ErrorState` / `CardSkeletons` / `TextSkeleton` · `FormAlert` + `Honeypot` · `Seo` (title, description, path, image, type, jsonLd, noindex).
Layout: `SiteLayout` (header/footer/skip-link), `NewsletterForm` (reusable on any page).
Hooks/lib: `useSettings()` (company/contact/social/stats — **never hardcode contact data**), `telHref`, `useFormSubmit(form, {mutationFn, successMessage, onSuccess})` (maps Laravel 422 → Mantine form errors, form-level error text, success toast), `publicApi` + `queries.*` (`@/api/public`), `parseApiError`, `formatDate/timeAgo/pluralize/pad2`.

## Page checklist (every public page)
`<Seo title description path …/>` · one `<h1>` · loading → `CardSkeletons`/`TextSkeleton`, error → `ErrorState onRetry={refetch}`, empty → `EmptyState` · forms: Mantine `useForm` + `useFormSubmit`, client validation mirrors the contract rules, field errors inline, form-level `FormAlert`, submit button `loading`, success state (not just a toast), `Honeypot`, consent checkbox linking to `/privacy` · lists: URL-synced filters (`useSearchParams`) so pages are shareable/back-button friendly, debounced search (`useDebouncedValue` from `@mantine/hooks`), `Pager` · wrap sections in `Reveal` (not every element) · no dead links, no lorem ipsum, no mock data.

## Tooling
- Dev: `npm run dev` (http://localhost:5173, proxies `/api /sanctum /storage` to Laravel on :8000). Build: `npm run build`. Lint: `npm run lint`. Tests: `npm test`.
- Visual/behaviour check with a real browser (uses system Chrome via puppeteer-core):
  `node scripts/browser-check.mjs http://localhost:5173/<path> <width> <height> .shots/<name> [--full] [--drawer]`
  Prints horizontal-overflow and console errors, writes `.shots/<name>.png` (view it with the Read tool). Always check 390 and 1280.
- Do not use shell heredocs to write files containing backticks (use the Write/Edit tools).
