# 🚀 Ultimate Hybrid Deployment Guide: Render + Railway + Vercel

This guide provides step-by-step instructions to deploy your Library Management System using the **Hybrid Model** for the best balance of **Cost (Free)** and **Performance**.

**Architecture:**
- **Database**: TiDB Serverless (Free MySQL)
- **Backend Workers** (Auth, Library, Booking): Render (Free Tier)
- **API Gateway** (Entry Point): Railway (Fast & Reliable)
- **Frontend**: Vercel (Global CDN)

---

## ✅ Phase 1: Database Setup (10 Mins)
Since Render's free tier doesn't support persistent storage well, we use a cloud database.

1.  **Sign Up**: Go to [TiDB Cloud](https://tidbcloud.com/) and sign up (No credit card required).
2.  **Create Cluster**: 
    - Click "Create Cluster".
    - Select **"Serverless"** tier.
    - Choose a region (e.g., AWS Oregon).
    - Give it a name (e.g., `library-db`).
3.  **Get Credentials**:
    - Once created, click "Connect".
    - Copy the **Standard Connection** details:
        - Host (e.g., `gateway01.xxx.tidbcloud.com`)
        - Port (`4000`)
        - User
        - Password
4.  **Allow Traffic**: Ensure "IP Access List" is set to "0.0.0.0/0" (Allow All) so Render/Railway can connect.

---

## ✅ Phase 2: GitHub Prep (5 Mins)
1.  Create a new Repository on GitHub (e.g., `library-app-complete`).
2.  Push your entire project (`d:\Library_App`) to this repository.
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main
    ```

---

## ✅ Phase 3: Deploy Workers on Render (20 Mins)
We will deploy the heavy services here for free.

### A. Deploy `auth-service`
1.  Log in to [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Settings**:
    - **Name**: `library-auth`
    - **Root Directory**: `auth-service`
    - **Runtime**: Java
    - **Build Command**: `mvn clean package -DskipTests`
    - **Start Command**: `java -jar target/auth-service-0.0.1-SNAPSHOT.jar` (Check your actual jar name in `target/` if unsure, usually it matches artifactId-version).
5.  **Environment Variables** (Click "Advanced"):
    - `DB_URL`: `jdbc:mysql://<TiDB_Host>:4000/library_db?sslMode=VERIFY_IDENTITY`
    - `DB_USERNAME`: `<TiDB_User>`
    - `DB_PASSWORD`: `<TiDB_Password>`
    - `EUREKA_CLIENT_ENABLED`: `false`
    - `JWT_SECRET`: `super_secret_key_at_least_32_chars_long`
6.  Click **Create Web Service**.
7.  **Wait**: It will transform code to a live app.
8.  **Copy URL**: Once live, copy the URL (e.g., `https://library-auth.onrender.com`).

### B. Deploy `library-service` & `booking-service`
Repeat the exact steps above for both services.
- Change **Root Directory** to `library-service` / `booking-service`.
- Add the same **Environment Variables**.
- **Copy their URLs** once deployed.

---

## ✅ Phase 4: Deploy Gateway on Railway (10 Mins)
Railway keeps the "Front Door" of your app open and fast.

1.  Log in to [Railway.app](https://railway.app).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  **Configure**:
    - Click on the project card.
    - Go to **Settings** -> **Root Directory**: Set to `api-gateway`.
5.  **Variables**: Go to the **Variables** tab and add:
    - `EUREKA_CLIENT_ENABLED` = `false`
    - `AUTH_SERVICE_URL` = `https://library-auth.onrender.com` (Your Render URL from Phase 3A)
    - `LIBRARY_SERVICE_URL` = `https://library-library.onrender.com` (Your Render URL)
    - `BOOKING_SERVICE_URL` = `https://library-booking.onrender.com` (Your Render URL)
    - `JWT_SECRET` = `super_secret_key_at_least_32_chars_long` (Must match Phase 3)
6.  Railway will automatically redeploy. Use the **Generated Domain** (e.g., `https://api-gateway-production.up.railway.app`).
    - *Note: If no domain is generated, go to Settings -> Networking -> Generate Domain.*

---

## ✅ Phase 5: Deploy Frontend on Vercel (5 Mins)
1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite (should auto-detect).
5.  **Root Directory**: Click "Edit" and select `library-frontend`.
6.  **Environment Variables**:
    - Key: `VITE_API_BASE_URL`
    - Value: `https://api-gateway-production.up.railway.app` (Your Railway Domain)
7.  Click **Deploy**.

---

## 🎉 Done!
- Open your **Vercel** URL.
- **Test**: Try to login. 
    - The request goes: Vercel -> Railway (Gateway) -> Render (Auth Service) -> TiDB (Database).
    - The first login might take **10-20 seconds** (Render waking up).
    - Subsequent requests will be fast!
