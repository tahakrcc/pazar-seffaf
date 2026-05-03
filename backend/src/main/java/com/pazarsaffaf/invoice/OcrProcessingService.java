package com.pazarsaffaf.invoice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pazarsaffaf.pricing.Product;
import com.pazarsaffaf.pricing.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrProcessingService {

    private final OcrJobRepository ocrJobRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository invoiceLineRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void processJob(Long ocrJobId) {
        OcrJob job = ocrJobRepository.findById(ocrJobId).orElseThrow();
        Invoice inv = job.getInvoice();
        invoiceLineRepository.deleteByInvoice_Id(inv.getId());
        job.setStatus("PROCESSING");
        ocrJobRepository.save(job);

        Product first = productRepository.findAll().stream().findFirst().orElse(null);
        if (first != null) {
            InvoiceLine line = new InvoiceLine();
            line.setInvoice(inv);
            line.setProduct(first);
            line.setQuantity(BigDecimal.ONE);
            line.setUnit(first.getUnit());
            line.setUnitPrice(BigDecimal.valueOf(25));
            line.setLineTotal(BigDecimal.valueOf(25));
            line.setRawLabel("OCR mock: " + first.getName());
            invoiceLineRepository.save(line);
        }

        Map<String, Object> raw = new HashMap<>();
        raw.put("engine", "mock");
        raw.put("lines", 1);
        try {
            job.setRawOutputJson(objectMapper.writeValueAsString(raw));
        } catch (Exception e) {
            job.setRawOutputJson("{}");
        }
        job.setStatus("COMPLETED");
        job.setCompletedAt(Instant.now());
        ocrJobRepository.save(job);
        inv.setStatus("OCR_COMPLETED");
        invoiceRepository.save(inv);
        log.info("OCR job {} completed for invoice {}", ocrJobId, inv.getId());
    }
}
