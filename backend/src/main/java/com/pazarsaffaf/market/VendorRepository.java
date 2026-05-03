package com.pazarsaffaf.market;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByMarket_Id(Long marketId);

    /** Oturum içi esnaf API'si: AppUser üzerindeki Vendor proxy'sine dokunmadan pazar ile birlikte yükle. */
    @Query("SELECT v FROM Vendor v JOIN FETCH v.market WHERE v.appUser.id = :appUserId")
    Optional<Vendor> findWithMarketByAppUserId(@Param("appUserId") Long appUserId);
}
