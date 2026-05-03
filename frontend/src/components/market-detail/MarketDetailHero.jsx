import Icon from '../Icon.jsx'

export default function MarketDetailHero({ marketName, isOpen, district, dayNames, vendorCount, onBack, mapsHref }) {
  const summary = [district, dayNames, `${vendorCount} esnaf`].filter(Boolean).join(' · ')

  return (
    <header className="pd-hero pd-hero--minimal" aria-labelledby="pd-market-title">
      <div className="pd-hero__strip">
        <button type="button" className="pd-hero__back" onClick={onBack} aria-label="Önceki sayfaya dön">
          <Icon name="arrow_back" size={22} />
        </button>

        <div className="pd-hero__grow">
          <h1 id="pd-market-title" className="pd-hero__name">
            {marketName}
          </h1>
          <p className="pd-hero__summary" title={`${isOpen ? 'Açık' : 'Kapalı'} · ${summary}`}>
            <span className={isOpen ? 'pd-hero__badge pd-hero__badge--open' : 'pd-hero__badge pd-hero__badge--closed'}>
              {isOpen ? 'Açık' : 'Kapalı'}
            </span>
            <span className="pd-hero__sep" aria-hidden>
              {' '}
              ·{' '}
            </span>
            <span className="pd-hero__meta">{summary}</span>
          </p>
        </div>

        <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="pd-hero__maplink">
          <Icon name="directions" size={20} aria-hidden />
          <span className="pd-hero__maplink-txt">Yol tarifi</span>
        </a>
      </div>
    </header>
  )
}
