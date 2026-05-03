import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { markets as mockMarkets } from '../data/markets'
import { fetchMarkets } from '../api/pazarApi'
import Icon from './Icon.jsx'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'

const DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

const VATANDAS_MISSIONS = [
  {
    icon: 'map',
    title: 'Pazar ve fiyat',
    desc: 'İl seçerek açık semt pazarlarını, çalışma saatlerini ve güncel fiyat özetini inceleyin.',
  },
  {
    icon: 'shopping_cart',
    title: 'Akıllı liste',
    desc: 'Alışveriş listenizi oluşturun; pazar haritasında ürünün hangi tezgahta olduğunu görün.',
  },
  {
    icon: 'calculate',
    title: 'Tutar hesaplama',
    desc: 'Pazar detayında ürün bazında miktar girerek tahmini tutarı hesaplayın.',
  },
  {
    icon: 'campaign',
    title: 'Şikâyet',
    desc: 'Pazar sayfasından tezgâh veya esnaf seçerek vatandaş şikâyeti iletebilirsiniz.',
  },
]

export default function VatandasPanel({ user, darkMode, setDarkMode, shopList }) {
  const navigate = useNavigate()
  const [apiMarkets, setApiMarkets] = useState([])

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        const m = await fetchMarkets('')
        if (!canceled) {
          setApiMarkets(Array.isArray(m) && m.length ? m : mockMarkets)
        }
      } catch {
        if (!canceled) {
          setApiMarkets(mockMarkets)
        }
      }
    })()
    return () => {
      canceled = true
    }
  }, [])

  const marketOptions = apiMarkets.length ? apiMarkets : mockMarkets
  const openMarkets = marketOptions.filter((m) => Array.isArray(m.days) && m.days.length > 0)

  return (
    <RolePanelLayout
      title="Vatandaş paneli"
      subtitle={`${user?.name ? `${user.name} · ` : ''}Pazar ve liste işlemleriniz`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[
        { label: 'Kayıtlı pazar', value: openMarkets.length },
        { label: 'Listede ürün', value: shopList?.length || 0 },
      ]}
    >
      <RoleMissionCards heading="Bu panelde yapabilecekleriniz" missions={VATANDAS_MISSIONS} />

      <section className="chart-card" style={{ marginTop: 8 }}>
        <h3>Açık pazarlara git</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Karttan pazar detayına geçebilirsiniz (yerleşim, fiyatlar, esnaflar).
        </p>
        {openMarkets.map((m) => (
          <button
            key={m.id}
            type="button"
            className="role-market-row"
            onClick={() => navigate(`/market/${m.id}`)}
          >
            <span className="role-market-row__badge" aria-hidden>
              {m.name[0]}
            </span>
            <span className="role-market-row__text">
              <span className="role-market-row__title">{m.name}</span>
              <span className="role-market-row__meta">
                {m.district} / {m.city} · {m.days.map((d) => DAYS_SHORT[d]).join(', ')}
              </span>
            </span>
            <Icon name="arrow_forward" size={22} aria-hidden />
          </button>
        ))}
      </section>
    </RolePanelLayout>
  )
}
