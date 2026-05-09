import Icon from './Icon.jsx'
import MapView from './MapView.jsx'

export default function ElderHome({
  city,
  marketSearch,
  setMarketSearch,
  viewMode,
  setViewMode,
  withDistance,
  openMarkets,
  closedMarkets,
  daysTr,
  onOpenSettings,
  onOpenShopList,
  shopListCount,
  onOpenMarket,
}) {
  return (
    <section className="elder-home" aria-label="Kolay kullanım ana ekranı">
      <div className="elder-home__hero">
        <p className="elder-home__city">{city}</p>
        <h1 className="elder-home__title">Neyi arıyorsunuz?</h1>
        <div className="elder-home__search-wrap">
          <Icon name="search" size={28} />
          <input
            type="search"
            className="elder-home__search"
            placeholder="Pazar adı veya ilçe yazın"
            value={marketSearch}
            onChange={(e) => setMarketSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="elder-home__actions">
        <button type="button" className="elder-home__btn elder-home__btn--primary" onClick={() => setViewMode((v) => (v === 'map' ? 'cards' : 'map'))}>
          <Icon name={viewMode === 'map' ? 'view_agenda' : 'map'} size={28} />
          {viewMode === 'map' ? 'Listeyi göster' : 'Haritada göster'}
        </button>
        <button type="button" className="elder-home__btn" onClick={onOpenShopList}>
          <Icon name="shopping_cart" size={28} />
          Alışveriş Listem {shopListCount > 0 ? `(${shopListCount})` : ''}
        </button>
        <button type="button" className="elder-home__btn" onClick={onOpenSettings}>
          <Icon name="settings" size={28} />
          Ayarlar
        </button>
      </div>

      {viewMode === 'map' ? (
        <div className="elder-home__map">
          <MapView markets={withDistance} userLoc={null} onMarketClick={onOpenMarket} />
        </div>
      ) : (
        <div className="elder-home__list">
          {openMarkets.length === 0 && closedMarkets.length === 0 ? (
            <div className="elder-home__empty">
              <p>Aradığınız pazarı bulamadık.</p>
              {marketSearch.trim() ? (
                <button type="button" className="elder-home__btn elder-home__btn--primary" onClick={() => setMarketSearch('')}>
                  Aramayı temizle
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {openMarkets.map((m) => (
                <LargeMarketCard key={m.id} market={m} isOpen daysTr={daysTr} onOpenMarket={onOpenMarket} />
              ))}
              {closedMarkets.map((m) => (
                <LargeMarketCard key={m.id} market={m} isOpen={false} daysTr={daysTr} onOpenMarket={onOpenMarket} />
              ))}
            </>
          )}
        </div>
      )}
    </section>
  )
}

function LargeMarketCard({ market, isOpen, daysTr, onOpenMarket }) {
  return (
    <article className={`elder-card ${isOpen ? 'is-open' : 'is-closed'}`}>
      <div className="elder-card__head">
        <h2>{market.name}</h2>
        <span className={`elder-card__status ${isOpen ? 'is-open' : 'is-closed'}`}>{isOpen ? 'Açık' : 'Kapalı'}</span>
      </div>
      <p className="elder-card__meta">
        {market.district} / {market.city}
      </p>
      <p className="elder-card__meta">
        {market.days.map((d) => daysTr[d]).join(', ')} · {market.hours}
      </p>
      <button type="button" className="elder-card__open-btn" disabled={!isOpen} onClick={() => onOpenMarket(market.id)}>
        {isOpen ? 'Pazarı aç' : 'Şu an kapalı'}
      </button>
    </article>
  )
}
