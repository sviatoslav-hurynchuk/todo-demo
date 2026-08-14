# TodoApp — Enterprise Task Management System

A production-oriented To-Do application built with **ASP.NET Core 10 Web API** (4-tier architecture) and an **Angular 20** single-page application. Inspired by [Microsoft To Do](https://to-do.office.com/) design language.

---

## UI Showcase

| Main Dashboard & Task List | Task Form & DatePicker |
| :---: | :---: |
| ![Main Dashboard](https://github.com/user-attachments/assets/21f37ee7-9d42-4004-9165-0aa3ffddd62b) | ![Task Form](https://github.com/user-attachments/assets/5e036d1c-1968-4526-bd4d-d981806ecb60) |

| Category Management | Mobile View |
| :---: | :---: |
| ![Categories](https://github.com/user-attachments/assets/ba892bcd-c0fc-4f9b-b3c5-284aa2f4a13d) | ![Mobile View](https://github.com/user-attachments/assets/28e26d04-6c7d-4286-8bbd-dc31cb0b2974) |

---

## 1. System Architecture

The solution adheres strictly to a 4-layer (N-Tier) separation of concerns:

```
                  ┌────────────────────────┐
                  │          Api           │ (Presentation / REST API)
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │        Services        │ (Business Logic & DTOs)
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │       Interfaces       │ (Abstractions & Contracts)
                  └───────────▲────────────┘
                              │
                  ┌───────────┴────────────┐
                  │       DataAccess       │ (Persistence & EF Core)
                  └────────────────────────┘
```

### Layer Responsibilities

1. **`Api` (Presentation Layer)**
   - HTTP request handling, route mapping, and payload validation.
   - Authentication / Authorization pipeline (JWT Bearer).
   - Global exception handling middleware (`GlobalExceptionHandler`).
   - Rate limiting on auth endpoints (10 req/min per IP).
   - Swagger / OpenAPI documentation (development only).

2. **`Services` (Business Logic Layer)**
   - Core domain logic, business validation rules, `Result<T>` pattern.
   - DTO mappings (`TaskDtos`, `CategoryDtos`, `AuthDtos`).
   - Server-side pagination, search, and filter processing.
   - JWT token generation (`JwtTokenGenerator`) and password hashing (BCrypt).
   - Background `TokenCleanupService` for expired refresh token removal.

3. **`Interfaces` (Abstraction Layer)**
   - Interface contracts for all services (`ITaskService`, `ICategoryService`, `IAuthService`, `IJwtTokenGenerator`).
   - Shared `Result<T>` type for explicit error handling.
   - DTO definitions shared between Services and Api layers.

4. **`DataAccess` (Data Access Layer)**
   - Entity Framework Core `AppDbContext` configuration.
   - Domain entities (`User`, `Category`, `TaskItem`, `RefreshToken`).
   - Fluent API entity configurations (indexes, constraints).
   - Database migrations with automatic application on startup.

---

## 2. Technology Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Backend Runtime** | .NET | 10.0 |
| **Web Framework** | ASP.NET Core Web API | 10.0 |
| **ORM** | Entity Framework Core | 10.0 |
| **Database** | SQLite | — |
| **Authentication** | JWT Bearer (HMAC-SHA256) + HttpOnly Refresh Tokens | — |
| **Frontend Framework** | Angular (Standalone Components) | 20.3 |
| **Language** | TypeScript | 5.9 |
| **Reactive Programming** | RxJS | 7.8 |
| **Styling** | SCSS (custom, no CSS framework) | — |

---

## 3. Features

### Backend
- **JWT Authentication** — access token (15 min) + refresh token (7 days, HttpOnly cookie) rotation.
- **Rate Limiting** — fixed-window (10/min) on authentication endpoints.
- **Paginated Task Queries** — search, filter by category / completion / importance.
- **Task Toggle** — `PATCH /api/tasks/{id}/toggle` for quick completion toggle.
- **Category Management** — user-scoped categories with color and task count.
- **Background Cleanup** — `TokenCleanupService` periodically removes expired refresh tokens.
- **Auto-Migration** — `Database.Migrate()` on startup for zero-config development.
- **Global Error Handling** — structured `ProblemDetails` responses via `IExceptionHandler`.

### Frontend
- **Microsoft To Do–inspired UI** — clean, minimal design with SCSS custom styling.
- **Reactive Forms** — typed `FormGroup` with `NonNullableFormBuilder` and custom validators.
- **Lazy-loaded Routes** — `login`, `register`, `dashboard` loaded on demand.
- **Auth Guards** — `authGuard` (protected routes) and `guestGuard` (login/register).
- **HTTP Interceptor** — automatic `Authorization` header injection and 401 token refresh.
- **Signal-based State** — Angular signals for component-level reactive state.
- **RxJS Pipelines** — `switchMap` for stale request cancellation, `takeUntilDestroyed` for cleanup.
- **Custom DatePicker** — `ControlValueAccessor`-based component with English locale calendar.
- **Toast Notifications** — `ToastService` with success / error / info variants.
- **Responsive Layout** — sidebar drawer on mobile (≤480px), resize observer for state sync.
- **Accessibility** — focus trap in modals, `aria-label`, `aria-expanded`, scoped Escape handling.

---

## 4. Directory Specification

```
todo-demo/
├── README.md
├── .gitignore
├── .coderabbit.yaml
│
├── backend/
│   ├── TodoApp.slnx
│   │
│   ├── Interfaces/                          # Abstraction Layer
│   │   ├── TodoApp.Interfaces.csproj
│   │   ├── Common/
│   │   │   └── Result.cs                    # Result<T> pattern
│   │   ├── DTOs/
│   │   │   ├── AuthDtos.cs
│   │   │   ├── CategoryDtos.cs
│   │   │   └── TaskDtos.cs
│   │   ├── IAuthService.cs
│   │   ├── ICategoryService.cs
│   │   ├── IJwtTokenGenerator.cs
│   │   └── ITaskService.cs
│   │
│   ├── DataAccess/                          # Persistence Layer
│   │   ├── TodoApp.DataAccess.csproj
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── TaskItem.cs
│   │   │   ├── Category.cs
│   │   │   └── RefreshToken.cs
│   │   ├── Configurations/
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── TaskItemConfiguration.cs
│   │   │   ├── CategoryConfiguration.cs
│   │   │   └── RefreshTokenConfiguration.cs
│   │   └── Migrations/
│   │       ├── 20260730_InitialCreate
│   │       ├── 20260802_AddRefreshTokenTable
│   │       ├── 20260804_AddTasksCompositeIndex
│   │       ├── 20260811_AddRefreshTokenCleanupIndexes
│   │       └── 20260812_DueDateToDateOnly
│   │
│   ├── Services/                            # Business Logic Layer
│   │   ├── TodoApp.Services.csproj
│   │   ├── Helpers/
│   │   │   └── JwtTokenGenerator.cs
│   │   └── Services/
│   │       ├── AuthService.cs
│   │       ├── CategoryService.cs
│   │       ├── TaskService.cs
│   │       └── TokenCleanupService.cs
│   │
│   └── Api/                                 # Presentation Layer
│       ├── TodoApp.Api.csproj
│       ├── Program.cs
│       ├── appsettings.json
│       ├── Controllers/
│       │   ├── AuthenticatedControllerBase.cs
│       │   ├── AuthController.cs
│       │   ├── TasksController.cs
│       │   └── CategoriesController.cs
│       └── Middleware/
│           └── GlobalExceptionHandler.cs
│
└── frontend/
    ├── package.json
    ├── angular.json
    ├── tsconfig.json / tsconfig.app.json
    └── src/
        └── app/
            ├── app.ts                       # Root component
            ├── app.routes.ts                # Lazy-loaded route config
            ├── app.config.ts                # Provider configuration
            ├── app.html / app.scss
            │
            ├── core/                        # Singleton services & guards
            │   ├── guards/
            │   │   ├── auth.guard.ts
            │   │   └── guest.guard.ts
            │   ├── interceptors/
            │   │   └── auth.interceptor.ts
            │   ├── models/
            │   │   ├── auth.model.ts
            │   │   ├── category.model.ts
            │   │   ├── task.model.ts
            │   │   └── pagination.model.ts
            │   └── services/
            │       ├── auth.service.ts
            │       ├── category.service.ts
            │       ├── task.service.ts
            │       └── toast.service.ts
            │
            ├── features/                    # Feature modules
            │   ├── auth/
            │   │   ├── login/               # Login page component
            │   │   └── register/            # Register page component
            │   ├── dashboard/
            │   │   ├── dashboard.component  # Main layout shell
            │   │   ├── sidebar/             # Navigation sidebar
            │   │   └── category-form/       # Category create/edit modal
            │   └── tasks/
            │       ├── task-list/           # Paginated task list with search & filters
            │       ├── task-item/           # Single task row component
            │       └── task-form/           # Task create/edit modal
            │
            └── shared/                      # Reusable components & utilities
                ├── components/
                │   ├── navbar/              # Top navigation bar
                │   ├── date-picker/         # Custom English calendar picker
                │   └── toast-container/     # Toast notification renderer
                └── validators/
                    └── no-whitespace.validator.ts
```

---

## 5. API Endpoints Specification

### Authentication
| Method | Endpoint | Description | Auth | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No | Yes |
| `POST` | `/api/auth/login` | Authenticate & return JWT + refresh cookie | No | Yes |
| `POST` | `/api/auth/refresh-token` | Rotate access token via HttpOnly cookie | No | Yes |
| `POST` | `/api/auth/revoke-token` | Invalidate refresh token | Yes | No |

### Tasks
| Method | Endpoint | Query Parameters | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | `page`, `pageSize`, `search`, `categoryId`, `isCompleted`, `isImportant` | Paginated task list with filters | Yes |
| `GET` | `/api/tasks/{id}` | — | Retrieve task by ID | Yes |
| `POST` | `/api/tasks` | — | Create a new task | Yes |
| `PUT` | `/api/tasks/{id}` | — | Update task details | Yes |
| `DELETE` | `/api/tasks/{id}` | — | Delete task | Yes |
| `PATCH` | `/api/tasks/{id}/toggle` | — | Toggle task completion | Yes |

### Categories
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get user categories with task counts | Yes |
| `GET` | `/api/categories/{id}` | Get category by ID | Yes |
| `POST` | `/api/categories` | Create custom category | Yes |
| `PUT` | `/api/categories/{id}` | Update category name / color | Yes |
| `DELETE` | `/api/categories/{id}` | Delete category | Yes |

---

## 6. Build & Environment Instructions

### Prerequisites
- .NET 10.0 SDK
- Node.js v22.x LTS
- npm 10.x+

### Backend

```bash
cd backend
dotnet restore
dotnet build TodoApp.slnx
dotnet run --project Api/TodoApp.Api.csproj
```

The API starts at `https://localhost:7194` (or `http://localhost:5194`).
Swagger UI is available at the root URL in development mode.
Database migrations are applied automatically on startup.

### Frontend

```bash
cd frontend
npm install
npm start
```

The SPA starts at `http://localhost:4200` and proxies API requests to the backend.

---

## 7. Domain Model

```
┌──────────┐       ┌───────────┐       ┌──────────────┐
│   User   │──1:N──│  Category │──1:N──│   TaskItem   │
│          │       │           │       │              │
│ Id       │       │ Id        │       │ Id           │
│ Username │       │ Name      │       │ Title        │
│ Email    │       │ Color     │       │ Description? │
│ Password │       │ UserId    │       │ IsCompleted  │
│ CreatedAt│       │           │       │ IsImportant  │
└──────────┘       └───────────┘       │ DueDate?     │
      │                                │ CategoryId?  │
      │         ┌───────────────┐      │ UserId       │
      └──1:N────│ RefreshToken  │      │ CreatedAt    │
                │               │      └──────────────┘
                │ Id            │
                │ Token         │
                │ ExpiresAt     │
                │ IsRevoked     │
                │ UserId        │
                └───────────────┘
```
