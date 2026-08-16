# Project Content Deliverables — TaskFlow, Inkwell, DevFolio

Companion doc to `README.md` section 8. Full structured data for these lives in
`frontend/src/data/projects.js`; this file has the polished, copy-paste-ready writing
for resumes, LinkedIn, and GitHub.

---

## Project: TaskFlow — Task Management App

**Purpose:** A collaborative task/project management tool so small teams can stop
tracking work across scattered chat threads and spreadsheets.

**Technologies:** React, Socket.io, Node.js, Express, MongoDB, Tailwind CSS.

**Architecture:** React SPA with a Kanban board (react-beautiful-dnd) talking to an
Express REST API for CRUD operations, plus a persistent Socket.io connection for
real-time board updates. MongoDB stores boards, tasks, and workspace membership with
role-based permissions.

**Key Features:**
- Drag-and-drop Kanban board
- Real-time collaboration via Socket.io
- Team workspaces with granular permissions
- Activity feed and email notifications
- Dark/light mode and keyboard shortcuts

**Challenge Solved:** Multiple users dragging cards simultaneously caused visible
flicker as server state overwrote local drag state. Solved with optimistic UI updates
(apply the move instantly on the client) plus server reconciliation (silently correct
only if the server's result differs).

**Suggested Improvements:** Add offline support with a service worker and local queue,
paginate very large boards, and add unit tests around the reconciliation logic.

**Resume bullet points:**
- Developed a real-time collaborative task manager (React, Socket.io, Node.js) supporting concurrent multi-user Kanban boards.
- Eliminated UI flicker from concurrent drag-and-drop actions by implementing optimistic updates with server-side reconciliation.
- Designed role-based workspace permissions enabling secure multi-team usage from a single deployment.

**LinkedIn-ready blurb:**
> Shipped TaskFlow, a real-time collaborative task manager built with React, Socket.io, and MongoDB. Solved a tricky real-time sync bug using optimistic UI + server reconciliation so multiple users can drag cards on the same board without flicker. #MERN #RealTimeApps

**GitHub README opener:**
> ## TaskFlow — Real-Time Task Management App
> A Kanban-based project management tool with live multi-user collaboration.
>
> **Tech:** React · Socket.io · Node.js · Express · MongoDB · Tailwind CSS
>
> **Highlights:** Drag-and-drop boards · Real-time sync via WebSockets · Role-based team workspaces
>
> [Live Demo](#) · [Screenshots](#)

---

## Project: Inkwell — Blogging Platform

**Purpose:** A fast, distraction-free publishing tool for independent writers who don't
need the overhead of a full CMS.

**Technologies:** React, Cloudinary, Node.js, MongoDB, Tailwind CSS.

**Architecture:** Server-rendered post pages for SEO, paired with a React-based
markdown editor for authoring. Images upload directly to Cloudinary from the client;
Node.js/Express handles auth, drafts, and publishing state in MongoDB.

**Key Features:**
- Markdown editor with live preview and image uploads
- Author auth with draft/publish workflow
- SEO-friendly server-rendered post pages
- Comment threads with moderation tools
- Full-text search across posts

**Challenge Solved:** Rendering user-submitted markdown as HTML opened an XSS risk.
Solved by sanitizing all rendered HTML through DOMPurify with a strict allow-list of
tags/attributes before it ever reaches the DOM.

**Suggested Improvements:** Add scheduled publishing, RSS feed generation, and reading-
time estimates computed server-side for consistency across clients.

**Resume bullet points:**
- Built a full-stack blogging platform (React, Node.js, MongoDB) with a markdown editor and SEO-optimized server-rendered post pages.
- Hardened the platform against XSS by sanitizing all user-submitted markdown/HTML through a strict DOMPurify allow-list.
- Implemented full-text search and a comment moderation system used by 20+ active writers.

**LinkedIn-ready blurb:**
> Built Inkwell, a full-stack blogging platform (React + Node.js + MongoDB) with a markdown editor, SEO-friendly rendering, and full-text search. Prioritized security by sanitizing all user-submitted content against XSS. #WebDevelopment #MERN

**GitHub README opener:**
> ## Inkwell — Modern Blogging Platform
> A fast, SEO-friendly blogging platform with a markdown editor and moderation tools.
>
> **Tech:** React · Node.js · MongoDB · Cloudinary · Tailwind CSS
>
> **Highlights:** Markdown editor with live preview · SEO-optimized rendering · XSS-safe content sanitization
>
> [Live Demo](#) · [Screenshots](#)

---

## Project: DevFolio — Portfolio Website

**Purpose:** A personal, performance-obsessed portfolio site (an earlier version of
this very project) built to prove out an animated, accessible React front end.

**Technologies:** React, Framer Motion, Tailwind CSS.

**Architecture:** A single React SPA with scroll-triggered section animations, theme
persistence, and a validated contact form. No backend — form submissions originally
went through a serverless function.

**Key Features:**
- Scroll-triggered section animations
- Dark/light theme with persisted preference
- Server-validated contact form
- Lighthouse score of 95+ across Performance, SEO, and Accessibility

**Challenge Solved:** Rich motion was tanking the mobile Lighthouse performance score.
Solved by lazy-loading below-the-fold sections and restricting all animations to
GPU-friendly CSS transforms (`transform`/`opacity` only, never animating `width`,
`height`, or `top`/`left`).

**Suggested Improvements:** Migrate to this MERN-based iteration (this repo) for a real
backend-backed contact form, and add automated Lighthouse CI checks on every deploy.

**Resume bullet points:**
- Designed and built a personal portfolio site in React and Framer Motion, achieving a 95+ Lighthouse score across Performance, SEO, and Accessibility.
- Optimized animation performance by restricting all transitions to GPU-accelerated CSS properties, cutting mobile load time significantly.

**LinkedIn-ready blurb:**
> Built and open-sourced DevFolio, a performance-first personal portfolio (React + Framer Motion) scoring 95+ on Lighthouse across the board. #React #WebPerformance

**GitHub README opener:**
> ## DevFolio — Animated Personal Portfolio
> A performance-focused personal portfolio with scroll animations and a validated contact form.
>
> **Tech:** React · Framer Motion · Tailwind CSS
>
> **Highlights:** 95+ Lighthouse score · GPU-only animations · Persisted dark/light theme
>
> [Live Demo](#) · [Screenshots](#)
