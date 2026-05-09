package com.pazarsaffaf.market;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "market_layout")
@Getter
@Setter
@NoArgsConstructor
public class MarketLayout {

    @Id
    @Column(name = "market_id")
    private Long marketId;

    @OneToOne(optional = false)
    @MapsId
    @JoinColumn(name = "market_id")
    private Market market;

    @Column(name = "format_version", nullable = false)
    private int formatVersion = 2;

    @Column(name = "revision", nullable = false)
    private long revision = 1;

    @Column(name = "layout_json", nullable = false, columnDefinition = "CLOB")
    private String layoutJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
