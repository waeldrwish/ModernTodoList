Todo Frontend (Next.js)

Overview

- Next.js app (App Router + TypeScript) for the existing Express/Mongo backend in `backend/`.
- Supports signup/login/logout and full CRUD for tasks.
- Uses cookie-based auth by default via Next.js rewrite proxy (`/api/*` -> `http://localhost:5000/*`).

Getting Started

- Prerequisites: Node.js 18+ and pnpm/npm/yarn.
- Backend: ensure it runs on `http://localhost:5000` and has `.env` with `MONGOURI` and `JWT_SECRET`.
  - From `backend/`: `npm install` then `npm start`.
- Frontend:
  - From `frontend/`: `npm install` then `npm run dev`.
  - Open http://localhost:3000.

Configuration

- Default API base uses Next.js rewrites so requests go to `/api/*` and are proxied to `http://localhost:5000`.
- To point to a different backend URL directly from the browser, set `frontend/.env.local`:
  - `NEXT_PUBLIC_API_BASE_URL=http://your-backend-host:5000`

Key Files

- `frontend/next.config.js`: rewrites `/api/:path*` to the backend.
- `frontend/lib/api.ts`: tiny API client with `fetch` and token storage.
- `frontend/app/login/page.tsx`: login form.
- `frontend/app/signup/page.tsx`: signup form.
- `frontend/app/tasks/page.tsx`: tasks list + create/edit/toggle/delete.
- `frontend/components/NavBar.tsx`: top bar with logout.

