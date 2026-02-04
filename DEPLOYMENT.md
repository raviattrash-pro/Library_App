# Deployment Guide

## 1. Frontend Deployment (Vercel) - Recommended for Best UI Experience
Vercel is the best platform for deploying React/Vite apps for free.

### Steps:
1. Push your code to **GitHub**.
2. Go to [Vercel](https://vercel.com) and Sign Up.
3. Click **"Add New Project"** and import your repository.
4. Select `library-frontend` as the root directory.
5. Vercel should auto-detect "Vite".
6. **Environment Variables**:
   - Add `VITE_API_BASE_URL` and set it to your backend URL (see below).
7. Click **Deploy**.

---

## 2. Backend Deployment - The "Free Tier" Challenge
You have a **Microservices Architecture** (Gateway, Auth, Booking, Library, Eureka, MySQL).
**Problem:** Free cloud providers (Render, Fly.io) usually spin down services after inactivity. With 5+ services, your app will be very slow (timeouts) as they wake up one by one.

### Option A: The "Best Performance" Free Method (Cloudflare Tunnel)
Keep the backend running on your powerful local machine and expose it safely to the internet. This gives you **server-grade performance** for **$0**.

1. **Run your backend locally**:
   ```powershell
   docker-compose up -d
   ```
2. **Install Cloudflared**:
   - Download [Cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) for Windows.
3. **Start the Tunnel**:
   ```powershell
   cloudflared tunnel --url http://localhost:8080
   ```
4. Copy the URL provided (e.g., `https://random-name.trycloudflare.com`).
5. Go to your **Vercel Project Settings > Environment Variables**.
   - Set `VITE_API_BASE_URL` to this Cloudflare URL.
6. **Redeploy** Frontend in Vercel.

### Option B: Cloud Hosting (Render/Railway)
If you must deploy to the cloud, **Railway** is better for Docker Compose, but it is not permanently free (trial credits). **Render** is free but lacks Docker Compose support on the free tier, meaning you must deploy 6 separate services manually.

**Recommendation**: Use **Option A** for demonstrations/portfolios. Use **Option B** (Paid) for real production usage.
