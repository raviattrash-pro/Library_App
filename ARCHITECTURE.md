# System Architecture Documentation

## 1. Architecture Overview

The Library Management System is built on a **Microservices Architecture** pattern, designed for scalability, maintainability, and independent deployment. The system decomposes the application into loosely coupled services that communicate via REST APIs, coordinated by a central API Gateway and Service Registry.

### 1.1 High-Level Design
*   **Client-Side**: A Single Page Application (SPA) built with React.js provides the user interface.
*   **Edge Layer**: An API Gateway serves as the single entry point, handling routing, security, and load balancing.
*   **Service Layer**: Distinct backend services handle specific business domains (Auth, Library, Booking).
*   **Data Layer**: Services own their own data stores (Database-per-service pattern), ensuring loose coupling.
*   **Infrastructure**: Dockerized containers managed via Docker Compose.

---

## 2. System Components

### 2.1 Backend Services (Spring Boot)

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8080` | **Spring Cloud Gateway**. Handles all incoming traffic. <br>- **Routes**: Maps `/api/v1/auth` -> Auth Service, `/api/v1/library` -> Library Service, etc.<br>- **Security**: Validates JWT tokens via `AuthenticationFilter` before proxying requests.<br>- **Cross-Cutting**: Handles CORS, rate limiting, and request logging. |
| **Service Registry** | `8761` | **Netflix Eureka**. Acts as the phonebook for microservices.<br>- Services register themselves at startup.<br>- Gateway looks up service locations dynamically, enabling horizontal scaling. |
| **Config Server** | `8888` | **Spring Cloud Config**. Centralized configuration management.<br>- Stores externalized configuration (e.g., DB URLs, feature flags) in a git-backed or native file system repository. |
| **Auth Service** | `8081` | Manages User Identity and Access Management (IAM).<br>- **Responsibilities**: Registration, Login, Token Generation.<br>- **Security**: Uses `BCrypt` for password hashing and `JJWT` for signing access tokens. |
| **Library Service** | `8082` | Core domain service.<br>- **Domains**: Seats, Shifts, QR Codes, Lost & Found, Maintenance, **Print Service**, **Cafe Menu & Orders**.<br>- **Logic**: Manages physical assets and rules (e.g., seat availability, shift timings). |
| **Booking Service** | `8084` | Manages the transaction lifecycle.<br>- **Domains**: Bookings, Payments, Revenue.<br>- **Logic**: Handles seat reservation, conflict detection, and payment verification. |

### 2.2 Frontend (React)

*   **Framework**: React 18 with Vite for build tooling.
*   **Routing**: `react-router-dom` v6 for client-side navigation.
*   **State Management**: React `Context API` (ThemeContext, AuthContext) and local state.
*   **HTTP Client**: `Axios` with interceptors for automatically attaching JWT tokens to requests.
*   **UI Library**: Custom CSS + Glassmorphism design system.

---

## 3. Data Architecture

The system follows the **Database per Service** pattern to ensure decoupling.

### 3.1 Schemas

#### `library_auth_db` (Managed by Auth Service)
*   `users`: Stores user credentials, roles (ADMIN, USER), and profile info.

#### `library_db` (Managed by Library Service)
*   `seats`: Seat details (number, status).
*   `shifts`: Shift timings and pricing.
*   `qr_codes`: Payment QR codes.
*   `lost_items`: Lost and found implementation.
*   `maintenance_requests`: Issue tracking.

#### `booking_db` (Managed by Booking Service)
*   `bookings`: Reservation records linking Users, Seats, and Shifts.
*   `payments`: Payment status and transaction snapshots.

---

## 4. Key Workflows

### 4.1 Authentication Flow
1.  **User Login**: Client sends credentials to `/api/v1/auth/login`.
2.  **Validation**: Auth Service verifies credentials against `library_auth_db`.
3.  **Token Creation**: If valid, a **JWT** is generated containing `sub` (username), `roles`, and `exp` (expiration).
4.  **Response**: JWT is returned to the client and stored (e.g., localStorage).

### 4.2 Request Authorization Flow
1.  **Request**: Client sends request with header `Authorization: Bearer <token>`.
2.  **Gateway Interception**: `AuthenticationFilter` in API Gateway intercepts the request.
3.  **Verification**: Gateway validates the token signature using the shared Secret Key.
4.  **Context Propagation**: If valid, the Gateway extracts User ID/Role and adds them as headers (`X-User-Id`, `X-User-Role`) before forwarding to downstream services.

### 4.3 Seat Booking Flow
1.  **Selection**: User selects a Seat and Shift on the Frontend.
2.  **Submission**: Request POST `/api/v1/bookings` sent to Gateway -> Booking Service.
3.  **Validation**: Booking Service checks for existing bookings in `booking_db` for the given Seat+Shift+Date.
4.  **Reservation**: A persistent record is created with status `PENDING`.
5.  **Payment Upload**: User uploads payment screenshot.
6.  **Verification**: Admin approves payment -> Booking status updates to `CONFIRMED`.

---

## 5. Security Implementation

*   **Transport Layer**: HTTPS (in production environments).
*   **Authentication**: Stateless JWT (JSON Web Tokens).
*   **Password Storage**: BCrypt strong hashing.
*   **CORS**: Configured at API Gateway to allow requests from the Frontend origin.
*   **Input Validation**: Spring Validation (`@Valid`) on DTOs.

## 6. Observability

*   **Metrics**: All services expose endpoints via **Spring Boot Actuator**.
*   **Scraping**: **Prometheus** scrapes these metrics at `/actuator/prometheus`.
*   **Visualization**: **Grafana** dashboards display real-time system health.
*   **Tracing**: **Zipkin** (optional) for distributed request tracing.

