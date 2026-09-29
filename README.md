# Talent Registry Africa

Talent Registry Africa is a professional discovery and reputation platform for African digital talent—including technical writers, UI/UX and product designers, content strategists, software engineers, and technical leaders. The platform enables professionals to build a shareable Professional Passport showcasing their work history, deliverables, portfolio links, and skills without requiring third-party employment verification.

## What It Does

- Professional Passports: Provides each digital professional with a dedicated, shareable passport URL highlighting their profile headline, location, availability, work history, deliverables, competencies, and client reviews.
- Direct Work History: Users can directly add, update, and manage their career history, including company or client name, job title, description, start and end dates, skills used, and optional links to live projects, articles, design files, or portfolios.
- Activity-Based Reputation System: Calculates a dynamic reputation score (0 to 100) based on platform engagement, profile completeness, completed client engagements, and authentic client ratings and reviews.
- Talent Discovery: Enables employers, recruiters, and team leads to filter and discover talent across African hubs by specialization (writing, design, engineering, product, marketing), primary skills, location, and reputation score.
- Client Endorsements: Allows clients and colleagues to leave structured feedback, ratings, and competency assessments upon completed engagements.
- Direct Inquiries: Facilitates direct communication between hiring teams and candidates with structured engagement types, budget ranges, and project scopes.
- Organization Profiles: Displays company profiles and associated digital professionals and alumni.
- Administrative Governance: Includes an administrative control center for user management, dispute resolution, and audit logging.

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JSON Web Tokens (JWT) and bcrypt password hashing

## Prerequisites

- Node.js version 18.x or later
- npm version 9.x or later
- MongoDB instance (local or MongoDB Atlas connection string)

## Setup and Run Instructions

### 1. Clone and Navigate

Clone the repository and move into the project directory:

```bash
git clone https://github.com/meshach5667/talent-registry
cd talent-registry
```

### 2. Install Dependencies

Install the required root and server dependencies:

```bash
npm install
```

If running the backend independently from the server subdirectory, ensure server dependencies are installed as well:

```bash
cd server && npm install && cd ..
```

### 3. Configure Environment Variables

Create a local environment file from the example template:

```bash
cp .env.example .env
```

Open `.env` and configure the following variables:

- PORT: Port for the Express backend server (default: 5000)
- NODE_ENV: Application environment (development or production)
- MONGODB_URI: Connection string for MongoDB (e.g., mongodb://localhost:27017/talent_registry or MongoDB Atlas URI)
- JWT_SECRET: Strong secret string used to sign authentication tokens
- JWT_EXPIRES_IN: Lifespan for authentication tokens (e.g., 7d)
- CLIENT_URL: Base URL of the frontend application (default: http://localhost:3000)
- NEXT_PUBLIC_API_URL: API base URL path for frontend requests (default: /api/v1)

Optional configurations:
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: For cloud image uploads (falls back to local file storage if empty)
- GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL: For GitHub OAuth integration

### 4. Seed Database (Optional)

To populate the database with sample digital talent profiles (writers, designers, engineers), organizations, work histories, and reviews:

```bash
npm run seed
```

Default demo accounts created during seeding:
- Professional: kwame@example.com (Password: Password123!)
- Employer: recruiter@paystack.com (Password: Password123!)
- Admin: admin@talentregistry.africa (Password: AdminPass123!)

### 5. Run the Application

#### Development Mode

Run both the Express API and Next.js frontend concurrently:

```bash
npm run dev
```

Alternatively, run them in separate terminals:

Terminal 1 (Backend API):
```bash
npm run dev:backend
```

Terminal 2 (Frontend Web):
```bash
npm run dev:frontend
```

The frontend application will be available at:
http://localhost:3000

The backend API server will be available at:
http://localhost:5000

#### Production Build

To build and run the optimized production bundle:

```bash
npm run build
npm start
```

To run the backend in production mode:

```bash
npm run start:backend
```

## API Route Structure

All API routes are prefixed under `/api/v1`:

- /api/v1/auth: Registration, login, current user session, password updates, and GitHub OAuth
- /api/v1/profiles: Profile retrieval, updates, skill management, and talent search
- /api/v1/experiences: Direct work history CRUD operations
- /api/v1/projects: Technical project deliverables CRUD operations
- /api/v1/organizations: Organization profiles and associated talent
- /api/v1/feedbacks: Client ratings and review submissions
- /api/v1/contacts: Direct hiring inquiries and messaging
- /api/v1/admin: Governance metrics, dispute handling, user management, and audit logs
- /api/health: Service health check endpoint
