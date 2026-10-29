# Phase 1 — Audit & URL Inventory of https://digit-b.com/

Audited 2026-10-29. The site is a WordPress install using the **Eazyrecruitz** theme (CPTs `eazyrecruitz_jobs`, `eazyrecruitz_service`, `eazy_testimonials`). Mailchimp for WP shortcode `[mc4wp_form id="1128"]` is unrendered everywhere.

`robots.txt`: `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php`, `Sitemap: https://digit-b.com/wp-sitemap.xml`.

## URL inventory (from sitemaps + crawl)

### Pages (11)
| Old URL | Content | New route |
|---|---|---|
| `/` | Home (13 sections) | `/` |
| `/about-us/` | Mission, reasons, plan, specialties, FAQ | `/about` |
| `/contact-us/` | Contact info, offices, form | `/contact` |
| `/apply-now/` | 3-step form (basic info, qualification, work status) | `/apply` |
| `/vacancies/` | 6 job listings, no filters | `/vacancies` |
| `/articles/` | 3 "Latest News" posts | `/articles` |
| `/blog/` | 4 posts | `/blog` |
| `/mentorship/` | Empty (no programme content) | `/mentorship` |
| `/temporary-staffing/` | Service page (placeholder copy) | `/services/temporary-staffing` |
| `/direct-hire/` | Service page (placeholder copy) | `/services/direct-hire` |
| `/coming-soon/` | Title only | dropped (404) |

### Posts (4)
| Old URL | Category | New route |
|---|---|---|
| `/why-hiring-great-tech-talent-is-harder-than-ever-and-what-actually-works/` | Latest News | `/articles/why-hiring-great-tech-talent-is-harder-than-ever-and-what-actually-works` |
| `/what-tech-candidates-really-look-for-in-2025-hint-its-not-just-salary/` | Latest News | `/articles/what-tech-candidates-really-look-for-in-2025-hint-its-not-just-salary` |
| `/why-specialized-tech-recruiters-make-a-real-difference/` | Latest News | `/articles/why-specialized-tech-recruiters-make-a-real-difference` |
| `/common-hiring-mistakes-tech-companies-dont-realize-theyre-making/` | Our Blog | `/blog/common-hiring-mistakes-tech-companies-dont-realize-theyre-making` |

Categories: `/category/latest-news/`, `/category/our-blog/`.

### Jobs (7) — CPT `eazyrecruitz_jobs`
`software-engineer-2` (Full Time, Dhaka) · `accountant` (Dhaka) · `manager` (Contract to Hire, Dhaka, 30000-40000, 2-3 yrs) · `sqa-engineer` (Contract, Dhaka, 20000-30000) · `software-engineer` (Contract to Hire, County Wexford IE, $85-90k, 3-5 yrs, ref 2019ER) · `project-manager` (Direct Hire, County Wexford IE, $85-90k) · `people-manager-4` (unlisted).
Job categories (`/jobs_cat/`): contract, contract-to-hire, direct-hire, full-time → modelled as `employment_type`.
New route pattern: `/vacancies/:slug`.

### Services (16) — CPT `eazyrecruitz_service`
Real: temporary, direct-hire, contract, payrolling, training, executive-search, certified-company.
Template filler: save-your-money-2, application-screening-scheduling-2, employee-on-boarding-checklist-2, take-care-of-employees-benefits-2, temporary-2, direct-hire-2, contract-2, semper-sceleris, broad-network-2-2.
Homepage "Solutions": Talent Acquisition, Intelligence & Consultation, Talent Sourcing, Candidate Matching, Recruitment Solutions, Executive Search.
→ Consolidated into one `services` table; routes `/services` and `/services/:slug`.

### Testimonials (5)
john-wick, david-lee, emily-davis, michael-thompson, jessica-brown (shown on Home: Jessica Brown, Michael Thompson, Emily Davis).

## Homepage sections (13)
1 Hero (3 slides, CTAs → apply-now) · 2 Mission "Driving Innovation with the Right Talent" · 3 Why Choose Us (4 pillars) · 4 Video (`staffing-video.mp4`) · 5 Our Clients (empty) · 6 Testimonials · 7 Solutions (6) · 8 Mentorship tabs Standard/Premium (4 plans) · 9 Job Vacancies (3) · 10 "It's Your Turn" contact cards · 11 Contact form ("What are you looking for?") · 12 Featured news (3) · 13 Newsletter.

## Forms found
| Form | Live behaviour | Rebuild |
|---|---|---|
| Contact ("Send This Message") | Fields not exposed | `POST /contact` |
| Apply Now (3 steps: Basic Info, Qualification, Work Status Remote/Hybrid/In person) | Rendered as **images** | Real multi-step form + résumé upload → `POST /applications` |
| Job-detail application | Same image form | Apply from job → `POST /applications` with `job` |
| Newsletter (Mailchimp) | Shortcode unrendered | `POST /newsletter` |
| Mentorship "Get Started" | No URL | `POST /mentorship-requests` |
| Hire-page "Place a Job Order" | No form | Links to `/contact?type=hiring` |

## Content to preserve
Tagline "Moving Beyond 0 and 1 to B-coming Digital"; positioning "recruitment firm for headhunting and talent acquisition in retail supply chain tech"; 4 reasons (Deep Industry Knowledge, Tailored Recruitment, Proven Results, Dedicated Support); 3-step working style (Strategic Approach, Tailored Solutions, Collaborative Process); 4 specialties (Executive Search, Global Talent Network, Industry Expertise, Customized Recruitment); FAQ (industries, candidate fit, remote hiring, 30–45 days time-to-fill, post-placement support); "over a decade of experience"; 6 services; mentorship tracks Career Switch / First Job; footer nav (Home, About Us, Apply Now, Articles, Blog, Contact Us, Mentorship, Vacancies).

## Defects in the original (fixed in rebuild)
1. Three contradictory contact sets (Columbus OH / Chicago / Los Angeles / New Orleans / Minneapolis; 4 phone numbers; `info@example.com`).
2. Lorem-ipsum / template copy on About, service pages, job details, Contact.
3. Links to `el.commonsupport.com` (template demo domain) from Home service/pillar cards.
4. "Learn More" links to `about-us-temp`, "Drop Your CV" to `apply-now-temp`.
5. Forms are images or unrendered shortcodes; no validation, no feedback states.
6. Mentorship page empty; Home pricing features (cost accounting, project viability) unrelated to supply-chain tech.
7. No search/filter/pagination on Vacancies, Articles, Blog; articles have no excerpt, no year in dates.
8. Job pages lack description/responsibilities/requirements/benefits; "Posted 3 years ago"; inconsistent salary formats.
9. Typo "Suport"; arabic link label on Articles ("التوظيف المؤقت").
10. Footer social links are generic (`facebook.com`, `twitter.com`, `linkedin.com`).
11. ModSecurity returns 406 to non-browser clients.
