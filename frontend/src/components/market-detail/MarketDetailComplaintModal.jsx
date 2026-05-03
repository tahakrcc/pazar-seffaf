import Icon from '../Icon.jsx'

export default function MarketDetailComplaintModal({
  vendor,
  complaintPhone,
  complaintText,
  onPhone,
  onText,
  onPhoto,
  onSubmit,
  onCancel,
}) {
  if (!vendor) return null

  return (
    <div className="product-modal-overlay" onClick={onCancel}>
      <div className="product-modal md-complaint-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal__handle" aria-hidden />
        <h3 className="md-complaint-modal__title">Tezgah şikâyeti</h3>
        <p className="md-complaint-modal__meta">
          <strong>{vendor.stall}</strong> · {vendor.name}
        </p>
        <label className="sr-only" htmlFor="complaint-phone">
          Telefon
        </label>
        <input
          id="complaint-phone"
          type="tel"
          className="md-complaint-modal__input"
          placeholder="Telefon numaranız (zorunlu)"
          value={complaintPhone}
          onChange={(e) => onPhone(e.target.value)}
          inputMode="tel"
        />
        <label className="sr-only" htmlFor="complaint-body">
          Şikâyet metni
        </label>
        <textarea
          id="complaint-body"
          className="md-complaint-modal__textarea"
          placeholder="Şikâyetinizi yazın…"
          value={complaintText}
          onChange={(e) => onText(e.target.value)}
        />
        <label className="md-complaint-modal__file">
          <Icon name="attach_file" size={18} aria-hidden />
          <span>Fotoğraf ekle (isteğe bağlı)</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0] || null)} />
        </label>
        <div className="product-modal__actions md-complaint-modal__actions">
          <button type="button" className="product-modal__btn product-modal__btn--primary" onClick={onSubmit}>
            Gönder
          </button>
          <button type="button" className="product-modal__btn product-modal__btn--secondary" onClick={onCancel}>
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}
