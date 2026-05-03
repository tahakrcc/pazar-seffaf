import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { getPanelPathForRole } from './utils/rolePaths.js'
import RequireRole from './components/RequireRole.jsx'
import VatandasPanel from './components/VatandasPanel.jsx'
import { markets as mockMarkets, DAYS_TR as DAYS_TR_FALLBACK, products as mockProducts } from './data/markets'
import { fetchMarkets, fetchProducts, fetchWeather, fetchDaysTr } from './api/pazarApi'
import { getUserLocation, calculateDistance, isMarketOpenToday, findClosestCity } from './utils/helpers'
import MapView from './components/MapView'
import LoginPage from './components/LoginPage'
import MarketDetail from './components/MarketDetail'
import Dashboard from './components/Dashboard'
import EsnafPanel from './components/EsnafPanel'
import ZabitaPanel from './components/ZabitaPanel'
import ChiefPanel from './components/ChiefPanel'
import PazarListesi from './components/PazarListesi'
import Icon from './components/Icon'
import AppShell from './components/layout/AppShell.jsx'

const CITIES = ['Malatya', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep', 'Konya']

const SHOP_KEY = 'pazar_shop_list_v1'

function loadShopList() {
  try {
    const raw = localStorage.getItem(SHOP_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function weatherIconName(icon) {
  if (!icon) return 'wb_sunny'
  const m = { sun: 'wb_sunny', cloud: 'cloud', 'cloud-sun': 'partly_cloudy_day' }
  return m[icon] || 'wb_sunny'
}

export default function App() {
  const [city, setCity] = useState('Malatya')
  const [hasSelectedCity, setHasSelectedCity] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [userLoc, setUserLoc] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [marketSearch, setMarketSearch] = useState('')
  const [user, setUser] = useState({ name: 'Vatandaş', role: 'Vatandaş' })
  const [darkMode, setDarkMode] = useState(false)
  const [shopList, setShopList] = useState(loadShopList)
  const [showSmartList, setShowSmartList] = useState(false)
  const [marketsCatalog, setMarketsCatalog] = useState(mockMarkets)
  const [productsCatalog, setProductsCatalog] = useState(mockProducts)
  const [weatherInfo, setWeatherInfo] = useState({ temp: 22, desc: 'Güneşli', icon: 'wb_sunny', tip: '' })
  const [daysTr, setDaysTr] = useState(DAYS_TR_FALLBACK)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200)
    getUserLocation().then(loc => {
      setUserLoc(loc)
      if (!city) setCity(findClosestCity(loc.lat, loc.lng))
    }).catch(() => {})
    return () => clearTimeout(timer)
  }, [city])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    try { localStorage.setItem(SHOP_KEY, JSON.stringify(shopList)) } catch { /* ignore */ }
  }, [shopList])

  useEffect(() => {
    let cancel = false
    fetchDaysTr().then((d) => { if (!cancel && Array.isArray(d) && d.length) setDaysTr(d) }).catch(() => {})
    return () => { cancel = true }
  }, [])

  useEffect(() => {
    if (!hasSelectedCity) return
    let cancel = false
    ;(async () => {
      try {
        const [m, p, w] = await Promise.all([fetchMarkets(city), fetchProducts(), fetchWeather(city)])
        if (cancel) return
        setMarketsCatalog(Array.isArray(m) && m.length ? m : mockMarkets.filter((x) => x.city === city))
        setProductsCatalog(Array.isArray(p) && p.length ? p : mockProducts)
        setWeatherInfo({
          temp: w.temp,
          desc: w.desc,
          icon: weatherIconName(w.icon),
          tip: w.tip || '',
        })
      } catch {
        if (!cancel) {
          setMarketsCatalog(mockMarkets.filter((x) => x.city === city))
          setProductsCatalog(mockProducts)
        }
      }
    })()
    return () => { cancel = true }
  }, [city, hasSelectedCity])

  const addToShopList = (product, subtype = null) => {
    const key = `${product.id}-${subtype || 'default'}`
    if (shopList.find(i => i.key === key)) return
    setShopList([...shopList, {
      key,
      productId: product.id,
      name: subtype || product.name,
      parentName: product.name,
      abbr: product.abbr,
      unit: product.unit,
      qty: 1,
      checked: false
    }])
    setShowSmartList(true)
  }

  const filtered = marketsCatalog.filter(m => m.city === city)
  const withDistance = filtered.map(m => ({
    ...m,
    distance: userLoc ? calculateDistance(userLoc.lat, userLoc.lng, m.lat, m.lng) : null,
    isOpen: isMarketOpenToday(m)
  })).sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1
    if (a.distance && b.distance) return a.distance - b.distance
    return 0
  })

  const searchedMarkets = withDistance.filter(m =>
    m.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
    m.district.toLowerCase().includes(marketSearch.toLowerCase())
  )
  const openMarkets = searchedMarkets.filter(m => m.isOpen)
  const closedMarkets = searchedMarkets.filter(m => !m.isOpen)

  const isLogin = location.pathname === '/login' || location.pathname === '/login/'
  const isPortalPath = location.pathname === '/portal' || location.pathname === '/portal/'
  const isDetail = location.pathname.startsWith('/market/')
  const isPanelRoute = location.pathname.startsWith('/panel/')

  if (isLogin) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u)
          navigate(getPanelPathForRole(u.role))
        }}
        darkMode={darkMode}
      />
    )
  }

  if (showSplash) {
    return (
      <div className="splash-screen">
        <img src="/logo.png" alt="Pazar Şeffaf Logo" className="splash-logo-img" />
        <h1>Pazar Şeffaf</h1>
        <p>Belediye Hizmet Sistemi</p>
      </div>
    )
  }

  if (!hasSelectedCity && !isDetail && !isLogin && !isPanelRoute && !isPortalPath) {
    return (
      <div className="welcome-screen">
        <main className="welcome-card">
          <img src="/logo.png" alt="" className="welcome-card__logo" />
          <p className="welcome-card__eyebrow">Pazar Şeffaf</p>
          <h1 className="welcome-card__title">İl seçimi</h1>
          <p className="welcome-card__lead">
            Hangi ildeki açık semt pazarlarını ve güncel fiyat özetini görmek istediğinizi seçin.
          </p>
          <div className="welcome-form">
            <label className="welcome-field-label" htmlFor="welcome-city-select">
              İl
            </label>
            <select
              id="welcome-city-select"
              value={city || 'Malatya'}
              onChange={(e) => setCity(e.target.value)}
              className="welcome-select"
            >
              {[...new Set(CITIES)].sort((a, b) => a.localeCompare(b, 'tr')).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button type="button" className="welcome-btn" onClick={() => setHasSelectedCity(true)}>
              Devam et
            </button>
            <button
              type="button"
              className="welcome-loc-btn"
              onClick={() => {
                getUserLocation()
                  .then((loc) => {
                    setUserLoc(loc)
                    setCity(findClosestCity(loc.lat, loc.lng))
                    setHasSelectedCity(true)
                  })
                  .catch(() => alert('Konum alınamadı.'))
              }}
            >
              <Icon name="my_location" size={20} aria-hidden />
              Konumuma göre seç
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/market/:id" element={<MarketDetail user={user} addToShopList={addToShopList} marketsCatalog={marketsCatalog} productsCatalog={productsCatalog} daysTrArr={daysTr} />} />
      <Route
        path="/portal"
        element={
          <LoginPage
            onLogin={(u) => {
              setUser(u)
              navigate(getPanelPathForRole(u.role))
            }}
            darkMode={darkMode}
          />
        }
      />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={(u) => {
              setUser(u)
              navigate(getPanelPathForRole(u.role))
            }}
            darkMode={darkMode}
          />
        }
      />
      <Route path="/panel/vatandas" element={<VatandasPanel user={user} darkMode={darkMode} setDarkMode={setDarkMode} shopList={shopList} />} />
      <Route
        path="/panel/esnaf"
        element={
          <RequireRole user={user} allow={['Esnaf']}>
            <Navigate to="/panel/esnaf/ozet" replace />
          </RequireRole>
        }
      />
      <Route
        path="/panel/esnaf/:section"
        element={
          <RequireRole user={user} allow={['Esnaf']}>
            <EsnafPanel user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
          </RequireRole>
        }
      />
      <Route
        path="/panel/zabita"
        element={
          <RequireRole user={user} allow={['Zabıta']}>
            <ZabitaPanel user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
          </RequireRole>
        }
      />
      <Route
        path="/panel/mudur"
        element={
          <RequireRole user={user} allow={['Zabıta Müdürü']}>
            <ChiefPanel user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
          </RequireRole>
        }
      />
      <Route
        path="/panel/yonetici"
        element={
          <RequireRole user={user} allow={['Yönetici']}>
            <Dashboard user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
          </RequireRole>
        }
      />
      <Route path="/dashboard" element={<Navigate to={getPanelPathForRole(user?.role)} replace />} />
      <Route path="*" element={
          <AppShell
            city={city}
            panelHref={getPanelPathForRole(user?.role)}
            darkMode={darkMode}
            onToggleTheme={() => setDarkMode(!darkMode)}
            onChangeCity={() => setHasSelectedCity(false)}
            weather={{
              temp: weatherInfo.temp,
              desc: weatherInfo.desc,
              icon: weatherInfo.icon,
              tip: weatherInfo.tip,
            }}
          >
            <section className="section-header" aria-label="Pazar ara">
              <input
                type="search"
                className="search-input"
                placeholder="Pazar adı veya ilçe ara"
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
              />
            </section>

            {viewMode === 'map' ? (
              <MapView markets={withDistance} userLoc={userLoc} onMarketClick={id => navigate(`/market/${id}`)} />
            ) : openMarkets.length === 0 && closedMarkets.length === 0 ? (
              <div className="home-empty-state" role="status">
                <p className="home-empty-title">Bu aramaya uygun pazar yok</p>
                <p className="home-empty-hint">Farklı bir anahtar kelime veya ilçe adı deneyin; aramayı temizleyerek tüm pazarları görebilirsiniz.</p>
                {marketSearch.trim() ? (
                  <button type="button" className="home-empty-clear" onClick={() => setMarketSearch('')}>
                    Aramayı temizle
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="market-cards-container">
                {openMarkets.map((m) => <MarketCard key={m.id} market={m} isOpen daysTrArr={daysTr} />)}
                {closedMarkets.map((m) => <MarketCard key={m.id} market={m} isOpen={false} daysTrArr={daysTr} />)}
              </div>
            )}

            <button
              type="button"
              className="home-view-toggle"
              onClick={() => setViewMode((v) => (v === 'cards' ? 'map' : 'cards'))}
              aria-pressed={viewMode === 'map'}
              title={viewMode === 'map' ? 'Pazar kartlarına dön' : 'Harita görünümü'}
              aria-label={viewMode === 'map' ? 'Pazar kartlarına dön' : 'Harita görünümüne geç'}
            >
              <Icon name={viewMode === 'map' ? 'storefront' : 'map'} size={22} />
            </button>

            <button
              type="button"
              className="shop-list-fab"
              onClick={() => setShowSmartList(true)}
              aria-label="Pazar listesini aç"
            >
              <Icon name="shopping_cart" size={24} />
              {shopList.length > 0 && <span className="fab-badge">{shopList.length}</span>}
            </button>

            <PazarListesi
              isOpen={showSmartList}
              onToggle={() => setShowSmartList(!showSmartList)}
              city={city}
              selectedItems={shopList}
              setSelectedItems={setShopList}
              catalogMarkets={marketsCatalog}
              catalogProducts={productsCatalog}
              onNavigateToMarketSchema={(marketId, productIds) => {
                navigate(`/market/${marketId}`, { state: { schemaHighlightProductIds: productIds } })
                setShowSmartList(false)
              }}
            />
          </AppShell>
      } />
    </Routes>
  )
}

function MarketCard({ market, isOpen, daysTrArr }) {
  const navigate = useNavigate()
  const dnames = daysTrArr && daysTrArr.length ? daysTrArr : DAYS_TR_FALLBACK
  return (
    <div
      className={`market-card ${isOpen ? 'open' : 'closed'}`}
      onClick={() => isOpen && navigate(`/market/${market.id}`)}
      role={isOpen ? 'button' : undefined}
      tabIndex={isOpen ? 0 : undefined}
      aria-label={isOpen ? `${market.name}, pazar detayına git` : undefined}
      aria-disabled={!isOpen}
      onKeyDown={(e) => {
        if (!isOpen) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/market/${market.id}`)
        }
      }}
    >
      <img src={market.image || '/market_1_1777411006018.png'} alt={market.name} className="mc-image" />
      <div className="mc-status-wrapper">
        <div className={`mc-status ${isOpen ? 'open' : 'closed'}`}>{isOpen ? 'Açık' : 'Kapalı'}</div>
      </div>
      <div className="mc-content">
        <div className="mc-header">
          <div className="mc-title">{market.name}</div>
          <div className="mc-district">{market.district} / {market.city}</div>
          <div className="mc-info">
            <span>{market.days.map(d => dnames[d]).join(', ')}</span>
            <span>{market.hours}</span>
            {market.distance && <span>{market.distance.toFixed(1)} km</span>}
          </div>
        </div>
        <div className="mc-actions">
          <button className="action-btn" onClick={(e) => { if (!isOpen) return; e.stopPropagation(); navigate(`/market/${market.id}`) }}>
            Detay
          </button>
        </div>
      </div>
    </div>
  )
}
