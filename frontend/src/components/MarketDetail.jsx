import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { markets as mockMarkets, DAYS_TR, getMarketPrices, vendors, products as mockProducts, getMarketSchema, getPriceTrend } from '../data/markets'
import { kernekMarketCanvas } from '../data/kernekCanvasSchema.js'
import { parseMarketSchemaPayload } from '../utils/schemaCanvas.js'
import { submitComplaint } from '../api/pazarApi'
import { getDetailPrices, getMarketLayoutResponse, submitComplaintOffline } from '../data/offlineDataset.js'
import { getMapsLink, isMarketOpenToday } from '../utils/helpers'
import { buildCellTypeMap, getWallLineStyle } from '../utils/schemaGrid.js'
import { getMergedSchemaTools } from '../config/schemaCellTypes.js'
import MarketDetailHero from './market-detail/MarketDetailHero.jsx'
import MarketDetailTabs from './market-detail/MarketDetailTabs.jsx'
import MarketDetailSchemaTab from './market-detail/MarketDetailSchemaTab.jsx'
import MarketDetailPricesTab from './market-detail/MarketDetailPricesTab.jsx'
import MarketDetailVendorsTab from './market-detail/MarketDetailVendorsTab.jsx'
import MarketDetailRoleTab from './market-detail/MarketDetailRoleTab.jsx'
import MarketDetailCalcModal from './market-detail/MarketDetailCalcModal.jsx'
import MarketDetailSchemaModal from './market-detail/MarketDetailSchemaModal.jsx'
import MarketDetailComplaintModal from './market-detail/MarketDetailComplaintModal.jsx'
import { PRODUCT_CATEGORIES } from './market-detail/constants.js'
import { isValidPhone, getStallPhoto, vendorInitials } from './market-detail/utils.js'

import PazarListesi from './PazarListesi.jsx'

export default function MarketDetail({ user, addToShopList, shopList, setShopList, city, marketsCatalog, productsCatalog, daysTrArr }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const schemaHighlightRef = useRef(null)
  const marketsList = marketsCatalog && marketsCatalog.length ? marketsCatalog : mockMarkets
  const productsList = productsCatalog && productsCatalog.length ? productsCatalog : mockProducts
  const dayLabels = daysTrArr && daysTrArr.length ? daysTrArr : DAYS_TR
  const market = marketsList.find((m) => m.id === Number(id))
  const [prices, setPrices] = useState([])
  const [layout, setLayout] = useState(null)

  useEffect(() => {
    if (!market) return
    const pr = getDetailPrices(market.id)
    setPrices(pr)
    const layoutRes = getMarketLayoutResponse(market.id)
    const parsedLayout = parseMarketSchemaPayload(layoutRes?.layout)
    setLayout(parsedLayout?.canvas ? parsedLayout : { canvas: kernekMarketCanvas })
  }, [market])

  const [tab, setTab] = useState('schema')
  const [selectedFilterProducts, setSelectedFilterProducts] = useState([])
  const [showSchemaModal, setShowSchemaModal] = useState(false)
  const [selectedStall, setSelectedStall] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [complaintText, setComplaintText] = useState('')
  const [complaintPhone, setComplaintPhone] = useState('')
  const [complaintPhoto, setComplaintPhoto] = useState(null)
  const [complaintVendorId, setComplaintVendorId] = useState(null)
  const [is3D, setIs3D] = useState(false)
  const [calcQty, setCalcQty] = useState(1)
  const [showCalcFor, setShowCalcFor] = useState(null)

  useEffect(() => {
    if (!market) return
    const fromState = location.state?.schemaHighlightProductIds
    const q = searchParams.get('highlightProducts')
    const fromQuery = q ? q.split(',').map((x) => Number(x)).filter((n) => Number.isFinite(n)) : null
    const ids = Array.isArray(fromState) && fromState.length ? fromState : fromQuery
    if (!ids?.length) return
    const key = `${market.id}:${ids.join(',')}`
    if (schemaHighlightRef.current === key) return
    const source = prices.length ? prices : getMarketPrices(market.id)
    if (!source.length) return
    const idSet = new Set(ids.map(Number))
    const toSelect = source.filter((p) => idSet.has(p.id))
    if (toSelect.length) {
      setSelectedFilterProducts(toSelect)
      setTab('schema')
      setShowSchemaModal(true)
      schemaHighlightRef.current = key
    }
  }, [market, location.state, searchParams, prices])

  useEffect(() => {
    setComplaintVendorId(null)
  }, [id])

  const displaySchema = useMemo(() => {
    if (!market) return { cells: [], cols: 5, rows: 5 }
    return getMarketSchema(market.id)
  }, [market])

  const mergedSchemaTools = useMemo(() => getMergedSchemaTools(), [])
  const schemaTypeMap = useMemo(() => buildCellTypeMap(displaySchema.cells), [displaySchema.cells])

  const marketVendors = useMemo(
    () => (!market ? [] : vendors.filter((v) => v.marketId === market.id)),
    [market]
  )

  if (!market) {
    return (
      <div className="pd-page detail-page">
        <p className="pd-not-found">Pazar bulunamadı</p>
      </div>
    )
  }

  const displayPrices = prices.length ? prices : getMarketPrices(market.id)
  const isOpen = isMarketOpenToday(market)
  const dayNames = market.days.map((d) => dayLabels[d]).join(', ')
  const role = user?.role

  const tabs = ['schema', 'products', 'vendors']
  if (role === 'Esnaf') tabs.push('myprices')
  if (role === 'Zabıta') tabs.push('inspection')
  if (role === 'Yönetici') tabs.push('analytics')

  const tabLabels = {
    schema: 'Yerleşim',
    products: 'Fiyatlar',
    vendors: 'Esnaflar',
    myprices: 'Fiyatlarım',
    inspection: 'Denetim',
    analytics: 'Analiz',
  }
  const tabIcons = {
    schema: 'map',
    products: 'payments',
    vendors: 'groups',
    myprices: 'edit_note',
    inspection: 'policy',
    analytics: 'monitoring',
  }

  const handleOpenSchema = () => {
    setSelectedStall(null)
    setShowSchemaModal(true)
  }

  const toggleProductFilter = (product) => {
    if (selectedFilterProducts.find((p) => p.id === product.id)) {
      setSelectedFilterProducts(selectedFilterProducts.filter((p) => p.id !== product.id))
    } else {
      setSelectedFilterProducts([...selectedFilterProducts, product])
    }
  }

  const searchedPrices = displayPrices.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
    const matchCategory = selectedCategory === 'Tümü' || p.category === selectedCategory
    return matchSearch && matchCategory
  })

  const findCheapest = (productId) => {
    const mv = vendors.filter((v) => v.marketId === market.id && v.products.includes(productId))
    if (mv.length === 0) return null
    return mv[0]
  }

  const openProductCalc = (p) => {
    setShowCalcFor(p)
    setCalcQty(1)
  }

  const complaintVendor = complaintVendorId != null ? vendors.find((x) => x.id === complaintVendorId) : null

  const handleComplaintSubmit = async () => {
    const cv = complaintVendor
    if (!cv || cv.marketId !== market.id) return
    try {
      if (!complaintPhone.trim()) {
        alert('Telefon numarası zorunludur.')
        return
      }
      if (!isValidPhone(complaintPhone)) {
        alert('Geçerli bir telefon numarası girin (en az 10 hane).')
        return
      }
      let latitude
      let longitude
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        )
        latitude = pos.coords.latitude
        longitude = pos.coords.longitude
      } catch {
        /* konum isteğe bağlı */
      }
      try {
        await submitComplaint({
          marketId: market.id,
          vendorId: cv.id,
          description: complaintText,
          latitude,
          longitude,
          reporterPhone: complaintPhone.trim(),
          citizenSessionId: localStorage.getItem('pazar_citizen_session') || undefined,
          photoFile: complaintPhoto || undefined,
        })
      } catch {
        await submitComplaintOffline()
      }
      if (!localStorage.getItem('pazar_citizen_session')) {
        try {
          localStorage.setItem('pazar_citizen_session', `anon-${Date.now()}`)
        } catch {
          /* ignore */
        }
      }
      alert('Şikâyetiniz iletildi.')
      setComplaintText('')
      setComplaintPhone('')
      setComplaintPhoto(null)
      setComplaintVendorId(null)
    } catch {
      alert('Gönderilemedi. Bağlantınızı kontrol edin.')
    }
  }

  return (
    <div className="market-detail-layout">
      <div className="pd-page detail-page market-detail-content">
      <aside className="pd-sidebar detail-sidebar">
        <MarketDetailHero
          marketName={market.name}
          isOpen={isOpen}
          district={market.district}
          dayNames={dayNames}
          vendorCount={market.vendorCount}
          onBack={() => navigate(-1)}
          mapsHref={getMapsLink(market.lat, market.lng)}
        />
        <MarketDetailTabs tabs={tabs} activeTab={tab} onTabChange={setTab} tabLabels={tabLabels} tabIcons={tabIcons} />
      </aside>

      <main className="pd-scroll detail-main-content">
        {tab === 'schema' && (
          <MarketDetailSchemaTab
            productSearch={productSearch}
            onProductSearch={setProductSearch}
            categories={PRODUCT_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategory={setSelectedCategory}
            selectedFilterProducts={selectedFilterProducts}
            onToggleProduct={toggleProductFilter}
            searchedPrices={searchedPrices}
            onOpenMap={handleOpenSchema}
          />
        )}

        {tab === 'products' && (
          <MarketDetailPricesTab
            productSearch={productSearch}
            onProductSearch={setProductSearch}
            categories={PRODUCT_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategory={setSelectedCategory}
            searchedPrices={searchedPrices}
            getPriceTrend={getPriceTrend}
            marketId={market.id}
            onOpenProduct={openProductCalc}
            vendors={marketVendors}
            onGoToStall={(vendorId) => {
              setSelectedStall({ vendorId }) // Setting just vendorId. The schema modal uses selectedStall.vendorId
              setShowSchemaModal(true)
            }}
          />
        )}

        {tab === 'vendors' && (
          <MarketDetailVendorsTab
            vendors={marketVendors}
            userRole={user?.role}
            onComplaint={setComplaintVendorId}
            getStallPhoto={getStallPhoto}
            vendorInitials={vendorInitials}
            productsList={productsList}
            prices={displayPrices}
            onGoToStall={(vendorId) => {
              setSelectedStall({ vendorId })
              setShowSchemaModal(true)
            }}
          />
        )}

        {tab === 'myprices' && <MarketDetailRoleTab variant="myprices" />}
        {tab === 'inspection' && <MarketDetailRoleTab variant="inspection" />}
        {tab === 'analytics' && <MarketDetailRoleTab variant="analytics" />}
      </main>

      <MarketDetailSchemaModal
        open={showSchemaModal}
        marketName={market.name}
        selectedFilterProducts={selectedFilterProducts}
        is3D={is3D}
        onToggle3D={setIs3D}
        onClose={() => setShowSchemaModal(false)}
        layout={layout}
        vendors={vendors}
        selectedStall={selectedStall}
        onSelectStall={setSelectedStall}
        mergedSchemaTools={mergedSchemaTools}
        schemaTypeMap={schemaTypeMap}
        getWallLineStyle={getWallLineStyle}
        productsList={productsList}
        prices={prices.length ? prices : displayPrices}
        onOpenProductCalc={openProductCalc}
        userRole={user?.role}
        onComplaintFromStall={(vendorId) => {
          setComplaintVendorId(vendorId)
          setSelectedStall(null)
        }}
        getStallPhoto={getStallPhoto}
        shopList={shopList}
        setShopList={setShopList}
        city={city}
        marketsCatalog={marketsCatalog}
        productsCatalog={productsCatalog}
        marketId={market.id}
      />

      {showCalcFor && (
        <MarketDetailCalcModal
          product={showCalcFor}
          calcQty={calcQty}
          onCalcQty={setCalcQty}
          trend={getPriceTrend(showCalcFor.id, market.id)}
          recommendedVendor={findCheapest(showCalcFor.id)}
          onAddToList={() => {
            addToShopList && addToShopList(showCalcFor)
            setShowCalcFor(null)
          }}
          onClose={() => setShowCalcFor(null)}
        />
      )}

      {complaintVendor && (
        <MarketDetailComplaintModal
          vendor={complaintVendor}
          complaintPhone={complaintPhone}
          complaintText={complaintText}
          onPhone={setComplaintPhone}
          onText={setComplaintText}
          onPhoto={setComplaintPhoto}
          onSubmit={handleComplaintSubmit}
          onCancel={() => setComplaintVendorId(null)}
        />
      )}
    </div>
    
    <div className="market-detail-sidebar-right">
      <PazarListesi
        isOpen={true}
        onToggle={() => {}}
        city={city}
        selectedItems={shopList || []}
        setSelectedItems={setShopList || (() => {})}
        catalogMarkets={marketsCatalog}
        catalogProducts={productsCatalog}
        miniMode={true}
        miniMarketId={market.id}
      />
    </div>

    </div>
  )
}
