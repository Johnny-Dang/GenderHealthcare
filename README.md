# 💡 [Gender Healthcare Service Management System](https://genderhealthcare.vercel.app/)

A Fullstack Monorepo for managing gender healthcare services, built with **ReactJS (Frontend)** and **ASP.NET Core Web API (Backend)**.

---

## 📁 Project Structure

```
GenderHealthcareServiceManagementSystem/
│
├── frontend/    # ReactJS application
├── backend/     # ASP.NET Core Web API
├── README.md
└── .gitigore
```

---

## ✅ Environment Requirements

### 🔷 Frontend (ReactJS)

- Node.js >= 18.x
- npm or yarn

### 🔶 Backend (ASP.NET Core Web API)

- .NET 6 SDK or later (recommend .NET 8)
- (Optional) SQL Server (for Entity Framework Core)

---

## 🚀 How to Setup and Run the Project

### 1. Clone the Repository

```bash
git clone git@github.com:Johnny-Dang/GenderHealthCareServiceManagementSystem.git
cd GenderHealthcareServiceManagementSystem
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env         # Modify environment variables if needed
npm install                  # or: yarn
npm start                    # Start the React development server
```

### 3. Setup Backend

```bash
cd ../backend
cp appsettings.Development.json.example appsettings.Development.json
dotnet restore                        # Install backend dependencies
dotnet ef database update             # Apply EF Core migrations (if any)
dotnet run                            # Start the Web API server
```

---

## 🌿 Branch Naming Convention (MonoRepo)

To maintain a clean and scalable workflow in a **monorepo structure**, we follow a consistent naming convention for Git branches:

### 🔧 Naming Format

```
<type>/<module>/<short-description>-<task-id>
```

- **<type>**: Type of work (`feature`, `fix`, `refactor`, `chore`, `hotfix`, `test`, `docs`)
- **<module>**: `fe` for frontend, `be` for backend
- **<short-description>**: Brief description using kebab-case
- **<task-id>**: Optional task or issue ID (e.g., `FE101`, `BE204`)

> 🔹 Example: `feature/fe/login-page-FE101`, `fix/be/token-expiry-BE88`

---

### 📁 Common Branch Types

| Prefix      | Description                           |
| ----------- | ------------------------------------- |
| `feature/`  | Add new features                      |
| `fix/`      | Bug fixes                             |
| `hotfix/`   | Urgent production fixes               |
| `refactor/` | Code refactoring, no behavior changes |
| `chore/`    | Tooling, CI/CD, environment configs   |
| `test/`     | Add or update tests                   |
| `docs/`     | Documentation updates                 |

---

### 🧭 Sample Branch Names

| Purpose                     | Branch Name                           |
| --------------------------- | ------------------------------------- |
| FE: Login UI                | `feature/fe/login-page-FE101`         |
| BE: User authentication API | `feature/be/user-authentication-BE45` |
| FE: Fix responsive bug      | `fix/fe/navbar-bug-FE202`             |
| BE: Fix CORS issue          | `fix/be/cors-policy-BE88`             |
| BE: Refactor business logic | `refactor/be/order-service-BE777`     |
| FE: Update README           | `docs/fe/update-readme-FE10`          |

---

## 📌 Best Practices

- Use lowercase letters and kebab-case (`-`) to separate words.
- Keep branch names concise and meaningful.
- Always include the module (`fe` or `be`) to avoid confusion.
- Link branch names to task IDs from your PM tool (Jira, Trello, GitHub Projects, etc.)

---

## 📣 Recommended Workflow

1. **Create branch** based on this naming convention.
2. **Commit and push** regularly with meaningful messages.
3. Open **pull request** referencing the related task/issue.
4. Follow **code review process** with teammates.

---

🔗 **Live site**: [https://genderhealthcare.vercel.app](https://genderhealthcare.vercel.app)

Happy coding! 💻💙---

## ✍️ Commit Message Guidelines

To ensure clarity and consistency, follow this structured format for commit messages:

### 🔧 Commit Format

```
<type>(<scope>): <short-description>
```

- **<type>**: Type of change (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`)
- **<scope>**: Optional, module or component (`fe`, `be`, `auth`, `db`, etc.)
- **<short-description>**: Clear summary in present tense

> 🔹 Example: `feat(fe): add login page UI`, `fix(be): correct token expiration bug`

### 📁 Common Commit Types

| Type       | Meaning                                              |
| ---------- | ---------------------------------------------------- |
| `feat`     | A new feature                                        |
| `fix`      | A bug fix                                            |
| `docs`     | Documentation changes                                |
| `style`    | Code style changes (formatting, missing semi colons) |
| `refactor` | Code refactoring (no behavior change)                |
| `test`     | Adding or fixing tests                               |
| `chore`    | Maintenance, CI/CD configs, build tools              |

### 📌 Best Practices

- Use the imperative mood: `add` not `added` or `adds`
- Limit the subject line to 50 characters
- Capitalize the subject line
- Do not end the subject line with a period

---
