package com.pazarsaffaf.inspection;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    List<Inspection> findByMarket_IdOrderByInspectionDateDesc(Long marketId);

    List<Inspection> findByOfficer_IdOrderByInspectionDateDesc(Long officerUserId);
}
