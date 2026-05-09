import Icon from '../Icon.jsx'

/** Ana sayfa üst şeridi: hava durumu + tek büyük Ayarlar düğmesi */
export default function AppShell({
  weather,
  onOpenSettings,
  children,
}) {
  return (
    <div className="app-shell">
      <header className="app-shell-header">
        <div className="app-shell-brand">
          <img src="/logo.png" alt="Pazar Şeffaf" />
          <div>
            <strong>Pazar Şeffaf</strong>
            <span>Açık pazar bilgisi</span>
          </div>
        </div>
        <div className="app-shell-actions">
          {weather ? (
            <div className="app-shell-weather" title={weather.tip || `${weather.temp}° · ${weather.desc}`}>
              <Icon name={weather.icon} size={18} />
              <span className="app-shell-weather-text">
                <strong>{weather.temp}°</strong>
                <span className="app-shell-weather-desc">{weather.desc}</span>
              </span>
            </div>
          ) : null}
          <button type="button" className="btn-shell btn-shell--settings" onClick={onOpenSettings}>
            <Icon name="settings" size={22} aria-hidden />
            Ayarlar
          </button>
        </div>
      </header>

      <main className="app-shell-main">{children}</main>
    </div>
  )
}
