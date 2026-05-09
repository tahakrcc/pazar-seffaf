import { useEffect, useState } from 'react'
import { patchOfficerComplaint, postOfficerInspection, postOfficerViolation } from '../api/pazarApi'
import {
  getAllMarkets,
  getVendorsForMarket,
  STATIC_COMPLAINTS,
  getOfficerInspectionsList,
} from '../data/offlineDataset.js'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'
import RolePanelQuickNav from './RolePanelQuickNav.jsx'
import Icon from './Icon.jsx'

const ZABITA_MISSIONS = [
  { icon: 'campaign', title: 'Şikâyet işleme', desc: 'Vatandaş başvurularını üzerinize alın veya çözüldü olarak kapatın.' },
  { icon: 'rule', title: 'Saha denetimi', desc: 'Pazar seçerek denetim kaydı oluşturun; uygun / ihlal sonucunu işleyin.' },
  { icon: 'gavel', title: 'İhlal kaydı', desc: 'Denetime bağlı olarak esnaf ve ihlal türü ile resmî kayıt açın.' },
  { icon: 'history', title: 'Geçmiş', desc: 'Önceki denetim ve ihlal kayıtlarınızı takip edin.' },
]

export default function ZabitaPanel({ user, darkMode, setDarkMode }) {
  const [tab, setTab] = useState('overview')
  const [markets, setMarkets] = useState([])
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [vendors, setVendors] = useState([])
  const [inspections, setInspections] = useState([])
  const [complaints, setComplaints] = useState([])
  const [inspectionNotes, setInspectionNotes] = useState('')
  const [violCount, setViolCount] = useState(0)
  const [statusPick, setStatusPick] = useState('completed')
  const [lastInspectionId, setLastInspectionId] = useState(null)
  const [newViolation, setNewViolation] = useState({ vendorId: '', type: '', desc: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const violationTypes = ['Hijyen ihlali', 'Fiyat manipülasyonu', 'Ruhsat eksikliği', 'Tartı hilesi', 'Etiket eksikliği', 'Yer ihlali']
  const tabs = [
    { key: 'overview', icon: 'analytics', label: 'Genel' },
    { key: 'complaints', icon: 'campaign', label: 'Şikayetler' },
    { key: 'inspect', icon: 'rule', label: 'Denetim' },
    { key: 'violations', icon: 'gavel', label: 'İhlaller' },
    { key: 'history', icon: 'history', label: 'Geçmiş' },
  ]

  const refresh = () => {
    setErr('')
    const ml = getAllMarkets()
    setMarkets(ml)
    if (selectedMarket == null && ml.length) setSelectedMarket(ml[0].id)
    setInspections(getOfficerInspectionsList())
    setComplaints(STATIC_COMPLAINTS.map((c) => ({ ...c })))
    const ins = getOfficerInspectionsList()
    if (!lastInspectionId && ins[0]?.id) setLastInspectionId(ins[0].id)
  }

  // refresh fonksiyonu bu bileşende sabit iş akışı için mount sırasında çağrılır.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { refresh() }, [])
  useEffect(() => {
    if (selectedMarket == null) return
    setVendors(getVendorsForMarket(selectedMarket))
  }, [selectedMarket])

  const marketName = (id) => markets.find((x) => x.id === id)?.name || `Pazar #${id}`
  const violationCount = inspections.filter((i) => i.status === 'violation').length

  const saveInspection = async () => {
    const today = new Date().toISOString().slice(0, 10)
    try {
      const res = await postOfficerInspection({
        marketId: selectedMarket,
        inspectionDate: today,
        status: statusPick,
        violationsCount: violCount,
        notes: inspectionNotes,
      })
      setLastInspectionId(res.id)
    } catch {
      const nextId = Math.max(0, ...inspections.map((i) => i.id || 0)) + 1
      setInspections((prev) => [
        ...prev,
        {
          id: nextId,
          marketId: selectedMarket,
          inspectionDate: today,
          status: statusPick,
          violationsCount: violCount,
          notes: inspectionNotes,
          inspector: 'Yerel kayıt',
        },
      ])
      setLastInspectionId(nextId)
    }
    setMsg('Denetim kaydı oluşturuldu (yerel demo).')
  }

  const saveViolation = async () => {
    const inspId = lastInspectionId || inspections[0]?.id
    if (!inspId || !newViolation.vendorId || !newViolation.type) {
      alert('Önce denetim kaydı oluşturun, ardından esnaf ve ihlal türünü seçin.')
      return
    }
    try {
      await postOfficerViolation({
        inspectionId: inspId,
        vendorId: Number(newViolation.vendorId),
        type: newViolation.type,
        description: newViolation.desc || '',
      })
    } catch {
      /* yerel mod — sunucu yok */
    }
    setNewViolation({ vendorId: '', type: '', desc: '' })
    setMsg('İhlal kaydı yerel oturumda tutuldu (demo).')
  }

  const claimOrResolve = async (id, status) => {
    try {
      await patchOfficerComplaint(id, status)
    } catch {
      /* offline demo */
    }
    setComplaints((prev) =>
      prev.map((c) => (Number(c.id) === Number(id) ? { ...c, status } : c)),
    )
  }

  const quickNavItems = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    hint:
      t.key === 'complaints'
        ? 'Vatandaş şikâyetleri'
        : t.key === 'inspect'
          ? 'Saha denetim kaydı'
          : t.key === 'violations'
            ? 'İhlal tescili'
            : t.key === 'history'
              ? 'Geçmiş denetimler'
              : 'Özet ekran',
    icon: t.icon,
    onClick: () => setTab(t.key),
  }))

  return (
    <RolePanelLayout
      variant="zabita"
      title="Zabıta operasyon merkezi"
      subtitle={`Denetim ve şikâyet — ${user?.name || 'Zabıta memuru'}`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[{ label: 'Denetim', value: inspections.length }, { label: 'İhlal', value: violationCount }]}
    >
      <RoleMissionCards heading="Saha denetimi — görevleriniz" missions={ZABITA_MISSIONS} />
      <RolePanelQuickNav title="Modüller" activeKey={tab} items={quickNavItems} />
      <div className="detail-tabs" style={{ marginBottom: 16 }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {err && <div className="panel-error">{err}</div>}
      {msg && <div className="panel-success">{msg}</div>}

      {tab === 'overview' && (
        <section className="chart-card">
          <h3>Genel Durum</h3>
          <p className="muted">Örnek veriler yalnızca tarayıcıda (frontend) tutulur; backend zorunlu değildir.</p>
          <button type="button" className="btn-v2 btn-primary" onClick={refresh}>Verileri yenile</button>
        </section>
      )}

      {tab === 'complaints' && (
        <section className="chart-card">
          <h3>Şikayet Kutusu</h3>
          {complaints.map((c) => (
            <div key={c.id} className="panel-row">
              <div className="panel-row-title">#{c.id} · {c.marketName || marketName(c.marketId)}</div>
              {(c.vendorName || c.stallCode) && (
                <div className="panel-row-desc">
                  Tezgâh: {c.stallCode || '—'} · {c.vendorName || '—'}
                </div>
              )}
              <div className="panel-row-desc">{c.description}</div>
              {c.reporterPhone && <div className="panel-row-desc">İletişim: {c.reporterPhone}</div>}
              <div className="panel-actions">
                <button type="button" className="btn-v2 btn-primary" onClick={() => claimOrResolve(c.id, 'IN_PROGRESS')}>Üzerime al</button>
                <button type="button" className="btn-v2" onClick={() => claimOrResolve(c.id, 'RESOLVED')}>Çözüldü</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === 'inspect' && (
        <section className="chart-card">
          <h3>Yeni Denetim</h3>
          <label className="pl-field">
            <span className="pl-field-label">Pazar</span>
            <select value={selectedMarket ?? ''} onChange={(e) => setSelectedMarket(Number(e.target.value))} className="pazar-listesi-select">
              {markets.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.city})</option>)}
            </select>
          </label>
          <label className="pl-field">
            <span className="pl-field-label">Sonuç</span>
            <select value={statusPick} onChange={(e) => setStatusPick(e.target.value)} className="pazar-listesi-select">
              <option value="completed">Uygun</option>
              <option value="violation">İhlal</option>
            </select>
          </label>
          <label className="pl-field">
            <span className="pl-field-label">İhlal sayısı</span>
            <input type="number" value={violCount} onChange={(e) => setViolCount(Number(e.target.value) || 0)} className="pazar-listesi-input" />
          </label>
          <label className="pl-field">
            <span className="pl-field-label">Not</span>
            <textarea value={inspectionNotes} onChange={(e) => setInspectionNotes(e.target.value)} className="pazar-listesi-input" style={{ minHeight: 100 }} />
          </label>
          <button type="button" className="btn-v2 btn-primary" onClick={saveInspection}>Kaydet</button>
        </section>
      )}

      {tab === 'violations' && (
        <section className="chart-card">
          <h3>İhlal Kaydı</h3>
          <div className="pl-ai-grid">
            <label className="pl-field">
              <span className="pl-field-label">Denetim ID</span>
              <input type="number" value={lastInspectionId || ''} onChange={(e) => setLastInspectionId(Number(e.target.value) || null)} className="pazar-listesi-input" />
            </label>
            <label className="pl-field">
              <span className="pl-field-label">Esnaf</span>
              <select value={newViolation.vendorId} onChange={(e) => setNewViolation({ ...newViolation, vendorId: e.target.value })} className="pazar-listesi-select">
                <option value="">Seçin</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
          </div>
          <label className="pl-field">
            <span className="pl-field-label">İhlal türü</span>
            <select value={newViolation.type} onChange={(e) => setNewViolation({ ...newViolation, type: e.target.value })} className="pazar-listesi-select">
              <option value="">Seçin</option>
              {violationTypes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
          <label className="pl-field">
            <span className="pl-field-label">Açıklama</span>
            <textarea value={newViolation.desc} onChange={(e) => setNewViolation({ ...newViolation, desc: e.target.value })} className="pazar-listesi-input" style={{ minHeight: 80 }} />
          </label>
          <button type="button" className="btn-v2 btn-primary" onClick={saveViolation}>İhlal kaydet</button>
        </section>
      )}

      {tab === 'history' && (
        <section className="chart-card">
          <h3>Denetim Geçmişi</h3>
          {inspections.map((ins) => (
            <div key={ins.id} className="panel-row">
              <div className="panel-row-title">{ins.marketName || marketName(ins.marketId)}</div>
              <div className="panel-row-desc">{ins.inspector} · {ins.date} · {ins.violations} ihlal</div>
              {ins.notes && <div className="panel-row-desc">&quot;{ins.notes}&quot;</div>}
            </div>
          ))}
        </section>
      )}
    </RolePanelLayout>
  )
}

