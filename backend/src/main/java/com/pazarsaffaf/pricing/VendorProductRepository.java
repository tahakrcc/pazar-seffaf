package com.pazarsaffaf.pricing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorProductRepository extends JpaRepository<VendorProduct, Long> {

    List<VendorProduct> findByVendor_Market_IdAndPublishedTrue(Long marketId);

    List<VendorProduct> findByVendor_Id(Long vendorId);

    List<VendorProduct> findByProduct_IdAndVendor_Market_IdAndPublishedTrueOrderByUnitPriceAsc(Long productId, Long marketId);
}
