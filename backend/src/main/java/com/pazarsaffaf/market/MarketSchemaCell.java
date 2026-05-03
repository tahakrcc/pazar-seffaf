package com.pazarsaffaf.market;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "market_schema_cell")
@Getter
@Setter
@NoArgsConstructor
public class MarketSchemaCell {

    @EmbeddedId
    private MarketCellId id;

    @MapsId("marketId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(name = "cell_type", nullable = false, length = 32)
    private String cellType;

    @Column(name = "stall_code")
    private String stallCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    public MarketSchemaCell(Market market, String cellId, String cellType, String stallCode, Vendor vendor) {
        this.id = new MarketCellId(market.getId(), cellId);
        this.market = market;
        this.cellType = cellType;
        this.stallCode = stallCode;
        this.vendor = vendor;
    }
}
