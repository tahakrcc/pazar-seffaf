import { useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Icon from '../Icon.jsx'
import SchemaCanvasViewer from '../SchemaCanvasViewer.jsx'
import SchemaCellInner from '../SchemaCellInner.jsx'
import { getProductIconName } from '../../utils/productIcon.js'

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
    <div className="bottom-sheet-overlay md-stall-overlay" onClick={onClose}>
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
  displaySchema,
  canvas,
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
}) {
  const [serviceHint, setServiceHint] = useState(null)

  useEffect(() => {
    if (!open) setServiceHint(null)
  }, [open])

  if (!open) return null

  const title =
    selectedFilterProducts.length > 0
      ? `${selectedFilterProducts.map((p) => p.name).join(', ')} Satanlar`
      : 'Tüm Pazar Haritası'

  const vendor = selectedStall ? vendors.find((v) => v.id === selectedStall.vendorId) : null
  const stallPhoto = vendor ? getStallPhoto(vendor.id) : ''

  return (
    <div className="schema-fullscreen-overlay md-schema-fs">
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
      <div className="schema-fs-body md-schema-fs__body">
        <TransformWrapper initialScale={1} minScale={0.4} maxScale={4} centerOnInit wheel={{ step: 0.04 }} pinch={{ step: 3 }}>
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ padding: '40px' }}>
            {canvas != null ? (
              <SchemaCanvasViewer
                canvas={canvas}
                vendors={vendors}
                mergedSchemaTools={mergedSchemaTools}
                is3D={is3D}
                selectedFilterProducts={selectedFilterProducts}
                selectedStall={selectedStall}
                onSelectStall={onSelectStall}
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
            <div
              className={`schema-grid schema-grid--viewer ${is3D ? 'schema-grid-3d' : ''}`}
              style={{ gridTemplateColumns: `repeat(${displaySchema.cols}, 1fr)` }}
            >
              {displaySchema.cells.map((cell) => {
                const cellVendor = cell.vendorId ? vendors.find((v) => v.id === cell.vendorId) : null
                const hasProduct =
                  selectedFilterProducts.length > 0 &&
                  cellVendor &&
                  cellVendor.products.some((pid) => selectedFilterProducts.find((sp) => sp.id === pid))
                const isDimmed = selectedFilterProducts.length > 0 && cell.type === 'stall' && !hasProduct
                const isActive = selectedStall && selectedStall.id === cell.id
                const typeClass = String(cell.type).replace(/[^a-zA-Z0-9_-]/g, '_')
                const wallStyle =
                  cell.type === 'wall' ? getWallLineStyle(cell.id, schemaTypeMap) : undefined
                return (
                  <div
                    key={cell.id}
                    className={`grid-cell cell-${typeClass} ${cellVendor ? 'has-vendor' : ''} ${isDimmed ? 'dimmed' : ''} ${isActive ? 'active' : ''}`}
                    style={wallStyle}
                    onClick={() => {
                      if (cell.type === 'tarti') {
                        setServiceHint('Tartı noktası — tartım için buraya başvurun.')
                        window.setTimeout(() => setServiceHint(null), 3200)
                        return
                      }
                      if (cell.type === 'stall' && cellVendor) {
                        onSelectStall(isActive ? null : cell)
                        return
                      }
                      if (cell.type === 'stall' && !cellVendor) {
                        setServiceHint('Bu tezgahta kayıtlı esnaf bulunmuyor.')
                        window.setTimeout(() => setServiceHint(null), 2800)
                      }
                    }}
                  >
                    <SchemaCellInner
                      cell={cell}
                      vendor={cellVendor}
                      adminMode={false}
                      mergedTools={mergedSchemaTools}
                      is3D={is3D}
                      iconSize={20}
                    />
                    {cell.type === 'stall' &&
                      selectedFilterProducts.length > 0 &&
                      cellVendor &&
                      cellVendor.products.some((pid) => selectedFilterProducts.find((sp) => sp.id === pid)) && (
                        <div className="here-pin-3d">
                          <div className="pin-head">
                            <Icon name="place" size={12} /> Burada
                          </div>
                          <div className="pin-stick" />
                        </div>
                      )}
                  </div>
                )
              })}
            </div>
            )}
          </TransformComponent>
        </TransformWrapper>
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
        onClose={() => onSelectStall(null)}
        onComplaint={onComplaintFromStall}
      />
    </div>
  )
}
