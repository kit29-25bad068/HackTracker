# 🚂 HackTracker Global Deployment Guide for Railway.app

Deploy HackTracker live on **[Railway.app](https://railway.app)** with automated CI/CD, free SSL, and high performance.

---

## ⚡ Quick 3-Step Railway Deployment

### 1️⃣ Push Your Project to GitHub

If you haven't pushed your code to GitHub yet, run these commands in your project folder (`hacktracker`):
```bash
git init
git add .
git commit -m "Deploy HackTracker to Railway"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/hacktracker.git
git push -u origin main
```

---

### 2️⃣ Deploy Backend Server on Railway

1. Go to **[Railway.app](https://railway.app)** and log in with your GitHub account.
2. Click **"New Project"** $\rightarrow$ select **"Deploy from GitHub repo"**.
3. Select your **`hacktracker`** repository.
4. Click **"Add variables"** (or open the **Variables** tab for the service) and add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `hacktracker_super_secret_railway_key_2026`
   - `DATABASE_URL`: `file:./dev.db`
   - `APIFY_API_TOKEN`: `apify_api_LsL1kWSh2sxL5xzRHMVBQWEFFJaDM04bNdkp`
5. In the **Settings** tab of the service:
   - Under **Root Directory**, enter: `server`
   - Under **Build Command**, enter: `npm install && npm run build`
   - Under **Start Command**, enter: `npm start`
   - Under **Networking**, click **"Generate Domain"** (e.g. `hacktracker-production-xyz.up.railway.app`).
6. Copy your generated public backend domain (e.g. `https://hacktracker-production-xyz.up.railway.app`).

---

### 3️⃣ Deploy Frontend UI (on Vercel or Railway)

#### Option A: On Vercel (Recommended for instant global CDN speeds)
1. Go to **[Vercel.com](https://vercel.com)** $\rightarrow$ **"Add New..."** $\rightarrow$ **"Project"**.
2. Select your `hacktracker` repository.
3. Set **Root Directory** to `client`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://hacktracker-production-xyz.up.railway.app/api` *(Your Railway domain with `/api`)*
5. Click **"Deploy"**.

#### Option B: On Railway as a second service
1. In your Railway project canvas, click **"+ Create"** $\rightarrow$ **"GitHub Repo"** $\rightarrow$ select `hacktracker`.
2. In Settings:
   - Set **Root Directory**: `client`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm run preview`
   - Under Variables: add `VITE_API_URL=https://hacktracker-production-xyz.up.railway.app/api`
   - Under Networking: click **"Generate Domain"**.

---

### 🎉 Your Global HackTracker Website is Live!
Any updates you push to GitHub will now automatically rebuild and deploy to Railway in real-time.
