package com.pazarsaffaf.service;

import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.pricing.VendorProduct;
import com.pazarsaffaf.pricing.VendorProductRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiBudgetOptimizerService {

    private final MarketRepository marketRepository;
    private final VendorProductRepository vendorProductRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> optimize(Long marketId, BigDecimal budget, List<Long> productIds, Map<Long, BigDecimal> qtyByProduct) {
        Market market = marketRepository.findById(marketId).orElseThrow();
        List<Map<String, Object>> picks = new ArrayList<>();
        BigDecimal spent = BigDecimal.ZERO;
        for (Long pid : productIds.stream().sorted().toList()) {
            List<VendorProduct> offers =
                    vendorProductRepository.findByProduct_IdAndVendor_Market_IdAndPublishedTrueOrderByUnitPriceAsc(pid, marketId);
            if (offers.isEmpty()) {
                continue;
            }
            VendorProduct best = offers.get(0);
            BigDecimal qty = qtyByProduct.getOrDefault(pid, BigDecimal.ONE);
            BigDecimal line = best.getUnitPrice().multiply(qty);
            if (spent.add(line).compareTo(budget) <= 0) {
                spent = spent.add(line);
                picks.add(
                        Map.of(
                                "productId",
                                pid,
                                "productName",
                                best.getProduct().getName(),
                                "vendorId",
                                best.getVendor().getId(),
                                "vendorName",
                                best.getVendor().getName(),
                                "unitPrice",
                                best.getUnitPrice(),
                                "qty",
                                qty,
                                "lineTotal",
                                line.setScale(2, RoundingMode.HALF_UP)));
            }
        }
        return Map.of(
                "marketId",
                market.getId(),
                "marketName",
                market.getName(),
                "budget",
                budget,
                "spent",
                spent.setScale(2, RoundingMode.HALF_UP),
                "remaining",
                budget.subtract(spent).setScale(2, RoundingMode.HALF_UP),
                "items",
                picks);
    }
}
