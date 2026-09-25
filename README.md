# Talent Registry Africa 🛡️

> **“Don’t just claim your experience. Prove it.”**

Talent Registry is a full-stack professional verification and talent discovery platform engineered for African software engineers, architects, and technical leaders. It eliminates resume falsehoods by transforming self-reported claims into cryptographically audited **Professional Passports**.

---

## 🌟 Key Architecture & Tech Stack

- **Frontend:** Next.js (App Router), JavaScript, Tailwind CSS, Lucide Icons, shadcn/ui design conventions.
- **Backend:** Node.js, Express.js REST API, JWT Authentication, Multer file upload validation, Rate limiting, Helmet security headers, Centralized error handling.
- **Database:** MongoDB & Mongoose ORM (User, Organization, Profile, Experience, Project, VerificationRequest, Feedback, ContactRequest, Notification, AuditLog, Dispute).
- **Storage:** Secure Profile Photo Uploads with Cloudinary SDK support and automatic local filesystem fallback.

---

## 🚀 Live Demo Accounts (1-Click Switcher Available in Navbar)

| Role | Name | Email | Password | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Professional** | Kwame Mensah | `kwame.mensah@talentregistry.africa` | `password123` | Elite Systems Architect (Accra, Ghana) with verified Paystack tenure & 92 Trust Score |
| **Employer** | Tunde Adebayo | `tunde@paystack.com` | `password123` | VP Engineering at Paystack; reviews employee claims & hires talent |
| **Admin** | Amara Okafor | `admin@talentregistry.africa` | `password123` | Platform governance, org verifications, dispute resolution & audit logs |
| **Pending Pro** | Amina Diallo | `amina.diallo@talentregistry.africa` | `password123` | Security Engineer with live pending verification request |

---

## 📋 Core Features & Verification Workflow

1. **Closed-Loop Verification Lifecycle:**
   - Professional documents a role or technical project deliverable.
   - Professional dispatches a verification request specifying the manager's corporate email.
   - Employer receives an authenticated review token (`/verification/[token]`).
   - Employer reviews, submits 5-star & competence ratings (Tech Competence, Reliability, Communication), and certifies or rejects.
   - Experience receives an immutable verification reference code (e.g. `VER-EXP-PAYSTACK-KM21`), Verified Badge, and increases the professional's reputation score.

2. **Reputation & Trust Index Scoring:**
   - Dynamically calculated from profile completeness (0-25 pts), verified experiences (up to 45 pts), verified projects (up to 20 pts), and employer ratings (up to 10 pts).
   - Tiers: `Elite Talent` (80+), `Verified Pro` (60-79), `Emerging` (30-59), `Unverified` (<30).

3. **Public Professional Passport (`/passport/[slug]`):**
   - High-trust shareable URL with printable view.
   - Distinct emerald **Verified by Employer** badges vs neutral **Self-Reported** tags.
   - Employer testimonials and granular competence ratings.
   - Direct "Inquire / Contact" modal for employer recruitment.
   - Community integrity dispute reporting button.

4. **Talent Discovery Search (`/talent`):**
   - Filters by African country (Nigeria, Kenya, Ghana, South Africa, Egypt, Rwanda, Senegal, Uganda).
   - Filters by specialization (Software Engineering, Distributed Systems, DevOps, AI/ML, Security).
   - Filters by technical skill and minimum trust score slider.
   - Toggle to filter exclusively candidates with verified experience.

5. **Profile Photo Management:**
   - Upload, replace, and delete profile photo.
   - Enforces 5MB size limit and image mime-type validation.
   - Displays clean fallback initials avatar when no photo exists.

6. **Employer & Organization Management (`/organization/dashboard`):**
   - Manage corporate profile, logo, and work email domain.
   - Queue of incoming employee verification claims.
   - Directory of verified African tech organizations (`/organizations`).

7. **Admin Governance & Audit Trail (`/admin`):**
   - User account activation and suspension.
   - Organization verification badge grant/revocation.
   - Community dispute investigation and resolution.
   - Cryptographic platform audit log trail.

---

## 🛠️ Quickstart Instructions

### 1. Prerequisites
- Node.js 18+ and npm
- MongoDB running on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database with African Tech Profiles & Orgs
```bash
npm run seed
```

### 4. Run Both Backend and Frontend Concurrently
```bash
npm run dev
```
- Frontend Web App: `http://localhost:3000`
- Express Backend API: `http://localhost:5000` (also reverse-proxied at `http://localhost:3000/api/v1`)

---

## 🏛️ REST API Routes Overview

- `POST /api/v1/auth/register` - Create Professional, Employer, or Admin account
- `POST /api/v1/auth/login` - Authenticate and receive JWT
- `GET /api/v1/auth/me` - Fetch authenticated user & profile
- `POST /api/v1/auth/photo` - Upload/replace profile photo
- `DELETE /api/v1/auth/photo` - Remove profile photo
- `GET /api/v1/profiles/search` - Search talent directory with filters
- `GET /api/v1/profiles/passport/:slug` - Public Professional Passport data
- `GET /api/v1/profiles/me` - Current professional profile & items
- `PUT /api/v1/profiles/me` - Update headline, bio, skills, availability
- `POST /api/v1/experiences` - Add employment record
- `POST /api/v1/projects` - Add technical project
- `POST /api/v1/verifications/request` - Dispatch verification request token
- `GET /api/v1/verifications/review/:token` - Retrieve claim for token audit
- `POST /api/v1/verifications/review/:token` - Certify or decline claim
- `GET /api/v1/contacts` - List hiring inquiries
- `POST /api/v1/contacts` - Send inquiry to candidate
- `GET /api/v1/organizations` - List African organizations
- `GET /api/v1/admin/overview` - Governance metrics
- `GET /api/v1/admin/audit-logs` - Platform audit trail
