package com.pazarsaffaf.api;

import com.pazarsaffaf.complaint.Complaint;
import com.pazarsaffaf.complaint.ComplaintRepository;
import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.AppUserRepository;
import com.pazarsaffaf.iam.UserRole;
import jakarta.validation.constraints.NotNull;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chief")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ChiefApiController {

    private static final List<String> OPEN = List.of("NEW", "ASSIGNED", "IN_PROGRESS");

    private final ComplaintRepository complaintRepository;
    private final AppUserRepository appUserRepository;

    @GetMapping("/workload")
    public Map<String, Object> workload(@AuthenticationPrincipal AppUser chief) {
        long officers =
                appUserRepository.findByReportsTo_Id(chief.getId()).stream()
                        .filter(u -> u.getRole() == UserRole.OFFICER)
                        .count();
        long open = complaintRepository.findByStatusInOrderBySubmittedAtDesc(OPEN).size();
        return Map.of("officerCount", officers, "openComplaints", open);
    }

    @GetMapping("/officers")
    public List<Map<String, Object>> officers(@AuthenticationPrincipal AppUser chief) {
        return appUserRepository.findByReportsTo_Id(chief.getId()).stream()
                .filter(u -> u.getRole() == UserRole.OFFICER)
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail()))
                .toList();
    }

    @GetMapping("/complaints")
    public List<Map<String, Object>> complaints() {
        return complaintRepository.findByStatusInOrderBySubmittedAtDesc(OPEN).stream()
                .map(this::complaintToMap)
                .toList();
    }

    public record AssignmentRequest(@NotNull Long complaintId, @NotNull Long officerUserId) {}

    @PostMapping("/assignments")
    @Transactional
    public Map<String, Object> assign(@AuthenticationPrincipal AppUser chief, @RequestBody AssignmentRequest req) {
        Complaint c = complaintRepository.findById(req.complaintId()).orElseThrow();
        AppUser officer = appUserRepository.findById(req.officerUserId()).orElseThrow();
        if (officer.getRole() != UserRole.OFFICER) {
            throw new IllegalArgumentException("Hedef kullanici zabita olmali");
        }
        if (officer.getReportsTo() == null || !officer.getReportsTo().getId().equals(chief.getId())) {
            throw new IllegalArgumentException("Zabita bu mudure bagli degil");
        }
        c.setAssignedOfficer(officer);
        c.setStatus("ASSIGNED");
        complaintRepository.save(c);
        return Map.of("complaintId", c.getId(), "assignedOfficerId", officer.getId());
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
