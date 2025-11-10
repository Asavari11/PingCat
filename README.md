# PingCat User Manual

## Overview
PingCat is a cross-platform desktop browser-like application built with:
- Frontend: React 18 + Vite + TypeScript + TailwindCSS + Radix UI components
- Desktop shell: Electron (custom frameless window, downloads, terminal spawning, AI integration)
- Backend API: Node.js + Express + MongoDB (Mongoose) for authentication & profiles
- AI features: Gemini API integration (replace hardcoded key with env var before production)

This manual guides a first‑time setup on Windows (PowerShell) but is applicable to macOS/Linux with minor command changes.

## Repository
- GitHub: https://github.com/Asavari11/PingCat

## Prerequisites
1. Node.js
   - Recommended: Node.js v18.x or later (Electron 38 + Vite 5 + React 18 rely on modern ESM features).
   - Download: https://nodejs.org/en/download
   - Verify: `node -v` and `npm -v`

2. Git (to clone the repository)
   - https://git-scm.com/downloads
   - Verify: `git --version`

3. MongoDB
   - MongoDB Atlas (cloud): https://www.mongodb.com/atlas/database
   Obtain a connection string (e.g. `mongodb+srv://<user>:<passowrd>@pingcatcluster.yzeuwkj.mongodb.net/?appName=PingCatcluster`).

4. Gemini API Key
   - Obtain from Google AI Studio: https://ai.google.dev
   - Replace the hardcoded key in `electron/main.ts` with an environment variable before production use.

5. Recommended Tools
   - VS Code for development: https://code.visualstudio.com
   - MongoDB Compass (GUI): https://www.mongodb.com/products/compass

## Project Directory Structure (Key Parts)
```
Root
  package.json       (Frontend + Electron scripts)
  vite.config.ts     (Dev server on port 8080)
  electron/          (Electron main & preload scripts)
  src/               (React application source)
  backend/           (API server: Express + Mongoose)
  aiaccess/          (Folder for AI use)

Backend
  backend/src/server.ts   (Express startup)
  backend/src/routes/auth.ts (routes)
  backend/src/routes/profiles.ts (Profile-related endpoints)
  backend/src/models/User.ts    (User schema)

Src
  src/pages/Login.tsx     (Login page`)
  src/services/authService.ts   (Auth Handle)
  src/services/settingsService.ts (Local settings management)
  src/components/*        (UI components)

Electron
  electron/main.ts        (App window, downloads, IPC, terminal commands, Gemini query handler)
```

### Local Storage Keys Used
- `activeProfile`
- `profiles`
- `browser_settings`
- `browser_downloads`
- `authToken`

## Environment Configuration
You will need TWO .env files (copy the provided examples):
1. Backend: `backend/.env` (start from `backend/.env.example`)
2. Frontend/Electron root: `.env` at repository root for Vite (start from `.env.example`)

Sample `backend/.env`:
```
PORT=5000
MONGO_URI=<MONGI_URI>
JWT_SECRET=<replace_with_long_random_string>
FRONTEND_URL=http://localhost:8080
```

Sample root `.env` (for Vite):
```
VITE_API_URL=http://localhost:5000
GEMINI_API_KEY=your_gemini_key_here  # (Refactor main.ts to use this variable)
```

## User Credentials
Current implementation exposes only a standard user role (no separate Admin/Guest layers yet). You create accounts via the signup endpoint.

Test / Demo Credentials (create manually):
- Username: demo
- Email: demo@example.com
- Password: Choose a strong password (e.g. `DemoPass123!`)

No default admin user is provisioned. If you need role separation, implement additional fields (e.g. `role: 'admin' | 'user'`) in `User.ts` and guard routes accordingly.

Account Lifecycle Endpoints
- Signup: POST `/api/signup`
- Login:  POST `/api/login`

## Execution Steps
1. Clone the repository:
```powershell
git clone https://github.com/Asavari11/PingCat.git
cd PingCat
```

2. Install root (frontend + electron) dependencies:
```powershell
npm install
```

3. Install backend dependencies:
```powershell
cd backend
npm install
cd ..
```

4. Create environment files:
   - Add `backend/.env` (see sample above).
   - Add root `.env` (see sample above).

5. Start MongoDB:
   - Atlas: No local step needed, just ensure firewall/IP whitelist is configured.

6. Run backend API (in separate terminal):
```powershell
cd backend
npm run dev
```
Expected console output:
- "MongoDB connected"
- "Server running on port 5000"

7. Run frontend + electron (new terminal at root):
```powershell
cd PingCat   # if not already there
npm run start
```
This invokes `concurrently` to run:
- Vite React dev server at http://localhost:8080
- Electron loading `ELECTRON_START_URL` (points to http://localhost:8080)

8. Access the application:
   - Electron window should open automatically.
   - If not, manually run: `npm run electron-start`

Stores `profile` in localStorage inside Electron/Browser environment.

## Verifying Successful Execution
- Backend: Console shows MongoDB connection and listening port.
- Frontend: Visit http://localhost:8080 in a browser (if not using Electron) confirms UI loads.
- Electron: Window opens with custom frame; menu can toggle DevTools.
- Login: After POST `/api/login`, localStorage keys `activeProfile` & `profiles` appear.
- Settings: Adjust settings and confirm `browser_settings` key updates in localStorage.
- Downloads: Initiate a download; progress events appear (watched via DevTools Console).

## Testing Tips
- Use MongoDB Compass to inspect the `users` collection.
- Test invalid credentials: send wrong password and expect `Invalid credentials` JSON error.

## Troubleshooting
Issue: Electron window stays blank.
- Ensure Vite dev server started (port 8080). Check logs for build errors.
- Confirm `ELECTRON_START_URL` is set (default uses http://localhost:8080) and not blocked by firewall.

Issue: Cannot connect to MongoDB.
- Verify `MONGO_URI` correctness and accessibility (Atlas: IP whitelist).

Issue: Password reset email not sent.
- Confirm Gmail App Password (not regular account password).
- Check less secure app access / 2FA settings.

Issue: CORS errors.
- The backend enables `cors()`; ensure requests target `http://localhost:5000`.
- If using a different frontend port, adjust `FRONTEND_URL` and `VITE_API_URL`.

Issue: Gemini query fails.
- Replace hardcoded API key in `electron/main.ts` with `process.env.GEMINI_API_KEY`.
- Verify network connectivity and key quota.

Issue: Stale local data.
- Clear localStorage keys: `activeProfile`, `profiles`, `browser_settings`, `browser_downloads`, `authToken`.

## Reset / Restart
1. Stop all terminals (Ctrl+C).
2. Clear localStorage (DevTools > Application > Clear Storage).
3. Restart backend and then frontend/electron.

## Security Notes
- Do NOT leave real API keys or Gmail credentials in source control.
- Replace hardcoded Gemini API key before any distribution.
- Use strong, unique `JWT_SECRET`.
- Implement rate limiting, password strength validation, and HTTPS (reverse proxy) for production.

## Quick Reference Commands
Setup:
```powershell
npm install
cd backend; npm install; cd ..
```
Run:
```powershell
cd backend; npm run dev
# new terminal
npm run start
```
Build backend for production:
```powershell
cd backend
npm run build
npm start
```