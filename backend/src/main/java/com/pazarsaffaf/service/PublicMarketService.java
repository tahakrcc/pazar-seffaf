package com.pazarsaffaf.service;

import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.market.MarketSchemaCell;
import com.pazarsaffaf.market.MarketSchemaCellRepository;
import com.pazarsaffaf.pricing.Product;
import com.pazarsaffaf.pricing.VendorProduct;
import com.pazarsaffaf.pricing.VendorProductRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicMarketService {

    private final MarketRepository marketRepository;
    private final MarketSchemaCellRepository marketSchemaCellRepository;
    private final VendorProductRepository vendorProductRepository;

    @Transactional(readOnly = true)
    public List<Market> listMarkets(String city) {
        if (city == null || city.isBlank()) {
            return marketRepository.findAll();
        }
        return marketRepository.findByCityIgnoreCase(city.trim());
    }

    @Transactional(readOnly = true)
    public Market getMarket(Long id) {
        return marketRepository.findById(id).orElseThrow();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> mapSchema(Long marketId) {
        Market market = marketRepository.findById(marketId).orElseThrow();
        List<MarketSchemaCell> cells = marketSchemaCellRepository.findById_MarketId(marketId);
        int minR = Integer.MAX_VALUE;
        int maxR = Integer.MIN_VALUE;
        int minC = Integer.MAX_VALUE;
        int maxC = Integer.MIN_VALUE;
        List<Map<String, Object>> outCells = new ArrayList<>();
        for (MarketSchemaCell sc : cells) {
            String[] parts = sc.getId().getCellId().split("-");
            int r = Integer.parseInt(parts[0]);
            int c = Integer.parseInt(parts[1]);
            minR = Math.min(minR, r);
            maxR = Math.max(maxR, r);
            minC = Math.min(minC, c);
            maxC = Math.max(maxC, c);
            Map<String, Object> m = new HashMap<>();
            m.put("id", sc.getId().getCellId());
            m.put("type", sc.getCellType());
            m.put("stallCode", sc.getStallCode());
            m.put("vendorId", sc.getVendor() != null ? sc.getVendor().getId() : null);
            outCells.add(m);
        }
        int cols = maxC >= minC ? maxC - minC + 1 : 1;
        int rows = maxR >= minR ? maxR - minR + 1 : 1;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("cols", cols);
        result.put("rows", rows);
        result.put("cells", outCells);
        String canvasJson = market.getSchemaCanvasJson();
        if (canvasJson != null && !canvasJson.isBlank()) {
            result.put("canvas", canvasJson);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> aggregatedPrices(Long marketId) {
        List<VendorProduct> list = vendorProductRepository.findByVendor_Market_IdAndPublishedTrue(marketId);
        Map<Long, List<BigDecimal>> byProduct = new HashMap<>();
        Map<Long, Product> products = new HashMap<>();
        for (VendorProduct vp : list) {
            byProduct.computeIfAbsent(vp.getProduct().getId(), k -> new ArrayList<>()).add(vp.getUnitPrice());
            products.put(vp.getProduct().getId(), vp.getProduct());
        }
        List<Map<String, Object>> res = new ArrayList<>();
        for (Map.Entry<Long, List<BigDecimal>> e : byProduct.entrySet()) {
            List<BigDecimal> prices = e.getValue();
            BigDecimal min = prices.stream().min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
            BigDecimal max = prices.stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
            BigDecimal median = min.add(max).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            Product p = products.get(e.getKey());
            Map<String, Object> row = new HashMap<>();
            row.put("id", p.getId());
            row.put("name", p.getName());
            row.put("abbr", p.getAbbr());
            row.put("category", p.getCategory());
            row.put("unit", p.getUnit());
            row.put("minPrice", min);
            row.put("maxPrice", max);
            row.put("medianPrice", median);
            row.put("confidence", 70 + (e.getKey().intValue() % 25));
            res.add(row);
        }
        res.sort(Comparator.comparing(m -> (Long) m.get("id")));
        return res;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> vendorOffers(Long marketId, Long productId) {
        return vendorProductRepository.findByProduct_IdAndVendor_Market_IdAndPublishedTrueOrderByUnitPriceAsc(productId, marketId).stream()
                .map(
                        vp ->
                                Map.<String, Object>of(
                                        "vendorId",
                                        vp.getVendor().getId(),
                                        "vendorName",
                                        vp.getVendor().getName(),
                                        "stallCode",
                                        vp.getVendor().getStallCode(),
                                        "unitPrice",
                                        vp.getUnitPrice(),
                                        "score",
                                        vp.getVendor().getScore()))
                .collect(Collectors.toList());
    }
}
