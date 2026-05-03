import { useEffect, useState } from 'react'
import {
  fetchChiefWorkload,
  fetchChiefOfficers,
  fetchChiefComplaints,
  postChiefAssignment,
} from '../api/pazarApi'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'
import RolePanelQuickNav from './RolePanelQuickNav.jsx'
import Icon from './Icon.jsx'

const CHIEF_MISSIONS = [
  { icon: 'assignment_ind', title: 'Şikâyet atama', desc: 'Havuzdaki açık kayıtları sahadaki zabıta personeline yönlendirin.' },
  { icon: 'groups', title: 'Ekip görünümü', desc: 'Bağlı personel sayısı ve açık iş yükünü tek ekranda izleyin.' },
  { icon: 'monitoring', title: 'Operasyonel özet', desc: 'Belediye şikâyet hattından gelen yoğunluğu yönetin.' },
]

const chiefTabs = [
  { key: 'ozet', label: 'Özet', icon: 'dashboard' },
  { key: 'atamalar', label: 'Atamalar', icon: 'assignment_ind' },
  { key: 'ekip', label: 'Ekip', icon: 'groups' },
]

export default function ChiefPanel({ user, darkMode, setDarkMode }) {
  const [section, setSection] = useState('ozet')
  const [workload, setWorkload] = useState({ officerCount: 0, openComplaints: 0 })
  const [officers, setOfficers] = useState([])
  const [complaints, setComplaints] = useState([])
  const [err, setErr] = useState('')
  const [assigningId, setAssigningId] = useState(null)
  const [officerPick, setOfficerPick] = useState({})

  const load = async () => {
    setErr('')
    try {
      const [w, o, c] = await Promise.all([fetchChiefWorkload(), fetchChiefOfficers(), fetchChiefComplaints()])
      setWorkload(w || {})
      setOfficers(Array.isArray(o) ? o : [])
      setComplaints(Array.isArray(c) ? c : [])
    } catch (e) {
      setErr(String(e.message || e))
    }
  }

  useEffect(() => { load() }, [])

  const assign = async (complaintId, officerUserId) => {
    if (!officerUserId) return
    setAssigningId(complaintId)
    try {
      await postChiefAssignment(complaintId, Number(officerUserId))
      await load()
    } catch (e) {
      alert(String(e.message || e))
    } finally {
      setAssigningId(null)
    }
  }

  const quickNavItems = chiefTabs.map((t) => ({
    key: t.key,
    label: t.label,
    hint:
      t.key === 'ozet'
        ? 'İş yükü ve rakamlar'
        : t.key === 'atamalar'
          ? 'Şikâyeti personele ver'
          : 'Zabıta personeli listesi',
    icon: t.icon,
    onClick: () => setSection(t.key),
  }))

  return (
    <RolePanelLayout
      variant="mudur"
      title="Zabıta müdürlüğü — ekip yönetimi"
      subtitle={`Ekip ve atamalar — ${user?.name || 'Müdür'}`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[
        { label: 'Zabıta personeli', value: workload.officerCount || 0 },
        { label: 'Açık şikayet', value: workload.openComplaints || 0 },
      ]}
    >
      <RoleMissionCards heading="Ekip koordinasyonu — sorumluluklarınız" missions={CHIEF_MISSIONS} />
      <RolePanelQuickNav title="Modüller" activeKey={section} items={quickNavItems} />
      <div className="detail-tabs" style={{ marginBottom: 16 }}>
        {chiefTabs.map((t) => (
          <button key={t.key} type="button" className={section === t.key ? 'active' : ''} onClick={() => setSection(t.key)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>
      {err && <div className="panel-error">{err}</div>}

      {section === 'ozet' && (
        <section className="chart-card">
          <h3>Operasyon özeti</h3>
          <p className="muted">
            Bağlı zabıta sayısı: <strong>{workload.officerCount ?? 0}</strong> · Havuzdaki açık şikâyet:{' '}
            <strong>{workload.openComplaints ?? 0}</strong>
          </p>
          <p className="muted">Şikâyetleri personele dağıtmak için &quot;Atamalar&quot; sekmesini kullanın.</p>
          <button type="button" className="btn-v2 btn-primary" onClick={load}>
            Verileri yenile
          </button>
        </section>
      )}

      {section === 'atamalar' && (
        <section className="chart-card">
          <h3>Şikâyet havuzu ve atama</h3>
          <p className="muted">Açık kayıtları ekipteki zabıta personeline yönlendirin.</p>
          {complaints.length === 0 && <p className="muted">Atanacak açık şikayet yok.</p>}
          {complaints.map((c) => (
            <div key={c.id} className="panel-row">
              <div className="panel-row-title">
                #{c.id} · {c.marketName || `Pazar ${c.marketId}`}
              </div>
              {(c.vendorName || c.stallCode) && (
                <div className="panel-row-desc">
                  Tezgâh: {c.stallCode || '—'} · {c.vendorName || '—'}
                </div>
              )}
              <div className="panel-row-desc">
                {c.description || 'Açıklama yok'} · {c.status}
                {c.assignedOfficerName ? ` · ${c.assignedOfficerName}` : ''}
              </div>
              {c.reporterPhone && <div className="panel-row-desc">İletişim: {c.reporterPhone}</div>}
              <div className="panel-actions">
                <select
                  value={officerPick[c.id] || ''}
                  onChange={(e) => setOfficerPick({ ...officerPick, [c.id]: e.target.value })}
                  className="pazar-listesi-select"
                >
                  <option value="" disabled>
                    Zabıta seçin
                  </option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-v2 btn-primary"
                  onClick={() => assign(c.id, officerPick[c.id])}
                  disabled={assigningId != null}
                >
                  {assigningId === c.id ? 'İşleniyor...' : 'Ata'}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {section === 'ekip' && (
        <section className="chart-card">
          <h3>Zabıta personeli</h3>
          <p className="muted">Sistemde kayıtlı memurlar (API).</p>
          {officers.length === 0 && <p className="muted">Personel listesi boş veya yüklenemedi.</p>}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {officers.map((o) => (
              <li
                key={o.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontWeight: 800 }}>{o.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.email || '—'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" className="btn-v2" onClick={load}>
        Yenile
      </button>
    </RolePanelLayout>
  )
}

