import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

const LS_SIMPLE = 'pazar_simple_mode_v1'

export function loadSimpleMode() {
  try {
    return localStorage.getItem(LS_SIMPLE) === '1'
  } catch {
    return false
  }
}

export function saveSimpleMode(v) {
  try {
    localStorage.setItem(LS_SIMPLE, v ? '1' : '0')
  } catch {
    /* ignore */
  }
}

/** Tam ekran ayarlar: il, basit mod, tema, bağlantılar */
export default function AppSettingsModal({
  open,
  onClose,
  city,
  cities,
  setCity,
  setHasSelectedCity,
  simpleMode,
  setSimpleMode,
  darkMode,
  setDarkMode,
}) {
  const [draftCity, setDraftCity] = useState(city || 'Malatya')

  useEffect(() => {
    if (open) setDraftCity(city || 'Malatya')
  }, [open, city])

  if (!open) return null

  const applyCity = () => {
    setCity(draftCity)
    setHasSelectedCity(true)
    onClose?.()
  }

  const openFullCityScreen = () => {
    setHasSelectedCity(false)
    onClose?.()
  }

  return (
    <div className="app-settings-overlay" role="dialog" aria-modal="true" aria-labelledby="app-settings-title" onClick={onClose}>
      <div className="app-settings-panel" onClick={(e) => e.stopPropagation()}>
        <header className="app-settings-panel__head">
          <div>
            <h2 id="app-settings-title" className="app-settings-panel__title">
              Ayarlar
            </h2>
            <p className="app-settings-panel__sub">Bu ekrandan ilinizi ve görünümü değiştirebilirsiniz.</p>
          </div>
          <button type="button" className="app-settings-close" onClick={onClose} aria-label="Ayarları kapat">
            <Icon name="close" size={28} />
          </button>
        </header>

        <div className="app-settings-scroll">
          <section className="app-settings-section" aria-labelledby="settings-city-heading">
            <h3 id="settings-city-heading" className="app-settings-heading">
              <Icon name="location_on" size={22} aria-hidden />
              İl seçimi
            </h3>
            <p className="app-settings-hint">Fiyat özetleri ve pazar listesi seçtiğiniz ile gösterilir.</p>
            <label className="app-settings-label" htmlFor="settings-city-select">
              İl
            </label>
            <select
              id="settings-city-select"
              className="app-settings-select"
              value={draftCity}
              onChange={(e) => setDraftCity(e.target.value)}
            >
              {[...new Set(cities)].sort((a, b) => a.localeCompare(b, 'tr')).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="app-settings-row-actions">
              <button type="button" className="app-settings-primary" onClick={applyCity}>
                İli kaydet
              </button>
              <button type="button" className="app-settings-secondary" onClick={openFullCityScreen}>
                Başlangıç il ekranına git
              </button>
            </div>
          </section>

          <section className="app-settings-section" aria-labelledby="settings-simple-heading">
            <h3 id="settings-simple-heading" className="app-settings-heading">
              <Icon name="accessibility_new" size={22} aria-hidden />
              Basit mod
            </h3>
            <p className="app-settings-hint">Daha büyük yazı ve düğmeler; sade üst çubuk. Okuması kolay ekran.</p>
            <label className="app-settings-toggle-row">
              <input
                type="checkbox"
                className="app-settings-checkbox"
                checked={simpleMode}
                onChange={(e) => setSimpleMode(e.target.checked)}
              />
              <span className="app-settings-toggle-text">Basit modu aç</span>
            </label>
          </section>

          <section className="app-settings-section">
            <h3 className="app-settings-heading">
              <Icon name={darkMode ? 'light_mode' : 'dark_mode'} size={22} aria-hidden />
              Görünüm
            </h3>
            <label className="app-settings-toggle-row">
              <input
                type="checkbox"
                className="app-settings-checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="app-settings-toggle-text">Karanlık tema</span>
            </label>
          </section>

          <section className="app-settings-section">
            <h3 className="app-settings-heading">
              <Icon name="menu_book" size={22} aria-hidden />
              Yararlı bağlantılar
            </h3>
            <div className="app-settings-links">
              <Link to="/akis" className="app-settings-link" onClick={onClose}>
                Sistem nasıl işler?
              </Link>
              <Link to="/portal" className="app-settings-link" onClick={onClose}>
                Giriş yap (esnaf / zabıta / yönetici)
              </Link>
            </div>
          </section>
        </div>

        <footer className="app-settings-footer">
          <button type="button" className="app-settings-primary app-settings-footer__btn" onClick={onClose}>
            Kapat
          </button>
        </footer>
      </div>
    </div>
  )
}
