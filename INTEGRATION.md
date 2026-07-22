# SafeX - Group 22 Integration Guide

This repo is the **Video Management module**. Every other Group 22 module
plugs into it through the shared shell (sidebar, topbar, theme, auth
context). Follow these rules so nothing conflicts.

---

## 1. Shared shell (already built)

- `src/App.tsx` - routes and layout
- `src/components/Sidebar.tsx` - nav (add your route here)
- `src/components/Topbar.tsx` - theme toggle + role switcher
- `src/context/AuthContext.tsx` - role/user (`Admin | General | Kids`)
- `src/context/ThemeContext.tsx` - light/dark

---

## 2. Where each teammate's module slots in

| Module                          | Route              | File to create                            |
| ------------------------------- | ------------------ | ----------------------------------------- |
| Auth (login / register / roles) | `/login` `/register` | `src/pages/Login.tsx`, `Register.tsx`   |
| Admin Dashboard (extended)      | `/dashboard`       | already scaffolded - extend `Dashboard.tsx` |
| Category Management             | `/categories`      | `src/pages/Categories.tsx`                |
| Recommendations                 | `/recommendations` | `src/pages/Recommendations.tsx`           |
| Kids Panel                      | `/kids`            | `src/pages/Kids.tsx`                      |

Placeholder pages already exist so navigation works today.
Replace the placeholder in `App.tsx` when the real component lands.

---

## 3. Backend contract (ASP.NET Core Web API)

All modules should follow the same conventions:

- Base URL: `VITE_API_BASE` (default `http://localhost:5080`)
- All admin endpoints require `Authorization: Bearer <jwt>`
- All list endpoints return an array, all mutations return the updated entity
- Snake nothing - use camelCase JSON (already default in ASP.NET Core)

Suggested endpoints per module:

```
Auth              POST   /api/auth/register
                  POST   /api/auth/login          → { token, user }
                  GET    /api/auth/me

Categories        GET    /api/categories
                  POST   /api/categories          (Admin)
                  PUT    /api/categories/{id}     (Admin)
                  DELETE /api/categories/{id}     (Admin)

Recommendations   POST   /api/recommendations     (any signed-in user)
                  GET    /api/recommendations     (Admin) ?status=Pending
                  POST   /api/recommendations/{id}/approve (Admin)
                  POST   /api/recommendations/{id}/reject  (Admin)

Kids Panel        GET    /api/videos?audience=kids
                  (server enforces: role=Kids ⇒ audience always forced to kids)
```

---

## 4. Auth wiring (5-minute change)

Once your Auth teammate ships the login endpoint:

1. In `Login.tsx`, after a successful POST, call:
   ```ts
   localStorage.setItem('safex.token', data.token)
   localStorage.setItem('safex.user',  JSON.stringify(data.user))
   ```
2. `src/lib/api.ts` already reads `safex.token` and sends it as
   `Authorization: Bearer …` on every request.
3. `AuthContext` already reads `safex.user` on boot - the sidebar
   role-gating starts working immediately.

---

## 5. Kids-safety rule (all teammates must follow)

Kids accounts must **never** see `audience = 'general'` content.
Enforce this on the server, not just the UI:

```csharp
// in every read endpoint that returns videos:
if (User.IsInRole("Kids"))
    query = query.Where(v => v.Audience == "kids"
                          && v.Status   == "Published"
                          && !v.IsDeleted);
```

---

## 6. Theme & design tokens

Use CSS variables from `src/styles/app.css`. **Do not hardcode colors.**
Examples:

```tsx
<div style={{ background: 'var(--surface)', color: 'var(--text)' }} />
<button className="btn btn-brand">Primary action</button>
<span className="badge-status badge-status-Published">Published</span>
```

Reusable classes: `.panel`, `.panel-pad`, `.card-video`, `.stat-card`,
`.chip-tab`, `.btn-brand`, `.btn-ghost`, `.empty`, `.skeleton`.

---

## 7. Git workflow for Group 22

Each teammate works on a branch named after their module:

```
main
├── feature/auth
├── feature/dashboard
├── feature/categories
├── feature/recommendations
├── feature/kids-panel
└── feature/video-management   ← this repo
```

Merge into `main` via pull request. The Group Leader reviews before merge.

---

## 8. Running the whole stack

```
# 1. Database (SSMS)
run database/01_create_database.sql
run database/02_seed_categories.sql

# 2. Backend
cd backend/SafeX.Api
dotnet run                # http://localhost:5080

# 3. Frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```
