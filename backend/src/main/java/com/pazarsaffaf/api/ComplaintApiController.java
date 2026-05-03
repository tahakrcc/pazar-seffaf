package com.pazarsaffaf.api;

import com.pazarsaffaf.audit.AuditLog;
import com.pazarsaffaf.audit.AuditLogRepository;
import com.pazarsaffaf.complaint.Complaint;
import com.pazarsaffaf.complaint.ComplaintRepository;
import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import com.pazarsaffaf.storage.EvidenceStorageService;
import jakarta.validation.constraints.NotNull;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintApiController {
    private static final Pattern PHONE_ALLOWED_PATTERN = Pattern.compile("^\\+?[0-9\\s()\\-]{10,20}$");

    private final ComplaintRepository complaintRepository;
    private final MarketRepository marketRepository;
    private final VendorRepository vendorRepository;
    private final EvidenceStorageService evidenceStorageService;
    private final AuditLogRepository auditLogRepository;

    public record ComplaintCreateRequest(@NotNull Long marketId, String description, Double latitude, Double longitude) {}

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> create(
            @RequestParam Long marketId,
            @RequestParam Long vendorId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam String reporterPhone,
            @RequestParam(required = false) String citizenSessionId,
            @RequestParam(required = false) MultipartFile photo)
            throws Exception {
        String normalizedPhone = normalizePhone(reporterPhone);
        Market market = marketRepository.findById(marketId).orElseThrow();
        Vendor vendor = vendorRepository.findById(vendorId).orElseThrow();
        if (!vendor.getMarket().getId().equals(market.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secilen tezgah bu pazara ait degil");
        }
        Complaint c = new Complaint();
        c.setMarket(market);
        c.setVendor(vendor);
        c.setDescription(description);
        c.setLatitude(latitude);
        c.setLongitude(longitude);
        c.setReporterPhone(normalizedPhone);
        c.setCitizenSessionId(citizenSessionId != null ? citizenSessionId : UUID.randomUUID().toString());
        if (photo != null && !photo.isEmpty()) {
            String key = evidenceStorageService.store(photo, "complaints");
            c.setEvidenceObjectKey(key);
        }
        c = complaintRepository.save(c);
        AuditLog log = new AuditLog();
        log.setActor("ANON");
        log.setAction("COMPLAINT_CREATE");
        log.setResourceType("complaint");
        log.setResourceId(String.valueOf(c.getId()));
        auditLogRepository.save(log);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", c.getId());
        response.put("status", c.getStatus());
        response.put("assignedOfficerId", null);
        response.put("reporterPhone", c.getReporterPhone());
        return response;
    }

    private String normalizePhone(String reporterPhone) {
        if (reporterPhone == null || reporterPhone.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarasi zorunludur");
        }
        String raw = reporterPhone.trim();
        if (!PHONE_ALLOWED_PATTERN.matcher(raw).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarasi gecersiz");
        }
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() < 10 || digits.length() > 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon numarasi gecersiz");
        }
        return raw.startsWith("+") ? "+" + digits : digits;
    }
}
