package com.pazarsaffaf.invoice;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceLineRepository extends JpaRepository<InvoiceLine, Long> {

    List<InvoiceLine> findByInvoice_Id(Long invoiceId);

    void deleteByInvoice_Id(Long invoiceId);
}
