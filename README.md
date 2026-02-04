# Library Management System

A comprehensive Library Management Application built with Spring Boot Microservices, MySQL, and React.js. This system features seat booking, fee management, user authentication, and an admin dashboard, following enterprise-grade microservices architecture patterns.

## 🎯 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based authentication with role-based access control (ADMIN, USER, LIBRARIAN)
- **Seat Management** - Interactive seat booking system with real-time availability
- **Shift Management** - Multiple shifts (Morning, Afternoon, Evening) with different pricing
- **Booking Management** - Create, view, and cancel seat bookings
- **Admin Dashboard** - Comprehensive admin panel for system management
- **User Dashboard** - Personalized dashboard showing bookings and statistics

### Enterprise Features
- **Microservices Architecture** - Modular, scalable architecture with independent services
- **Service Discovery** - Eureka Server for dynamic service registration
- **API Gateway** - Centralized routing, load balancing, and security
- **Distributed Tracing** - Zipkin integration for request tracing
- **Monitoring & Metrics** - Prometheus + Grafana for real-time monitoring
- **Circuit Breaker** - Resilience4j for fault tolerance
- **Swagger Documentation** - Interactive API documentation for all services
- **Content Negotiation** - Support for JSON and XML responses
- **Internationalization (i18n)** - Multi-language support (English, Hindi)
- **API Versioning** - URI-based versioning (`/api/v1/`)

## 🏗️ Architecture

### Microservices
| Service | Port | Description |
|---------|------|-------------|
| **Eureka Server** | 8761 | Service discovery and registration |
| **Config Server** | 8888 | Centralized configuration management |
| **API Gateway** | 8080 | Entry point, routing, and security |
| **Auth Service** | 8081 | Authentication and user management |
| **Library Service** | 8082 | Seat and shift management |
| **Booking Service** | 8084 | Booking operations and management |
| **React Frontend** | 5173 | User interface |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana** | 3000 | Metrics visualization |
| **Zipkin** | 9411 | Distributed tracing |

### Technology Stack

**Backend:**
- Spring Boot 3.2.1
- Spring Cloud 2023.0.0
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Resilience4j
- OpenAPI/Swagger
- Micrometer + Prometheus
- Zipkin

**Frontend:**
- React 18.2
- React Router 6
- Axios
- Chart.js
- Framer Motion
- React Toastify
- i18next

**DevOps:**
- Docker & Docker Compose
- Maven
- Nginx

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Or, for local development:
  - Java 17
  - Node.js 18+
  - MySQL 8.0
  - Maven 3.8+

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
cd Library_App

# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 2: Local Development

**Start Backend Services:**

```bash
# Start Eureka Server
cd eureka-server
mvn spring-boot:run

# Start Config Server
cd ../config-server
mvn spring-boot:run

# Start API Gateway
cd ../api-gateway
mvn spring-boot:run

# Start Auth Service
cd ../auth-service
mvn spring-boot:run

# Start Library Service
cd ../library-service
mvn spring-boot:run

# Start Booking Service
cd ../booking-service
mvn spring-boot:run
```

**Start Frontend:**

```bash
cd library-frontend
npm install
npm run dev
```

## 🔑 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| user | admin123 | USER |

## 📊 Access Points

Once running, access the following URLs:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Gateway** | http://localhost:8080 |
| **Eureka Dashboard** | http://localhost:8761 |
| **Prometheus** | http://localhost:9090 |
| **Grafana** | http://localhost:3000 (admin/admin) |
| **Zipkin** | http://localhost:9411 |
| **Auth Service Swagger** | http://localhost:8081/swagger-ui.html |
| **Library Service Swagger** | http://localhost:8082/swagger-ui.html |
| **Booking Service Swagger** | http://localhost:8084/swagger-ui.html |

## 🗄️ Database Schema

The system uses multiple MySQL databases:

- `library_auth_db` - User authentication data
- `library_db` - Seats and shifts
- `booking_db` - Booking records

Database initialization scripts with sample data are in `init-scripts/01-init.sql`.

## 📚 API Endpoints

### Authentication Service (Port 8081)

```
POST /api/v1/auth/login         - User login
POST /api/v1/auth/register      - User registration
GET  /api/v1/users              - Get all users (ADMIN)
GET  /api/v1/users/{id}         - Get user by ID
PUT  /api/v1/users/{id}         - Update user
DELETE /api/v1/users/{id}       - Delete user (ADMIN)
```

### Library Service (Port 8082)

```
GET    /api/v1/seats            - Get all seats
GET    /api/v1/seats/{id}       - Get seat by ID (with HATEOAS)
GET    /api/v1/seats/available  - Get available seats
POST   /api/v1/seats            - Create seat (ADMIN)
PUT    /api/v1/seats/{id}       - Update seat (ADMIN)
DELETE /api/v1/seats/{id}       - Delete seat (ADMIN)
PATCH  /api/v1/seats/{id}/status - Update seat status

GET    /api/v1/shifts           - Get all shifts
GET    /api/v1/shifts/{id}      - Get shift by ID
POST   /api/v1/shifts           - Create shift (ADMIN)
PUT    /api/v1/shifts/{id}      - Update shift (ADMIN)
DELETE /api/v1/shifts/{id}      - Delete shift (ADMIN)
```

### Booking Service (Port 8084)

```
GET    /api/v1/bookings         - Get all bookings
GET    /api/v1/bookings/{id}    - Get booking by ID
GET    /api/v1/bookings/user/{userId} - Get user bookings
POST   /api/v1/bookings         - Create booking
PUT    /api/v1/bookings/{id}    - Update booking
POST   /api/v1/bookings/{id}/cancel - Cancel booking
DELETE /api/v1/bookings/{id}    - Delete booking (ADMIN)
```

## 🛠️ Configuration

### Environment Variables

Services use the following environment variables:

```bash
# Database
DB_URL=jdbc:mysql://localhost:3306/library_auth_db
DB_USERNAME=root
DB_PASSWORD=root

# Service Discovery
EUREKA_URL=http://localhost:8761/eureka/

# Security
JWT_SECRET=your-secret-key-here-make-it-strong-and-secure

# Tracing
ZIPKIN_URL=http://localhost:9411/api/v2/spans
```

## 🎨 UI Features

- **Glassmorphism Design** - Modern, transparent glass-like UI elements
- **Dark Mode Support** - Toggle between light and dark themes
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Interactive Animations** - Smooth transitions and micro-animations
- **Real-time Updates** - Live seat availability and booking status
- **Toast Notifications** - User-friendly feedback messages

## 📈 Monitoring & Observability

### Prometheus Metrics
All services expose Prometheus metrics at `/actuator/prometheus`:
- Request counts and latencies
- JVM metrics (memory, threads, GC)
- Custom business metrics

### Grafana Dashboards
Pre-configured dashboards for:
- Service health and performance
- Request rates and error rates
- JVM metrics visualization

### Zipkin Tracing
Distributed tracing for:
- Request flow across services
- Performance bottlenecks
- Service dependencies

## 🔒 Security

- **JWT Authentication** - Stateless token-based auth
- **Role-Based Access Control** - ADMIN, USER, LIBRARIAN roles
- **Password Encryption** - BCrypt hashing
- **CORS Configuration** - Secure cross-origin requests
- **API Gateway Security** - Centralized security filters

## 🧪 Testing

```bash
# Run backend tests
mvn test

# Run frontend tests
cd library-frontend
npm test
```

## 📦 Building for Production

```bash
# Build all services
docker-compose build

# Build specific service
docker build -t auth-service ./auth-service

# Build frontend
cd library-frontend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🎓 Learning Resources

- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Microservices Patterns](https://microservices.io/)

## 🐛 Troubleshooting

### Services not starting?
- Check if required ports are available
- Verify Docker is running
- Check logs: `docker-compose logs [service-name]`

### Database connection issues?
- Ensure MySQL is running
- Verify database credentials
- Check `DB_URL` environment variable

### Frontend not connecting to backend?
- Verify API Gateway is running on port 8080
- Check CORS configuration
- Verify JWT token in browser localStorage

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Swagger API docs

---

**Built with ❤️ using Spring Boot, React, and Docker**
