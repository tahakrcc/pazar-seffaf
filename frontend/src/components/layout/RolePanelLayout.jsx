import { useNavigate } from 'react-router-dom'
import Icon from '../Icon.jsx'

export default function RolePanelLayout({
  title,
  subtitle,
  stats = [],
  darkMode,
  setDarkMode,
  /** esnaf | zabita | mudur | yonetici — üst şerit rengi */
  variant,
  children,
}) {
  const navigate = useNavigate()
  const variantClass = variant && ['esnaf', 'zabita', 'mudur', 'yonetici'].includes(variant) ? ` role-layout--${variant}` : ''

  return (
    <section className={`role-layout${variantClass}`}>
      <header className="role-layout-header">
        <div className="role-layout-top">
          <button type="button" className="btn-shell" onClick={() => navigate('/')}>
            <Icon name="arrow_back" size={18} />
            Ana sayfa
          </button>
          <button type="button" className="btn-shell" onClick={() => setDarkMode(!darkMode)}>
            <Icon name={darkMode ? 'light_mode' : 'dark_mode'} size={18} />
          </button>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {stats.length > 0 && (
          <div className="role-layout-stats">
            {stats.map((s) => (
              <div key={s.label} className="role-layout-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </header>
      <div className="role-layout-body">{children}</div>
    </section>
  )
}
