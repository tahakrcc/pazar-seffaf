import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchMarkets,
  fetchMarketLayout,
  fetchAdminMunicipalities,
  fetchAdminVendors,
  fetchAdminInspections,
  fetchAdminOfficers,
  fetchAdminComplaints,
  postAdminAssignment,
  postAdminMarket,
  postAdminMarketLayout,
} from '../api/pazarApi'
import Icon from './Icon.jsx'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import { addMergedSchemaTool, getMergedSchemaTools } from '../config/schemaCellTypes.js'
import { normalizeLayout, toBackendLayoutPayload } from '../features/schema/model/layoutModel.js'
import SchemaCanvasEditor from './SchemaCanvasEditor.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'
import RolePanelQuickNav from './RolePanelQuickNav.jsx'

const ADMIN_MISSIONS = [
  { icon: 'storefront', title: 'Pazar yönetimi', desc: 'Yeni semt pazarı tanımlayın; kapasite ve çalışma günlerini düzenleyin.' },
  { icon: 'grid_on', title: 'Yerleşim şeması', desc: 'Izgara veya serbest tuval ile tezgâh, duvar ve servis noktalarını çizin.' },
  { icon: 'groups', title: 'Esnaf kayıtları', desc: 'Tezgâh kodu ve pazar atamasını yönetin; şikâyet eşlemesi için güncel tutun.' },
  { icon: 'shield_person', title: 'Zabıta ataması', desc: 'Açık vatandaş şikâyetlerini ilgili zabıta personeline atayın.' },
  { icon: 'analytics', title: 'Genel bakış', desc: 'Pazar, şikâyet ve denetim özet istatistiklerini izleyin.' },
]

const ADMIN_QUICK_HINTS = {
  overview: 'KPI ve grafikler',
  markets: 'Pazar kaydı ve düzenleme',
  schema: 'Izgara veya serbest tuval',
  vendors: 'Tezgâh–esnaf eşlemesi',
  officers: 'Zabıta kullanıcıları ve atama',
}

function normalizeLayoutResponse(api) {
  return { revision: Number(api?.revision || 0), layout: normalizeLayout(api?.layout) }
}

function layoutToEditorCanvas(layout) {
  const normalized = normalizeLayout(layout)
  return { version: 1, width: normalized.width, height: normalized.height, elements: normalized.nodes }
}

function editorCanvasToLayout(canvasDraft) {
  const width = Number(canvasDraft?.width) || 720
  const height = Number(canvasDraft?.height) || 520
  const nodes = Array.isArray(canvasDraft?.elements) ? canvasDraft.elements : []
  return normalizeLayout({ version: 2, width, height, nodes })
}

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value
    let start = 0
    const step = num / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= num) {
        setDisplay(num)
        clearInterval(timer)
      } else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])
  return <>{display.toLocaleString('tr-TR')}</>
}

export default function Dashboard({ user, darkMode, setDarkMode }) {
  const [tab, setTab] = useState('overview')
  const [markets, setMarkets] = useState([])
  const [vendors, setVendors] = useState([])
  const [inspections, setInspections] = useState([])
  const [officers, setOfficers] = useState([])
  const [complaints, setComplaints] = useState([])
  const [officerPick, setOfficerPick] = useState({})
  const [assigningId, setAssigningId] = useState(null)
  const [municipalities, setMunicipalities] = useState([])
  const [openComplaints, setOpenComplaints] = useState(0)
  const [loadErr, setLoadErr] = useState('')
  const [selectedMarketId, setSelectedMarketId] = useState(null)
  const [schemaState, setSchemaState] = useState({ revision: 0, layout: normalizeLayout(null) })
  const [canvasSaving, setCanvasSaving] = useState(false)
  const [editingStall, setEditingStall] = useState(null)
  const [schemaToolsRev, setSchemaToolsRev] = useState(0)
  const [customToolDraft, setCustomToolDraft] = useState({ id: '', label: '', icon: 'widgets' })
  const mergedSchemaTools = useMemo(() => {
    void schemaToolsRev
    return getMergedSchemaTools()
  }, [schemaToolsRev])
  const [newMarket, setNewMarket] = useState({
    municipalityId: null,
    name: '',
    city: 'Malatya',
    district: '',
    type: 'Semt Pazarı',
    vendorCount: 100,
    openingDays: '3,5',
    hours: '07:00-17:00',
    latitude: 38.35,
    longitude: 38.31,
    address: '',
    image: '',
  })

  const refreshAll = useCallback(async () => {
    setLoadErr('')
    try {
      const [m, v, ins, mun, o, comp] = await Promise.all([
        fetchMarkets(''),
        fetchAdminVendors(),
        fetchAdminInspections(),
        fetchAdminMunicipalities(),
        fetchAdminOfficers(),
        fetchAdminComplaints(),
      ])
      const ml = Array.isArray(m) ? m : []
      setMarkets(ml)
      setVendors(Array.isArray(v) ? v : [])
      setInspections(Array.isArray(ins) ? ins : [])
      setMunicipalities(Array.isArray(mun) ? mun : [])
      setOfficers(Array.isArray(o) ? o : [])
      setComplaints(Array.isArray(comp) ? comp : [])
      const open = (Array.isArray(comp) ? comp : []).filter((c) =>
        ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)
      ).length
      setOpenComplaints(open)
      if (Array.isArray(mun) && mun.length) {
        setNewMarket((nm) => (nm.municipalityId == null ? { ...nm, municipalityId: mun[0].id } : nm))
      }
    } catch (e) {
      setLoadErr(String(e.message || e))
    }
  }, [])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const loadSchema = useCallback(async (marketId) => {
    if (marketId == null) return
    try {
      const raw = await fetchMarketLayout(marketId)
      setSchemaState(normalizeLayoutResponse(raw))
    } catch (e) {
      setLoadErr(String(e.message || e))
      setSchemaState({ revision: 0, layout: normalizeLayout(null) })
    }
  }, [])

  useEffect(() => {
    if (selectedMarketId == null && markets.length) {
      setSelectedMarketId(markets[0].id)
    }
  }, [markets, selectedMarketId])

  useEffect(() => {
    if (selectedMarketId != null) loadSchema(selectedMarketId)
  }, [selectedMarketId, loadSchema])

  const handleMarketChange = (id) => {
    const mId = Number(id)
    setSelectedMarketId(mId)
  }

  const handleAssignVendor = async (vendorId) => {
    if (!editingStall) return
    if (selectedMarketId == null) return
    const nextNodes = schemaState.layout.nodes.map((node) => {
      if (node.id !== editingStall.id || node.kind !== 'stall') return node
      const v = vendorId == null ? null : vendors.find((x) => x.id === vendorId)
      const fallbackCode =
        v?.stallCode != null && String(v.stallCode).trim() !== ''
          ? String(v.stallCode)
          : editingStall.stallCode || node.stallCode
      return {
        ...node,
        vendorId: vendorId == null ? null : vendorId,
        stallCode: fallbackCode || null,
      }
    })
    try {
      await postAdminMarketLayout(
        selectedMarketId,
        toBackendLayoutPayload({ ...schemaState.layout, nodes: nextNodes }),
        schemaState.revision,
      )
      await loadSchema(selectedMarketId)
      await refreshAll()
    } catch (e) {
      alert(String(e.message || e))
    }
    setEditingStall(null)
  }

  const handleSaveCanvas = async (nextCanvas) => {
    if (selectedMarketId == null) return
    setCanvasSaving(true)
    try {
      const nextLayout = editorCanvasToLayout(nextCanvas)
      await postAdminMarketLayout(selectedMarketId, toBackendLayoutPayload(nextLayout), schemaState.revision)
      await loadSchema(selectedMarketId)
      alert('Yerleşim kaydedildi.')
    } catch (e) {
      alert(String(e.message || e))
    } finally {
      setCanvasSaving(false)
    }
  }

  const saveNewMarket = async () => {
    if (!newMarket.name || !newMarket.municipalityId) {
      alert('Belediye ve pazar adı zorunludur.')
      return
    }
    try {
      await postAdminMarket({
        municipalityId: newMarket.municipalityId,
        name: newMarket.name,
        city: newMarket.city,
        district: newMarket.district || newMarket.city,
        latitude: Number(newMarket.latitude) || 0,
        longitude: Number(newMarket.longitude) || 0,
        openingDays: newMarket.openingDays || '1,2,3,4,5',
        hours: newMarket.hours || '07:00-17:00',
        vendorCount: Number(newMarket.vendorCount) || 0,
        type: newMarket.type || 'Semt Pazarı',
        address: newMarket.address || '',
        image: newMarket.image || '/market_1_1777411006018.png',
      })
      await refreshAll()
      setNewMarket((nm) => ({
        ...nm,
        name: '',
        district: '',
      }))
      alert('Pazar oluşturuldu.')
    } catch (e) {
      alert(String(e.message || e))
    }
  }

  const assignComplaint = async (complaintId, officerUserId) => {
    if (!officerUserId) return
    setAssigningId(complaintId)
    try {
      await postAdminAssignment(complaintId, Number(officerUserId))
      await refreshAll()
    } catch (e) {
      alert(String(e.message || e))
    } finally {
      setAssigningId(null)
    }
  }

  const tabItems = [
    { key: 'overview', label: 'Genel Bakış', icon: 'analytics' },
    { key: 'markets', label: 'Pazarlar', icon: 'storefront' },
    { key: 'schema', label: 'Şema Çizici', icon: 'grid_on' },
    { key: 'vendors', label: 'Esnaflar', icon: 'groups' },
    { key: 'officers', label: 'Zabıta', icon: 'shield_person' },
  ]

  const adminQuickNavItems = tabItems.map((t) => ({
    key: t.key,
    label: t.label,
    hint: ADMIN_QUICK_HINTS[t.key] || '',
    icon: t.icon,
    onClick: () => setTab(t.key),
  }))

  const vendorsOnMarket = vendors.filter((v) => v.marketId === selectedMarketId)
  const topVendors = [...vendors].slice(0, 5)

  return (
    <RolePanelLayout
      variant="yonetici"
      title="Yönetici — belediye sistemi"
      subtitle={`Sistem geneli yapılandırma ve denetim. Hoş geldiniz, ${user?.name || 'Yönetici'}.`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[
        { label: 'Pazar', value: markets.length },
        { label: 'Açık şikayet', value: openComplaints },
      ]}
    >
      <RoleMissionCards heading="Sistem — görevleriniz" missions={ADMIN_MISSIONS} />
      <RolePanelQuickNav title="Panel bölümleri" activeKey={tab} items={adminQuickNavItems} />

      <div className="detail-tabs" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        {tabItems.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name={t.icon} size={18} /> {t.label}
          </button>
        ))}
      </div>

      <div className="dashboard" style={{ padding: '20px 24px' }}>
        {loadErr && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 12,
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {loadErr}
          </div>
        )}

        {tab === 'overview' && (
          <>
            <div className="stats-grid">
              {[
                { val: markets.length, label: 'Toplam Pazar', change: 'API', dir: 'up', gradient: 'linear-gradient(135deg,#00a651,#007a3d)' },
                { val: vendors.length, label: 'Kayıtlı Esnaf', change: 'API', dir: 'up', gradient: 'linear-gradient(135deg,#10b981,#0ea5e9)' },
                { val: 0, label: 'Aktif kullanıcı', change: 'Yakında', dir: 'up', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
                { val: openComplaints, label: 'Açık Şikâyet', change: 'API', dir: 'down', gradient: 'linear-gradient(135deg,#64748b,#475569)' },
              ].map((s, i) => (
                <div key={i} className="stat-card-gradient" style={{ background: s.gradient }}>
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 900 }}>
                    <AnimatedNumber value={s.val} />
                  </div>
                  <div className="stat-label" style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255,255,255,0.2)',
                      width: 'max-content',
                    }}
                  >
                    {s.change}
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-card">
              <h3>Haftalık fiyat gözlem sayısı</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Özet grafik (örnek veri).</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '16px 0' }}>
                {[35, 52, 41, 68, 55, 72, 48].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{v}</span>
                    <div
                      style={{
                        width: '100%',
                        height: `${v * 1.8}px`,
                        background: 'linear-gradient(180deg,var(--accent),var(--accent-2))',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.5s',
                        boxShadow: '0 2px 8px rgba(51,161,201,0.22)',
                      }}
                    />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <h3>Kayıtlı esnaflar</h3>
              {topVendors.map((v, i) => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1rem', width: 30, textAlign: 'center', fontWeight: 900, color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontWeight: 700 }}>{v.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.marketName || '-'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'schema' && markets.length === 0 && (
          <p style={{ color: 'var(--text-muted)', padding: 24 }}>Önce API üzerinden pazar verisi yüklenmeli veya yeni pazar oluşturulmalıdır.</p>
        )}
        {tab === 'schema' && markets.length > 0 && selectedMarketId != null && (
          <div className="panel-section" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: '12px' }}>
              <h3>Pazar şeması</h3>
              <select
                value={selectedMarketId}
                onChange={(e) => handleMarketChange(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                }}
              >
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid-toolbar schema-admin-toolbar">
              {mergedSchemaTools.map((tool) => (
                <span key={tool.id} className="tool-btn active" title={tool.label}>
                  <Icon name={tool.icon} size={16} />
                  {tool.label}
                </span>
              ))}
            </div>
            <div className="schema-custom-tool-row">
              <span className="schema-custom-tool-hint">Özel hücre tipi (API ile kaydedilir; anahtar max 32 karakter):</span>
              <input
                type="text"
                placeholder="tip_anahtari"
                value={customToolDraft.id}
                onChange={(e) => setCustomToolDraft((d) => ({ ...d, id: e.target.value }))}
                className="schema-custom-input"
              />
              <input
                type="text"
                placeholder="Görünen ad"
                value={customToolDraft.label}
                onChange={(e) => setCustomToolDraft((d) => ({ ...d, label: e.target.value }))}
                className="schema-custom-input"
              />
              <input
                type="text"
                placeholder="Material ikon"
                value={customToolDraft.icon}
                onChange={(e) => setCustomToolDraft((d) => ({ ...d, icon: e.target.value }))}
                className="schema-custom-input"
              />
              <button
                type="button"
                className="tool-btn"
                onClick={() => {
                  try {
                    addMergedSchemaTool(customToolDraft)
                    setSchemaToolsRev((x) => x + 1)
                    setCustomToolDraft({ id: '', label: '', icon: 'widgets' })
                  } catch (err) {
                    alert(String(err.message || err))
                  }
                }}
              >
                Listeye ekle
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '16px 0', fontSize: '0.85rem', padding: '0 24px' }}>
              Tek layout modeli kullanılır. Burada yaptığınız değişiklik aynı veriyle hem 2D hem 3D görünümde çalışır.
            </p>
            <SchemaCanvasEditor
              canvas={layoutToEditorCanvas(schemaState.layout)}
              selectedMarketId={selectedMarketId}
              saving={canvasSaving}
              vendorsOnMarket={vendorsOnMarket}
              onSave={(draft) => void handleSaveCanvas(draft)}
              onRequestEditStall={(el) =>
                setEditingStall({
                  id: el.id,
                  stallCode: el.stallCode || '',
                  vendorId: el.vendorId ?? null,
                })
              }
            />
          </div>
        )}

        {tab === 'markets' && (
          <div className="panel-section">
            <h3>Yeni pazar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Belediye</label>
              <select
                value={newMarket.municipalityId ?? ''}
                onChange={(e) => setNewMarket({ ...newMarket, municipalityId: Number(e.target.value) })}
                style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
              >
                {municipalities.map((mu) => (
                  <option key={mu.id} value={mu.id}>
                    {mu.name}
                  </option>
                ))}
              </select>
              <input type="text" className="search-input" placeholder="Pazar adı" value={newMarket.name} onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })} />
              <input type="text" className="search-input" placeholder="İl" value={newMarket.city} onChange={(e) => setNewMarket({ ...newMarket, city: e.target.value })} />
              <input type="text" className="search-input" placeholder="İlçe" value={newMarket.district} onChange={(e) => setNewMarket({ ...newMarket, district: e.target.value })} />
              <input type="text" className="search-input" placeholder="Açılış günleri (örn. 2,5 veya 3)" value={newMarket.openingDays} onChange={(e) => setNewMarket({ ...newMarket, openingDays: e.target.value })} />
              <input type="text" className="search-input" placeholder="Saatler (örn. 07:00-17:00)" value={newMarket.hours} onChange={(e) => setNewMarket({ ...newMarket, hours: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input type="number" className="search-input" placeholder="Enlem" value={newMarket.latitude} onChange={(e) => setNewMarket({ ...newMarket, latitude: e.target.value })} />
                <input type="number" className="search-input" placeholder="Boylam" value={newMarket.longitude} onChange={(e) => setNewMarket({ ...newMarket, longitude: e.target.value })} />
              </div>
              <input type="number" className="search-input" placeholder="Esnaf kapasitesi" value={newMarket.vendorCount} onChange={(e) => setNewMarket({ ...newMarket, vendorCount: e.target.value })} />
              <input type="text" className="search-input" placeholder="Tür (örn. Semt Pazarı)" value={newMarket.type} onChange={(e) => setNewMarket({ ...newMarket, type: e.target.value })} />
              <input type="text" className="search-input" placeholder="Adres (isteğe bağlı)" value={newMarket.address} onChange={(e) => setNewMarket({ ...newMarket, address: e.target.value })} />
              <input type="text" className="search-input" placeholder="Görsel yolu (isteğe bağlı)" value={newMarket.image} onChange={(e) => setNewMarket({ ...newMarket, image: e.target.value })} />
              <button type="button" className="btn-v2 btn-primary" onClick={saveNewMarket}>
                Pazarı kaydet
              </button>
            </div>
            <h4 style={{ marginTop: '32px', fontWeight: 800 }}>Mevcut pazarlar</h4>
            {markets.map((m) => (
              <div key={m.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {m.city}/{m.district}
                  </div>
                </div>
                <span className="badge" style={{ background: 'var(--bg-body)', color: 'var(--text-main)' }}>
                  {m.vendorCount}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'vendors' && (
          <div className="panel-section">
            <h3>Esnaflar</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 12 }}>
              Yeni esnaf hesabı kimlik (IAM) ve satıcı kaydı ile oluşturulur; burada tüm tezgâh kayıtlarını görüntüleyebilirsiniz.
            </p>
            <h4 style={{ marginTop: '24px', fontWeight: 800 }}>Sistemdeki esnaflar</h4>
            {vendors.map((v) => (
              <div key={v.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--gradient-accent)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {v.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{v.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {v.marketName} · {v.stallCode}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.id}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'officers' && (
          <div className="panel-section">
            <h3>Zabıta ve şikâyet atama</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 12 }}>
              Admin olarak açık şikayetleri zabıta memurlarına atayabilirsiniz.
            </p>
            <h4 style={{ marginTop: '24px', fontWeight: 800 }}>Açık şikayetler</h4>
            {complaints.length === 0 && (
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Açık şikayet bulunamadı.</p>
            )}
            {complaints.map((c) => (
              <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>#{c.id} · {c.marketName}</div>
                {(c.vendorName || c.stallCode) && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Tezgâh: {c.stallCode || '—'} · {c.vendorName || '—'}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {c.description || 'Açıklama yok'} · {c.status}
                  {c.assignedOfficerName ? ` · ${c.assignedOfficerName}` : ''}
                </div>
                {c.reporterPhone && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    İletişim: {c.reporterPhone}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    value={officerPick[c.id] || ''}
                    onChange={(e) => setOfficerPick({ ...officerPick, [c.id]: e.target.value })}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontWeight: 600, minWidth: 180 }}
                  >
                    <option value="" disabled>Zabıta seçin...</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn-v2 btn-primary" disabled={assigningId != null} onClick={() => assignComplaint(c.id, officerPick[c.id])}>
                    {assigningId === c.id ? '…' : 'Ata'}
                  </button>
                </div>
              </div>
            ))}
            <h4 style={{ marginTop: '24px', fontWeight: 800 }}>Son denetimler</h4>
            {inspections.map((i) => (
              <div key={i.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{i.inspector}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {i.marketName} · {i.date}
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: i.status === 'completed' ? 'var(--success-bg)' : i.status === 'violation' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                    color: i.status === 'completed' ? 'var(--success)' : i.status === 'violation' ? 'var(--danger)' : 'var(--warning)',
                  }}
                >
                  {i.status === 'completed' ? 'Tamamlandı' : i.status === 'violation' ? 'İhlal' : 'Beklemede'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingStall && (
        <div className="bottom-sheet-overlay" onClick={() => setEditingStall(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bs-handle" />
            <h2 style={{ fontWeight: 900, fontSize: '1.3rem' }}>Tezgah ataması: {editingStall.stallCode}</h2>
            <p style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bu pazardaki ({markets.find((x) => x.id === selectedMarketId)?.name || '—'}) esnafı seçin.</p>
            <div style={{ maxHeight: '40vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
              <div
                role="presentation"
                className={`stall-product-item ${!editingStall.vendorId ? 'selected' : ''}`}
                onClick={() => handleAssignVendor(null)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${!editingStall.vendorId ? 'var(--danger)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>[Tezgahı boşalt]</span>
              </div>
              {vendorsOnMarket.map((v) => (
                <div
                  key={v.id}
                  role="presentation"
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${editingStall.vendorId === v.id ? 'var(--accent)' : 'var(--border)'}`,
                    background: editingStall.vendorId === v.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => handleAssignVendor(v.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge">Esnaf</span>
                    <span style={{ fontWeight: 700 }}>{v.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tezgah ataması</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </RolePanelLayout>
  )
}
