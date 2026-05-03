package com.pazarsaffaf.api;

import com.pazarsaffaf.pricing.Product;
import com.pazarsaffaf.pricing.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductApiController {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<Map<String, Object>> list() {
        return productRepository.findAll().stream().map(this::toDto).toList();
    }

    private Map<String, Object> toDto(Product p) {
        List<String> subtypes = List.of();
        if (p.getSubtypesJson() != null && !p.getSubtypesJson().isBlank()) {
            try {
                subtypes = objectMapper.readValue(p.getSubtypesJson(), new TypeReference<>() {});
            } catch (Exception ignored) {
            }
        }
        return Map.of(
                "id",
                p.getId(),
                "name",
                p.getName(),
                "abbr",
                p.getAbbr() != null ? p.getAbbr() : "",
                "category",
                p.getCategory() != null ? p.getCategory() : "",
                "unit",
                p.getUnit() != null ? p.getUnit() : "",
                "subtypes",
                subtypes);
    }
}
