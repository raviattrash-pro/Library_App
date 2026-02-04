# Quick Start Guide - Library Management System

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites Check
Ensure you have Docker and Docker Compose installed:
```bash
docker --version
docker-compose --version
```

### Step 2: Navigate to Project
```bash
cd d:\Library_App
```

### Step 3: Start All Services
```bash
docker-compose up --build -d
```

This command will:
- Build all Docker images
- Start MySQL database
- Launch all microservices (Eureka, Config Server, API Gateway, Auth, Library, Booking)
- Start React frontend
- Initialize Prometheus, Grafana, and Zipkin

### Step 4: Wait for Services to Start
Services take about 2-3 minutes to fully initialize. You can monitor progress:
```bash
docker-compose logs -f
```

Press `Ctrl+C` to stop viewing logs.

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

### Step 6: Login
Use these credentials:
- **Username**: `admin`
- **Password**: `admin123`

### Step 7: Book Your First Seat!
1. Click "Book a Seat" from the dashboard
2. Select any green (available) seat
3. Choose a shift (A, B, or C)
4. Pick your start date and duration
5. Click "Confirm Booking"

**Congratulations! You've successfully booked your first seat! 🎉**

## 📊 Explore the System

### View Your Bookings
Navigate to **"My Bookings"** to see all your reservations.

### Check Service Health
- **Eureka Dashboard**: http://localhost:8761
- **API Documentation**: http://localhost:8081/swagger-ui.html (Auth Service)
- **Monitoring**: http://localhost:9090 (Prometheus)
- **Tracing**: http://localhost:9411 (Zipkin)

## 🛑 Stop Services
```bash
docker-compose down
```

To also remove data volumes:
```bash
docker-compose down -v
```

## 🔧 Troubleshooting

### Services not starting?
```bash
# Check if ports are in use
netstat -an | findstr "8080 8761 3306 5173"

# View service logs
docker-compose logs [service-name]
```

### Frontend can't connect to backend?
1. Verify API Gateway is running: http://localhost:8080/actuator/health
2. Check browser console for errors
3. Clear browser cache and localStorage

### Database connection issues?
```bash
# Restart MySQL
docker-compose restart mysql

# Or recreate everything
docker-compose down -v
docker-compose up --build -d
```

## 📝 Default Credentials

| Username | Password | Role | Use Case |
|----------|----------|------|----------|
| admin | admin123 | ADMIN | Full system access |
| user | admin123 | USER | Regular user booking |

## 🎯 Next Steps

1. **Explore Admin Panel**: Login as admin and check "Admin Dashboard"
2. **Try Different Shifts**: Book seats in different time slots
3. **Test Cancellation**: Cancel a booking from "My Bookings"
4. **Check Monitoring**: View metrics in Prometheus and traces in Zipkin
5. **Read Full Documentation**: Check README.md for detailed information

## 📞 Need Help?

- **Full Documentation**: `README.md`
- **API Docs**: Visit Swagger UI for each service
- **Walkthrough**: `walkthrough.md` for complete system overview

---

**Enjoy using the Library Management System! 📚**
