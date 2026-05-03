import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import RolePanelLayout from './layout/RolePanelLayout.jsx'
import {
  fetchVendorMe,
  fetchVendorProducts,
  fetchProducts,
  fetchMarketPrices,
  postVendorProduct,
  patchVendorProductPublish,
  fetchVendorInvoices,
  postVendorInvoice,
  patchVendorInvoiceLines,
} from '../api/pazarApi'
import Icon from './Icon.jsx'
import RoleMissionCards from './RoleMissionCards.jsx'
import RolePanelQuickNav from './RolePanelQuickNav.jsx'
import { getProductIconName } from '../utils/productIcon.js'

const ESNAF_MISSIONS = [
  { icon: 'payments', title: 'Birim fiyat', desc: 'Ürünlerinize göre tezgâh fiyatlarını girin ve yayına alın.' },
  { icon: 'receipt_long', title: 'Hal fişi', desc: 'Fiş yükleyin; satırları düzenleyerek kayıtlı tutun.' },
  { icon: 'photo_camera', title: 'Tezgâh görünürlüğü', desc: 'Tezgâh fotoğrafınızı güncelleyerek vatandaş haritasında görünün.' },
  { icon: 'storefront', title: 'Pazar özeti', desc: 'Bağlı olduğunuz pazarın genel fiyat seviyelerini takip edin.' },
]

const SECTION_TO_TAB = {
  ozet: 'overview',
  fiyatlar: 'prices',
  'hal-fisi': 'invoice',
  tezgah: 'stall',
}

const STALL_IMAGE_KEY = 'pazar_stall_photo_v1'

function getStallImage(vendorId) {
  try {
    const raw = localStorage.getItem(STALL_IMAGE_KEY)
    if (!raw) return ''
    const map = JSON.parse(raw)
    return map?.[String(vendorId)] || ''
  } catch {
    return ''
  }
}

function setStallImage(vendorId, dataUrl) {
  try {
    const raw = localStorage.getItem(STALL_IMAGE_KEY)
    const map = raw ? JSON.parse(raw) : {}
    map[String(vendorId)] = dataUrl
    localStorage.setItem(STALL_IMAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

export default function EsnafPanel({ user, darkMode, setDarkMode }) {
  const { section } = useParams()
  const tab = section ? SECTION_TO_TAB[section] : undefined

  const [me, setMe] = useState(null)
  const [vendorProducts, setVendorProducts] = useState([])
  const [catalog, setCatalog] = useState([])
  const [marketPrices, setMarketPrices] = useState([])
  const [myPrices, setMyPrices] = useState({})
  const [invoices, setInvoices] = useState([])
  const [lineEdits, setLineEdits] = useState({})
  const [stallImage, setStallImagePreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const myProducts = useMemo(
    () =>
      vendorProducts
        .map((vp) => {
          const p = catalog.find((x) => x.id === vp.productId)
          return p ? { ...p, vpId: vp.id, unitPrice: vp.unitPrice, published: vp.published } : null
        })
        .filter(Boolean),
    [vendorProducts, catalog],
  )

  async function loadCore() {
    setErr('')
    try {
      const [m, vp, pr] = await Promise.all([fetchVendorMe(), fetchVendorProducts(), fetchProducts()])
      setMe(m)
      setVendorProducts(Array.isArray(vp) ? vp : [])
      setCatalog(Array.isArray(pr) ? pr : [])
      setStallImagePreview(getStallImage(m?.id))
      if (m?.marketId) {
        const prices = await fetchMarketPrices(m.marketId)
        setMarketPrices(Array.isArray(prices) ? prices : [])
      }
    } catch (e) {
      setErr(String(e.message || e))
    }
  }

  async function loadInvoices() {
    try {
      const list = await fetchVendorInvoices()
      setInvoices(Array.isArray(list) ? list : [])
    } catch {
      setInvoices([])
    }
  }

  useEffect(() => {
    loadCore()
  }, [])

  useEffect(() => {
    if (tab === 'invoice') loadInvoices()
  }, [tab])

  async function savePrices() {
    setBusy(true)
    try {
      for (const row of myProducts) {
        const raw = myPrices[row.id]
        if (raw === undefined || raw === '') continue
        const unitPrice = Number(String(raw).replace(',', '.'))
        if (Number.isNaN(unitPrice)) continue
        await postVendorProduct(row.id, unitPrice)
      }
      await loadCore()
      alert('Fiyatlar kaydedildi.')
    } catch (e) {
      alert(String(e.message || e))
    } finally {
      setBusy(false)
    }
  }

  async function publishRow(vpId, published) {
    try {
      await patchVendorProductPublish(vpId, published)
      await loadCore()
    } catch (e) {
      alert(String(e.message || e))
    }
  }

  async function onInvoiceFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      await postVendorInvoice(file)
      await loadInvoices()
      alert('Fiş yüklendi.')
    } catch (error) {
      alert(String(error.message || error))
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  async function saveLines(invoiceId, lines) {
    const updates = lines.map((ln) => {
      const ed = lineEdits[ln.id] || {}
      return {
        lineId: ln.id,
        productId: ed.productId != null ? Number(ed.productId) : ln.productId,
        quantity: ed.quantity != null ? Number(ed.quantity) : ln.quantity,
        unitPrice: ed.unitPrice != null ? Number(ed.unitPrice) : ln.unitPrice,
      }
    })
    setBusy(true)
    try {
      await patchVendorInvoiceLines(invoiceId, updates)
      await loadInvoices()
      setLineEdits({})
      alert('Satırlar güncellendi.')
    } catch (e) {
      alert(String(e.message || e))
    } finally {
      setBusy(false)
    }
  }

  function handleStallPhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file || !me?.id) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result || '')
      if (!dataUrl) return
      setStallImagePreview(dataUrl)
      setStallImage(me.id, dataUrl)
      alert('Tezgah fotoğrafı kaydedildi.')
    }
    reader.readAsDataURL(file)
  }

  if (!me && !err) {
    return (
      <div className="detail-page" style={{ padding: 40 }}>
        <p>Yükleniyor...</p>
      </div>
    )
  }

  if (!section || !tab) {
    return <Navigate to="/panel/esnaf/ozet" replace />
  }

  const quickNavItems = [
    { key: 'overview', label: 'Genel', hint: 'Özet ve veri yenileme', icon: 'home', to: '/panel/esnaf/ozet' },
    { key: 'prices', label: 'Fiyatlar', hint: 'Birim fiyat ve yayın', icon: 'payments', to: '/panel/esnaf/fiyatlar' },
    { key: 'invoice', label: 'Hal fişi', hint: 'Fiş yükle ve satırları düzenle', icon: 'receipt_long', to: '/panel/esnaf/hal-fisi' },
    { key: 'stall', label: 'Tezgâh', hint: 'Tezgâh fotoğrafı', icon: 'photo_camera', to: '/panel/esnaf/tezgah' },
  ]

  return (
    <RolePanelLayout
      variant="esnaf"
      title="Esnaf merkezi"
      subtitle={`${me?.name || user?.name || 'Esnaf'} · Tezgâh ${me?.stall || '-'} · ${me?.marketName || '-'}`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      stats={[
        { label: 'Ürün', value: myProducts.length },
        { label: 'Yayında', value: myProducts.filter((x) => x.published).length },
      ]}
    >
      <RoleMissionCards heading="Fiyat ve tezgâh — görevleriniz" missions={ESNAF_MISSIONS} />
      <RolePanelQuickNav title="Sayfalar" activeKey={tab} items={quickNavItems} />

      <div style={{ paddingTop: 16 }}>
        {err && (
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 700, marginBottom: 16 }}>
            {err}
          </div>
        )}

        {tab === 'overview' && (
          <div className="chart-card">
            <h3 style={{ fontWeight: 900, marginBottom: 12 }}>Panel özeti</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Sol üstteki kartlarla <strong>Genel</strong>, <strong>Fiyatlar</strong>, <strong>Hal fişi</strong> ve <strong>Tezgâh</strong> sayfalarına geçin; her biri kendi URL’sinde açılır.
            </p>
            <button type="button" className="btn-v2 btn-primary" onClick={loadCore} disabled={busy}>
              Verileri yenile
            </button>
          </div>
        )}

        {tab === 'prices' && (
          <div>
            <h3 style={{ fontWeight: 900, marginBottom: 16 }}>Fiyat güncelleme</h3>
            {myProducts.map((p) => {
              const priceData = marketPrices.find((pr) => pr.id === p.id)
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="product-abbr product-abbr--sm" aria-hidden>
                        <Icon name={getProductIconName(p)} size={20} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 800 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Piyasa medyan: ₺{priceData?.medianPrice ?? '?'} / {p.unit}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      placeholder={String(p.unitPrice ?? '')}
                      value={myPrices[p.id] ?? ''}
                      onChange={(e) => setMyPrices({ ...myPrices, [p.id]: e.target.value })}
                      style={{ flex: 1, minWidth: 120, padding: 12, borderRadius: 'var(--radius-md)', border: '2px solid var(--border)', fontSize: '1rem', fontWeight: 700, background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>₺/{p.unit}</span>
                    <button type="button" className="btn-v2" onClick={() => publishRow(p.vpId, !p.published)}>
                      {p.published ? 'Yayından kaldır' : 'Yayınla'}
                    </button>
                  </div>
                </div>
              )
            })}
            <button type="button" className="btn-v2 btn-primary" onClick={savePrices} disabled={busy}>
              Fiyatları kaydet
            </button>
          </div>
        )}

        {tab === 'invoice' && (
          <div>
            <h3 style={{ fontWeight: 900, marginBottom: 12 }}>Hal fişi yükleme</h3>
            <input type="file" accept="image/*,.pdf" onChange={onInvoiceFile} disabled={busy} style={{ marginBottom: 20 }} />
            {invoices.map((inv) => (
              <div key={inv.id} className="glass-panel" style={{ padding: 16, borderRadius: 'var(--radius-lg)', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>
                  Fiş #{inv.id} · {inv.status} · OCR: {inv.ocrJobStatus || '-'}
                </div>
                {(inv.lines || []).length === 0 && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Satır yok veya OCR bekleniyor.</p>
                )}
                {(inv.lines || []).map((ln) => (
                  <div key={ln.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10, fontSize: '0.85rem' }}>
                    <label>
                      Ürün
                      <select
                        value={lineEdits[ln.id]?.productId ?? ln.productId ?? ''}
                        onChange={(e) => setLineEdits({ ...lineEdits, [ln.id]: { ...lineEdits[ln.id], productId: e.target.value } })}
                        style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}
                      >
                        <option value="">-</option>
                        {catalog.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Miktar
                      <input
                        type="number"
                        defaultValue={ln.quantity}
                        onChange={(e) => setLineEdits({ ...lineEdits, [ln.id]: { ...lineEdits[ln.id], quantity: e.target.value } })}
                        style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}
                      />
                    </label>
                    <label style={{ gridColumn: '1 / -1' }}>
                      Birim fiyat
                      <input
                        type="number"
                        defaultValue={ln.unitPrice}
                        onChange={(e) => setLineEdits({ ...lineEdits, [ln.id]: { ...lineEdits[ln.id], unitPrice: e.target.value } })}
                        style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}
                      />
                    </label>
                  </div>
                ))}
                {(inv.lines || []).length > 0 && (
                  <button type="button" className="btn-v2 btn-primary" disabled={busy} onClick={() => saveLines(inv.id, inv.lines)}>
                    Satırları kaydet
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'stall' && (
          <div>
            <h3 style={{ fontWeight: 900, marginBottom: 16 }}>Tezgah fotoğrafı</h3>
            <div className="glass-panel" style={{ padding: 20, borderRadius: 'var(--radius-xl)', marginBottom: 16 }}>
              <div style={{ marginBottom: 12, fontWeight: 700 }}>
                Tezgah: {me?.stall || '-'} · Pazar: {me?.marketName || '-'}
              </div>
              <input type="file" accept="image/*" onChange={handleStallPhotoChange} />
              {stallImage && (
                <div style={{ marginTop: 14 }}>
                  <img
                    src={stallImage}
                    alt="Tezgah fotoğrafı"
                    style={{ width: '100%', maxWidth: 420, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RolePanelLayout>
  )
}
