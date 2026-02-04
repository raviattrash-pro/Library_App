package com.library.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfiguration {

    @Value("${AUTH_SERVICE_URL:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${LIBRARY_SERVICE_URL:http://localhost:8082}")
    private String libraryServiceUrl;

    @Value("${BOOKING_SERVICE_URL:http://localhost:8084}")
    private String bookingServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/api/v1/auth/**", "/api/v1/users/**")
                        .uri(authServiceUrl))
                .route("library-service", r -> r.path("/api/v1/seats/**", "/api/v1/shifts/**", 
                        "/api/v1/admin/**", "/api/lockers/**", "/menu/**", "/orders/**", 
                        "/api/finance/**", "/print/**")
                        .uri(libraryServiceUrl))
                .route("booking-service", r -> r.path("/api/v1/bookings/**")
                        .uri(bookingServiceUrl))
                .build();
    }
}
