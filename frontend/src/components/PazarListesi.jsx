import { useState, useMemo, useCallback, useEffect } from 'react'
import { products as defaultProducts, markets as defaultMarkets, getMarketPrices, vendors } from '../data/markets'
import { localAiOptimizeBudget } from '../data/offlineDataset.js'
import { exportShoppingListImage } from '../utils/listExport'
import { getProductIconName } from '../utils/productIcon.js'
import Icon from './Icon.jsx'

export default function PazarListesi({
  isOpen,
  onToggle,
  city,
  selectedItems,
  setSelectedItems,
  catalogMarkets,
  catalogProducts,
  onNavigateToMarketSchema,
  miniMode = false,
  miniMarketId = null,
  onSelectStall,
}) {
  const products = catalogProducts && catalogProducts.length ? catalogProducts : defaultProducts
  const markets = catalogMarkets && catalogMarkets.length ? catalogMarkets : defaultMarkets
  const [step, setStep] = useState('pick')
  const [search, setSearch] = useState('')
  const [listFilter, setListFilter] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [expandedProduct, setExpandedProduct] = useState(null)
  const [viewMode, setViewMode] = useState('all')
  const [selectedMarketId, setSelectedMarketId] = useState(null)
  const [schemaMarketId, setSchemaMarketId] = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  const [budgetInput, setBudgetInput] = useState('')
  /** Bütçe önerisinde dikkate alınacak pazarlar (çoğul); seçilenler arasında ürün başına en ucuz medyan */
  const [aiMarketIds, setAiMarketIds] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [budgetDraftItems, setBudgetDraftItems] = useState([])
  /** Bütçe sekmesinde pazar çoklu seçimi — tek satırda tıklayınca panel açılır */
  const [budgetMarketsOpen, setBudgetMarketsOpen] = useState(false)

  const [exporting, setExporting] = useState(false)
  const [expandedVendorItem, setExpandedVendorItem] = useState(null)

  const categories = ['Tümü', 'Sebze', 'Meyve', 'Süt Ürünü', 'Diğer']

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subtypes && p.subtypes.some((s) => s.toLowerCase().includes(search.toLowerCase())))
    const matchCat = activeCategory === 'Tümü' || p.category === activeCategory
    return matchSearch && matchCat
  })

  const cityMarkets = useMemo(() => {
    let mks = markets.filter((m) => m.city === city)
    
    // Ensure current market is included in miniMode even if city differs
    if (miniMode && miniMarketId) {
      const currentMarket = markets.find((m) => m.id === miniMarketId)
      if (currentMarket && !mks.some((m) => m.id === miniMarketId)) {
        mks = [...mks, currentMarket]
      }
    }

    return mks
      .map((m) => {
        const prices = getMarketPrices(m.id)
        let total = 0
        const itemPrices = selectedItems.map((item) => {
          const p = prices.find((pr) => pr.id === item.productId)
          const subtypeMultiplier =
            item.name !== item.parentName ? 1 + (((item.name.length * 7) % 20) - 10) / 100 : 1
          let price = p ? (parseFloat(p.medianPrice) * subtypeMultiplier).toFixed(1) : '?'
          
          // Use vendor price if selected for this market in miniMode
          if (miniMode && m.id === miniMarketId && item.selectedVendor && item.selectedVendor.price) {
            price = item.selectedVendor.price
          }
          
          const lineTotal = price !== '?' ? parseFloat(price) * item.qty : 0
          total += lineTotal
          return { ...item, price, lineTotal: lineTotal.toFixed(2) }
        })
        return { ...m, itemPrices, total: total.toFixed(2) }
      })
      .sort((a, b) => parseFloat(a.total) - parseFloat(b.total))
  }, [selectedItems, city, markets, miniMode, miniMarketId])

  const cheapestMarket = cityMarkets[0]

  const cityMarketIdsKey = useMemo(
    () =>
      cityMarkets
        .map((m) => m.id)
        .sort((a, b) => a - b)
        .join(','),
    [cityMarkets],
  )

  useEffect(() => {
    setAiMarketIds(cityMarkets.map((m) => m.id))
  }, [cityMarketIdsKey])

  const toggleItem = (product, subtype) => {
    const key = `${product.id}-${subtype || 'default'}`
    const existing = selectedItems.find((i) => i.key === key)
    if (existing) {
      setSelectedItems(selectedItems.filter((i) => i.key !== key))
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          key,
          productId: product.id,
          name: subtype || product.name,
          parentName: product.name,
          abbr: product.abbr,
          unit: product.unit,
          qty: 1,
          checked: false,
        },
      ])
    }
  }

  const toggleChecked = (key) => {
    setSelectedItems(selectedItems.map((i) => (i.key === key ? { ...i, checked: !i.checked } : i)))
  }

  const updateQty = (key, qty) => {
    setSelectedItems(selectedItems.map((i) => (i.key === key ? { ...i, qty: Math.max(0.5, qty) } : i)))
  }

  const removeItem = (key) => {
    setSelectedItems(selectedItems.filter((i) => i.key !== key))
  }

  const quantitiesMap = useMemo(() => {
    const q = {}
    selectedItems.forEach((i) => {
      q[String(i.productId)] = i.qty
    })
    return q
  }, [selectedItems])

  const productIds = useMemo(() => [...new Set(selectedItems.map((i) => i.productId))], [selectedItems])

  /** Bütçe sekmesinde: birim fiyat × miktar (kg); miktar veya bütçe değişince güncellenir */
  const budgetMarketSummary = useMemo(() => {
    const n = aiMarketIds.length
    const total = cityMarkets.length
    if (total === 0) return 'Bu şehirde pazar yok'
    if (n === 0) return 'Hiçbiri seçili değil — dokun ve seç'
    if (n === total) return `Tümü seçili (${n} pazar)`
    const names = cityMarkets.filter((m) => aiMarketIds.includes(m.id)).map((m) => m.name)
    if (names.length <= 2) return names.join(' · ')
    return `${names.slice(0, 2).join(' · ')} · +${names.length - 2}`
  }, [aiMarketIds, cityMarkets])

  const budgetLiveTotals = useMemo(() => {
    const cap = parseFloat(String(budgetInput).replace(',', '.'))
    let spent = 0
    for (const row of budgetDraftItems) {
      if (!row.keep) continue
      const u = row.unitAtMarket
      const q = Number(row.qty)
      if (u != null && Number.isFinite(u) && Number.isFinite(q) && q > 0) {
        spent += u * q
      }
    }
    spent = Math.round(spent * 100) / 100
    const remaining =
      Number.isFinite(cap) && cap >= 0 ? Math.round((cap - spent) * 100) / 100 : null
    return { spent, remaining }
  }, [budgetDraftItems, budgetInput])

  const filteredSelectedForCompare = useMemo(() => {
    if (!listFilter.trim()) return selectedItems
    const q = listFilter.toLowerCase()
    return selectedItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.parentName && i.parentName.toLowerCase().includes(q)),
    )
  }, [selectedItems, listFilter])

  const runAiOptimize = useCallback(async () => {
    const mids = aiMarketIds.filter((id) => cityMarkets.some((m) => m.id === id))
    if (!mids.length) {
      setAiError('Bütçe için en az bir pazar işaretleyin.')
      return
    }
    const budget = parseFloat(String(budgetInput).replace(',', '.'))
    if (!Number.isFinite(budget) || budget <= 0) {
      setAiError('Geçerli bir bütçe girin.')
      return
    }
    if (!productIds.length) {
      setAiError('Listede ürün bulunmalı.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      const qtyBudgetOne = {}
      productIds.forEach((pid) => {
        qtyBudgetOne[String(pid)] = 1
      })
      const res = localAiOptimizeBudget(mids, budget, productIds, qtyBudgetOne)
      setAiResult(res && typeof res === 'object' ? res : null)
      const lines = Array.isArray(res?.items) ? res.items : []
      const nextDraft = lines.map((row, idx) => {
        const pid = Number(row.productId)
        const catalogRow = products.find((p) => p.id === pid)
        const existing = selectedItems.find((s) => s.productId === pid)
        return {
          id: `${pid || idx}-${idx}`,
          productId: pid || null,
          name: row.productName || catalogRow?.name || `Ürün ${idx + 1}`,
          unit: catalogRow?.unit || existing?.unit || 'ad',
          qty: Math.max(0.5, Number(row.quantity ?? existing?.qty ?? 1) || 1),
          keep: true,
          lineTotal: row.lineTotal != null ? Number(row.lineTotal) : null,
          cheapestMarketName: row.suggestedMarketName || '',
          unitAtMarket:
            row.unitPriceAtBestMarket != null ? Number(row.unitPriceAtBestMarket) : null,
        }
      })
      setBudgetDraftItems(nextDraft)
    } catch {
      setAiError('Sunucuya ulaşılamadı veya hesaplama yapılamadı. Bağlantınızı kontrol edin.')
    } finally {
      setAiLoading(false)
    }
  }, [aiMarketIds, cityMarkets, budgetInput, productIds, products, selectedItems])

  const applyBudgetDraft = useCallback(() => {
    const approved = budgetDraftItems.filter((x) => x.keep && x.productId != null)
    if (!approved.length) {
      alert('Onay için en az bir ürün seçili olmalıdır.')
      return
    }
    const normalized = approved.map((row) => {
      const catalogRow = products.find((p) => p.id === row.productId)
      return {
        key: `${row.productId}-budget`,
        productId: row.productId,
        name: catalogRow?.name || row.name,
        parentName: catalogRow?.name || row.name,
        abbr: catalogRow?.abbr || 'PRD',
        unit: catalogRow?.unit || row.unit || 'ad',
        qty: Math.max(0.5, Number(row.qty) || 1),
        checked: false,
      }
    })
    setSelectedItems(normalized)
    setStep('compare')
  }, [budgetDraftItems, products, setSelectedItems])

  const handleExport = useCallback(async () => {
    const marketForRows =
      viewMode === 'single' && selectedMarketId
        ? cityMarkets.find((m) => m.id === selectedMarketId)
        : cheapestMarket
    const rows = selectedItems.map((item) => {
      const priceInfo = marketForRows?.itemPrices?.find((ip) => ip.key === item.key)
      const left = `${item.name} × ${item.qty} ${item.unit === 'kg' ? 'kg' : 'ad'}`
      const right = priceInfo?.lineTotal != null ? `₺${priceInfo.lineTotal}` : '—'
      return { left, right }
    })
    const totalLine =
      marketForRows?.total != null
        ? `Tahmini toplam (${marketForRows.name}): ₺${marketForRows.total}`
        : ''
    setExporting(true)
    try {
      await exportShoppingListImage({
        title: 'Alışveriş listesi',
        city,
        rows,
        footerLines: totalLine ? [totalLine, `Oluşturulma: ${new Date().toLocaleString('tr-TR')}`] : [`Oluşturulma: ${new Date().toLocaleString('tr-TR')}`],
      })
    } catch (e) {
      alert(e?.message || 'Listeyi görsel olarak kaydederken bir hata oluştu.')
    } finally {
      setExporting(false)
    }
  }, [viewMode, selectedMarketId, cityMarkets, cheapestMarket, selectedItems, city])

  const handleSchemaNavigate = useCallback(() => {
    const mid = schemaMarketId || cheapestMarket?.id
    if (!mid || !productIds.length) return
    if (typeof onNavigateToMarketSchema === 'function') {
      onNavigateToMarketSchema(mid, productIds)
    }
  }, [schemaMarketId, cheapestMarket, productIds, onNavigateToMarketSchema])

  if (!isOpen) return null

  return (
    <aside
      className={`pazar-listesi-sidebar ${collapsed ? 'pazar-listesi-sidebar--collapsed' : ''} ${miniMode ? 'pazar-listesi--mini' : ''}`}
      aria-label="Alışveriş listesi paneli"
    >
      <button
        type="button"
        className="pazar-listesi-collapse"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Paneli genişlet' : 'Paneli daralt'}
      >
        <Icon name={collapsed ? 'chevron_left' : 'chevron_right'} size={18} />
      </button>

      {collapsed ? (
        <div className="pazar-listesi-collapsed-inner">
          <Icon name="shopping_cart" size={22} label="Liste" />
          <span className="pazar-listesi-collapsed-label">Liste ({selectedItems.length})</span>
        </div>
      ) : (
        <>
          <header className="pazar-listesi-header">
            <div>
              <h3 className="pazar-listesi-title">
                <Icon name="shopping_cart" size={22} className="pazar-listesi-title-icon" />
                Alışveriş listesi
              </h3>
              <p className="pazar-listesi-sub">
                {selectedItems.length} ürün · {selectedItems.filter((i) => i.checked).length} tamamlandı
              </p>
            </div>
            {miniMode ? null : (
            <button
              type="button"
              className="pazar-listesi-close"
              onClick={onToggle}
              aria-label="Paneli kapat"
            >
              <Icon name="close" size={20} />
            </button>
            )}
          </header>

          {miniMode ? null : (
          <nav className="pazar-listesi-steps" aria-label="Liste adımları">
            <button
              type="button"
              className={step === 'pick' ? 'active' : ''}
              onClick={() => setStep('pick')}
            >
              Ürün seç
            </button>
            <button
              type="button"
              className={step === 'compare' ? 'active' : ''}
              onClick={() => setStep('compare')}
            >
              Karşılaştır
            </button>
            <button
              type="button"
              className={step === 'budget' ? 'active' : ''}
              onClick={() => setStep('budget')}
              disabled={selectedItems.length === 0}
            >
              Bütçe planı
            </button>
          </nav>
          )}

          <div className="pazar-listesi-body">
            {(step === 'pick' && !miniMode) && (
              <>
                <label className="sr-only" htmlFor="pl-search">
                  Ürün ara
                </label>
                <input
                  id="pl-search"
                  type="search"
                  className="pazar-listesi-input"
                  placeholder="Ürün ara (ör. domates, peynir)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />

                <div className="pazar-listesi-chips" role="toolbar" aria-label="Kategori">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`pl-chip ${activeCategory === c ? 'pl-chip--on' : ''}`}
                      onClick={() => setActiveCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {filteredProducts.map((p) => {
                  const isExpanded = expandedProduct === p.id
                  const hasSelected = selectedItems.some((i) => i.productId === p.id)
                  return (
                    <div key={p.id} className="pl-product-block">
                      <button
                        type="button"
                        className={`pl-product-row ${hasSelected ? 'pl-product-row--selected' : ''}`}
                        onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="pl-abbr" aria-hidden>
                          <Icon name={getProductIconName(p)} size={20} />
                        </span>
                        <span className="pl-product-name">{p.name}</span>
                        <span className="pl-meta">{p.subtypes?.length || 0} tür</span>
                        <Icon
                          name="expand_more"
                          size={20}
                          className={`pl-chevron ${isExpanded ? 'pl-chevron--open' : ''}`}
                        />
                      </button>
                      {isExpanded && p.subtypes && (
                        <div className="pl-subtypes">
                          <SubtypeRow
                            name={p.name}
                            selected={selectedItems.some((i) => i.key === `${p.id}-default`)}
                            onClick={() => toggleItem(p, null)}
                            isGeneric
                          />
                          {p.subtypes.map((st) => (
                            <SubtypeRow
                              key={st}
                              name={st}
                              selected={selectedItems.some((i) => i.key === `${p.id}-${st}`)}
                              onClick={() => toggleItem(p, st)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}

            {(step === 'compare' || miniMode) && selectedItems.length === 0 && (
              <div className="pl-empty">
                <Icon name="shopping_cart" size={48} className="pl-empty-icon" label="" />
                <p className="pl-empty-title">Listeniz boş</p>
                <p className="pl-empty-text">Ürün eklemek için «Ürün seç» adımına dönün.</p>
              </div>
            )}

            {(step === 'compare' || miniMode) && selectedItems.length > 0 && (
              <>
                {miniMode ? null : (
                <div className="pl-toolbar-inline">
                  <button
                    type="button"
                    className={viewMode === 'all' ? 'pl-tool-active' : ''}
                    onClick={() => {
                      setViewMode('all')
                      setSelectedMarketId(null)
                    }}
                  >
                    <Icon name="storefront" size={18} /> Tüm pazarlar
                  </button>
                  <button
                    type="button"
                    className={viewMode === 'single' ? 'pl-tool-active' : ''}
                    onClick={() => setViewMode('single')}
                  >
                    <Icon name="pin_drop" size={18} /> Tek pazar
                  </button>
                </div>
                )}

                {viewMode === 'single' && (
                  <label className="pl-field">
                    <span className="pl-field-label">Pazar</span>
                    <select
                      value={selectedMarketId || ''}
                      onChange={(e) => setSelectedMarketId(Number(e.target.value))}
                      className="pazar-listesi-select"
                    >
                      <option value="">Seçin…</option>
                      {cityMarkets.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (₺{m.total})
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="pl-section-label">Satırlar</div>
                <ul className="pl-lines">
                  {filteredSelectedForCompare.map((item) => {
                    const marketData = miniMode
                        ? cityMarkets.find((m) => m.id === miniMarketId)
                        : (viewMode === 'single' && selectedMarketId
                            ? cityMarkets.find((m) => m.id === selectedMarketId)
                            : cheapestMarket)
                    const priceInfo = marketData?.itemPrices?.find((ip) => ip.key === item.key)
                    const itemVendors = vendors ? vendors.filter((v) => v.marketId === miniMarketId && v.products.includes(item.productId)) : []
                    
                    const isVendorListExpanded = expandedVendorItem === item.key
                    
                    return (
                      <div key={item.key} className="pl-line-wrapper">
                        <li className={`pl-line ${item.checked ? 'pl-line--done' : ''}`}>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => toggleChecked(item.key)}
                            aria-label={`${item.name} alındı`}
                          />
                          <div className="pl-line-main" style={{ cursor: 'pointer' }} onClick={() => setExpandedVendorItem(isVendorListExpanded ? null : item.key)}>
                            <div className="pl-line-name">
                              {item.name}
                              <Icon name={isVendorListExpanded ? "expand_less" : "expand_more"} size={14} />
                            </div>
                            <div className="pl-line-unit">
                              {item.selectedVendor ? `₺${item.selectedVendor.price} / ${item.unit}` : (priceInfo ? `₺${priceInfo.price} / ${item.unit}` : '—')}
                            </div>
                          </div>
                          <input
                            type="number"
                            className="pl-qty"
                            value={item.qty}
                            onChange={(e) => updateQty(item.key, parseFloat(e.target.value) || 0.5)}
                            step="0.5"
                            min="0.5"
                            aria-label={`${item.name} miktar`}
                          />
                          <span className="pl-unit">{item.unit === 'kg' ? 'kg' : 'ad'}</span>
                          <span className="pl-line-total">
                            {priceInfo?.lineTotal != null ? `₺${priceInfo.lineTotal}` : '—'}
                          </span>
                          <button
                            type="button"
                            className="pl-remove"
                            onClick={() => removeItem(item.key)}
                            aria-label={`${item.name} kaldır`}
                          >
                            <Icon name="delete_outline" size={18} />
                          </button>
                        </li>
                        
                        {miniMode && isVendorListExpanded && itemVendors.length > 0 && (
                          <div className="pl-line-vendors">
                            {itemVendors.map((v) => {
                              const vPrice = priceInfo ? (parseFloat(priceInfo.price) + ((v.id % 5) - 2)).toFixed(1) : '?'
                              const isActive = item.selectedVendor?.id === v.id
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  className={`pl-vendor-btn ${isActive ? 'pl-vendor-btn--active' : ''}`}
                                  onClick={() => {
                                    const updatedItems = selectedItems.map((si) =>
                                      si.key === item.key ? { ...si, selectedVendor: { id: v.id, name: v.name, price: vPrice, stall: v.stall } } : si
                                    )
                                    setSelectedItems(updatedItems)
                                  }}
                                >
                                  <Icon name="storefront" size={14} />
                                  <span>{v.name} ({v.stall}): ₺{vPrice}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </ul>

                {(!miniMode && viewMode === 'all') && (
                  <>
                    <div className="pl-section-label">Pazar karşılaştırması</div>
                    <ul className="pl-markets">
                      {cityMarkets.map((m, i) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            className={`pl-market-row ${i === 0 ? 'pl-market-row--best' : ''}`}
                            onClick={() => {
                              setViewMode('single')
                              setSelectedMarketId(m.id)
                            }}
                          >
                            <span className="pl-rank">{i === 0 ? 'En uygun' : `#${i + 1}`}</span>
                            <span className="pl-m-name">{m.name}</span>
                            <span className="pl-m-price">₺{m.total}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {!miniMode && (
                  <>
                    <div className="pl-section-label">Şema ve dışa aktarma</div>
                    <div className="pl-schema-row">
                      <label className="pl-field pl-field--grow">
                        <span className="pl-field-label">Haritada gösterilecek pazar</span>
                        <select
                          value={schemaMarketId || ''}
                          onChange={(e) => setSchemaMarketId(Number(e.target.value) || null)}
                          className="pazar-listesi-select"
                        >
                          <option value="">Önerilen (en uygun)</option>
                          {cityMarkets.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="btn-pl-secondary"
                        onClick={handleSchemaNavigate}
                        disabled={!productIds.length || !(schemaMarketId || cheapestMarket?.id)}
                      >
                        <Icon name="map" size={18} /> Şemada aç
                      </button>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  className="btn-pl-export"
                  onClick={handleExport}
                  disabled={exporting || !selectedItems.length}
                >
                  <Icon name="image" size={18} />
                  {exporting ? 'Hazırlanıyor…' : 'Listeyi görsel indir'}
                </button>

              </>
            )}

            {(step === 'budget' && !miniMode) && (
              <div>
                <div className="pl-section-label">Bütçeye uygun ürünler</div>
                <p className="pl-hint">
                  Öneri her ürün için <strong>1 kg</strong> ile başlar; tutar en ucuz pazardaki birim fiyat × miktar.
                  Kilo veya bütçeyi değiştirince <strong>Harcanan / Kalan</strong> anında güncellenir.
                </p>
                <div className="pl-ai-grid pl-ai-grid--markets">
                  <div className="pl-field pl-field--market-picks">
                    <span className="pl-field-label">Pazarlar (seçilenlerde ürün başına en ucuz)</span>
                    <button
                      type="button"
                      className="pl-market-picks-trigger"
                      aria-expanded={budgetMarketsOpen}
                      aria-controls="budget-market-picks-panel"
                      id="budget-market-picks-trigger"
                      onClick={() => setBudgetMarketsOpen((o) => !o)}
                    >
                      <span className="pl-market-picks-trigger-text">
                        <span className="pl-market-picks-trigger-title">Seçili pazarlar</span>
                        <span className="pl-market-picks-trigger-summary">{budgetMarketSummary}</span>
                      </span>
                      <Icon
                        name="expand_more"
                        size={22}
                        className={`pl-market-picks-chevron${budgetMarketsOpen ? ' pl-market-picks-chevron--open' : ''}`}
                      />
                    </button>
                    <div
                      id="budget-market-picks-panel"
                      role="region"
                      aria-labelledby="budget-market-picks-trigger"
                      hidden={!budgetMarketsOpen}
                      className="pl-market-picks-panel"
                    >
                      <div className="pl-market-picks-toolbar">
                        <button
                          type="button"
                          className="pl-market-picks-btn"
                          onClick={() => setAiMarketIds(cityMarkets.map((m) => m.id))}
                        >
                          Tümünü seç
                        </button>
                        <button type="button" className="pl-market-picks-btn" onClick={() => setAiMarketIds([])}>
                          Temizle
                        </button>
                      </div>
                      <div className="pl-market-picks" role="group">
                        {cityMarkets.map((m) => (
                          <label key={m.id} className="pl-market-pick">
                            <input
                              type="checkbox"
                              checked={aiMarketIds.includes(m.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAiMarketIds((prev) => [...new Set([...prev, m.id])])
                                } else {
                                  setAiMarketIds((prev) => prev.filter((id) => id !== m.id))
                                }
                              }}
                            />
                            <span>{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="pl-field">
                    <span className="pl-field-label">Bütçe (₺)</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="pazar-listesi-input"
                      placeholder="Örn. 500"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                    />
                  </label>
                </div>
                <button type="button" className="btn-pl-primary" onClick={runAiOptimize} disabled={aiLoading || !selectedItems.length}>
                  <Icon name="smart_toy" size={18} />
                  {aiLoading ? 'Hesaplanıyor…' : 'Öneriyi getir'}
                </button>
                {aiError && <p className="pl-error">{aiError}</p>}
                {aiResult && (
                  <div className="pl-ai-result">
                    <div
                      className={`pl-ai-head${budgetLiveTotals.remaining != null && budgetLiveTotals.remaining < 0 ? ' pl-ai-head--over' : ''}`}
                    >
                      <strong>{aiResult.marketName || 'Pazar'}</strong>
                      <span>
                        Harcanan: ₺
                        {budgetDraftItems.length > 0
                          ? budgetLiveTotals.spent.toFixed(2)
                          : aiResult.spent != null
                            ? String(aiResult.spent)
                            : '—'}{' '}
                        · Kalan: ₺
                        {budgetDraftItems.length > 0
                          ? budgetLiveTotals.remaining != null
                            ? budgetLiveTotals.remaining.toFixed(2)
                            : '—'
                          : aiResult.remaining != null
                            ? String(aiResult.remaining)
                            : '—'}
                      </span>
                    </div>
                    {budgetDraftItems.length === 0 ? (
                      <p className="pl-hint">Bu bütçe için öneri bulunamadı.</p>
                    ) : (
                      <ul className="pl-lines">
                        {budgetDraftItems.map((row) => {
                          const u = row.unitAtMarket
                          const q = Number(row.qty) || 0
                          const lineCost =
                            u != null && Number.isFinite(u) && q > 0
                              ? Math.round(u * q * 100) / 100
                              : null
                          return (
                          <li key={row.id} className="pl-line">
                            <input
                              type="checkbox"
                              checked={row.keep}
                              onChange={(e) => setBudgetDraftItems((prev) => prev.map((x) => (x.id === row.id ? { ...x, keep: e.target.checked } : x)))}
                            />
                            <div className="pl-line-main">
                              <div className="pl-line-name">{row.name}</div>
                              <div className="pl-line-unit">
                                {lineCost != null ? (
                                  <>
                                    Tahmini:{' '}
                                    <strong>₺{lineCost.toFixed(2)}</strong>
                                    {u != null ? (
                                      <>
                                        {' '}
                                        (₺{u.toFixed(2)}/{row.unit === 'kg' ? 'kg' : 'birim'} × {q}{' '}
                                        {row.unit === 'kg' ? 'kg' : 'ad'})
                                      </>
                                    ) : null}
                                  </>
                                ) : null}
                                {row.cheapestMarketName ? (
                                  <>
                                    {' · '}
                                    <span className="pl-line-best">En ucuz pazar: {row.cheapestMarketName}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                            <input
                              type="number"
                              className="pl-qty"
                              value={row.qty}
                              min="0.5"
                              step="0.5"
                              onChange={(e) =>
                                setBudgetDraftItems((prev) =>
                                  prev.map((x) =>
                                    x.id === row.id
                                      ? { ...x, qty: Math.max(0.5, Number(e.target.value) || 1) }
                                      : x,
                                  ),
                                )
                              }
                            />
                            <span className="pl-unit">{row.unit === 'kg' ? 'kg' : 'ad'}</span>
                          </li>
                          )
                        })}
                      </ul>
                    )}
                    <button type="button" className="btn-pl-primary" onClick={applyBudgetDraft} disabled={!budgetDraftItems.some((x) => x.keep)}>
                      Onayla ve listeyi güncelle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (step === 'compare' || miniMode) && (
            <footer className="pazar-listesi-footer">
              <div className="pazar-listesi-footer-inner">
                <div>
                  <div className="pl-footer-cap">
                    {miniMode 
                      ? (cityMarkets.find((m) => m.id === miniMarketId)?.name || 'Seçili pazar')
                      : (viewMode === 'single' && selectedMarketId
                          ? cityMarkets.find((m) => m.id === selectedMarketId)?.name || 'Seçili pazar'
                          : 'En uygun pazar')}
                  </div>
                  <div className="pl-footer-progress">
                    {selectedItems.filter((i) => i.checked).length}/{selectedItems.length} tamamlandı
                  </div>
                </div>
                <div className="pl-footer-total">
                  ₺
                  {miniMode
                    ? cityMarkets.find((m) => m.id === miniMarketId)?.total
                    : (viewMode === 'single' && selectedMarketId
                        ? cityMarkets.find((m) => m.id === selectedMarketId)?.total
                        : cheapestMarket?.total)}
                </div>
              </div>
            </footer>
          )}
        </>
      )}
    </aside>
  )
}

function SubtypeRow({ name, selected, onClick, isGeneric }) {
  return (
    <button type="button" className={`pl-subtype ${selected ? 'pl-subtype--on' : ''}`} onClick={onClick}>
      <span className="pl-check" aria-hidden>
        {selected ? <Icon name="check" size={14} /> : null}
      </span>
      <span className="pl-subtype-label">{isGeneric ? `${name} (Genel)` : name}</span>
    </button>
  )
}
