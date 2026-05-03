package com.pazarsaffaf.market;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRepository extends JpaRepository<Market, Long> {

    List<Market> findByCityIgnoreCase(String city);
}
