# TodoApp - Enterprise Task Management System

A production-oriented To-Do Application built with **ASP.NET Core Web API** utilizing a strict 4-tier architecture and an **Angular** single-page application (SPA).

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
   - Authentication/Authorization pipeline enforcement (JWT Bearer).
   - Global exception handling middleware.

2. **`Services` (Business Logic Layer)**
   - Core domain logic, business validation rules.
   - Data transfer object (DTO) mappings.
   - Server-side pagination, searching, and filter processing.
   - Cryptographic utilities (JWT token generation, password hashing).

3. **`Interfaces` (Abstraction Layer)**
   - Interface contracts for all services and repositories.
   - Decouples API and Service layers from concrete data access implementations.

4. **`DataAccess` (Data Access Layer)**
   - Entity Framework Core `DbContext` configuration.
   - Domain entity definitions (`User`, `Category`, `TaskItem`).
   - Generic repository implementation and database migrations.

---

## 2. Technology Stack

- **Backend**: .NET 10.0 C# REST API
- **ORM**: Entity Framework Core
- **Database**: SQLite (default for development) / MS SQL Server compatible
- **Security**: JWT (JSON Web Tokens) with HMAC-SHA256 signing
- **Frontend**: Angular 19+ (TypeScript, RxJS, Reactive Forms)
- **Styling**: Modern Responsive UI (Bootstrap 5 / Tailwind CSS)

---

## 3. Directory Specification

```
todo-demo/
├── README.md
├── .gitignore
│
├── backend/
│   ├── TodoApp.slnx
│   ├── Interfaces/
│   │   ├── TodoApp.Interfaces.csproj
│   │   ├── ITaskService.cs
│   │   ├── ICategoryService.cs
│   │   ├── IAuthService.cs
│   │   └── IRepository.cs
│   ├── DataAccess/
│   │   ├── TodoApp.DataAccess.csproj
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── TaskItem.cs
│   │   │   └── Category.cs
│   │   └── Repositories/
│   │       └── Repository.cs
│   ├── Services/
│   │   ├── TodoApp.Services.csproj
│   │   ├── Services/
│   │   │   ├── TaskService.cs
│   │   │   ├── CategoryService.cs
│   │   │   └── AuthService.cs
│   │   └── DTOs/
│   │       ├── TaskDtos.cs
│   │       ├── CategoryDtos.cs
│   │       └── AuthDtos.cs
│   └── Api/
│       ├── TodoApp.Api.csproj
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── TasksController.cs
│       │   └── CategoriesController.cs
│       ├── Program.cs
│       └── appsettings.json
│
└── frontend/
    ├── package.json
    └── src/
        └── app/
            ├── core/
            │   ├── guards/
            │   ├── interceptors/
            │   ├── models/
            │   └── services/
            ├── features/
            │   ├── auth/
            │   ├── tasks/
            │   └── categories/
            └── shared/
                ├── navbar/
                └── pagination/
```

---

## 4. API Endpoints Specification

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |

### Tasks Management
| Method | Endpoint | Query Parameters | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | `pageNumber`, `pageSize`, `search`, `categoryId` | Paginated list of tasks with filters | Yes |
| `GET` | `/api/tasks/{id}` | - | Retrieve task by ID | Yes |
| `POST` | `/api/tasks` | - | Create a new task | Yes |
| `PUT` | `/api/tasks/{id}` | - | Update task details / status | Yes |
| `DELETE`| `/api/tasks/{id}` | - | Delete task | Yes |

### Categories
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Get user categories with task counts | Yes |
| `POST` | `/api/categories` | Create custom category | Yes |
| `PUT` | `/api/categories/{id}` | Update category name / color | Yes |
| `DELETE`| `/api/categories/{id}` | Delete category | Yes |

---

## 5. Build & Environment Instructions

### Prerequisites
- .NET 9.0/10.0 SDK or later
- Node.js (v20.x or v22.x LTS)
- npm 10.x+

### Backend Initialization
```bash
cd backend
dotnet restore
dotnet build TodoApp.slnx
dotnet run --project Api/TodoApp.Api.csproj
```

### Frontend Initialization
```bash
cd frontend
npm install
npm start
```
