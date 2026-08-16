# Admin Dashboard — Documentation

A secured, JWT-authenticated admin dashboard for managing every piece of portfolio
content (Profile, Skills, Services, Experience, Education, Certifications, Contact
Information, and Projects) without touching code.

- **Frontend:** `/admin/*` routes inside the existing React app (`frontend/src/admin`)
- **Backend:** REST API under `/api/*` (`backend/src`)
- **Auth:** JWT (7-day expiry by default), bcrypt-hashed passwords, token-based
  forgot/reset password flow
- **File uploads:** Multer (disk storage), served statically from `/uploads`

---

## 1. Quick Start

### 1.1 Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD (8+ chars)
npm run seed     # creates the one admin account from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev      # starts on http://localhost:5000
```

### 1.2 Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev             # starts on http://localhost:5173
```

### 1.3 Log in

Open `http://localhost:5173/admin/login` and sign in with the `ADMIN_EMAIL` /
`ADMIN_PASSWORD` you set before running `npm run seed`.

> There is no public sign-up route — admin accounts are provisioned only via the
> seed script (or directly in MongoDB), which keeps the dashboard single-tenant
> and closed to the public by design.

---

## 2. Authentication Flow

| Route | Method | Auth | Description |
|---|---|---|---|
| `/admin/login` | UI | — | Email + password login |
| `/admin/forgot-password` | UI | — | Request a reset link (emailed via SMTP, or logged to the server console if SMTP isn't configured) |
| `/admin/reset-password/:token` | UI | — | Set a new password using the emailed token |
| `/admin/dashboard`, `/admin/skills`, … | UI | JWT required | Redirects to `/admin/login` if not authenticated |

The reset token is a random 32-byte value; only its SHA-256 hash is stored in
MongoDB with a 30-minute expiry, so a compromised database alone can't be used
to reset a password.

---

## 3. Database Schema (MongoDB / Mongoose)

All collections use Mongoose's automatic `_id`, `createdAt`, `updatedAt`.

### `User` (admin account)
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | required, bcrypt-hashed, `select: false` |
| role | String | `"admin"` |
| resetPasswordToken | String | hashed, `select: false` |
| resetPasswordExpire | Date | `select: false` |

### `Profile` (singleton — one document)
name, initials, role, tagline, bio, heroTyped[String], email, phone, location,
yearsExperience, availability, avatar (image URL), resumeUrl,
socials { github, linkedin, twitter, instagram }

### `Skill`
category, name, level (1–5), order

### `Service`
title, description, icon, featured (Boolean), order

### `Experience`
company, role, location, startDate, endDate, current (Boolean),
description, achievements[String], order

### `Education`
institution, degree, field, startDate, endDate, grade, description, order

### `Certification`
name, issuer, issueDate, expiryDate, credentialId, credentialUrl,
image (URL), order

### `ContactInfo` (singleton — one document)
email, phone, location, availability, mapUrl,
socials { github, linkedin, twitter, instagram }

### `Project`
name, category, year, image (URL), gallery[String] (URLs), description,
problem, features[String], challenges, tech[String], github, demo,
documents[{ name, url }], featured (Boolean), order

### `ContactMessage` (pre-existing — public contact form submissions)
name, email, subject, message, ip

---

## 4. API Endpoints

Base URL: `http://localhost:5000/api`. All list/detail `GET` endpoints are
public (so the API can also feed the public site later); `POST`, `PUT`,
`DELETE` require `Authorization: Bearer <token>`.

### Auth — `/auth`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` |
| GET | `/auth/me` | ✓ | — |
| POST | `/auth/forgot-password` | — | `{ email }` |
| POST | `/auth/reset-password/:token` | — | `{ password }` |
| PUT | `/auth/update-password` | ✓ | `{ currentPassword, newPassword }` |

### Profile (singleton) — `/profile`
| Method | Path | Auth |
|---|---|---|
| GET | `/profile` | — |
| PUT | `/profile` | ✓ |

### Contact Info (singleton) — `/contact-info`
| Method | Path | Auth |
|---|---|---|
| GET | `/contact-info` | — |
| PUT | `/contact-info` | ✓ |

### List resources — same shape for each of `/skills`, `/services`,
`/experience`, `/education`, `/certifications`, `/projects`:
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/<resource>` | — | Query params: `search`, `page`, `limit`, `sort`, plus per-resource filters (e.g. `?category=Frontend` on `/skills`) |
| GET | `/<resource>/:id` | — | |
| POST | `/<resource>` | ✓ | validated payload |
| PUT | `/<resource>/:id` | ✓ | validated payload |
| DELETE | `/<resource>/:id` | ✓ | |

### File uploads — `/upload`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/upload/image?type=profile\|projects\|certifications\|misc` | ✓ | multipart field `file`; images only, 5MB max; returns `{ url }` |
| POST | `/upload/file?type=documents\|projects\|misc` | ✓ | multipart field `file`; images or PDF/DOC/DOCX, 10MB max |

Uploaded files are served statically at `http://localhost:5000/uploads/<type>/<filename>`.

### Public contact form (pre-existing) — `/contact`
| Method | Path | Auth |
|---|---|---|
| POST | `/contact` | — (rate-limited, 5/15min/IP) |

### Health check
`GET /api/health` → `{ success, status: "ok", timestamp }`

**Standard response envelope** for every endpoint:
```json
{ "success": true, "message": "…", "data": { }, "errors": [] }
```

---

## 5. Folder Structure (additions)

```
backend/
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── contactInfoController.js
│   │   ├── uploadController.js
│   │   ├── skillController.js          # crudFactory(Skill, …)
│   │   ├── serviceController.js
│   │   ├── experienceController.js
│   │   ├── educationController.js
│   │   ├── certificationController.js
│   │   ├── projectController.js
│   │   └── contactController.js        # pre-existing
│   ├── middleware/
│   │   ├── auth.js                     # JWT `protect`
│   │   ├── upload.js                   # Multer config
│   │   ├── validators.js               # express-validator rule sets
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── models/                         # one file per Mongoose schema
│   ├── routes/
│   │   ├── crudRoutes.js               # buildCrudRouter() shared by 6 modules
│   │   └── …Routes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── crudFactory.js              # generic CRUD controller
│   │   ├── mailer.js
│   │   └── seedAdmin.js                # `npm run seed`
│   ├── app.js
│   └── server.js
└── uploads/                            # profile/ projects/ certifications/ documents/ misc/

frontend/
└── src/
    ├── admin/
    │   ├── api/client.js                # fetch wrapper + resourceApi()
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── AdminLayout.jsx          # sidebar + topbar shell
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── DataTable.jsx            # search + table + actions
    │   │   ├── ResourceManager.jsx      # generic list-CRUD page (config-driven)
    │   │   ├── SingletonForm.jsx        # generic form for Profile/ContactInfo
    │   │   ├── FormField.jsx
    │   │   ├── ImageUploader.jsx
    │   │   ├── MultiUploader.jsx        # project gallery + document attachments
    │   │   ├── Modal.jsx
    │   │   └── ConfirmDialog.jsx
    │   ├── pages/
    │   │   ├── Login.jsx / ForgotPassword.jsx / ResetPassword.jsx
    │   │   ├── DashboardHome.jsx
    │   │   ├── ProfilePage.jsx / ContactInfoPage.jsx
    │   │   └── SkillsPage.jsx / ServicesPage.jsx / ExperiencePage.jsx /
    │   │       EducationPage.jsx / CertificationsPage.jsx / ProjectsPage.jsx
    │   └── AdminRoutes.jsx
    └── App.jsx                          # branches to admin shell vs public site
```

**Why a `ResourceManager` instead of six near-identical pages?** Skills,
Services, Experience, Education, Certifications, and Projects are all "list of
records with search + CRUD" — the only real difference is which fields they
have. `ResourceManager` takes a small config (table columns + form fields) and
renders the full page; each module's file is ~20 lines. The backend mirrors
this with `crudFactory()` / `buildCrudRouter()`. Profile and Contact Info are
handled the same way via `SingletonForm`, since they're single-document
resources rather than lists.

---

## 6. Frontend Features Implemented

- **Responsive UI** — sidebar collapses to a slide-over drawer on mobile/tablet (Tailwind breakpoints)
- **Search & filter** — debounced search box on every list page, backed by MongoDB text-style regex search server-side
- **Form validation** — required-field checks client-side, plus server-side `express-validator` errors surfaced per-field
- **Success/error messages** — `react-hot-toast` on every create/update/delete/upload/login action
- **Image upload** — drag-free "Upload" button with live preview and remove, used for Profile photo, Certification badges, Project cover + gallery
- **Document upload** — PDF/DOC attachments for Projects
- **CRUD everywhere** — every module supports Create, Read, Update, Delete (Profile/Contact Info are read/update, being singletons by nature)

---

## 7. Security Notes

- Passwords hashed with bcrypt (10 salt rounds); never returned in API responses (`select: false`)
- JWT signed with `JWT_SECRET`; validate this is a long random string in production
- Forgot-password endpoint returns an identical response whether or not the email exists, to prevent account enumeration
- Reset tokens are single-use, hashed at rest, and expire after 30 minutes
- Uploads are filtered by extension + MIME type and capped at 5MB (images) / 10MB (documents)
- Write endpoints (`POST`/`PUT`/`DELETE`) all require a valid JWT; read endpoints are intentionally public so the API can also power the public-facing site
- Login and password-reset endpoints are rate-limited (10 requests / 15 min / IP)

## 8. Known Limitations / Suggested Next Steps

- Single admin account by design (no roles/permissions beyond `admin`) — extend the `User` model with a `role` enum if you need multiple editors.
- The public-facing pages (`Home`, `Skills`, `Projects`, etc.) still read from the static files in `frontend/src/data/*.js`. To make the dashboard fully drive the live site, swap those data imports for calls to the new public `GET` endpoints (e.g. `GET /api/skills`, `GET /api/projects`) — the shapes already line up closely with the existing `data/*.js` files.
- No automated test suite is included; consider adding Jest/Supertest for the API and Vitest/RTL for the dashboard if this goes to production.
