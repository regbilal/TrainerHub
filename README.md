# Trainer Hub

A mobile-first platform connecting coaches with their clients. Coaches can manage clients, create training and meal programs, assign them, and track progress. Clients can follow programs, track workouts, log meals, and monitor their fitness journey.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API, MediatR (CQRS), Entity Framework Core, SQL Server
- **Auth & users**: **ASP.NET Core Identity** (`ApplicationUser` with `Guid` keys), JWT Bearer tokens for API access (Identity’s password hasher; PBKDF2 by default — not raw BCrypt on entities)
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Vite, React Router
- **i18n**: react-i18next (frontend), .NET resource files (backend) — English, Arabic (RTL), French, Spanish
- **Observability**: `ErrorLogs` table; global exception middleware persists unhandled exceptions; coach-only **Error Logs** UI at `/coach/errors` and `GET /api/errorlogs` (filterable)

## Project Structure

```
TrainerHub.sln
src/
├── TrainerHub.Domain/           # Entities (incl. ApplicationUser), Enums, Interfaces
├── TrainerHub.Application/      # MediatR Commands, Queries, Handlers, DTOs, Resources (.resx)
├── TrainerHub.Infrastructure/   # EF Core DbContext (Identity), Migrations, JWT & SMS Services, DatabaseSeeder
│   └── Data/                   # ApplicationDbContext, DesignTimeDbContextFactory (EF tools), DatabaseSeeder
├── TrainerHub.API/              # Controllers, Middleware (GlobalExceptionHandler), Program.cs
└── trainer-hub-client/          # React frontend (Vite + TypeScript)
    └── src/
        ├── components/          # Layout, LanguagePicker
        ├── lib/                 # api.ts, auth.tsx, i18n.ts
        ├── locales/             # en.json, ar.json, fr.json, es.json
        ├── pages/               # Login, Register, Onboarding, SearchCoaches
        │   ├── coach/           # Dashboard, ClientDetail, Programs, ProgramForm, MealPrograms, MealProgramForm, ErrorLogs
        │   └── client/          # Dashboard, ProgramView, MealProgramView, Progress
        └── types/               # TypeScript interfaces
```

Identity-related tables (in addition to app tables) include standard ASP.NET Identity schema, e.g. `AspNetRoles`, `AspNetUserRoles`, user claims/logins/tokens; application users are mapped to the **`Users`** table via EF configuration.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) (for the React frontend)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB, Express, or full)
- Optional: `dotnet-ef` global tool for migrations (`dotnet tool install --global dotnet-ef`)

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

If you **replaced or recreated** the initial migration, use an **empty** database (or drop the existing one) so schema and `__EFMigrationsHistory` stay in sync.

On startup, the API runs **`MigrateAsync()`** and, when the **`Users`** table has no rows, runs **`DatabaseSeeder`** (requires a working connection).

### 2. Local development (Kestrel + Vite)

The app uses the same pattern as many ASP.NET + SPA setups: **you browse the site through Kestrel**, not through the Vite port. In Development, ASP.NET **proxies non-API requests to the Vite dev server** (`Microsoft.AspNetCore.SpaServices.Extensions`), so the browser stays **same-origin** with the API. The React client calls **`/api/...`** (see `trainer-hub-client/src/lib/api.ts`); no separate “API URL” is required in the frontend.

**Ports** (defaults in `TrainerHub.API/Properties/launchSettings.json`):

| Service | URL | Role |
|--------|-----|------|
| **ASP.NET (Kestrel or IIS Express)** | `http://localhost:5000` | **Open this in the browser** — serves `/api`, `/swagger`, and proxies the SPA to Vite |
| **Vite** | `http://localhost:5173` | Dev-only asset + HMR server; do **not** use this as the main app URL |

**Steps** (two terminals):

1. **Frontend — start Vite first** (so the proxy has a target):

   ```bash
   cd src/trainer-hub-client
   npm install
   npm run dev
   ```

2. **Backend — start the API**:

   ```bash
   cd src/TrainerHub.API
   dotnet run
   ```

3. Open **`http://localhost:5000`** in the browser. Swagger: **`http://localhost:5000/swagger`**.

If the SPA does not load, confirm Vite is running on **5173** (`strictPort` in `vite.config.ts`) and that nothing else is blocking the connection.

**Production builds** are not served by this proxy: run `npm run build` in `trainer-hub-client` and host the `dist` output from the API (static files + SPA fallback) as you would for any ASP.NET–hosted React app.

## Test Data (Seeded Accounts)

Seeding runs only when **no users exist**. All seeded accounts share the same password:

| Password | Notes |
|----------|--------|
| **`Test123!`** | Meets Identity options: 8+ chars, upper, lower, digit, non-alphanumeric |

### Coaches

| Email | Display name |
|-------|----------------|
| `coach@test.com` | Ahmed Benali |
| `sara.coach@test.com` | Sara Martinez |
| `khaled.coach@test.com` | خالد العمري (Arabic sample data) |

### Clients

| Email | Display name |
|-------|----------------|
| `client@test.com` | Youssef Alami |
| `fatima@test.com` | Fatima Zahra |
| `omar@test.com` | Omar Idrissi |
| `mohammed@test.com` | محمد الشهري |
| `noura@test.com` | نورة القحطاني |

The seeder also creates sample clients without user accounts (pending invitations), training and meal programs (including Arabic content), assignments, workout logs, progress entries, reviews, and connection requests. Use these accounts to exercise **RTL** and **Arabic** copy by switching the UI language to Arabic.

If login fails after a schema change, ensure the database was recreated or migrated, and that seeding actually ran (check the `Users` table and app logs).

## API Endpoints

### Auth

- `POST /api/auth/register` — Register as coach
- `POST /api/auth/login` — Login
- `POST /api/auth/onboarding` — Complete client onboarding

### Clients (Coach, authorized)

- `GET /api/clients` — List coach's clients
- `GET /api/clients/{id}` — Client detail
- `POST /api/clients/invite` — Invite a client
- `GET /api/clients/{clientId}/assignments` — Client's program assignments
- `GET /api/clients/{clientId}/progress` — Client's progress entries
- `GET /api/clients/{clientId}/workout-logs` — Client's workout logs

### Training Programs (Coach, authorized)

- `GET /api/programs` — List coach's training programs
- `GET /api/programs/{id}` — Program detail
- `POST /api/programs` — Create program
- `PUT /api/programs/{id}` — Update program
- `POST /api/programs/{programId}/assign` — Assign program to client

### Meal Programs (Coach / client, authorized as appropriate)

- `GET /api/meal-programs` — List coach's meal programs
- `GET /api/meal-programs/{id}` — Meal program detail
- `POST /api/meal-programs` — Create meal program
- `PUT /api/meal-programs/{id}` — Update meal program
- `POST /api/meal-programs/assign` — Assign meal program to client
- `GET /api/meal-programs/assignments` — Client's assigned meal programs

### Progress (Client, authorized)

- `GET /api/progress` — Client's progress entries
- `POST /api/progress/entry` — Log a progress entry
- `GET /api/progress/assignments` — Client's training program assignments
- `GET /api/progress/workouts` — Client's workout logs
- `POST /api/progress/workout` — Log a workout

### Coach Search (Public)

- `GET /api/coaches/search?q=` — Search coaches (optional search term)
- `GET /api/coaches/{id}/reviews` — Public reviews for a coach
- `POST /api/coaches/connect` — Send a connection request (public)

### Connection Requests (Coach, authorized)

- `GET /api/connection-requests` — List pending requests for the current coach
- `PUT /api/connection-requests/{id}/accept` — Accept
- `PUT /api/connection-requests/{id}/reject` — Reject

### Reviews (Authorized)

- `POST /api/reviews` — Create a review
- `PUT /api/reviews/{id}` — Update a review
- `DELETE /api/reviews/{id}` — Delete a review
- `GET /api/reviews/client/{clientId}` — Reviews for a client relationship

### Error Logs (Coach, authorized)

- `GET /api/errorlogs` — Paginated error logs; query: `search`, `exceptionType`, `statusCode`, `httpMethod`, `from`, `to`, `page`, `pageSize`
- `DELETE /api/errorlogs/{id}` — Delete one log
- `DELETE /api/errorlogs` — Delete all logs

## Features

### Training Programs

Coaches create structured training programs with exercises (sets, reps, duration, rest). Programs are assigned to clients who can log their workout performance.

### Meal Programs

Coaches create flexible meal programs organized by days (e.g. “Monday”, “Day 1”). Each day contains meal items with optional nutritional info (calories, protein, carbs, fat). Programs are assigned to clients who can view their meal plans.

### Coach Search & Connection Requests

Users can search for coaches publicly (no account required) and send connection requests. Coaches accept or reject requests from the dashboard.

### Bidirectional Reviews

Coaches can review clients and clients can review coaches. Client reviews of coaches appear on the coach search experience with star ratings and comments.

### Multi-language Support (i18n)

Four languages: English, Arabic (RTL layout), French, and Spanish. Frontend strings and many API error messages are localized; language is sent via `Accept-Language` from the client.

### Error Logging

Unhandled exceptions are written to the **`ErrorLogs`** table (path, method, status code, exception type, message, stack trace, optional request body, etc.). Coaches can browse and filter them in the app under **Error Logs** (`/coach/errors`).

### ASP.NET Core Identity

User accounts use Identity’s user store and password hashing. Application roles **Coach** and **Client** are stored on the user record (`UserRole`); JWT claims still expose the role for authorization in the API.

## User Flows

### Coach Flow

1. Register → Coach Dashboard  
2. Invite clients via phone (SMS stubbed in development)  
3. Create training programs and meal programs  
4. Assign programs to clients  
5. Track progress, workouts, connection requests, reviews  
6. Optional: open **Error Logs** to inspect server-side failures  

### Client Flow

1. Invitation link or coach search → connection request / onboarding  
2. Set password on `/onboarding/:token`  
3. View programs, log workouts and progress, view meal plans  
4. Review coach  
