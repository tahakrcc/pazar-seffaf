import { useState, useEffect, Component } from 'react'
import { createPortal } from 'react-dom'
import Icon from '../Icon.jsx'
import SchemaViewport from '../../features/schema/components/SchemaViewport.jsx'
import SchemaCellInner from '../SchemaCellInner.jsx'
import { getProductIconName } from '../../utils/productIcon.js'
import PazarListesi from '../PazarListesi.jsx'
class SchemaErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee2e2', color: '#b91c1c', zIndex: 9999, position: 'relative' }}>
          <h3>Harita Yüklenirken Hata Oluştu</h3>
          <pre>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: '0.8rem', marginTop: 10 }}>{this.state.error?.stack}</pre>
          <button onClick={this.props.onClose} style={{ marginTop: 10, padding: 8, background: '#b91c1c', color: 'white', border: 'none', borderRadius: 4 }}>Kapat</button>
        </div>
      )
    }
    return this.props.children
  }
}

function StallBottomSheet({
  selectedStall,
  vendor,
  stallPhoto,
  productsList,
  prices,
  selectedFilterProducts,
  onOpenProductCalc,
  userRole,
  onClose,
  onComplaint,
  closing,
  entered,
}) {
  if (!selectedStall || !vendor) return null

  const buildPriceRow = (p, priceData) => {
    if (!priceData) return null
    const median =
      typeof priceData.medianPrice === 'number' ? String(priceData.medianPrice) : String(priceData.medianPrice ?? '')
    return {
      ...p,
      ...priceData,
      medianPrice: median,
      minPrice: Number(priceData.minPrice),
      maxPrice: Number(priceData.maxPrice),
    }
  }

  return (
    <div
      className={`bottom-sheet-overlay md-stall-overlay ${entered && !closing ? 'bottom-sheet-overlay--entered' : ''} ${closing ? 'bottom-sheet-overlay--closing' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <div className="bottom-sheet md-stall-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bs-handle" />
        <div className="md-stall-sheet__head">
          <div>
            <h3 className="md-stall-sheet__title">Tezgah {selectedStall.stallCode}</h3>
            <p className="md-stall-sheet__sub">{vendor.name}</p>
          </div>
        </div>
        {stallPhoto ? (
          <img className="md-stall-sheet__photo" src={stallPhoto} alt={`${vendor.name} tezgah fotoğrafı`} />
        ) : null}
        <h4 className="md-stall-sheet__section-label">Satılan ürünler</h4>
        <div className="md-stall-sheet__grid">
          {vendor.products.map((pid) => {
            const p = productsList.find((prod) => prod.id === pid)
            if (!p) return null
            const priceData = prices.find((pr) => Number(pr.id) === Number(p.id))
            const filtered = selectedFilterProducts.find((sp) => sp.id === p.id)
            return (
              <div
                key={p.id}
                className={`md-stall-product ${filtered ? 'md-stall-product--hit' : ''}`}
              >
                <div className="md-stall-product__main">
                  <span className="product-abbr product-abbr--sm" aria-hidden>
                    <Icon name={getProductIconName(p)} size={20} />
                  </span>
                  <div>
                    <div className="md-stall-product__name">{p.name}</div>
                    {priceData && (
                      <div className="md-stall-product__price">₺{priceData.medianPrice}</div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="md-stall-product__calc"
                  disabled={!priceData || !onOpenProductCalc}
                  onClick={() => {
                    const row = buildPriceRow(p, priceData)
                    if (row) onOpenProductCalc(row)
                  }}
                  aria-label={`${p.name} için fiyat hesapla`}
                >
                  <Icon name="calculate" size={16} aria-hidden />
                  <span>Hesapla</span>
                </button>
              </div>
            )
          })}
        </div>
        {userRole === 'Vatandaş' && (
          <div className="md-stall-sheet__complaint-block">
            <p className="md-stall-sheet__complaint-hint">
              Şikâyet yalnızca seçtiğiniz tezgah için kayda alınır.
            </p>
            <button type="button" className="btn-v2 btn-primary md-stall-sheet__complaint-btn" onClick={() => onComplaint(vendor.id)}>
              Bu tezgaha şikâyet bildir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MarketDetailSchemaModal({
  open,
  marketName,
  selectedFilterProducts,
  is3D,
  onToggle3D,
  onClose,
  layout,
  vendors,
  selectedStall,
  onSelectStall,
  mergedSchemaTools,
  schemaTypeMap,
  getWallLineStyle,
  productsList,
  prices,
  onOpenProductCalc,
  userRole,
  onComplaintFromStall,
  getStallPhoto,
  shopList,
  setShopList,
  city,
  marketsCatalog,
  productsCatalog,
  marketId,
}) {
  const [serviceHint, setServiceHint] = useState(null)
  const [showMobileList, setShowMobileList] = useState(false)
  const [stallSheetClosing, setStallSheetClosing] = useState(false)
  const [stallSheetEntered, setStallSheetEntered] = useState(false)

  useEffect(() => {
    if (!open) setServiceHint(null)
  }, [open])

  useEffect(() => {
    if (selectedStall) setStallSheetClosing(false)
  }, [selectedStall])

  useEffect(() => {
    if (!stallSheetClosing) return undefined
    const t = window.setTimeout(() => {
      onSelectStall(null)
      setStallSheetClosing(false)
    }, 460)
    return () => window.clearTimeout(t)
  }, [stallSheetClosing, onSelectStall])

  useEffect(() => {
    if (!selectedStall) {
      setStallSheetEntered(false)
      return
    }
    setStallSheetEntered(false)
    let id2
    const id = window.requestAnimationFrame(() => {
      id2 = window.requestAnimationFrame(() => setStallSheetEntered(true))
    })
    return () => {
      window.cancelAnimationFrame(id)
      if (id2 != null) window.cancelAnimationFrame(id2)
    }
  }, [selectedStall])

  if (!open) return null

  const title =
    selectedFilterProducts.length > 0
      ? `${selectedFilterProducts.map((p) => p.name).join(', ')} Satanlar`
      : 'Tüm Pazar Haritası'

  const vendor = selectedStall ? vendors.find((v) => v.id === selectedStall.vendorId) : null
  const stallPhoto = vendor ? getStallPhoto(vendor.id) : ''

  return createPortal(
    <div className="schema-fullscreen-overlay md-schema-fs">
      <SchemaErrorBoundary onClose={onClose}>
        <div className="schema-fs-header md-schema-fs__header">
        <div>
          <h2 className="md-schema-fs__title">{title}</h2>
          <p className="md-schema-fs__subtitle">{marketName}</p>
        </div>
        <div className="md-schema-fs__actions">
          <button
            type="button"
            className={`md-schema-fs__pill ${is3D ? 'md-schema-fs__pill--on' : ''}`}
            onClick={() => onToggle3D(!is3D)}
          >
            {is3D ? '2D' : '3D'}
          </button>
          
          <button 
            type="button" 
            className="md-schema-fs__pill md-schema-fs__pill--list-toggle" 
            onClick={() => setShowMobileList(!showMobileList)}
          >
            <Icon name="shopping_cart" size={18} />
            {shopList?.length > 0 ? `(${shopList.length})` : ''}
          </button>

          <button type="button" className="md-schema-fs__close" onClick={onClose} aria-label="Kapat">
            <Icon name="close" size={22} />
          </button>
        </div>
      </div>
      {serviceHint ? (
        <div className="schema-viewer-hint" role="status">
          {serviceHint}
        </div>
      ) : null}
      <div className="md-schema-fs__content-row">
        <div className="schema-fs-body md-schema-fs__body">
          {layout ? (
            <SchemaViewport
              layout={layout.canvas || layout}
              is3D={is3D}
              vendors={vendors}
              selectedFilterProducts={selectedFilterProducts}
              selectedStall={selectedStall}
              onSelectStall={onSelectStall}
              mergedSchemaTools={mergedSchemaTools}
              onTartiHint={() => {
                setServiceHint('Tartı noktası — tartım için buraya başvurun.')
                window.setTimeout(() => setServiceHint(null), 3200)
              }}
              onEmptyStallHint={() => {
                setServiceHint('Bu tezgahta kayıtlı esnaf bulunmuyor.')
                window.setTimeout(() => setServiceHint(null), 2800)
              }}
            />
          ) : (
            <div className="schema-fs-loading">Yükleniyor...</div>
          )}
        </div>

        <div className={`schema-fs-sidebar ${showMobileList ? 'show-mobile' : ''}`}>
          <PazarListesi
            isOpen={true}
            onToggle={() => setShowMobileList(false)}
            city={city}
            selectedItems={shopList || []}
            setSelectedItems={setShopList || (() => {})}
            catalogMarkets={marketsCatalog}
            catalogProducts={productsCatalog}
            miniMode={true}
            miniMarketId={marketId}
            onSelectStall={onSelectStall}
          />
        </div>
      </div>
      <StallBottomSheet
        selectedStall={selectedStall}
        vendor={vendor}
        stallPhoto={stallPhoto}
        productsList={productsList}
        prices={prices}
        selectedFilterProducts={selectedFilterProducts}
        onOpenProductCalc={onOpenProductCalc}
        userRole={userRole}
        closing={stallSheetClosing}
        entered={stallSheetEntered}
        onClose={() => setStallSheetClosing(true)}
        onComplaint={onComplaintFromStall}
      />
      </SchemaErrorBoundary>
    </div>,
    document.body
  )
}
