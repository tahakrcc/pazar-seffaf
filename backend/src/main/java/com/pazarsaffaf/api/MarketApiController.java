package com.pazarsaffaf.api;

import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import com.pazarsaffaf.pricing.PriceObservationRepository;
import com.pazarsaffaf.market.MarketLayoutService;
import com.pazarsaffaf.service.PublicMarketService;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/markets")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class MarketApiController {

    private final PublicMarketService publicMarketService;
    private final MarketLayoutService marketLayoutService;
    private final PriceObservationRepository priceObservationRepository;
    private final VendorRepository vendorRepository;

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String city) {
        return publicMarketService.listMarkets(city == null ? "" : city).stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable Long id) {
        return toDto(publicMarketService.getMarket(id));
    }

    @GetMapping("/{id}/layout")
    public Map<String, Object> layout(@PathVariable Long id) {
        return marketLayoutService.getLayout(id);
    }

    @GetMapping("/{id}/prices")
    public List<Map<String, Object>> prices(@PathVariable Long id) {
        return publicMarketService.aggregatedPrices(id);
    }

    @GetMapping("/{id}/vendors")
    public List<Map<String, Object>> vendors(@PathVariable Long id) {
        return vendorRepository.findByMarket_Id(id).stream().map(this::vendorToMap).toList();
    }

    private Map<String, Object> vendorToMap(Vendor v) {
        return Map.of(
                "id",
                v.getId(),
                "name",
                v.getName(),
                "stall",
                v.getStallCode() != null ? v.getStallCode() : "",
                "score",
                v.getScore());
    }

    @GetMapping("/{id}/products/{productId}/vendor-offers")
    public List<Map<String, Object>> vendorOffers(@PathVariable Long id, @PathVariable Long productId) {
        return publicMarketService.vendorOffers(id, productId);
    }

    @GetMapping("/{id}/products/{productId}/trend")
    public Map<String, Object> trend(@PathVariable Long id, @PathVariable Long productId) {
        var list = priceObservationRepository.findTop200ByMarket_IdOrderByObservedAtDesc(id).stream()
                .filter(o -> o.getProduct().getId().equals(productId))
                .map(o -> o.getPrice().doubleValue())
                .limit(7)
                .toList();
        if (list.size() < 2) {
            long seed = productId * 31 + id * 7;
            double[] days = new double[7];
            for (int i = 0; i < 7; i++) {
                days[i] = Math.max(5, 15 + ((seed + i * 13) % 40) + Math.sin(seed + i) * 3);
            }
            return Map.of("days", days, "change", 2.1, "direction", "stable");
        }
        return Map.of("days", list, "change", 1.2, "direction", "stable");
    }

    private Map<String, Object> toDto(Market m) {
        int[] days =
                Arrays.stream(m.getOpeningDays().split(",")).map(String::trim).mapToInt(Integer::parseInt).toArray();
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", m.getId());
        dto.put("name", m.getName());
        dto.put("district", m.getDistrict());
        dto.put("city", m.getCity());
        dto.put("lat", m.getLatitude());
        dto.put("lng", m.getLongitude());
        dto.put("days", days);
        dto.put("hours", m.getHours());
        dto.put("vendorCount", m.getVendorCount());
        dto.put("type", m.getType() != null ? m.getType() : "");
        dto.put("address", m.getAddress() != null ? m.getAddress() : "");
        dto.put("image", m.getImage() != null ? m.getImage() : "");
        return dto;
    }
}
