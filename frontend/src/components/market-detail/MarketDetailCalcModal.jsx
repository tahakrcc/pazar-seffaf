import Icon from '../Icon.jsx'

export default function MarketDetailCalcModal({
  product,
  calcQty,
  onCalcQty,
  trend,
  recommendedVendor,
  onAddToList,
  onClose,
}) {
  if (!product) return null
  const maxV = Math.max(...trend.days, 1)

  return (
    <div className="product-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="product-modal product-modal--calc"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calc-product-title"
      >
        <div className="product-modal__handle" aria-hidden />
        <div className="calc-header">
          <div className="calc-icon calc-icon--symbol">
            <Icon name="scale" size={28} />
          </div>
          <div>
            <h3 id="calc-product-title" className="product-modal__title">
              {product.name}
            </h3>
            <div className="product-modal__subtitle">
              Birim fiyat: ₺{product.medianPrice} / {product.unit}
            </div>
          </div>
        </div>
        <div className="product-modal__trend">
          <div className="product-modal__trend-label">Son 7 Gün Fiyat Trendi</div>
          <div className="sparkline sparkline--modal">
            {trend.days.map((v, i) => (
              <div
                key={i}
                className={`sparkline-bar ${i === 6 ? 'sparkline-bar--accent' : 'sparkline-bar--muted'}`}
                style={{ height: `${(v / maxV) * 100}%` }}
              />
            ))}
          </div>
          <div className="product-modal__trend-meta">
            <span>7 gün önce</span>
            <span className={`trend-badge ${trend.direction}`}>
              {trend.direction === 'up' ? '↑ Arttı' : '↓ Düştü'} %{trend.change}
            </span>
            <span>Bugün</span>
          </div>
        </div>
        <div className="product-modal__field-label">Miktar Girin ({product.unit})</div>
        <div className="calc-input-row product-modal__chips">
          {[0.5, 1, 2, 3, 5].map((q) => (
            <button
              key={q}
              type="button"
              className={`product-modal__chip ${calcQty === q ? 'product-modal__chip--active' : ''}`}
              onClick={() => onCalcQty(q)}
            >
              {q}
            </button>
          ))}
        </div>
        <input
          type="number"
          className="calc-input"
          value={calcQty}
          onChange={(e) => onCalcQty(parseFloat(e.target.value) || 0)}
          step="0.5"
          min="0"
        />
        <div className="calc-result calc-result--mt">
          {calcQty} {product.unit} × ₺{product.medianPrice} ={' '}
          <strong>₺{(calcQty * parseFloat(product.medianPrice)).toFixed(2)}</strong>
        </div>
        {recommendedVendor && (
          <div className="calc-cheapest">
            Önerilen satıcı: <strong>{recommendedVendor.name}</strong>
          </div>
        )}
        <div className="product-modal__actions">
          <button type="button" className="product-modal__btn product-modal__btn--primary" onClick={onAddToList}>
            <Icon name="add_shopping_cart" size={20} />
            Listeye ekle
          </button>
          <button type="button" className="product-modal__btn product-modal__btn--secondary" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}
