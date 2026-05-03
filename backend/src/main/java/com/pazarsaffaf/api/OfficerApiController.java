package com.pazarsaffaf.api;

import com.pazarsaffaf.complaint.Complaint;
import com.pazarsaffaf.complaint.ComplaintRepository;
import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.UserRole;
import com.pazarsaffaf.inspection.Inspection;
import com.pazarsaffaf.inspection.InspectionRepository;
import com.pazarsaffaf.inspection.Violation;
import com.pazarsaffaf.inspection.ViolationRepository;
import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.LinkedHashMap;
import java.time.LocalDate;
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
@RequestMapping("/api/v1/officer")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class OfficerApiController {

    private static final List<String> OPEN = List.of("NEW", "ASSIGNED", "IN_PROGRESS");

    private final ComplaintRepository complaintRepository;
    private final InspectionRepository inspectionRepository;
    private final ViolationRepository violationRepository;
    private final MarketRepository marketRepository;
    private final VendorRepository vendorRepository;

    @GetMapping("/complaints")
    public List<Map<String, Object>> complaints(@AuthenticationPrincipal AppUser user) {
        List<Complaint> list = complaintRepository.findByStatusInOrderBySubmittedAtDesc(OPEN);
        if (user.getRole() == UserRole.OFFICER) {
            list =
                    list.stream()
                            .filter(
                                    c -> {
                                        if (c.getAssignedOfficer() == null) {
                                            return true;
                                        }
                                        return c.getAssignedOfficer().getId().equals(user.getId());
                                    })
                            .toList();
        }
        return list.stream().map(this::complaintToMap).toList();
    }

    public record ComplaintStatusPatch(@NotBlank String status) {}

    @PatchMapping("/complaints/{id}")
    @Transactional
    public Map<String, Object> patchComplaintStatus(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusPatch body) {
        Complaint c = complaintRepository.findById(id).orElseThrow();
        String next = body.status();
        if (user.getRole() == UserRole.OFFICER) {
            if ("IN_PROGRESS".equalsIgnoreCase(next)) {
                if (c.getAssignedOfficer() != null
                        && !c.getAssignedOfficer().getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Baska zabitaya atanmis");
                }
                if (c.getAssignedOfficer() == null) {
                    c.setAssignedOfficer(user);
                }
                c.setStatus("IN_PROGRESS");
            } else if ("RESOLVED".equalsIgnoreCase(next)) {
                if (c.getAssignedOfficer() == null
                        || !c.getAssignedOfficer().getId().equals(user.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Once uzerinize alin");
                }
                c.setStatus("RESOLVED");
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gecersiz durum");
            }
        } else if (user.getRole() == UserRole.CHIEF || user.getRole() == UserRole.ADMIN) {
            c.setStatus(next.toUpperCase());
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        complaintRepository.save(c);
        return Map.of("id", c.getId(), "status", c.getStatus());
    }

    @GetMapping("/inspections")
    public List<Map<String, Object>> myInspections(@AuthenticationPrincipal AppUser user) {
        if (user.getRole() != UserRole.OFFICER) {
            return List.of();
        }
        return inspectionRepository.findByOfficer_IdOrderByInspectionDateDesc(user.getId()).stream()
                .map(this::inspectionToMap)
                .toList();
    }

    @PostMapping("/inspections")
    @Transactional
    public Map<String, Object> createInspection(
            @AuthenticationPrincipal AppUser user, @Valid @RequestBody InspectionRequest req) {
        Inspection i = new Inspection();
        Market market = marketRepository.findById(req.marketId()).orElseThrow();
        i.setMarket(market);
        i.setOfficer(user);
        i.setInspectionDate(req.inspectionDate());
        i.setStatus(req.status());
        i.setViolationsCount(req.violationsCount());
        i.setNotes(req.notes());
        i = inspectionRepository.save(i);
        return Map.of("id", i.getId(), "status", i.getStatus());
    }

    public record InspectionRequest(
            @NotNull Long marketId,
            @NotNull LocalDate inspectionDate,
            @NotBlank String status,
            int violationsCount,
            String notes) {}

    @PostMapping("/violations")
    @Transactional
    public Map<String, Object> createViolation(@Valid @RequestBody ViolationRequest req) {
        Violation v = new Violation();
        v.setInspection(inspectionRepository.findById(req.inspectionId()).orElseThrow());
        if (req.vendorId() != null) {
            Vendor vendor = vendorRepository.findById(req.vendorId()).orElse(null);
            v.setVendor(vendor);
        }
        v.setViolationType(req.type());
        v.setDescription(req.description());
        v = violationRepository.save(v);
        return Map.of("id", v.getId());
    }

    public record ViolationRequest(
            @NotNull Long inspectionId, Long vendorId, @NotBlank String type, String description) {}

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

    private Map<String, Object> inspectionToMap(Inspection i) {
        return Map.of(
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
                i.getOfficer().getName());
    }
}
