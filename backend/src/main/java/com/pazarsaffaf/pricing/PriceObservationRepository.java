package com.pazarsaffaf.pricing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceObservationRepository extends JpaRepository<PriceObservation, Long> {

    List<PriceObservation> findTop200ByMarket_IdOrderByObservedAtDesc(Long marketId);
}
