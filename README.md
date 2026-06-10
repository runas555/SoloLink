# Session365 — Micro-CRM & Auto-Localizing Scheduler for Solopreneurs

Session365 is a lightweight, high-performance, and serverless-ready Micro-CRM designed for beauty masters, tutors, coaches, and private practitioners. It replaces messenger chaos with a beautiful, fast, and responsive online scheduling funnel and a dedicated practitioner dashboard.

The project is built on top of a modern **Next.js 14 App Router** architecture, optimized for serverless cold-starts, zero-configuration cross-platform builds, and dynamic browser-locale translation.

---

## 🛠️ Key Technical Architecture & Engineering Solutions

When showcasing this project to hiring managers, here are the key engineering challenges solved:

### 1. Pure-JS SQLite Driver (GYP-Free & Cross-Platform)
Traditional SQLite wrappers (`sqlite3`, `better-sqlite3`) rely on native C++ bindings, causing build failures on different operating systems (Windows, macOS M1/M2, Linux) if the local environment lacks compilation tools. 
* **Solution:** Used `@libsql/client` (LibSQL WASM/Pure-JS driver) which runs without any binary compilation. It allows seamless, unified development locally (`file:local.db`) and effortless production scaling with zero build friction.

### 2. Timezone-Deterministic Availability Engines
Evaluating calendar slots across different user timezones is a common source of time-shifting bugs.
* **Solution:** The scheduling engine records and stores practitioner business hours in their local timezone (e.g., `Europe/Moscow`, `Asia/Novosibirsk`) while converting client bookings to strict UTC ISO 8601 strings. 
* Availabilities are computed on the server side dynamically, mitigating DST shifts and local clock deviations on the client.

### 3. Concurrency Protection (Race Condition Prevention)
When multiple clients open the same booking slot at the exact same moment, double-booking is a risk.
* **Solution:** The booking transaction validates the slot overlapping constraints mathematically via a strict database assertion: `start_time < :new_end_time AND end_time > :new_start_time` within an isolated, atomic query. If the slot has been claimed, the client receives a structured `409 Conflict` state.

### 4. Zero-Dependency Dynamic Internationalization (i18n)
* **Solution:** Implemented client-centric browser locale detection (`navigator.language`) that defaults to Russian or English out-of-the-box, with manual override persistence via `localStorage`. Date formatting and weekdays are localized on-the-fly using the native `Intl.DateTimeFormat` API, preventing layout shifts and saving bundle size.

---

## 💻 Tech Stack

* **Framework:** Next.js 14 (App Router, React 18)
* **Styling:** Tailwind CSS (fully responsive, modern palette)
* **Database:** LibSQL / SQLite (via `@libsql/client` with support for secure HTTP tunnels in production)
* **Authentication:** Stateless JWT Sessions stored in secure, `HttpOnly` and `SameSite=Strict` cookies
* **Security Hashing:** `bcryptjs` (pure-JS cryptographically secure implementation)
* **Data Validation:** Schema modeling via `Zod`
* **Icons:** `lucide-react` (SVG-based icon system)

---

## 📁 Directory Structure

```text
src/
├── app/
│   ├── api/                  # API routes (Auth, Services, Bookings, Slots, Public data)
│   ├── book/[username]/     # Public client booking page
│   ├── dashboard/           # Private practitioner space (Calendar, Services, Schedule)
│   ├── login/               # Authorization page
│   ├── register/            # Registration page
│   └── layout.tsx           # Global layout with LanguageProvider context
├── db/
│   ├── index.ts             # LibSQL client singleton
│   └── schema.ts            # Type declarations for DB entities
├── lib/
│   ├── auth.ts              # JWT verify/sign and password hashing helpers
│   ├── i18n.tsx             # Context provider for i18n & Language Switcher
│   ├── translations.ts      # Dictionary for English & Russian locales
│   └── utils.ts             # Price, Date and Duration formatting helpers
└── middleware.ts            # App Router route-protection based on cookies
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18.x or later

### Installation

1. Clone the repository to your local directory.
2. Initialize and configure the `.env` file in the root folder:
   ```env
   DATABASE_URL=file:local.db
   JWT_SECRET=generate-a-secure-32-character-secret-key
   ```
3. Run the automated database setup utility to create schemas and tables:
   ```bash
   npm run db:init
   ```
4. Install all cross-platform dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) to view the homepage.

---

## ☁️ Vercel & Production Serverless Deployment

This project is fully ready to run in Serverless environments. Because SQLite files are ephemeral on serverless environments like Vercel, the application dynamically shifts to an external LibSQL database (e.g., [Turso](https://turso.tech)) when provided with cloud environment variables.

### Deploy Steps:

1. Create a free distributed SQLite database on **Turso**.
2. Connect your GitHub repository to **Vercel**.
3. In Vercel, configure the following **Environment Variables**:
   * `DATABASE_URL` — paste the connection link provided by Turso (e.g., `libsql://your-db.turso.io`).
   * `DATABASE_AUTH_TOKEN` — paste your secure Turso Database token.
   * `JWT_SECRET` — set a strong random passphrase to sign login tokens.
4. Vercel will automatically compile, optimize, and deploy your application globally.