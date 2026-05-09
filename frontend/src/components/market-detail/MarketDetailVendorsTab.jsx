import { useState } from 'react'
import Icon from '../Icon.jsx'
import { getProductIconName } from '../../utils/productIcon.js'

export default function MarketDetailVendorsTab({
  vendors,
  userRole,
  onComplaint,
  getStallPhoto,
  vendorInitials,
  productsList,
  prices,
  onGoToStall,
}) {
  const [expandedVendorId, setExpandedVendorId] = useState(null)

  const handleToggle = (vendorId) => {
    if (expandedVendorId === vendorId) setExpandedVendorId(null)
    else setExpandedVendorId(vendorId)
  }

  return (
    <section className="vendor-tab pd-vendors" aria-labelledby="vendor-tab-heading">
      <header className="vendor-tab__intro pd-vendors__intro">
        <span className="pd-eyebrow">Esnaflar</span>
        <h3 id="vendor-tab-heading">Kayıtlı esnaflar</h3>
        <p>
          Tezgah kodu ve ürün bilgisi resmi kayıtlardan gelir. Şikâyetler yalnızca seçtiğiniz tezgah için kayda alınır.
        </p>
      </header>
      {vendors.length === 0 ? (
        <p className="vendor-tab__empty md-empty">Bu pazar için kayıtlı esnaf bulunmuyor.</p>
      ) : (
        <ul className="vendor-list md-vendor-list">
          {vendors.map((v) => {
            const stallPhoto = getStallPhoto(v.id)
            const initials = vendorInitials(v.name)
            const isExpanded = expandedVendorId === v.id
            const n = v.products?.length ?? 0

            return (
              <li key={v.id} className={`vendor-card md-vendor-card ${isExpanded ? 'expanded' : ''}`}>
                <div 
                  className="vendor-card__clickable-area"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggle(v.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleToggle(v.id)
                    }
                  }}
                >
                  <div className="vendor-card__top">
                    <div className="vendor-card__identity">
                      <div className="vendor-card__avatar" aria-hidden>
                        {initials}
                      </div>
                      <div className="vendor-card__info">
                        <div className="vendor-card__name">{v.name}</div>
                        <div className="vendor-card__stall">
                          <Icon name="storefront" size={16} />
                          Tezgah {v.stall}
                        </div>
                      </div>
                    </div>
                  </div>
                  {stallPhoto ? (
                    <img className="vendor-card__photo" src={stallPhoto} alt={`${v.name} tezgah fotoğrafı`} />
                  ) : null}
                  <div className="vendor-card__footer">
                    <span className="vendor-card__products">
                      <Icon name="inventory_2" size={16} />
                      {n} ürün satıyor
                    </span>
                    <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={24} className="expand-icon" />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="vendor-card__expanded-content">
                    <div className="vendor-card__actions">
                      <button type="button" className="btn-goto-stall" onClick={() => onGoToStall(v.id)}>
                        Haritada Göster <Icon name="arrow_forward" size={16} />
                      </button>
                      {userRole === 'Vatandaş' && (
                        <button type="button" className="btn-pl-secondary" onClick={() => onComplaint(v.id)}>
                          <Icon name="flag" size={16} /> Şikâyet Et
                        </button>
                      )}
                    </div>
                    
                    <div className="vendor-products-list">
                      <h4 className="vpl-title">Sattığı Ürünler</h4>
                      {n > 0 ? (
                        <ul className="vpl-items">
                          {v.products.map(pid => {
                            const p = productsList?.find(prod => prod.id === pid)
                            if (!p) return null
                            // Generate mock price
                            const basePriceData = prices?.find(pr => Number(pr.id) === Number(p.id))
                            const basePrice = basePriceData ? Number(basePriceData.medianPrice) : 20
                            const vPrice = (basePrice + ((v.id % 3) - 1)).toFixed(1)
                            
                            return (
                              <li key={pid} className="vpl-item">
                                <div className="vpl-item-info">
                                  <span className="vpl-item-icon" aria-hidden>
                                    <Icon name={getProductIconName(p)} size={18} />
                                  </span>
                                  <span className="vpl-item-name">{p.name}</span>
                                </div>
                                <div className="vpl-item-price">₺{vPrice} <span className="vpl-unit">/ {p.unit}</span></div>
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <p className="no-vendor-msg">Bilgi yok</p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
