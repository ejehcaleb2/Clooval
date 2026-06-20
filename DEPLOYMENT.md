FRONTEND (Vercel):

1. Connect the GitHub repository to Vercel.
2. Vercel will use `vercel.json` to build the frontend.
3. In Vercel dashboard set environment variable:
   - `VITE_API_URL = https://your-backend-url.onrender.com`
4. Deploy; Vercel will publish the site from `dist-frontend`.

BACKEND (Render or DigitalOcean):

1. Connect the GitHub repository.
2. Build command: `npm run build:backend`
3. Start command: `npm run start`
4. Set environment variables (copy values or set from `.env.example`):
   - `DATABASE_URL`, `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, `FRONTEND_URL`, `JWT_SECRET`, etc.
5. Deploy.

DATABASE (Supabase):

1. Create project at https://supabase.com and copy the connection string.
2. Set the string as `DATABASE_URL` in the backend service.

LOCAL DEVELOPMENT:

- Backend (API): `npm run dev` (runs `tsx server.ts`) — listens on port 3000 by default.
- Frontend (Vite): `npx vite` — listens on port 5173 by default.
- Optionally use `concurrently` to run both together.

Notes:
- Do not move source files between frontend and backend folders.
- The frontend build outputs to `dist-frontend` and the backend build outputs to `dist-backend`.
- Ensure `VITE_API_URL` is set in the frontend environment (Vercel or `.env.local` for local dev).
