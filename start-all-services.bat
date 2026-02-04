@echo off
echo ====================================
echo Library Management System - Backend Startup
echo ====================================
echo.

echo Starting services in order...
echo.

echo [1/6] Starting Eureka Server (Port 8761)...
start "Eureka Server" cmd /k "cd /d D:\Library_App\eureka-server && mvn spring-boot:run"
timeout /t 30

echo [2/6] Starting Config Server (Port 8888)...
start "Config Server" cmd /k "cd /d D:\Library_App\config-server && mvn spring-boot:run"
timeout /t 30

echo [3/6] Starting API Gateway (Port 8080)...
start "API Gateway" cmd /k "cd /d D:\Library_App\api-gateway && mvn spring-boot:run"
timeout /t 20

echo [4/6] Starting Auth Service (Port 8081)...
start "Auth Service" cmd /k "cd /d D:\Library_App\auth-service && mvn spring-boot:run"
timeout /t 20

echo [5/6] Starting Library Service (Port 8082)...
start "Library Service" cmd /k "cd /d D:\Library_App\library-service && mvn spring-boot:run"
timeout /t 20

echo [6/6] Starting Booking Service (Port 8084)...
start "Booking Service" cmd /k "cd /d D:\Library_App\booking-service && mvn spring-boot:run"

echo.
echo ====================================
echo All services are starting!
echo Please wait 2-3 minutes for complete startup
echo ====================================
echo.
echo Check service status at:
echo - Eureka Dashboard: http://localhost:8761
echo - Frontend: http://localhost:5173
echo.
pause
