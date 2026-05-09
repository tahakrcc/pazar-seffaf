import { useState } from 'react'
import Icon from '../Icon.jsx'
import { getProductIconName } from '../../utils/productIcon.js'

export default function MarketDetailPricesTab({
  productSearch,
  onProductSearch,
  categories,
  selectedCategory,
  onCategory,
  searchedPrices,
  getPriceTrend,
  marketId,
  onOpenProduct,
  vendors,
  onGoToStall,
}) {
  const [expandedProductId, setExpandedProductId] = useState(null)

  const handleToggle = (p) => {
    if (expandedProductId === p.id) setExpandedProductId(null)
    else setExpandedProductId(p.id)
  }
  return (
    <div className="pd-panel">
      <header className="pd-head">
        <span className="pd-eyebrow">Fiyatlar</span>
        <h3 className="pd-title">Güncel Fiyatlar & Satıcılar</h3>
        <p className="pd-lead">Ürüne dokunun: Satan esnafları ve detaylı fiyatları görün.</p>
      </header>
      <label className="sr-only" htmlFor="products-search">
        Ürün ara
      </label>
      <div className="pd-field">
        <Icon name="search" size={20} className="pd-field__icon" aria-hidden />
        <input
          id="products-search"
          type="search"
          className="search-input pd-field__input"
          placeholder="Ürün ara…"
          value={productSearch}
          onChange={(e) => onProductSearch(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="pd-chip-track" role="toolbar" aria-label="Kategori">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`pd-chip ${selectedCategory === cat ? 'pd-chip--on' : ''}`}
            onClick={() => onCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="detail-product-list detail-product-list--prices pd-product-list pd-product-list--prices">
        {searchedPrices.map((p) => {
          const trend = getPriceTrend(p.id, marketId)
          const maxT = Math.max(...trend.days, 1)
          const isExpanded = expandedProductId === p.id
          const productVendors = vendors ? vendors.filter(v => v.products?.includes(p.id)) : []

          return (
            <div key={p.id} className="product-list-item-wrapper">
              <div
                role="button"
                tabIndex={0}
                className={`product-list-item product-list-item--price pd-price-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleToggle(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleToggle(p)
                  }
                }}
              >
                <div className="p-info p-info--grow">
                  <span className="product-abbr" aria-hidden>
                    <Icon name={getProductIconName(p)} size={22} />
                  </span>
                  <div className="p-info-text">
                    <div className="p-name">{p.name}</div>
                    <div className="p-unit">/ {p.unit}</div>
                  </div>
                </div>
                <div className="product-price-row">
                  <div className="sparkline sparkline--compact" aria-hidden>
                    {trend.days.map((v, i) => (
                      <div
                        key={i}
                        className={`sparkline-bar ${i === 6 ? 'sparkline-bar--accent' : 'sparkline-bar--muted'}`}
                        style={{ height: `${(v / maxT) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="product-price-block">
                    <div className="product-price-block__value">₺{p.medianPrice}</div>
                    <span className={`trend-badge ${trend.direction}`}>
                      {trend.direction === 'up' ? '↑' : '↓'} %{trend.change}
                    </span>
                  </div>
                  <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={24} className="expand-icon" />
                </div>
              </div>
              
              {isExpanded && (
                <div className="product-vendors-list">
                  <div className="product-vendors-header">
                    <h4>Bu ürünü satan esnaflar</h4>
                    <button type="button" className="btn-calc-small" onClick={() => onOpenProduct(p)}>
                      <Icon name="calculate" size={16} /> Miktar Hesapla
                    </button>
                  </div>
                  {productVendors.length > 0 ? (
                    <ul className="vendor-price-list">
                      {productVendors.map((v) => {
                        const vPrice = (Number(p.medianPrice) + ((v.id % 3) - 1)).toFixed(1)
                        return (
                          <li key={v.id} className="vendor-price-row">
                            <div className="vendor-info">
                              <div className="v-name">{v.name}</div>
                              <div className="v-stall">Tezgah: {v.stall}</div>
                            </div>
                            <div className="vendor-price">₺{vPrice}</div>
                            <button type="button" className="btn-goto-stall" onClick={() => onGoToStall(v.id)}>
                              Tezgaha Git <Icon name="arrow_forward" size={16} />
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="no-vendor-msg">Şu an bu ürünü satan esnaf bulunamadı.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
