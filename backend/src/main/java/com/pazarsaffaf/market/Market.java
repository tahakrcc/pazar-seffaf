package com.pazarsaffaf.market;

import jakarta.persistence.Column;
import jakarta.persistence.Basic;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Lob;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "market")
@Getter
@Setter
@NoArgsConstructor
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "municipality_id", nullable = false)
    private Municipality municipality;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String district;

    private double latitude;

    private double longitude;

    @Column(name = "opening_days", nullable = false, length = 128)
    private String openingDays;

    @Column(nullable = false)
    private String hours;

    @Column(name = "vendor_count", nullable = false)
    private int vendorCount;

    private String type;

    private String address;

    private String image;

    /** Serbest tuval şema JSON (genişlik/yükseklik ve çizgi+kutu öğeleri); null ise ızgara şema kullanılır. */
    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "schema_canvas_json")
    private String schemaCanvasJson;
}
