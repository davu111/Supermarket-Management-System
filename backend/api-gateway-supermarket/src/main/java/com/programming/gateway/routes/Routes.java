package com.programming.gateway.routes;

import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class Routes {

    @Bean
    public RouterFunction<ServerResponse> productService() {
        return GatewayRouterFunctions.route("product-service")
                .route(RequestPredicates.path("/api/products/**"), HandlerFunctions.http("http://localhost:8080"))
                .route(RequestPredicates.path("/api/categories/**"), HandlerFunctions.http("http://localhost:8080"))
                .filter((request, next) -> {
                    return next.handle(request);
                })
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> couponService() {
        return GatewayRouterFunctions.route("coupon-service")
                .route(RequestPredicates.path("/api/coupons/**"), HandlerFunctions.http("http://localhost:8081"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> warehouseService() {
        return GatewayRouterFunctions.route("warehouse-service")
                .route(RequestPredicates.path("/api/warehouses/**"), HandlerFunctions.http("http://localhost:8082"))
                .filter((request, next) -> {
                    return next.handle(request);
                })
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> inventoryService() {
        return GatewayRouterFunctions.route("inventory-service")
                .route(RequestPredicates.path("/api/inventory/**"), HandlerFunctions.http("http://localhost:8083"))
                .filter((request, next) -> {
                    return next.handle(request);
                })
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> employeeService() {
        return GatewayRouterFunctions.route("employee-service")
                .route(RequestPredicates.path("/api/employees/**"), HandlerFunctions.http("http://localhost:8084"))
                .filter((request, next) -> {
                    return next.handle(request);
                })
                .build();
    }
}
