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
public class ShoppingComparisonService {

    private final MarketRepository marketRepository;
    private final VendorProductRepository vendorProductRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> compareForCity(String city, List<Long> productIds, Map<Long, BigDecimal> qtyByProduct) {
        List<Market> markets =
                (city == null || city.isBlank())
                        ? marketRepository.findAll()
                        : marketRepository.findByCityIgnoreCase(city.trim());
        List<Map<String, Object>> results = new ArrayList<>();
        for (Market m : markets) {
            BigDecimal total = BigDecimal.ZERO;
            int found = 0;
            for (Long pid : productIds) {
                List<VendorProduct> offers =
                        vendorProductRepository.findByProduct_IdAndVendor_Market_IdAndPublishedTrueOrderByUnitPriceAsc(pid, m.getId());
                if (!offers.isEmpty()) {
                    BigDecimal qty = qtyByProduct.getOrDefault(pid, BigDecimal.ONE);
                    total = total.add(offers.get(0).getUnitPrice().multiply(qty));
                    found++;
                }
            }
            if (found > 0) {
                Map<String, Object> row = new HashMap<>();
                row.put("marketId", m.getId());
                row.put("name", m.getName());
                row.put("city", m.getCity());
                row.put("total", total.setScale(2, RoundingMode.HALF_UP));
                row.put("found", found);
                results.add(row);
            }
        }
        results.sort(Comparator.comparing(r -> (BigDecimal) r.get("total")));
        return results;
    }
}
