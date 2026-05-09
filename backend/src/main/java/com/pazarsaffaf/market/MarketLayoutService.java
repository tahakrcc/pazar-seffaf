package com.pazarsaffaf.market;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MarketLayoutService {
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final MarketLayoutRepository marketLayoutRepository;
    private final MarketRepository marketRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Map<String, Object> getLayout(Long marketId) {
        MarketLayout layout = marketLayoutRepository.findById(marketId).orElseGet(() -> createDefaultLayout(marketId, "system"));
        Map<String, Object> parsed = parseLayout(layout.getLayoutJson());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("marketId", marketId);
        result.put("formatVersion", layout.getFormatVersion());
        result.put("revision", layout.getRevision());
        result.put("layout", parsed);
        return result;
    }

    @Transactional
    public Map<String, Object> upsertLayout(Long marketId, Map<String, Object> layoutPayload, long expectedRevision, String updatedBy) {
        MarketLayout layout = marketLayoutRepository.findById(marketId).orElseGet(() -> createDefaultLayout(marketId, updatedBy));
        if (expectedRevision > 0 && layout.getRevision() != expectedRevision) {
            throw new IllegalStateException("Layout güncel değil. Sayfayı yenileyin.");
        }
        Map<String, Object> normalized = normalizeLayout(layoutPayload);
        layout.setLayoutJson(writeLayout(normalized));
        layout.setFormatVersion(2);
        layout.setRevision(layout.getRevision() + 1);
        layout.setUpdatedAt(Instant.now());
        layout.setUpdatedBy(updatedBy);
        marketLayoutRepository.save(layout);
        return getLayout(marketId);
    }

    private MarketLayout createDefaultLayout(Long marketId, String updatedBy) {
        Market market = marketRepository.findById(marketId).orElseThrow();
        MarketLayout layout = new MarketLayout();
        layout.setMarket(market);
        layout.setMarketId(market.getId());
        layout.setLayoutJson(defaultLayoutJson(market));
        layout.setFormatVersion(2);
        layout.setRevision(1);
        layout.setUpdatedAt(Instant.now());
        layout.setUpdatedBy(updatedBy);
        return marketLayoutRepository.save(layout);
    }

    private String defaultLayoutJson(Market market) {
        String canvas = market.getSchemaCanvasJson();
        if (canvas != null && !canvas.isBlank()) {
            return canvas;
        }
        return "{\"version\":2,\"width\":720,\"height\":520,\"nodes\":[]}";
    }

    private Map<String, Object> normalizeLayout(Map<String, Object> payload) {
        Map<String, Object> normalized = payload == null ? new LinkedHashMap<>() : new LinkedHashMap<>(payload);
        normalized.put("version", 2);
        Object width = normalized.get("width");
        Object height = normalized.get("height");
        normalized.put("width", (width instanceof Number n && n.doubleValue() >= 100) ? n.intValue() : 720);
        normalized.put("height", (height instanceof Number n && n.doubleValue() >= 100) ? n.intValue() : 520);
        Object nodes = normalized.get("nodes");
        if (!(nodes instanceof List<?>)) {
            normalized.put("nodes", List.of());
        }
        return normalized;
    }

    private Map<String, Object> parseLayout(String raw) {
        try {
            Map<String, Object> parsed = objectMapper.readValue(raw, MAP_TYPE);
            return normalizeLayout(parsed);
        } catch (Exception e) {
            return Map.of("version", 2, "width", 720, "height", 520, "nodes", List.of());
        }
    }

    private String writeLayout(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("Layout JSON yazılamadı");
        }
    }
}
