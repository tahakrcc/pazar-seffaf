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
}) {
  return (
    <div className="pd-panel">
      <header className="pd-head">
        <span className="pd-eyebrow">Fiyatlar</span>
        <h3 className="pd-title">Güncel ortalama</h3>
        <p className="pd-lead">Ürüne dokunun: miktar hesabı, 7 günlük trend ve listeye ekleme.</p>
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
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
                    className="product-list-item product-list-item--price pd-price-card"
              onClick={() => onOpenProduct(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onOpenProduct(p)
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
