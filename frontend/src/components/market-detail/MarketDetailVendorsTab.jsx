import Icon from '../Icon.jsx'

export default function MarketDetailVendorsTab({
  vendors,
  userRole,
  onComplaint,
  getStallPhoto,
  vendorInitials,
}) {
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
            const n = v.products?.length ?? 0
            return (
              <li key={v.id} className="vendor-card md-vendor-card">
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
                  {userRole === 'Vatandaş' && (
                    <button type="button" className="vendor-card__complaint" onClick={() => onComplaint(v.id)}>
                      <Icon name="flag" size={16} />
                      Şikâyet
                    </button>
                  )}
                </div>
                {stallPhoto ? (
                  <img className="vendor-card__photo" src={stallPhoto} alt={`${v.name} tezgah fotoğrafı`} />
                ) : null}
                <div className="vendor-card__footer">
                  <span className="vendor-card__products">
                    <Icon name="inventory_2" size={16} />
                    {n} ürün satıyor
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
