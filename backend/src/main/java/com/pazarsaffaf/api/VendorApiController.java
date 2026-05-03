package com.pazarsaffaf.api;

import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.UserRole;
import com.pazarsaffaf.invoice.Invoice;
import com.pazarsaffaf.invoice.InvoiceLine;
import com.pazarsaffaf.invoice.InvoiceLineRepository;
import com.pazarsaffaf.invoice.InvoiceRepository;
import com.pazarsaffaf.invoice.OcrEventPublisher;
import com.pazarsaffaf.invoice.OcrJob;
import com.pazarsaffaf.invoice.OcrJobRepository;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import com.pazarsaffaf.pricing.Product;
import com.pazarsaffaf.pricing.ProductRepository;
import com.pazarsaffaf.pricing.VendorProduct;
import com.pazarsaffaf.pricing.VendorProductRepository;
import com.pazarsaffaf.storage.EvidenceStorageService;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/vendor")
@RequiredArgsConstructor
public class VendorApiController {

    private final VendorRepository vendorRepository;
    private final VendorProductRepository vendorProductRepository;
    private final ProductRepository productRepository;
    private final EvidenceStorageService evidenceStorageService;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository invoiceLineRepository;
    private final OcrJobRepository ocrJobRepository;
    private final OcrEventPublisher ocrEventPublisher;

    private Vendor requireVendor(AppUser user) {
        if (user == null || user.getRole() != UserRole.VENDOR) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esnaf hesabi gerekli");
        }
        return vendorRepository
                .findWithMarketByAppUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Esnaf hesabi gerekli"));
    }

    @GetMapping("/me")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Map<String, Object> me(@AuthenticationPrincipal AppUser user) {
        Vendor v = requireVendor(user);
        return Map.of(
                "vendorId",
                v.getId(),
                "name",
                v.getName(),
                "stall",
                v.getStallCode() != null ? v.getStallCode() : "",
                "score",
                v.getScore(),
                "marketId",
                v.getMarket().getId(),
                "marketName",
                v.getMarket().getName());
    }

    @GetMapping("/products")
    public List<Map<String, Object>> list(@AuthenticationPrincipal AppUser user) {
        Vendor v = requireVendor(user);
        return vendorProductRepository.findByVendor_Id(v.getId()).stream().map(this::vpToMap).toList();
    }

    public record VendorProductUpsertRequest(@NotNull Long productId, @NotNull BigDecimal unitPrice) {}

    @PostMapping("/products")
    public Map<String, Object> upsertProduct(@AuthenticationPrincipal AppUser user, @RequestBody VendorProductUpsertRequest req) {
        Vendor v = requireVendor(user);
        Product p = productRepository.findById(req.productId()).orElseThrow();
        VendorProduct vp =
                vendorProductRepository.findByVendor_Id(v.getId()).stream()
                        .filter(x -> x.getProduct().getId().equals(p.getId()))
                        .findFirst()
                        .orElseGet(
                                () -> {
                                    VendorProduct n = new VendorProduct();
                                    n.setVendor(v);
                                    n.setProduct(p);
                                    return n;
                                });
        vp.setUnitPrice(req.unitPrice());
        vp.setPublished(false);
        vp = vendorProductRepository.save(vp);
        return Map.of("id", vp.getId());
    }

    @PatchMapping("/products/{id}/publish")
    public Map<String, Object> publish(@AuthenticationPrincipal AppUser user, @PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Vendor v = requireVendor(user);
        VendorProduct vp = vendorProductRepository.findById(id).orElseThrow();
        if (!vp.getVendor().getId().equals(v.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        vp.setPublished(Boolean.TRUE.equals(body.get("published")));
        vendorProductRepository.save(vp);
        return Map.of("id", vp.getId(), "published", vp.isPublished());
    }

    @PostMapping(value = "/invoices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadInvoice(@AuthenticationPrincipal AppUser user, @RequestParam("file") MultipartFile file)
            throws Exception {
        Vendor v = requireVendor(user);
        String key = evidenceStorageService.store(file, "invoices");
        Invoice inv = new Invoice();
        inv.setVendor(v);
        inv.setMarket(v.getMarket());
        inv.setObjectKey(key);
        inv.setStatus("UPLOADED");
        inv = invoiceRepository.save(inv);
        OcrJob job = new OcrJob();
        job.setInvoice(inv);
        job.setStatus("PENDING");
        job = ocrJobRepository.save(job);
        ocrEventPublisher.publishOrRunSync(job.getId());
        return Map.of("invoiceId", inv.getId(), "ocrJobId", job.getId());
    }

    @GetMapping("/invoices")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Map<String, Object>> listInvoices(@AuthenticationPrincipal AppUser user) {
        Vendor v = requireVendor(user);
        return invoiceRepository.findByVendor_IdOrderByCreatedAtDesc(v.getId()).stream()
                .map(this::invoiceToMap)
                .toList();
    }

    @PatchMapping("/invoices/{invoiceId}/lines")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> patchInvoiceLines(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long invoiceId,
            @RequestBody List<Map<String, Object>> updates) {
        Vendor v = requireVendor(user);
        Invoice inv = invoiceRepository.findById(invoiceId).orElseThrow();
        if (!inv.getVendor().getId().equals(v.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        for (Map<String, Object> u : updates) {
            if (u.get("lineId") == null) {
                continue;
            }
            long lineId = ((Number) u.get("lineId")).longValue();
            InvoiceLine line = invoiceLineRepository.findById(lineId).orElseThrow();
            if (!line.getInvoice().getId().equals(invoiceId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            }
            if (u.containsKey("productId") && u.get("productId") != null) {
                long productId = ((Number) u.get("productId")).longValue();
                line.setProduct(productRepository.findById(productId).orElseThrow());
            }
            if (u.containsKey("quantity") && u.get("quantity") != null) {
                line.setQuantity(BigDecimal.valueOf(((Number) u.get("quantity")).doubleValue()));
            }
            if (u.containsKey("unitPrice") && u.get("unitPrice") != null) {
                line.setUnitPrice(BigDecimal.valueOf(((Number) u.get("unitPrice")).doubleValue()));
            }
            if (line.getQuantity() != null && line.getUnitPrice() != null) {
                line.setLineTotal(line.getQuantity().multiply(line.getUnitPrice()));
            }
            invoiceLineRepository.save(line);
        }
        inv.setStatus("VENDOR_CORRECTED");
        invoiceRepository.save(inv);
        return Map.of("invoiceId", invoiceId, "updated", updates.size());
    }

    private Map<String, Object> invoiceToMap(Invoice inv) {
        String ocrStatus =
                ocrJobRepository.findFirstByInvoice_IdOrderByCreatedAtDesc(inv.getId())
                        .map(OcrJob::getStatus)
                        .orElse("");
        List<Map<String, Object>> lines =
                invoiceLineRepository.findByInvoice_Id(inv.getId()).stream()
                        .map(this::lineToMap)
                        .toList();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", inv.getId());
        m.put("status", inv.getStatus());
        m.put("ocrJobStatus", ocrStatus);
        m.put("objectKey", inv.getObjectKey());
        m.put("lines", lines);
        return m;
    }

    private Map<String, Object> lineToMap(InvoiceLine line) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", line.getId());
        if (line.getProduct() != null) {
            m.put("productId", line.getProduct().getId());
            m.put("productName", line.getProduct().getName());
        } else {
            m.put("productId", null);
            m.put("productName", "");
        }
        m.put("quantity", line.getQuantity());
        m.put("unit", line.getUnit() != null ? line.getUnit() : "");
        m.put("unitPrice", line.getUnitPrice());
        m.put("lineTotal", line.getLineTotal());
        m.put("rawLabel", line.getRawLabel() != null ? line.getRawLabel() : "");
        return m;
    }

    private Map<String, Object> vpToMap(VendorProduct vp) {
        return Map.of(
                "id",
                vp.getId(),
                "productId",
                vp.getProduct().getId(),
                "productName",
                vp.getProduct().getName(),
                "unitPrice",
                vp.getUnitPrice(),
                "published",
                vp.isPublished());
    }
}
