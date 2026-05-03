import Icon from '../Icon.jsx'

export default function MarketDetailTabs({ tabs, activeTab, onTabChange, tabLabels, tabIcons }) {
  return (
    <nav className="app-shell-toolbar pd-market-toolbar" role="tablist" aria-label="Pazar bölümleri">
      {tabs.map((t) => {
        const active = activeTab === t
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            className={`app-shell-tool ${active ? 'is-active' : ''}`}
            onClick={() => onTabChange(t)}
          >
            <Icon name={tabIcons[t]} size={20} aria-hidden />
            {tabLabels[t]}
          </button>
        )
      })}
    </nav>
  )
}
