# Trainer Hub

A mobile-first platform connecting coaches with their clients. Coaches can manage clients, create training and meal programs, assign them, and track progress. Clients can follow programs, track workouts, log meals, and monitor their fitness journey.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API, MediatR (CQRS), Entity Framework Core, SQL Server
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Vite, React Router
- **Auth**: JWT Bearer tokens, BCrypt password hashing
- **i18n**: react-i18next (frontend), .NET resource files (backend) — English, Arabic (RTL), French, Spanish

## Project Structure

```
TrainerHub.sln
src/
├── TrainerHub.Domain/           # Entities, Enums, Interfaces
├── TrainerHub.Application/      # MediatR Commands, Queries, Handlers, DTOs, Resources (.resx)
├── TrainerHub.Infrastructure/   # EF Core DbContext, Migrations, JWT & SMS Services
├── TrainerHub.API/              # Controllers, Middleware, Program.cs
└── trainer-hub-client/          # React frontend (Vite + TypeScript)
    └── src/
        ├── components/          # Layout, LanguagePicker
        ├── lib/                 # api.ts, auth.ts, i18n.ts
        ├── locales/             # en.json, ar.json, fr.json, es.json
        ├── pages/               # Login, Register, Onboarding, SearchCoaches
        │   ├── coach/           # Dashboard, ClientDetail, Programs, ProgramForm, MealPrograms, MealProgramForm
        │   └── client/          # Dashboard, ProgramView, MealProgramView, Progress
        └── types/               # TypeScript interfaces
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (for the React frontend)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB, Express, or full)

## Getting Started

### 1. Database Setup

Update the connection string in `src/TrainerHub.API/appsettings.json` if needed:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TrainerHub;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Apply EF Core migrations to create the database:

```bash
dotnet ef database update --project src/TrainerHub.Infrastructure --startup-project src/TrainerHub.API
```

### 2. Run the Backend

```bash
cd src/TrainerHub.API
dotnet run
```

The API will be available at `http://localhost:5000`. Swagger UI at `http://localhost:5000/swagger`.

### 3. Run the Frontend

```bash
cd src/trainer-hub-client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and proxies `/api` requests to the backend.

## API Endpoints

### Auth
- `POST /api/auth/register` — Register as coach
- `POST /api/auth/login` — Login
- `POST /api/auth/onboarding` — Complete client onboarding

### Clients (Coach)
- `GET /api/clients` — List coach's clients
- `GET /api/clients/:id` — Client detail
- `POST /api/clients/invite` — Invite a client
- `GET /api/clients/:id/assignments` — Client's program assignments
- `GET /api/clients/:id/progress` — Client's progress entries
- `GET /api/clients/:id/workout-logs` — Client's workout logs

### Training Programs (Coach)
- `GET /api/programs` — List coach's training programs
- `GET /api/programs/:id` — Program detail
- `POST /api/programs` — Create program
- `PUT /api/programs/:id` — Update program
- `POST /api/programs/:id/assign` — Assign program to client

### Meal Programs (Coach)
- `GET /api/meal-programs` — List coach's meal programs
- `GET /api/meal-programs/:id` — Meal program detail
- `POST /api/meal-programs` — Create meal program
- `PUT /api/meal-programs/:id` — Update meal program
- `POST /api/meal-programs/assign` — Assign meal program to client
- `GET /api/meal-programs/assignments` — Client's assigned meal programs

### Progress (Client)
- `GET /api/progress` — Client's progress entries
- `POST /api/progress/entry` — Log a progress entry
- `GET /api/progress/assignments` — Client's training program assignments
- `GET /api/progress/workouts` — Client's workout logs
- `POST /api/progress/workout` — Log a workout

### Coach Search (Public)
- `GET /api/coaches/search?query=` — Search coaches by name or email
- `GET /api/coaches/:id/reviews` — Get public reviews for a coach

### Connection Requests
- `POST /api/connection-requests` — Send connection request to a coach (public)
- `GET /api/connection-requests` — List pending requests (coach)
- `PUT /api/connection-requests/:id` — Accept or reject a request (coach)

### Reviews
- `POST /api/reviews` — Create a review (coach or client)
- `PUT /api/reviews/:id` — Update a review
- `DELETE /api/reviews/:id` — Delete a review
- `GET /api/reviews/client/:clientId` — Get reviews for a client relationship

## Features

### Training Programs
Coaches create structured training programs with exercises (sets, reps, duration, rest). Programs are assigned to clients who can log their workout performance.

### Meal Programs
Coaches create flexible meal programs organized by days/sections (e.g. "Monday", "Day 1", "Pre-Workout"). Each day contains meal items with optional nutritional info (calories, protein, carbs, fat). Programs are assigned to clients who can view their meal plans.

### Coach Search & Connection Requests
Users can search for coaches publicly (no account required) and send connection requests with their contact info. Coaches can accept or reject incoming requests from their dashboard.

### Bidirectional Reviews
Coaches can review clients and clients can review coaches. Client reviews of coaches are publicly visible on the coach search page with star ratings and comments.

### Multi-language Support (i18n)
Full internationalization with 4 languages: English, Arabic (with RTL layout support), French, and Spanish. Covers all frontend UI strings and backend API error messages. Language is detected from the browser and can be changed via the language picker.

## User Flows

### Coach Flow
1. Register an account → lands on Coach Dashboard
2. Invite clients via phone number → SMS sent (logged in dev)
3. Create training programs with exercises
4. Create meal programs with days and meal items
5. Assign training and meal programs to clients
6. Track client progress and workout logs
7. Review clients and view client reviews
8. Accept/reject connection requests from new clients

### Client Flow
1. Receive invitation link via SMS, or find a coach via search and send a connection request
2. Open link → `/onboarding/:token` → set password and profile
3. View assigned training and meal programs on dashboard
4. Follow exercises and log workouts
5. View meal plans with nutritional details
6. Track body metrics (weight, body fat %)
7. Review your coach
