package com.pazarsaffaf.inspection;

import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.market.Market;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inspection")
@Getter
@Setter
@NoArgsConstructor
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "officer_user_id", nullable = false)
    private AppUser officer;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "violations_count", nullable = false)
    private int violationsCount;

    private String notes;
}
