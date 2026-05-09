import { Link } from 'react-router-dom'
import Icon from '../../../components/Icon.jsx'
import { AKIS_AUTO_ADVANCE_MS } from '../constants/timing.js'

function formatAdvanceHint(ms) {
  const sec = Math.round(ms / 1000)
  return `~${sec} sn`
}

export function AkisHeader({ autoPlay, onAutoPlayChange }) {
  return (
    <header className="akis-page__top">
      <Link to="/" className="akis-page__brand">
        <span className="akis-page__brand-mark">
          <img src="/logo.png" alt="" width={40} height={40} />
        </span>
        <span className="akis-page__brand-text">
          <span className="akis-page__brand-title">Sistem akışı</span>
          <span className="akis-page__brand-sub">Pazar Şeffaf · rol bazlı veri yolu</span>
        </span>
      </Link>
      <div className="akis-page__top-actions">
        <label className="akis-page__toggle">
          <input type="checkbox" checked={autoPlay} onChange={(e) => onAutoPlayChange(e.target.checked)} />
          <span>Otomatik geçiş</span>
          <span className="akis-page__toggle-hint">{formatAdvanceHint(AKIS_AUTO_ADVANCE_MS)}</span>
        </label>
        <Link to="/" className="akis-page__home-btn">
          <Icon name="home" size={18} />
          Ana sayfa
        </Link>
      </div>
    </header>
  )
}
