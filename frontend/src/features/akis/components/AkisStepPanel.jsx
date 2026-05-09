import Icon from '../../../components/Icon.jsx'

export function AkisStepPanel({
  steps,
  activeIndex,
  total,
  step,
  onSelectStep,
  onPrev,
  onNext,
}) {
  return (
    <aside className="akis-page__panel" aria-live="polite">
      <div key={step.id} className="akis-step-copy">
        <p className="akis-page__eyebrow">
          <span className="akis-page__step-num">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="akis-page__step-slash">/</span>
          <span>{total}</span>
        </p>
        <h1 className="akis-page__title">{step.title}</h1>
        <p className="akis-page__hint">{step.hint}</p>
        <p className="akis-page__detail">{step.detail}</p>
      </div>

      <div className="akis-page__timeline" aria-hidden>
        <div className="akis-page__timeline-track" />
        <div className="akis-page__timeline-fill" style={{ width: `${((activeIndex + 1) / total) * 100}%` }} />
      </div>

      <div className="akis-page__progress">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`akis-page__dot ${i === activeIndex ? 'is-active' : ''} ${i < activeIndex ? 'is-past' : ''}`}
            onClick={() => onSelectStep(i)}
            aria-label={`${s.title} adımına git`}
            aria-current={i === activeIndex ? 'step' : undefined}
          />
        ))}
      </div>

      <div className="akis-page__nav">
        <button type="button" className="akis-page__btn akis-page__btn--ghost" onClick={onPrev}>
          <Icon name="chevron_left" size={20} />
          Önceki
        </button>
        <button type="button" className="akis-page__btn akis-page__btn--primary" onClick={onNext}>
          Sonraki
          <Icon name="chevron_right" size={20} />
        </button>
      </div>
    </aside>
  )
}
