package com.pazarsaffaf.invoice;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OcrJobRepository extends JpaRepository<OcrJob, Long> {

    Optional<OcrJob> findFirstByInvoice_IdOrderByCreatedAtDesc(Long invoiceId);
}
