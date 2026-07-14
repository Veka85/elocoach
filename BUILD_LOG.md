# EloCoach — Build Log

> League of Legends Coaching Platform
> Built as a portfolio-quality full-stack application
> Stack: Laravel 11 + React 18 + Tailwind CSS + MySQL

---

## Project Selection

### 5 Application Ideas Considered

1. **Task Management SaaS (Trello Clone)**
   - Features: Boards, cards, drag-and-drop, team members
   - DB complexity: Medium (users, boards, lists, cards, labels, attachments)
   - Difficulty: Medium
   - Portfolio value: Common — many developers build this

2. **League of Legends Coaching Platform** ✅ SELECTED
   - Features: Coach/student accounts, booking system, Riot API integration, analytics, reviews
   - DB complexity: High (users, roles, profiles, sessions, reviews, subscriptions, messages)
   - Difficulty: Medium-High
   - Portfolio value: Excellent — niche, realistic SaaS, shows API integration, booking logic, roles

3. **Job Board Platform**
   - Features: Company/candidate accounts, job listings, applications, filtering
   - DB complexity: Medium-High
   - Difficulty: Medium
   - Portfolio value: Good — common but practical

4. **E-Learning Platform**
   - Features: Courses, video lessons, progress tracking, certificates
   - DB complexity: High
   - Difficulty: High
   - Portfolio value: Very good but complex video handling

5. **Real Estate Listing Platform**
   - Features: Properties, agents, search, mortgage calculator
   - DB complexity: Medium
   - Difficulty: Medium
   - Portfolio value: Good but generic

---

## Selected Application: EloCoach

### Why This Choice?

- **Niche but realistic**: Real coaching platforms exist (ProGuides, Gamer Sensei)
- **Complex business logic**: Booking with time slots, role-based access, subscriptions
- **API integration**: Riot Games API shows external API consumption skills
- **Rich data model**: Multiple user types, sessions, reviews, subscriptions, messages
- **Modern patterns**: Service classes, policies, resources, form requests

---

## Architecture Plan

### Folder Structure

```
elocoach/
├── backend/                          # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/
│   │   │   │   │   └── AuthController.php
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── AdminDashboardController.php
│   │   │   │   │   └── AdminUserController.php
│   │   │   │   ├── CoachController.php
│   │   │   │   ├── SessionController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   ├── SubscriptionController.php
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── MessageController.php
│   │   │   │   └── RiotController.php
│   │   │   ├── Middleware/
│   │   │   │   └── EnsureRole.php
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── LoginRequest.php
│   │   │   │   │   └── RegisterRequest.php
│   │   │   │   ├── StoreSessionRequest.php
│   │   │   │   ├── UpdateCoachProfileRequest.php
│   │   │   │   └── StoreReviewRequest.php
│   │   │   └── Resources/
│   │   │       ├── UserResource.php
│   │   │       ├── CoachResource.php
│   │   │       ├── SessionResource.php
│   │   │       ├── ReviewResource.php
│   │   │       └── MessageResource.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── CoachProfile.php
│   │   │   ├── StudentProfile.php
│   │   │   ├── CoachingSession.php
│   │   │   ├── Review.php
│   │   │   ├── SubscriptionPlan.php
│   │   │   ├── Subscription.php
│   │   │   └── Message.php
│   │   ├── Services/
│   │   │   ├── SessionService.php
│   │   │   ├── RiotApiService.php
│   │   │   └── SubscriptionService.php
│   │   └── Policies/
│   │       ├── SessionPolicy.php
│   │       └── ReviewPolicy.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   └── routes/
│       └── api.php
│
└── frontend/                         # React 18 + Vite
    └── src/
        ├── api/
        │   └── axios.js
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useApi.js
        ├── services/
        │   ├── authService.js
        │   ├── coachService.js
        │   ├── sessionService.js
        │   └── reviewService.js
        ├── components/
        │   ├── common/
        │   ├── coaches/
        │   ├── sessions/
        │   └── dashboard/
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Coaches.jsx
        │   ├── CoachProfile.jsx
        │   ├── Dashboard.jsx
        │   ├── Sessions.jsx
        │   ├── SessionDetail.jsx
        │   ├── Profile.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminUsers.jsx
        │       └── AdminSessions.jsx
        └── App.jsx
```

### Database Schema

```
users
  id, name, email, password, role (admin|coach|student)
  summoner_name, region, avatar_url, discord_username
  email_verified_at, remember_token, timestamps

coach_profiles
  id, user_id (FK), bio, hourly_rate, rank, peak_rank
  specializations (JSON), champions (JSON), languages (JSON)
  is_verified, is_available, rating_avg, total_sessions
  youtube_url, twitch_url, timestamps

student_profiles
  id, user_id (FK), rank, main_role, goals, timestamps

coaching_sessions
  id, coach_id (FK→users), student_id (FK→users)
  scheduled_at, duration_minutes, price, status
  (pending|confirmed|completed|cancelled|no_show)
  meet_link, cancellation_reason, timestamps

session_notes
  id, session_id (FK), coach_notes, student_feedback, timestamps

reviews
  id, session_id (FK), coach_id (FK→users), student_id (FK→users)
  rating (1-5), comment, is_visible, timestamps

subscription_plans
  id, name, slug, price, sessions_per_month, features (JSON)
  is_active, timestamps

subscriptions
  id, user_id (FK), plan_id (FK), sessions_remaining
  starts_at, ends_at, status (active|cancelled|expired), timestamps

messages
  id, sender_id (FK→users), receiver_id (FK→users)
  content, read_at, timestamps
```

### API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/coaches                  (search, filter, paginate)
GET    /api/coaches/{id}
PUT    /api/coaches/{id}/profile

GET    /api/sessions                 (my sessions)
POST   /api/sessions
GET    /api/sessions/{id}
PUT    /api/sessions/{id}
DELETE /api/sessions/{id}
POST   /api/sessions/{id}/confirm
POST   /api/sessions/{id}/complete
POST   /api/sessions/{id}/cancel

GET    /api/reviews/coach/{id}
POST   /api/reviews

GET    /api/subscriptions/plans
POST   /api/subscriptions
GET    /api/subscriptions/current

GET    /api/dashboard
GET    /api/messages
POST   /api/messages

GET    /api/riot/summoner/{region}/{name}

GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/{id}
GET    /api/admin/sessions
```

### Authentication Flow

1. User registers → role assigned (student default, coach requires admin verify)
2. Login → Sanctum issues personal access token stored in localStorage
3. Every API request sends `Authorization: Bearer {token}` header
4. Middleware `EnsureRole` guards role-specific routes
5. Laravel Policies handle resource-level authorization

### User Roles

- **admin**: Full access, can verify coaches, manage all data
- **coach**: Can manage own profile, confirm/complete sessions, send notes
- **student**: Can browse coaches, book sessions, leave reviews

---

## Build Progress Log

| # | Step | Status | Files Created |
|---|------|--------|---------------|
| 1 | Project planning & architecture | ✅ Done | BUILD_LOG.md |
| 2 | README & setup instructions | ✅ Done | README.md |
| 3 | Backend config & composer | ✅ Done | composer.json, .env.example |
| 4 | Database migrations | ✅ Done | 8 migration files |
| 5 | Eloquent models | ✅ Done | 8 model files |
| 6 | Auth controller | ✅ Done | AuthController.php |
| 7 | Form requests | ✅ Done | 5 request classes |
| 8 | API Resources | ✅ Done | 5 resource classes |
| 9 | Services | ✅ Done | SessionService, RiotApiService, SubscriptionService |
| 10 | Policies | ✅ Done | SessionPolicy, ReviewPolicy |
| 11 | Feature controllers | ✅ Done | 7 controllers |
| 12 | Admin controllers | ✅ Done | 2 admin controllers |
| 13 | Middleware | ✅ Done | EnsureRole.php |
| 14 | Routes | ✅ Done | api.php |
| 15 | Seeders & Factories | ✅ Done | 4 seeders, 3 factories |
| 16 | React project setup | ✅ Done | package.json, vite, tailwind |
| 17 | Axios & API config | ✅ Done | axios.js |
| 18 | Auth context & hooks | ✅ Done | AuthContext.jsx, useAuth.js, useApi.js |
| 19 | Services (frontend) | ✅ Done | 4 service files |
| 20 | Common components | ✅ Done | 6 components |
| 21 | Coach components | ✅ Done | CoachCard, CoachFilters |
| 22 | Session components | ✅ Done | SessionCard, BookingModal |
| 23 | Dashboard components | ✅ Done | StatsCard, RecentSessions |
| 24 | App router | ✅ Done | App.jsx |
| 25 | Landing page | ✅ Done | Landing.jsx |
| 26 | Auth pages | ✅ Done | Login.jsx, Register.jsx |
| 27 | Coaches pages | ✅ Done | Coaches.jsx, CoachProfile.jsx |
| 28 | Dashboard page | ✅ Done | Dashboard.jsx |
| 29 | Sessions pages | ✅ Done | Sessions.jsx, SessionDetail.jsx |
| 30 | Profile page | ✅ Done | Profile.jsx |
| 31 | Admin pages | ✅ Done | AdminDashboard, AdminUsers, AdminSessions |
| 32 | Helpers & utilities | ✅ Done | helpers.js |

---

*EloCoach — Built with Laravel 11 + React 18 + Tailwind CSS*
