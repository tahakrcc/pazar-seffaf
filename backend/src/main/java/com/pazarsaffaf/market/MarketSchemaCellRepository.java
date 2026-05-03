package com.pazarsaffaf.market;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketSchemaCellRepository extends JpaRepository<MarketSchemaCell, MarketCellId> {

    List<MarketSchemaCell> findById_MarketId(Long marketId);

    void deleteById_MarketId(Long marketId);
}
