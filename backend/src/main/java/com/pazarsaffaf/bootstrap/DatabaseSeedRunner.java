package com.pazarsaffaf.bootstrap;

import com.pazarsaffaf.iam.AppUser;
import com.pazarsaffaf.iam.AppUserRepository;
import com.pazarsaffaf.iam.UserRole;
import com.pazarsaffaf.inspection.Inspection;
import com.pazarsaffaf.inspection.InspectionRepository;
import com.pazarsaffaf.market.Market;
import com.pazarsaffaf.market.MarketRepository;
import com.pazarsaffaf.market.MarketSchemaCell;
import com.pazarsaffaf.market.MarketSchemaCellRepository;
import com.pazarsaffaf.market.Municipality;
import com.pazarsaffaf.market.MunicipalityRepository;
import com.pazarsaffaf.market.Vendor;
import com.pazarsaffaf.market.VendorRepository;
import com.pazarsaffaf.pricing.PriceObservation;
import com.pazarsaffaf.pricing.PriceObservationRepository;
import com.pazarsaffaf.pricing.Product;
import com.pazarsaffaf.pricing.ProductRepository;
import com.pazarsaffaf.pricing.VendorProduct;
import com.pazarsaffaf.pricing.VendorProductRepository;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Profile("!test")
public class DatabaseSeedRunner implements ApplicationRunner {

    private final MunicipalityRepository municipalityRepository;
    private final MarketRepository marketRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final VendorProductRepository vendorProductRepository;
    private final MarketSchemaCellRepository marketSchemaCellRepository;
    private final AppUserRepository appUserRepository;
    private final InspectionRepository inspectionRepository;
    private final PriceObservationRepository priceObservationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (marketRepository.count() > 0) {
            return;
        }
        Municipality malatya = municipalityRepository.save(new Municipality("Malatya BB"));

        AppUser admin = new AppUser("admin@pazar.com", passwordEncoder.encode("123456"), "Yonetici", UserRole.ADMIN);
        admin.setMunicipality(malatya);
        appUserRepository.save(admin);

        AppUser chief = new AppUser("mudur@pazar.com", passwordEncoder.encode("123456"), "Zabita Muduru", UserRole.CHIEF);
        chief.setMunicipality(malatya);
        chief = appUserRepository.save(chief);

        AppUser officer = new AppUser("zabita@pazar.com", passwordEncoder.encode("123456"), "Zabita Memuru", UserRole.OFFICER);
        officer.setMunicipality(malatya);
        officer.setReportsTo(chief);
        officer = appUserRepository.save(officer);

        AppUser vendorUser = new AppUser("esnaf@pazar.com", passwordEncoder.encode("123456"), "Ahmet Yilmaz", UserRole.VENDOR);
        vendorUser.setMunicipality(malatya);
        vendorUser = appUserRepository.save(vendorUser);

        Market m1 = new Market();
        m1.setMunicipality(malatya);
        m1.setName("Kernek Semt Pazari");
        m1.setCity("Malatya");
        m1.setDistrict("Battalgazi");
        m1.setLatitude(38.3554);
        m1.setLongitude(38.3096);
        m1.setOpeningDays("2,5");
        m1.setHours("07:00-17:00");
        m1.setVendorCount(120);
        m1.setType("Semt Pazari");
        m1.setAddress("Kernek Mah.");
        m1.setImage("/market_1_1777411006018.png");
        m1.setSchemaCanvasJson(readUtf8Resource("seed/kernek-canvas.json").trim());
        m1 = marketRepository.save(m1);

        Market m2 = new Market();
        m2.setMunicipality(malatya);
        m2.setName("Carsamba Pazari");
        m2.setCity("Malatya");
        m2.setDistrict("Yesilyurt");
        m2.setLatitude(38.32);
        m2.setLongitude(38.28);
        m2.setOpeningDays("3");
        m2.setHours("06:30-16:00");
        m2.setVendorCount(85);
        m2.setType("Semt Pazari");
        m2.setAddress("Tecde Mah.");
        m2.setImage("/market_2_1777411026004.png");
        m2 = marketRepository.save(m2);

        Vendor v1 = new Vendor();
        v1.setMarket(m1);
        v1.setName("Ahmet Yilmaz");
        v1.setStallCode("A-12");
        v1.setScore(92);
        v1.setAppUser(vendorUser);
        v1 = vendorRepository.save(v1);

        vendorUser.setVendor(v1);
        appUserRepository.save(vendorUser);

        Vendor v2 = new Vendor();
        v2.setMarket(m1);
        v2.setName("Mehmet Kaya");
        v2.setStallCode("B-05");
        v2.setScore(87);
        v2 = vendorRepository.save(v2);

        List<Product> products = List.of(
                product("Domates", "DOM", "Sebze", "kg", "[\"Ceri\",\"Sofralik\"]"),
                product("Biber", "BBR", "Sebze", "kg", "[\"Sivri\",\"Dolmalik\"]"),
                product("Patlican", "PTL", "Sebze", "kg", "[]"),
                product("Elma", "ELM", "Meyve", "kg", "[]"),
                product("Sogan", "SGN", "Sebze", "kg", "[]"));
        products = productRepository.saveAll(products);
        productRepository.flush();

        for (Product p : products) {
            VendorProduct vp = new VendorProduct();
            vp.setVendor(v1);
            vp.setProduct(p);
            vp.setUnitPrice(BigDecimal.valueOf(15 + p.getId() * 3));
            vp.setPublished(true);
            vendorProductRepository.save(vp);

            VendorProduct vp2 = new VendorProduct();
            vp2.setVendor(v2);
            vp2.setProduct(p);
            vp2.setUnitPrice(BigDecimal.valueOf(18 + p.getId() * 2));
            vp2.setPublished(true);
            vendorProductRepository.save(vp2);

            PriceObservation obs = new PriceObservation();
            obs.setMarket(m1);
            obs.setVendor(v1);
            obs.setProduct(p);
            obs.setPrice(vp.getUnitPrice());
            obs.setConfidence(80);
            obs.setSource("VENDOR_LISTING");
            priceObservationRepository.save(obs);
        }

        seedSchema(m1, v1, v2);

        Inspection insp = new Inspection();
        insp.setMarket(m1);
        insp.setOfficer(officer);
        insp.setInspectionDate(LocalDate.now().minusDays(2));
        insp.setStatus("completed");
        insp.setViolationsCount(0);
        insp.setNotes("Tum tezgahlar uygun.");
        inspectionRepository.save(insp);
    }

    private static String readUtf8Resource(String classpathPath) {
        try (InputStream in = DatabaseSeedRunner.class.getClassLoader().getResourceAsStream(classpathPath)) {
            if (in == null) {
                throw new IllegalStateException("Eksik kaynak: " + classpathPath);
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Product product(String name, String abbr, String cat, String unit, String subtypes) {
        Product p = new Product();
        p.setName(name);
        p.setAbbr(abbr);
        p.setCategory(cat);
        p.setUnit(unit);
        p.setSubtypesJson(subtypes);
        return p;
    }

    private void seedSchema(Market market, Vendor v1, Vendor v2) {
        for (int r = 0; r < 5; r++) {
            for (int c = 0; c < 5; c++) {
                String cellId = r + "-" + c;
                if (r == 0 || r == 4 || c == 0 || c == 4) {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "wall", null, null));
                } else if (r == 1 && c == 2) {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "entrance", null, null));
                } else if (r == 3 && c == 2) {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "exit", null, null));
                } else if (r == 2 && c == 2) {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "stall", "A-12", v1));
                } else if (r == 2 && c == 3) {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "stall", "B-05", v2));
                } else {
                    marketSchemaCellRepository.save(new MarketSchemaCell(market, cellId, "empty", null, null));
                }
            }
        }
    }
}
