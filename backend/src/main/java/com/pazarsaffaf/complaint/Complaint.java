package com.pazarsaffaf.complaint;

import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.Vendor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "complaint")
@Getter
@Setter
@NoArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    private String description;

    @Column(nullable = false, length = 32)
    private String status = "NEW";

    private Double latitude;

    private Double longitude;

    @Column(name = "evidence_object_key")
    private String evidenceObjectKey;

    @Column(name = "citizen_session_id")
    private String citizenSessionId;

    @Column(name = "reporter_phone", length = 32)
    private String reporterPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_officer_id")
    private AppUser assignedOfficer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();
}
