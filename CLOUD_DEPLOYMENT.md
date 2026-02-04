# Free Cloud Deployment Guide

You requested a **"Cloud Only"** deployment for **FREE** with **Best Performance**.
This is challenging because microservices are heavy. However, **Render.com** (Free) + **TiDB Cloud** (Free MySQL) is the best working combination.

## Architecture Change for Free Cloud
To avoid paying \$$, we must simplify:
1.  **NO Eureka Server**: On Render, services might sleep. Dynamic IP discovery is unreliable on free tier. We will use **Direct URLs**.
2.  **NO Gateway Dynamic Routing**: We will hardcode Service URLs in the Gateway.
3.  **External Database**: Use a free managed MySQL (TiDB or Aiven).

---

## Step 1: Get a Free Database
1.  Sign up at **[TiDB Cloud](https://tidbcloud.com/)** (No credit card).
2.  Create a **Serverless Tier** MySQL cluster.
3.  Get the Connection details:
    - **Host**: `gateway01.us-west-2.prod.aws.tidbcloud.com` (example)
    - **User**: `failed_to_parse_user`
    - **Password**: `your_password`
    - **Port**: `4000`

---

## Step 2: Deploy Backend Services (Render)
You will deploy 4 services individually on Render.

### A. Deploy `auth-service`, `library-service`, `booking-service`
1.  Push your code to GitHub.
2.  In Render, create a **New Web Service**.
3.  Connect your repo.
4.  **Root Directory**: `auth-service` (for Auth), etc.
5.  **Build Command**: `mvn clean package -DskipTests`
6.  **Start Command**: `java -jar target/*.jar`
7.  **Environment Variables** (Add these in Render Dashboard for EACH service):
    - `DB_URL`: `jdbc:mysql://<your-tidb-host>:4000/library_db?sslMode=VERIFY_IDENTITY`
    - `DB_USERNAME`: `<your-tidb-user>`
    - `DB_PASSWORD`: `<your-tidb-password>`
    - `EUREKA_CLIENT_ENABLED`: `false` (We disable Eureka)

*Repeat this for Library and Booking services.*
*Note down their URLs (e.g., `https://library-app-auth.onrender.com`).*

### B. Deploy `api-gateway`
1.  Create a **New Web Service** for `api-gateway`.
2.  **Environment Variables**:
    - `AUTH_SERVICE_URL`: `https://your-auth-service.onrender.com`
    - `LIBRARY_SERVICE_URL`: `https://your-library-service.onrender.com`
    - `BOOKING_SERVICE_URL`: `https://your-booking-service.onrender.com`
    - `EUREKA_CLIENT_ENABLED`: `false`

*This Gateway URL (e.g., `https://library-gateway.onrender.com`) is your **Backend URL**.*

---

## Step 3: Deploy Frontend (Vercel)
1.  In Vercel, import `library-frontend`.
2.  **Environment Variables**:
    - `VITE_API_BASE_URL`: `https://library-gateway.onrender.com`
3.  Deploy!

---


---

## Hybrid Deployment (Render + Railway) - Recommended for Best Reliability
You asked to mix Render and Railway. This is a **smart strategy** because Railway is faster and cleaner, but costs credits, while Render is free but slower (sleeps).

**Strategy:**
1.  **Render**: Host the "heavy" worker services (`Library`, `Booking`, `Auth`) here. Since they are free, it doesn't matter if they sleep when not in use.
2.  **Railway**: Host the **API Gateway** here. Railway keeps it "always on" (more reliable), ensuring the entry point to your app is fast.
    *   *Note: Railway gives $5 trial credit. Once used, you pay.*

### How to Configure the Hybrid Mix:
1.  **Deploy `Auth`, `Library`, `Booking` on Render** (as per Step 2A above).
    *   Get their URLs: `https://auth.onrender.com`, etc.
2.  **Deploy `api-gateway` on Railway**:
    *   Connect GitHub Repo.
    *   Set Root Directory: `api-gateway`.
    *   Add Variables:
        *   `AUTH_SERVICE_URL` = `https://your-render-auth-url`
        *   `LIBRARY_SERVICE_URL` = `https://your-render-library-url`
        *   ...and so on.
    *   Railway will build and give you a `https://gateway.up.railway.app` URL.
3.  **Frontend (Vercel)**:
    *   Set `VITE_API_BASE_URL` = `https://your-railway-gateway-url`.

**Result**: Your "Front Door" (Gateway) is fast (Railway). Your "Workers" (Services) are free (Render). Best of both worlds!

