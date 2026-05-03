import Icon from './Icon.jsx'

/**
 * Rol paneli üstünde "bu sayfada neler yapılır" özet kartları.
 * @param {{ icon: string, title: string, desc: string }[]} missions
 */
export default function RoleMissionCards({ heading = 'Bu paneldeki görevler', missions }) {
  if (!missions?.length) return null
  return (
    <section className="role-missions" aria-labelledby="role-missions-heading">
      <h2 id="role-missions-heading" className="role-missions__title">
        {heading}
      </h2>
      <ul className="role-missions__grid">
        {missions.map((m) => (
          <li key={m.title} className="role-mission-card">
            <span className="role-mission-card__icon" aria-hidden>
              <Icon name={m.icon} size={26} />
            </span>
            <h3 className="role-mission-card__title">{m.title}</h3>
            <p className="role-mission-card__desc">{m.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
