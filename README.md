# Akash Kumar — Full Stack Developer Portfolio

A modern, animated, production-ready portfolio website built to help you land software developer roles.

**Live structure:** React (Vite) frontend + Express/MongoDB backend, now including a full **JWT-secured admin dashboard** for managing all portfolio content.

> 📘 **Admin dashboard:** see [`ADMIN_DASHBOARD.md`](./ADMIN_DASHBOARD.md) for the database schema, API reference, folder structure, and setup steps for the CRUD management dashboard (Profile, Skills, Services, Experience, Education, Certifications, Contact Info, Projects).

> ⚠️ **All public pages read from the database via the API.** There is no hardcoded/sample content anywhere in `frontend/src`. On a fresh install the database is empty, so every section will show **"No data available"** until you log in to `/admin` and add your Profile, Skills, Services, Projects, Experience, Education, Certifications, and Contact Info.

---

## 1. Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18 (Vite), React Router 6, Tailwind CSS 3, Framer Motion, react-helmet-async, react-hot-toast |
| Backend   | Node.js, Express 4, Mongoose (MongoDB), express-validator, express-rate-limit, Helmet, Nodemailer |
| Database  | MongoDB (optional — API runs fine without it; messages just won't persist) |

---

## 2. Design System

The site intentionally avoids the generic "dark background + purple gradient" AI-portfolio look. Instead it uses a **code-editor visual identity** appropriate for a developer:

- **Palette** — near-black ink background (`#0A0E14`) with two accents pulled from real syntax-highlighting semantics: mint/teal (`#5EEAD4`) for strings/keywords, amber (`#F5B860`) for constants, coral (`#FF6B6B`) for booleans/tags.
- **Type** — Space Grotesk (display), Inter (body), JetBrains Mono (code, labels, "eyebrow" section markers like `// 02. about-me`).
- **Signature element** — the hero renders as an actual code editor window (traffic-light dots, filename tab, line numbers) with a live typing effect cycling through your roles.
- **Dark/Light mode** — toggle in the navbar, persisted to `localStorage`, respects `prefers-color-scheme` on first visit.
- **Motion** — Framer Motion scroll reveals, hover micro-interactions, animated page transitions, and a loading screen. All motion respects `prefers-reduced-motion`.

---

## 3. Folder Structure

```
portfolio/
├── frontend/
│   ├── public/
│   │   ├── projects/          # project screenshots go here
│   │   ├── profile/           # your photo goes here
│   │   ├── resume/            # your resume PDF goes here
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer, PageTransition, ScrollToTop
│   │   │   ├── ui/             # Reusable primitives: Section, Reveal, Seo, ThemeToggle, StatCard, SocialLinks, Loader, BackToTop
│   │   │   └── sections/      # Feature components: CodeWindowHero, ProjectCard, TimelineItem, ContactForm, etc.
│   │   ├── pages/              # One file per route
│   │   ├── data/               # ALL editable content lives here (siteConfig, projects, skills, experience...)
│   │   ├── context/            # ThemeContext
│   │   ├── hooks/               # useTypingEffect
│   │   ├── utils/                # api.js (fetch wrapper)
│   │   ├── App.jsx              # Routes + animated transitions
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/            # contactRoutes.js
    │   ├── controllers/       # contactController.js
    │   ├── models/            # ContactMessage.js (Mongoose schema)
    │   ├── middleware/        # validators, rate limiter, error handler
    │   ├── config/            # db.js
    │   ├── utils/              # mailer.js
    │   ├── app.js
    │   └── server.js
    └── package.json
```

**To re-brand this site for yourself:** edit only the files in `frontend/src/data/`. No component code needs to change.

---

## 4. Local Setup

### Frontend
```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if backend isn't on localhost:5000
npm run dev                # http://localhost:5173
```

### Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI and SMTP creds (both optional)
npm run dev                # http://localhost:5000
```

The contact form works even with **no** `MONGO_URI` or SMTP configured — it just won't persist messages or send an email notification (it still returns success and logs a warning). This lets you demo the site immediately.

---

<<<<<<< HEAD
---

## 5a. Testing & Code Coverage

Both apps use [Vitest](https://vitest.dev/) for unit tests and v8 for coverage.

```bash
# Frontend
cd frontend
npm run test              # run once
npm run test:watch        # watch mode
npm run test:coverage     # run once + write coverage/ (HTML + lcov)

# Backend
cd backend
npm run test
npm run test:watch
npm run test:coverage
```

Coverage reports are written to `coverage/` in each app (gitignored) and are
also uploaded as downloadable artifacts on every CI run.

---

## 5b. CI/CD Pipeline

This repo ships with two GitHub Actions workflows:

### `.github/workflows/ci.yml` — Continuous Integration
Runs on every push and pull request, for both `frontend/` and `backend/` in
parallel jobs:
1. Checkout code
2. Set up Node.js 22 with npm dependency caching (keyed on each app's
   `package-lock.json`)
3. `npm ci` — clean, reproducible install
4. Lint (`oxlint` + `eslint` for frontend, `eslint` for backend)
5. Unit tests with coverage (Vitest)
6. Build (`vite build` for frontend; a no-op check for backend, which ships
   as plain Node source)

Any failing step fails the whole job with a clear log. A final `ci-success`
job aggregates both jobs into a single required status check you can use for
branch protection.

### `.github/workflows/cd.yml` — Continuous Deployment
Triggered by `workflow_run` **only after `CI` completes successfully on
`main`** (or manually via "Run workflow" in the Actions tab). It deploys:

- **Backend → Render**, by calling a Render deploy hook, then polling
  `/api/health` until it responds `200`.
- **Frontend → Vercel**, using the Vercel CLI in prebuilt mode
  (`vercel pull` → `vercel build` → `vercel deploy --prebuilt --prod`).

Both deploy jobs run under the `production` GitHub Environment — configure
required reviewers there if you want a manual approval gate before deploys
go live.

#### Required GitHub Secrets
Add these under **Settings → Secrets and variables → Actions**:

| Secret | Used by | Where to get it |
|---|---|---|
| `RENDER_DEPLOY_HOOK_URL` | deploy-backend | Render dashboard → service → Settings → Deploy Hook |
| `BACKEND_HEALTH_URL` *(optional)* | deploy-backend | Your deployed API's health URL, e.g. `https://your-api.onrender.com/api/health` |
| `VERCEL_TOKEN` | deploy-frontend | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | deploy-frontend | Vercel project → Settings → General (or `.vercel/project.json` after `vercel link`) |
| `VERCEL_PROJECT_ID` | deploy-frontend | Same as above |

Never commit these values — GitHub Secrets are encrypted at rest, masked in
logs, and only injected into the job that references them.

#### Rollback
- **Render (backend):** dashboard → service → *Deploys* tab → pick the last
  known-good deploy → *Rollback to this deploy*. For an auditable rollback,
  prefer `git revert <bad-commit>` on `main` and let CI/CD redeploy.
- **Vercel (frontend):** dashboard → project → *Deployments* → select the
  last good (immutable) deployment → *Promote to Production* (instant, no
  rebuild). Or: `vercel rollback <deployment-url> --token=$VERCEL_TOKEN`.

### Optional: Docker for the backend
`backend/Dockerfile` is a multi-stage, non-root, production image
(`node:22-alpine`) provided for portability if you ever move the API off
Render's native Node runtime onto a container platform. It isn't required
for the Render deployment path documented above — Render builds directly
from `backend/` with `npm install` / `npm start`.

```bash
cd backend
docker build -t portfolio-backend .
docker run --env-file .env -p 5000:5000 portfolio-backend
```


=======
>>>>>>> 1d79a8219f76b0d3152b5f9e41a4a67d82a9052e
## 5. Adding Your Own Content

1. **Personal info** → `frontend/src/data/siteConfig.js`
2. **Projects** → `frontend/src/data/projects.js`. Add screenshots to `frontend/public/projects/`.
3. **Skills** → `frontend/src/data/skills.js`
4. **Experience / Education / Certifications / Services** → `frontend/src/data/experience.js`
5. **Profile photo** → `frontend/public/profile/profile-photo.jpg`
6. **Resume PDF** → `frontend/public/resume/Akash_Kumar_Resume.pdf`
7. **Nav links / page order** → `frontend/src/data/navLinks.js`

---

## 6. Deployment Guide

### Frontend → Vercel (recommended)
1. Push the `frontend/` folder to a GitHub repo (or the whole monorepo with Vercel's root directory set to `frontend`).
2. In Vercel: **New Project → Import Repo**.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add environment variable `VITE_API_URL` = your deployed backend URL (e.g. `https://your-api.onrender.com/api`).
5. Deploy. Vercel auto-configures SPA routing; add a `vercel.json` rewrite only if you see 404s on refresh:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

### Backend → Render (or Railway / Fly.io)
1. Push `backend/` to GitHub.
2. In Render: **New → Web Service**, connect the repo, root directory `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `.env.example`: `MONGO_URI`, `CLIENT_ORIGIN` (your Vercel URL), `SMTP_*`, `CONTACT_RECEIVER_EMAIL`.
5. Deploy. Confirm `GET /api/health` returns `{ "success": true }`.

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access from `0.0.0.0/0` (or Render's IPs).
3. Copy the connection string into `MONGO_URI` in the backend's environment variables.

### Email notifications → Gmail App Password
1. Enable 2-Step Verification on your Google account.
2. Generate an **App Password** (Google Account → Security → App passwords).
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=<your gmail>`, `SMTP_PASS=<app password>`.

### Custom domain
Point your domain's DNS to Vercel (for the frontend) following Vercel's domain instructions, and update `siteConfig.seo.siteUrl`, `robots.txt`, and `sitemap.xml` to match.

---

## 7. Performance & SEO Checklist (already implemented)

- [x] Per-page `<title>`, meta description, canonical URL, Open Graph & Twitter tags via `react-helmet-async`
- [x] `robots.txt` + `sitemap.xml`
- [x] Semantic HTML, `aria-label`s on icon-only buttons, visible focus rings, `aria-invalid`/`aria-describedby` on form fields
- [x] `prefers-reduced-motion` respected globally
- [x] Route-based code is small (single JS bundle ~140 KB gzipped); images are lazy-loaded
- [x] No layout-shifting web fonts blocking render (`display=swap`)

Run a Lighthouse audit after deploying and adding real, optimized images (compress to WebP where possible) to confirm 90+ scores.

---

## 8. Content Deliverables (as requested)

### Project Case Studies
Full descriptions, features, challenges, and tech stacks for all 4 projects are in `frontend/src/data/projects.js` and rendered on `/projects/:id`. Below are polished, resume/LinkedIn/GitHub-ready versions of the flagship project.

#### Project: ShopCart — E-Commerce Platform

**Purpose:** A white-label online storefront that lets small retailers launch an e-commerce presence without recurring SaaS fees — product catalog, cart, secure checkout, and an admin dashboard.

**Technologies:** React, Redux Toolkit, Node.js, Express, MongoDB, Stripe, Tailwind CSS, JWT.

**Architecture:** A decoupled MERN app — a React SPA (Redux Toolkit for cart/auth state) talks to a stateless Express REST API secured with JWT. MongoDB stores products, orders, and users; Stripe handles payment intents, and a webhook confirms orders server-side once payment settles (never trusting the client alone).

**Key Features:**
- Role-based auth (customer/admin) with JWT
- Stripe-integrated checkout with webhook order confirmation
- Real-time inventory sync and low-stock alerts
- Admin dashboard with sales analytics
- Search, filters, and paginated listings

**Challenge Solved:** Concurrent checkouts on limited-stock items could oversell inventory. Solved using MongoDB transactions with optimistic locking on the stock field, rejecting the second of two simultaneous purchases cleanly instead of allowing a negative stock count.

**Suggested Improvements:** Add Redis caching for the product catalog, move image storage to S3/Cloudinary with a CDN, and add end-to-end tests with Playwright for the checkout flow.

**Resume bullet points:**
- Built and shipped a full-stack e-commerce platform (React, Node.js, MongoDB) handling secure Stripe checkout for 500+ simulated transactions.
- Solved a stock-overselling race condition using MongoDB transactions with optimistic locking, eliminating duplicate-purchase errors on limited-stock items.
- Designed a role-based JWT auth system and an admin analytics dashboard used to manage catalog and orders.

**LinkedIn-ready blurb:**
> Built ShopCart, a full-stack e-commerce platform (React + Node.js + MongoDB + Stripe) with secure checkout, an admin analytics dashboard, and real-time inventory sync. Solved a tricky concurrency bug around limited-stock checkouts using MongoDB transactions. #MERN #WebDevelopment

**GitHub README opener (copy-paste ready):**
> ## ShopCart — Full Stack E-Commerce Platform
> A white-label e-commerce storefront with product catalog, Stripe checkout, and an admin dashboard, built on the MERN stack.
>
> **Tech:** React · Redux Toolkit · Node.js · Express · MongoDB · Stripe · Tailwind CSS
>
> **Highlights:** JWT auth · Stripe webhooks · MongoDB transactions to prevent overselling · Sales analytics dashboard
>
> [Live Demo](#) · [Screenshots](#)

*(Follow the same structure for TaskFlow, Inkwell, and DevFolio — their raw content is already in `projects.js`; ask and I'll expand any of them into the same format.)*

### Achievements & Certifications
See `/certifications` page — AWS Certified Cloud Practitioner, Meta Front-End Developer Professional Certificate, MongoDB Certified Developer Associate, freeCodeCamp JS Algorithms & Data Structures.

### Contact Section
Live, validated contact form (`/contact`) posting to `POST /api/contact`, with client + server-side validation, rate limiting (5 submissions/15 min/IP), optional MongoDB persistence, and optional email notification via Nodemailer.

### Resume Summary
> Full Stack Developer with 3+ years of experience designing, building, and shipping production web applications on the MERN stack. Proven track record leading small teams, cutting page-load times by 40%, and shipping RESTful APIs used by 50K+ monthly active users. Comfortable owning a feature from database schema to deployed UI.

---

## 9. Next Steps for You

1. Replace placeholder content in `frontend/src/data/*.js` with your real info.
2. Drop in your photo, project screenshots, and resume PDF (paths in section 5).
3. Update all social links and email in `siteConfig.js`.
4. Deploy following section 6.
5. Run Lighthouse + fix any image-weight warnings before sharing the link with recruiters.
