import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

/**
 * Rol panelinde sekmelere / bölümlere hızlı geçiş.
 * `to` verilirse gerçek sayfa geçişi (NavLink); yoksa onClick.
 * @param {{ title: string, activeKey?: string, items: { key: string, label: string, hint: string, icon: string, onClick?: () => void, to?: string }[] }} props
 */
export default function RolePanelQuickNav({ title, activeKey, items }) {
  if (!items?.length) return null
  return (
    <nav className="role-quick-nav" aria-label={title}>
      <h2 className="role-quick-nav__title">{title}</h2>
      <ul className="role-quick-nav__grid">
        {items.map((it) => {
          const isActive = activeKey != null && it.key === activeKey
          const inner = (
            <>
              <Icon name={it.icon} size={22} aria-hidden />
              <span className="role-quick-nav__lbl">{it.label}</span>
              <span className="role-quick-nav__hint">{it.hint}</span>
            </>
          )
          return (
            <li key={it.key}>
              {it.to ? (
                <NavLink
                  to={it.to}
                  end
                  className={({ isActive: navActive }) =>
                    `role-quick-nav__btn${navActive ? ' role-quick-nav__btn--active' : ''}`
                  }
                >
                  {inner}
                </NavLink>
              ) : (
                <button
                  type="button"
                  className={`role-quick-nav__btn${isActive ? ' role-quick-nav__btn--active' : ''}`}
                  onClick={it.onClick}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
