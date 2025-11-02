Deployment Guide

Overview

- Monorepo with `backend` (Express + MongoDB + JWT) and `frontend` (Next.js 14 App Router + Tailwind).
- You can deploy using Docker Compose locally/on a server, or split: frontend on Vercel and backend on Render/Railway/VM.

Option A — Docker Compose (Frontend + Backend + Mongo)

Prereqs: Docker + Docker Compose.

1) Configure secrets
   - Edit `docker-compose.yml` to set a strong `JWT_SECRET`.
2) Build and run
   - `docker compose up --build -d`
   - Frontend at http://localhost:3000
   - Backend at http://localhost:5000
   - Mongo at localhost:27017
3) Environment notes
   - Frontend uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000` baked at build time.
   - Backend runs with `NODE_ENV=production`. Auth works via Bearer token and cookies (cookies require HTTPS for `SameSite=None;Secure`).

Option B — Split: Vercel (frontend) + Render/Railway (backend)

Backend (Render/Railway/VM)
- Env vars: `PORT=5000`, `MONGOURI`, `JWT_SECRET`.
- Start command: `npm run start:prod` (or `node app.js`).
- CORS: backend is configured with `origin: true; credentials: true` — OK with a single frontend origin.

Frontend (Vercel)
- Set env: `NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND-HOST:5000`.
- Build command: `npm run build`. Output: Next.js app.

Manual Node deploy (no Docker)

Backend
- From `backend/`: `npm ci` then `npm run start:prod` (requires `MONGOURI` and `JWT_SECRET`).

Frontend
- From `frontend/`: `npm ci` then `npm run build` and `npm start` (set `NEXT_PUBLIC_API_BASE_URL`).

Troubleshooting

- Cookies not set in HTTP (no HTTPS): tokens still work via Authorization header; for cookies, enable HTTPS and keep `NODE_ENV=production`.
- Next dev cache on Windows: we disable webpack fs cache in dev. For prod builds, it's unaffected.
- If the frontend points to `http://backend:5000` (service name) it won't work in the browser; use a host-resolvable URL like `http://localhost:5000`.

