package com.library.booking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "library-service")
public interface LibraryClient {

    @PatchMapping("/api/v1/seats/{id}/status")
    void updateSeatStatus(@PathVariable("id") Long id, @RequestParam(name = "status") String status);
}
