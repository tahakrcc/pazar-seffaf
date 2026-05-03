package com.pazarsaffaf.api;

import com.pazarsaffaf.audit.AuditLog;
import com.pazarsaffaf.audit.AuditLogRepository;
import com.pazarsaffaf.complaint.Complaint;
import com.pazarsaffaf.complaint.ComplaintRepository;
import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.AppUserRepository;
import com.pazarsaffaf.iam.UserRole;
import com.pazarsaffaf.inspection.Inspection;
import com.pazarsaffaf.inspection.InspectionRepository;
import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketCellId;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.market.MarketSchemaCell;
import com.pazarsaffaf.market.MarketSchemaCellRepository;
import com.pazarsaffaf.market.Municipality;
import com.pazarsaffaf.market.MunicipalityRepository;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminApiController {

    private final MunicipalityRepository municipalityRepository;
    private final MarketRepository marketRepository;
    private final MarketSchemaCellRepository marketSchemaCellRepository;
    private final VendorRepository vendorRepository;
    private final AuditLogRepository auditLogRepository;
    private final InspectionRepository inspectionRepository;
    private final ComplaintRepository complaintRepository;
    private final AppUserRepository appUserRepository;

    public record CreateMarketRequest(
            @NotNull Long municipalityId,
            @NotBlank String name,
            @NotBlank String city,
            @NotBlank String district,
            double latitude,
            double longitude,
            @NotBlank String openingDays,
            @NotBlank String hours,
            int vendorCount,
            String type,
            String address,
            String image) {}

    @PostMapping("/markets")
    @Transactional
    public Map<String, Object> createMarket(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin, @RequestBody CreateMarketRequest req) {
        Municipality m = municipalityRepository.findById(req.municipalityId()).orElseThrow();
        Market market = new Market();
        market.setMunicipality(m);
        market.setName(req.name());
        market.setCity(req.city());
        market.setDistrict(req.district());
        market.setLatitude(req.latitude());
        market.setLongitude(req.longitude());
        market.setOpeningDays(req.openingDays());
        market.setHours(req.hours());
        market.setVendorCount(req.vendorCount());
        market.setType(req.type());
        market.setAddress(req.address());
        market.setImage(req.image());
        market = marketRepository.save(market);
        audit(admin, "MARKET_CREATE", "market", String.valueOf(market.getId()));
        return Map.of("id", market.getId());
    }

    @GetMapping("/municipalities")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> municipalities(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin) {
        return municipalityRepository.findAll().stream()
                .map(m -> Map.<String, Object>of("id", m.getId(), "name", m.getName()))
                .toList();
    }

    @GetMapping("/vendors")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listVendors(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin) {
        return vendorRepository.findAll().stream()
                .map(
                        v ->
                                Map.<String, Object>of(
                                        "id",
                                        v.getId(),
                                        "name",
                                        v.getName(),
                                        "score",
                                        v.getScore(),
                                        "stallCode",
                                        v.getStallCode() != null ? v.getStallCode() : "",
                                        "marketId",
                                        v.getMarket().getId(),
                                        "marketName",
                                        v.getMarket().getName()))
                .toList();
    }

    @GetMapping("/inspections")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listInspections(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin) {
        return inspectionRepository.findAll().stream()
                .sorted(Comparator.comparing(Inspection::getInspectionDate).reversed())
                .limit(80)
                .map(
                        i ->
                                Map.<String, Object>of(
                                        "id",
                                        i.getId(),
                                        "marketId",
                                        i.getMarket().getId(),
                                        "marketName",
                                        i.getMarket().getName(),
                                        "date",
                                        i.getInspectionDate().toString(),
                                        "status",
                                        i.getStatus(),
                                        "violations",
                                        i.getViolationsCount(),
                                        "notes",
                                        i.getNotes() != null ? i.getNotes() : "",
                                        "inspector",
                                        i.getOfficer().getName()))
                .toList();
    }

    @GetMapping("/officers")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> officers() {
        return appUserRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.OFFICER)
                .map(
                        u ->
                                Map.<String, Object>of(
                                        "id", u.getId(),
                                        "name", u.getName(),
                                        "email", u.getEmail()))
                .toList();
    }

    @GetMapping("/complaints")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> complaints() {
        List<String> open = List.of("NEW", "ASSIGNED", "IN_PROGRESS");
        return complaintRepository.findByStatusInOrderBySubmittedAtDesc(open).stream()
                .map(this::complaintToMap)
                .toList();
    }

    public record ComplaintAssignmentRequest(@NotNull Long complaintId, @NotNull Long officerUserId) {}

    @PostMapping("/assignments")
    @Transactional
    public Map<String, Object> assignComplaint(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin, @RequestBody ComplaintAssignmentRequest req) {
        Complaint c = complaintRepository.findById(req.complaintId()).orElseThrow();
        AppUser officer = appUserRepository.findById(req.officerUserId()).orElseThrow();
        if (officer.getRole() != UserRole.OFFICER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hedef kullanici zabita olmali");
        }
        c.setAssignedOfficer(officer);
        c.setStatus("ASSIGNED");
        complaintRepository.save(c);
        audit(admin, "COMPLAINT_ASSIGN", "complaint", String.valueOf(c.getId()));
        return Map.of("complaintId", c.getId(), "assignedOfficerId", officer.getId());
    }

    @PatchMapping("/markets/{marketId}/schema/cells/{cellId}")
    @Transactional
    public Map<String, Object> patchCell(
            @AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin,
            @PathVariable Long marketId,
            @PathVariable String cellId,
            @RequestBody Map<String, Object> body) {
        Market market = marketRepository.findById(marketId).orElseThrow();
        MarketCellId id = new MarketCellId(marketId, cellId);
        MarketSchemaCell cell = marketSchemaCellRepository.findById(id).orElseGet(() -> new MarketSchemaCell(market, cellId, "empty", null, null));
        if (body.containsKey("cellType") && body.get("cellType") != null) {
            cell.setCellType(String.valueOf(body.get("cellType")));
        }
        if (body.containsKey("stallCode")) {
            Object sc = body.get("stallCode");
            cell.setStallCode(sc != null ? String.valueOf(sc) : null);
        }
        if (body.containsKey("vendorId")) {
            Object vid = body.get("vendorId");
            if (vid == null) {
                cell.setVendor(null);
            } else {
                long vendorPk = ((Number) vid).longValue();
                Vendor v = vendorRepository.findById(vendorPk).orElseThrow();
                cell.setVendor(v);
            }
        }
        marketSchemaCellRepository.save(cell);
        audit(admin, "SCHEMA_PATCH", "market_cell", marketId + ":" + cellId);
        return Map.of("ok", true);
    }

    /** Serbest tuval şeması (JSON metin); canvasJson null ise sütun silinir ve yalnız ızgara şema kullanılır. */
    public record SchemaCanvasPatchRequest(String canvasJson) {}

    private Map<String, Object> persistMarketCanvas(AppUser admin, Long marketId, String canvasJson) {
        Market market = marketRepository.findById(marketId).orElseThrow();
        market.setSchemaCanvasJson(canvasJson);
        marketRepository.save(market);
        audit(admin, "SCHEMA_CANVAS_PATCH", "market", String.valueOf(marketId));
        return Map.of("ok", true);
    }

    @PatchMapping("/markets/{marketId}/schema/canvas")
    @Transactional
    public Map<String, Object> patchSchemaCanvas(
            @AuthenticationPrincipal AppUser admin,
            @PathVariable Long marketId,
            @RequestBody SchemaCanvasPatchRequest req) {
        return persistMarketCanvas(admin, marketId, req.canvasJson());
    }

    /**
     * Tuval kaydı (POST): public GET {@code /api/v1/markets/{id}/map-schema} ile aynı isim uzayı.
     * Bazı ortamlarda PATCH isteği veya eski sürüm eşlemesi sorun çıkarabildiği için öncelikli kayıt yolu.
     */
    @PostMapping("/markets/{marketId}/map-schema/canvas")
    @Transactional
    public Map<String, Object> postMapSchemaCanvas(
            @AuthenticationPrincipal AppUser admin,
            @PathVariable Long marketId,
            @RequestBody SchemaCanvasPatchRequest req) {
        return persistMarketCanvas(admin, marketId, req.canvasJson());
    }

    public record AssignVendorRequest(@NotNull Long vendorId, @NotNull Long marketId) {}

    @PostMapping("/assign/vendor")
    @Transactional
    public Map<String, Object> assignVendor(@AuthenticationPrincipal com.pazarsaffaf.iam.AppUser admin, @RequestBody AssignVendorRequest req) {
        Vendor v = vendorRepository.findById(req.vendorId()).orElseThrow();
        Market m = marketRepository.findById(req.marketId()).orElseThrow();
        v.setMarket(m);
        vendorRepository.save(v);
        audit(admin, "VENDOR_ASSIGN_MARKET", "vendor", String.valueOf(v.getId()));
        return Map.of("vendorId", v.getId(), "marketId", m.getId());
    }

    private void audit(com.pazarsaffaf.iam.AppUser actor, String action, String resourceType, String resourceId) {
        AuditLog log = new AuditLog();
        log.setActor(actor != null ? actor.getEmail() : "system");
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        auditLogRepository.save(log);
    }

    private Map<String, Object> complaintToMap(Complaint c) {
        Long officerId = c.getAssignedOfficer() != null ? c.getAssignedOfficer().getId() : null;
        String officerName = c.getAssignedOfficer() != null ? c.getAssignedOfficer().getName() : "";
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("marketId", c.getMarket().getId());
        m.put("marketName", c.getMarket().getName());
        m.put("description", c.getDescription() != null ? c.getDescription() : "");
        m.put("status", c.getStatus());
        m.put("latitude", c.getLatitude() != null ? c.getLatitude() : 0);
        m.put("longitude", c.getLongitude() != null ? c.getLongitude() : 0);
        m.put("evidenceObjectKey", c.getEvidenceObjectKey() != null ? c.getEvidenceObjectKey() : "");
        m.put("reporterPhone", c.getReporterPhone() != null ? c.getReporterPhone() : "");
        m.put("submittedAt", c.getSubmittedAt().toString());
        m.put("assignedOfficerId", officerId != null ? officerId : 0);
        m.put("assignedOfficerName", officerName);
        if (c.getVendor() != null) {
            m.put("vendorId", c.getVendor().getId());
            m.put("vendorName", c.getVendor().getName());
            m.put(
                    "stallCode",
                    c.getVendor().getStallCode() != null ? c.getVendor().getStallCode() : "");
        } else {
            m.put("vendorId", 0L);
            m.put("vendorName", "");
            m.put("stallCode", "");
        }
        return m;
    }
}
