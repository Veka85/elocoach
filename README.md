# EloCoach — League of Legends Coaching Platform

A full-stack web application connecting League of Legends players with professional coaches. Built with **Laravel 11** (REST API) and **React 18** (Frontend) as a portfolio project demonstrating senior-level full-stack development.

---

## Features

- **Authentication** — Register, login, logout with JWT-like tokens via Laravel Sanctum
- **Three User Roles** — Admin, Coach, Student with route-level and resource-level authorization
- **Coach Profiles** — Rank, specializations, pricing, availability, champions
- **Session Booking** — Full booking lifecycle (pending → confirmed → completed)
- **Review System** — Star ratings with comments, aggregated coach ratings
- **Subscription Plans** — Tiered plans with session quotas
- **Messaging** — Direct messages between coaches and students
- **Riot API Integration** — Fetch summoner data and match history
- **Admin Panel** — User management, session oversight, coach verification
- **Search & Filtering** — Filter coaches by rank, role, price, region
- **Pagination** — All list endpoints paginated
- **Responsive UI** — Desktop, tablet, mobile with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| HTTP Client | Axios |
| Backend | Laravel 11, PHP 8.3+ |
| Authentication | Laravel Sanctum (token-based) |
| Database | MySQL 8.0 |
| ORM | Eloquent |
| API Style | RESTful JSON API with API Resources |

---

## Prerequisites

Make sure you have installed:

- **PHP** >= 8.3
- **Composer** >= 2.0
- **Node.js** >= 20.0
- **MySQL** >= 8.0
- A Riot Games API key (free at https://developer.riotgames.com)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url> elocoach
cd elocoach
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies via Composer
composer install

# Copy environment file
cp .env.example .env

# Generate application encryption key
php artisan key:generate

# Edit .env file with your database and Riot API credentials
nano .env
```

**Required `.env` values:**
```env
DB_DATABASE=elocoach
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
RIOT_API_KEY=RGAPI-your-key-here
FRONTEND_URL=http://localhost:5173
```

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE elocoach CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run all migrations (creates all tables)
php artisan migrate

# Seed the database (creates admin user, coaches, students, plans, sessions)
php artisan db:seed

# Start the development server
php artisan serve
# API will be available at: http://localhost:8000
```

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit if your backend runs on a different port
nano .env
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000/api
```

```bash
# Start the development server
npm run dev
# App will be available at: http://localhost:5173
```

### 4. Default Login Credentials (from seeder)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@elocoach.gg | password |
| Coach | coach@elocoach.gg | password |
| Student | student@elocoach.gg | password |

---

## API Documentation

All API endpoints require `Accept: application/json` header.
Authenticated endpoints require `Authorization: Bearer {token}` header.

### Authentication

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password",
  "password_confirmation": "password",
  "role": "student",           // "student" or "coach"
  "summoner_name": "Faker",
  "region": "EUW"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password"
}

Response:
{
  "data": { ...user object },
  "token": "1|abc123..."
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### Coaches

#### List coaches (with search and filters)
```
GET /api/coaches?search=Faker&rank=Diamond&role=Mid&max_price=50&region=EUW&page=1
```

#### Get coach details
```
GET /api/coaches/{id}
```

#### Update coach profile (coach only)
```
PUT /api/coaches/{id}/profile
Authorization: Bearer {token}

{
  "bio": "Diamond 1 mid laner with 5 years of coaching...",
  "hourly_rate": 25.00,
  "rank": "Diamond",
  "specializations": ["Mid Lane", "Mechanics"],
  "champions": ["Ahri", "Syndra", "Orianna"],
  "languages": ["English", "German"]
}
```

---

### Sessions

#### List my sessions
```
GET /api/sessions?status=pending&page=1
Authorization: Bearer {token}
```

#### Book a session (student only)
```
POST /api/sessions
Authorization: Bearer {token}

{
  "coach_id": 2,
  "scheduled_at": "2025-02-15 18:00:00",
  "duration_minutes": 60,
  "notes": "I struggle with wave management in mid lane"
}
```

#### Session lifecycle actions
```
POST /api/sessions/{id}/confirm    // Coach confirms
POST /api/sessions/{id}/complete   // Coach marks complete
POST /api/sessions/{id}/cancel     // Either party cancels
```

---

### Reviews

#### Get coach reviews
```
GET /api/reviews/coach/{coachId}
```

#### Leave a review (student only, after completed session)
```
POST /api/reviews
Authorization: Bearer {token}

{
  "session_id": 5,
  "rating": 5,
  "comment": "Amazing session, learned so much about wave management!"
}
```

---

### Subscriptions

#### Get available plans
```
GET /api/subscriptions/plans
```

#### Subscribe to a plan
```
POST /api/subscriptions
Authorization: Bearer {token}

{
  "plan_id": 2
}
```

---

### Riot API

#### Lookup summoner
```
GET /api/riot/summoner/{region}/{summonerName}
Authorization: Bearer {token}

// Example:
GET /api/riot/summoner/EUW/Faker
```

---

### Admin Endpoints

All require `Authorization: Bearer {admin_token}`

```
GET  /api/admin/dashboard
GET  /api/admin/users?role=coach&search=...&page=1
PUT  /api/admin/users/{id}          // Verify coach, change role
GET  /api/admin/sessions?status=pending
```

---

## Database Schema

```
users                    coach_profiles           student_profiles
─────────────────        ─────────────────        ─────────────────
id                       id                       id
name                     user_id (FK)             user_id (FK)
email                    bio                      rank
password                 hourly_rate              main_role
role                     rank                     goals
summoner_name            peak_rank                timestamps
region                   specializations (JSON)
avatar_url               champions (JSON)
discord_username         languages (JSON)
timestamps               is_verified
                         is_available
                         rating_avg
                         total_sessions

coaching_sessions        reviews                  messages
─────────────────        ─────────────────        ─────────────────
id                       id                       id
coach_id (FK)            session_id (FK)          sender_id (FK)
student_id (FK)          coach_id (FK)            receiver_id (FK)
scheduled_at             student_id (FK)          content
duration_minutes         rating                   read_at
price                    comment                  timestamps
status                   is_visible
meet_link                timestamps
cancellation_reason
timestamps

subscription_plans       subscriptions
─────────────────        ─────────────────
id                       id
name                     user_id (FK)
slug                     plan_id (FK)
price                    sessions_remaining
sessions_per_month       starts_at
features (JSON)          ends_at
is_active                status
timestamps               timestamps
```

---

## Project Structure

```
elocoach/
├── backend/          # Laravel 11 REST API
├── frontend/         # React 18 + Vite + Tailwind
├── BUILD_LOG.md      # Complete build log and architecture decisions
└── README.md         # This file
```

---

## Deployment

### Backend (e.g., Forge + DigitalOcean)
1. Push code to GitHub
2. Create server on DigitalOcean
3. Use Laravel Forge to provision and deploy
4. Set environment variables in Forge dashboard
5. Run `php artisan migrate --force` and `php artisan db:seed --force`

### Frontend (e.g., Vercel)
1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL` environment variable to your production API URL
3. Deploy — Vercel handles build and CDN automatically

### Environment Variables Checklist
- [ ] `APP_KEY` — generated via `php artisan key:generate`
- [ ] `DB_*` — database credentials
- [ ] `RIOT_API_KEY` — from developer.riotgames.com
- [ ] `FRONTEND_URL` — for CORS configuration
- [ ] `VITE_API_URL` — frontend API URL

---

*Built by a mid-level full-stack developer showcasing Laravel + React skills*
