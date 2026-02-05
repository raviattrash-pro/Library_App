# 🌐 KEEP-ALIVE GUIDE: How to Prevent Service Sleep

Since your application is hosted on free-tier services (Railway/Render + Vercel), services will automatically "sleep" after ~15 minutes of inactivity. This causes the first request to fail with a **504 Gateway Timeout**.

I have implemented a **Live Service Monitor** in your Admin Dashboard that automatically wakes up all services when you log in.

## 🛠️ Option 2: Automated 24/7 Keep-Alive (Recommended)

To ensure your services *never* sleep (even when no one is logged in), you can use a free uptime monitoring tool.

### Steps to Configure (Do this once):

1.  **Register:** Go to [UptimeRobot.com](https://uptimerobot.com/) and create a free account.
2.  **Create Monitor:** Click "Add New Monitor".
3.  **Monitor Type:** Select `HTTP(s)`.
4.  **Friendly Name:** e.g., "Library App Keep-Alive".
5.  **URL (IP):** Enter your API Gateway URL with a health endpoint:
    *   `https://libraryapp-production-0aa2.up.railway.app/actuator/health` 
    *   (Or use the specific service health endpoints I added: `.../api/v1/auth/health`)
6.  **Monitoring Interval:** Set to **5 minutes** (this is crucial; <15 mins prevents sleep).
7.  **Alert Contacts:** Uncheck if you don't want emails (optional).
8.  **Save:** Click "Create Monitor".

### How It Works:
*   UptimeRobot will send a request to your API Gateway every 5 minutes.
*   This constant traffic tricks Railway/Render into thinking the app is "active".
*   Your users will experience instant load times 24/7.
