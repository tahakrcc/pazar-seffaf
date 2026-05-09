import { useState, useEffect } from 'react'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'
import RolePanelQuickNav from './RolePanelQuickNav.jsx'
import Icon from './Icon.jsx'
import { submitComplaint } from '../api/pazarApi'
import {
  STATIC_NOTIFICATIONS,
  getAllMarkets,
  submitComplaintOffline,
} from '../data/offlineDataset.js'

const VATANDAS_MISSIONS = [
  { icon: 'shopping_basket', title: 'Akıllı Liste', desc: 'İhtiyaçlarınızı ekleyin, yapay zeka ile en uygun pazarı ve bütçe planını bulun.' },
  { icon: 'campaign', title: 'Şikâyet Bildir', desc: 'Pazardaki aksaklıkları, fahiş fiyatları veya hijyen sorunlarını belediyeye iletin.' },
  { icon: 'notifications_active', title: 'Duyurular', desc: 'Pazar yeri değişiklikleri ve belediye duyurularından anında haberdar olun.' },
]

export default function VatandasPanel({ user, darkMode, setDarkMode, shopList }) {
  const [tab, setTab] = useState('overview')
  const [notifications, setNotifications] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(false)
  const [complaintForm, setComplaintForm] = useState({
    marketId: '',
    vendorId: '',
    description: '',
    reporterPhone: '',
    photoFile: null
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setNotifications(STATIC_NOTIFICATIONS)
    setMarkets(getAllMarkets())
  }, [])

  const handleComplaintSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      try {
        await submitComplaint(complaintForm)
      } catch {
        await submitComplaintOffline()
      }
      setMsg('Şikayetiniz başarıyla iletildi. Teşekkür ederiz.')
      setComplaintForm({ marketId: '', vendorId: '', description: '', reporterPhone: '', photoFile: null })
    } catch (err) {
      alert('Şikayet iletilirken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const quickNavItems = [
    { key: 'overview', label: 'Genel Bakış', hint: 'Özet ve duyurular', icon: 'dashboard', onClick: () => setTab('overview') },
    { key: 'complaint', label: 'Şikayet Oluştur', hint: 'Belediyeye bildir', icon: 'add_alert', onClick: () => setTab('complaint') },
    { key: 'help', label: 'Yardım', hint: 'Nasıl kullanılır?', icon: 'help_outline', onClick: () => setTab('help') },
  ]

  return (
    <RolePanelLayout
      variant="vatandas"
      title="Vatandaş Portalı"
      subtitle={`Hoş geldiniz, ${user?.name || 'Vatandaş'}`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[
        { label: 'Aktif Liste', value: shopList?.length || 0 },
        { label: 'Duyurular', value: notifications.length }
      ]}
    >
      <RoleMissionCards heading="Neler Yapabilirsiniz?" missions={VATANDAS_MISSIONS} />
      <RolePanelQuickNav title="Hızlı Menü" activeKey={tab} items={quickNavItems} />

      <div className="detail-tabs" style={{ marginBottom: 16 }}>
        {quickNavItems.map((t) => (
          <button 
            key={t.key} 
            type="button" 
            className={tab === t.key ? 'active' : ''} 
            onClick={() => setTab(t.key)}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="panel-content-grid">
          <section className="chart-card">
            <div className="card-header-with-icon">
              <Icon name="notifications" size={24} className="icon-primary" />
              <h3>Güncel Duyurular</h3>
            </div>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p className="muted">Şu an için yeni bir duyuru bulunmuyor.</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="notification-item">
                    <div className="notification-dot" />
                    <div className="notification-body">
                      <div className="notification-title">{n.title}</div>
                      <div className="notification-text">{n.message || n.desc}</div>
                      <div className="notification-time">{n.date || 'Bugün'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="chart-card">
            <div className="card-header-with-icon">
              <Icon name="shopping_cart" size={24} className="icon-secondary" />
              <h3>Alışveriş Özetiniz</h3>
            </div>
            <div className="shop-list-summary">
              {shopList && shopList.length > 0 ? (
                <>
                  <p>{shopList.length} adet ürün listenizde bekliyor.</p>
                  <ul className="summary-items">
                    {shopList.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item.name} ({item.qty} {item.unit})</li>
                    ))}
                    {shopList.length > 3 && <li>...ve {shopList.length - 3} ürün daha</li>}
                  </ul>
                  <p className="hint">Harita üzerinden akıllı rotanızı görmek için ana sayfadaki sepet simgesine tıklayın.</p>
                </>
              ) : (
                <p className="muted">Henüz bir alışveriş listesi oluşturmadınız.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'complaint' && (
        <section className="chart-card">
          <div className="card-header-with-icon">
            <Icon name="campaign" size={24} className="icon-danger" />
            <h3>Yeni Şikayet Bildirimi</h3>
          </div>
          <p className="muted" style={{ marginBottom: 20 }}>
            Pazar yerlerindeki olumsuz durumları buradan bildirebilirsiniz. Talebiniz anında ilgili zabıta birimine iletilir.
          </p>

          {msg && <div className="panel-success" style={{ marginBottom: 16 }}>{msg}</div>}

          <form onSubmit={handleComplaintSubmit} className="complaint-form">
            <div className="form-grid">
              <label className="pl-field">
                <span className="pl-field-label">İlgili Pazar</span>
                <select 
                  required
                  value={complaintForm.marketId} 
                  onChange={e => setComplaintForm({...complaintForm, marketId: e.target.value})}
                  className="pazar-listesi-select"
                >
                  <option value="">Pazar Seçin</option>
                  {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>

              <label className="pl-field">
                <span className="pl-field-label">Telefon Numaranız</span>
                <input 
                  type="tel" 
                  placeholder="05xx xxx xx xx"
                  value={complaintForm.reporterPhone}
                  onChange={e => setComplaintForm({...complaintForm, reporterPhone: e.target.value})}
                  className="pazar-listesi-input"
                />
              </label>
            </div>

            <label className="pl-field">
              <span className="pl-field-label">Şikayet Detayı</span>
              <textarea 
                required
                placeholder="Lütfen durumu detaylıca açıklayın..."
                value={complaintForm.description}
                onChange={e => setComplaintForm({...complaintForm, description: e.target.value})}
                className="pazar-listesi-input"
                style={{ minHeight: 120 }}
              />
            </label>

            <label className="pl-field">
              <span className="pl-field-label">Fotoğraf Ekle (Opsiyonel)</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setComplaintForm({...complaintForm, photoFile: e.target.files[0]})}
                className="pazar-listesi-input"
              />
            </label>

            <button 
              type="submit" 
              className="btn-v2 btn-primary" 
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              <Icon name="send" size={18} />
              {loading ? 'Gönderiliyor...' : 'Şikayeti İlet'}
            </button>
          </form>
        </section>
      )}

      {tab === 'help' && (
        <section className="chart-card">
          <div className="card-header-with-icon">
            <Icon name="help" size={24} className="icon-info" />
            <h3>Nasıl Kullanılır?</h3>
          </div>
          <div className="help-content">
            <div className="help-step">
              <div className="step-num">1</div>
              <div className="step-text">Ana sayfadan gitmek istediğiniz pazarı seçin veya arama yapın.</div>
            </div>
            <div className="help-step">
              <div className="step-num">2</div>
              <div className="step-text">Alışveriş listenizi oluşturun. Yapay zeka size en ucuz pazarı önerecektir.</div>
            </div>
            <div className="help-step">
              <div className="step-num">3</div>
              <div className="step-text">Pazar detayındaki "Haritada Göster" butonu ile ürünlerin pazar içindeki yerlerini görün.</div>
            </div>
            <div className="help-step">
              <div className="step-num">4</div>
              <div className="step-text">Herhangi bir sorun yaşarsanız "Şikayet Oluştur" sekmesinden bize ulaşın.</div>
            </div>
          </div>
        </section>
      )}
    </RolePanelLayout>
  )
}
