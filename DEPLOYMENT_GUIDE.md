# 🌍 HackTracker Global Production Deployment Guide

Deploy HackTracker live to the world with **$0 hosting cost** using **Vercel** (Frontend) + **Render.com / Railway** (Backend).

---

## ⚡ Quick 3-Step Free Deployment

### 1️⃣ Push Code to GitHub
Open your terminal in the project directory (`hacktracker`) and run:
```bash
git init
git add .
git commit -m "Initial commit - HackTracker Production"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/hacktracker.git
git push -u origin main
```

---

### 2️⃣ Deploy the Backend Server (on Render.com - 100% Free)
1. Go to **[Render.com](https://render.com)** and sign in with GitHub.
2. Click **"New +"** $\rightarrow$ **"Web Service"**.
3. Connect your `hacktracker` GitHub repository.
4. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_super_secret_production_key_123`
   - `DATABASE_URL`: `file:./dev.db`
   - `APIFY_API_TOKEN`: `apify_api_LsL1kWSh2sxL5xzRHMVBQWEFFJaDM04bNdkp`
6. Click **"Create Web Service"**.
7. Once deployed, copy your backend URL (e.g. `https://hacktracker-api.onrender.com`).

---

### 3️⃣ Deploy the Frontend UI (on Vercel - 100% Free)
1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Import your `hacktracker` GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://hacktracker-api.onrender.com/api` *(Your Render backend URL with `/api`)*
6. Click **"Deploy"**.

🎉 **Your website is now LIVE on the global internet!** (e.g. `https://hacktracker.vercel.app` or your custom domain).

---

## 🗄️ Optional: Cloud Database (PostgreSQL on Neon.tech - Free)
If you want persistent multi-region PostgreSQL without SQLite file locking:
1. Create a free database at **[Neon.tech](https://neon.tech)**.
2. Copy your connection string (`postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).
3. Set `DATABASE_URL` in your Render backend settings.
4. In `server/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
5. Run `npx prisma db push` on deployment.
