import Icon from '../Icon.jsx'
import { getProductIconName } from '../../utils/productIcon.js'

export default function MarketDetailSchemaTab({
  productSearch,
  onProductSearch,
  categories,
  selectedCategory,
  onCategory,
  selectedFilterProducts,
  onToggleProduct,
  searchedPrices,
  onOpenMap,
}) {
  return (
    <div className="pd-panel pd-panel--lead">
      <header className="pd-head">
        <span className="pd-eyebrow">Yerleşim</span>
        <h3 className="pd-title">Ürün seçin</h3>
        <p className="pd-lead">Listeden ürün işaretleyin; haritada ilgili tezgahlar vurgulanır.</p>
      </header>
      <label className="sr-only" htmlFor="schema-product-search">
        Ürün ara
      </label>
      <div className="pd-field">
        <Icon name="search" size={20} className="pd-field__icon" aria-hidden />
        <input
          id="schema-product-search"
          type="search"
          className="search-input pd-field__input"
          placeholder="Örn: domates, biber…"
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
      {selectedFilterProducts.length > 0 && (
        <div className="filter-chips-container filter-chips-container--tight md-filter-chips">
          {selectedFilterProducts.map((p) => (
            <div key={p.id} className="filter-chip active">
              {p.name}
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleProduct(p)
                }}
                aria-label={`${p.name} kaldır`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="pd-cta">
        <button type="button" className="btn-v2 btn-primary pd-btn-map" onClick={onOpenMap}>
          <Icon name="map" size={20} />
          Seçilenleri haritada göster
        </button>
      </div>
      <p className="pd-section-label">Ürün seç · {selectedFilterProducts.length} seçili</p>
      <div className="detail-product-list pd-product-list">
        {searchedPrices.map((p) => {
          const isSelected = selectedFilterProducts.find((sp) => sp.id === p.id)
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              className={`product-list-item pd-product-row ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleProduct(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleProduct(p)
                }
              }}
            >
              <div className="p-info">
                <span className={`product-abbr ${isSelected ? 'is-on' : ''}`} aria-hidden>
                  <Icon name={getProductIconName(p)} size={22} />
                </span>
                <div className="p-info-text">
                  <div className="p-name">{p.name}</div>
                </div>
              </div>
              <span className={`product-toggle-btn ${isSelected ? 'is-on' : ''}`} aria-hidden>
                {isSelected ? '✓' : '+'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
