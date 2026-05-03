package com.pazarsaffaf.api;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/meta")
public class MetaApiController {

    private static final List<String> DAYS_TR =
            List.of("Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi");

    @GetMapping("/days")
    public List<String> days() {
        return DAYS_TR;
    }

    @GetMapping("/weather/{city}")
    public Map<String, Object> weather(@PathVariable String city) {
        return switch (city) {
            case "Istanbul", "İstanbul" -> Map.of("temp", 18, "desc", "Parcali bulutlu", "icon", "cloud", "tip", "Semsiye yaninizda olsun.");
            case "Ankara" -> Map.of("temp", 20, "desc", "Acik", "icon", "sun", "tip", "Iyi pazar havasi.");
            default -> Map.of("temp", 22, "desc", "Gunesli", "icon", "sun", "tip", "Pazar icin ideal.");
        };
    }

    @GetMapping("/notifications")
    public List<Map<String, Object>> notifications() {
        return List.of(
                Map.of("id", 1, "type", "price", "title", "Fiyat dustu", "desc", "Domates fiyati dustu.", "time", "5 dk once"),
                Map.of("id", 2, "type", "market", "title", "Yarin pazar", "desc", "Yarin acik pazar var.", "time", "1 saat once"));
    }
}
