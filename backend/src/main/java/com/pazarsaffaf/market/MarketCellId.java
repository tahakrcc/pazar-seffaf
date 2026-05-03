package com.pazarsaffaf.market;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MarketCellId implements Serializable {

    @Column(name = "market_id", nullable = false)
    private Long marketId;

    @Column(name = "cell_id", nullable = false, length = 32)
    private String cellId;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        MarketCellId that = (MarketCellId) o;
        return Objects.equals(marketId, that.marketId) && Objects.equals(cellId, that.cellId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(marketId, cellId);
    }
}
