# Quick Start - Manual Service Startup

Since Docker is not available, follow these steps to start services manually:

## Prerequisites
- ✅ MySQL database running on port 3306
- ✅ Java 17 installed
- ✅ Maven installed

## Option 1: Use the Automated Script (Easiest)

1. Double-click `start-all-services.bat` in the `D:\Library_App` directory
2. Wait 2-3 minutes for all services to start
3. Open http://localhost:5173 in your browser

## Option 2: Manual Startup (Each in a New Terminal)

### Terminal 1 - Eureka Server
```bash
cd D:\Library_App\eureka-server
mvn spring-boot:run
```
Wait until you see "Started EurekaServerApplication"

### Terminal 2 - Config Server
```bash
cd D:\Library_App\config-server
mvn spring-boot:run
```
Wait until you see "Started ConfigServerApplication"

### Terminal 3 - API Gateway
```bash
cd D:\Library_App\api-gateway
mvn spring-boot:run
```
Wait until you see "Started ApiGatewayApplication"

### Terminal 4 - Auth Service  
```bash
cd D:\Library_App\auth-service
mvn spring-boot:run
```
Wait until you see "Started AuthServiceApplication"

### Terminal 5 - Library Service
```bash
cd D:\Library_App\library-service
mvn spring-boot:run
```
Wait until you see "Started LibraryServiceApplication"

### Terminal 6 - Booking Service
```bash
cd D:\Library_App\booking-service
mvn spring-boot:run
```
Wait until you see "Started BookingServiceApplication"

### Terminal 7 - Frontend (Already Running ✅)
The frontend is already running on port 5173!

## Verify Services

Once all services are running, check:
- **Eureka Dashboard**: http://localhost:8761 - Should show all services registered
- **Frontend**: http://localhost:5173 - Should load the login page
- **API Gateway**: http://localhost:8080/actuator/health - Should return {"status":"UP"}

## Important Notes

⚠️ **MySQL Required**: Make sure MySQL is running with the databases:
- `library_auth_db`
- `library_db`  
- `booking_db`

You can create these databases and import the sample data from `init-scripts/01-init.sql`:
```bash
mysql -u root -p < D:\Library_App\init-scripts\01-init.sql
```

## Startup Time
- Total startup time: **2-3 minutes**
- Each service takes 20-30 seconds to start
- Wait for each service to fully start before starting the next one

## Troubleshooting

**Service won't start?**
- Check if the port is already in use
- Verify MySQL is running
- Check Java version: `java -version` (should be 17)
- Check Maven version: `mvn -version`

**"Connection refused" errors?**
- These are normal during startup
- Services retry automatically
- Wait until all services are up

**Frontend can't connect?**
- Ensure API Gateway (port 8080) is running
- Check browser console for errors
- Try refreshing the page

## Stop All Services

Press `Ctrl+C` in each terminal window to stop services.
