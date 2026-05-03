package com.pazarsaffaf.api;

import com.pazarsaffaf.service.AiBudgetOptimizerService;
import com.pazarsaffaf.service.ShoppingComparisonService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ShoppingAndAiApiController {

    private final ShoppingComparisonService shoppingComparisonService;
    private final AiBudgetOptimizerService aiBudgetOptimizerService;

    public record ShoppingOptimizeRequest(@NotBlank String city, List<Long> productIds, Map<String, BigDecimal> quantities) {}

    @PostMapping("/shopping/optimize")
    public List<Map<String, Object>> shopping(@RequestBody ShoppingOptimizeRequest req) {
        Map<Long, BigDecimal> qty = new HashMap<>();
        if (req.quantities() != null) {
            req.quantities().forEach((k, v) -> qty.put(Long.parseLong(k), v));
        }
        return shoppingComparisonService.compareForCity(req.city(), req.productIds(), qty);
    }

    public record AiBudgetRequest(@NotNull Long marketId, @NotNull BigDecimal budget, List<Long> productIds, Map<String, BigDecimal> quantities) {}

    @PostMapping("/ai/optimize-budget")
    public Map<String, Object> aiBudget(@RequestBody AiBudgetRequest req) {
        Map<Long, BigDecimal> qty = new HashMap<>();
        if (req.quantities() != null) {
            req.quantities().forEach((k, v) -> qty.put(Long.parseLong(k), v));
        }
        return aiBudgetOptimizerService.optimize(req.marketId(), req.budget(), req.productIds(), qty);
    }
}
