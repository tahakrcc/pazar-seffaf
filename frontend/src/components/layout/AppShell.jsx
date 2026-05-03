import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'

export default function AppShell({
  city,
  panelHref,
  darkMode,
  onToggleTheme,
  onChangeCity,
  toolbarItems = [],
  weather,
  children,
}) {
  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <div className="app-shell-brand">
          <img src="/logo.png" alt="Pazar Şeffaf" />
          <div>
            <strong>Pazar Şeffaf</strong>
            <span>Belediye Bilgi Sistemi</span>
          </div>
        </div>
        <div className="app-shell-actions">
          {weather && (
            <div className="app-shell-weather" title={weather.tip || `${weather.temp}° · ${weather.desc}`}>
              <Icon name={weather.icon} size={18} />
              <span className="app-shell-weather-text">
                <strong>{weather.temp}°</strong>
                <span className="app-shell-weather-desc">{weather.desc}</span>
              </span>
            </div>
          )}
          <button type="button" className="btn-shell" onClick={onChangeCity}>
            <Icon name="location_on" size={18} />
            {city}
          </button>
          {panelHref ? (
            <Link to={panelHref} className="btn-shell app-shell-panel-link">
              <Icon name="dashboard" size={18} aria-hidden />
              Panelim
            </Link>
          ) : null}
          <Link to="/portal" className="btn-shell app-shell-portal-link">
            <Icon name="login" size={18} aria-hidden />
            Portal
          </Link>
          <button type="button" className="btn-shell" onClick={onToggleTheme} aria-label="Tema">
            <Icon name={darkMode ? 'light_mode' : 'dark_mode'} size={18} />
          </button>
        </div>
      </header>

      {toolbarItems.length > 0 ? (
        <nav className="app-shell-toolbar" aria-label="Uygulama sekmeleri">
          {toolbarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`app-shell-tool ${item.active ? 'is-active' : ''}`}
              onClick={item.onClick}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      ) : null}

      <main className="app-shell-main">{children}</main>
    </div>
  )
}
