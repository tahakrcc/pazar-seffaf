/**
 * Tüm örnek iş verisi yalnızca frontend dosyalarında tutulur (backend zorunlu değil).
 */
import {
  markets,
  products,
  vendors,
  inspections as seedInspections,
  DAYS_TR,
  getMarketPrices,
} from './markets.js'
import { kernekMarketCanvas } from './kernekCanvasSchema.js'
import { normalizeLayout } from '../features/schema/model/layoutModel.js'

export function getCatalogMarkets(city) {
  if (!city) return [...markets]
  return markets.filter((m) => m.city === city)
}

export function getCatalogProducts() {
  return [...products]
}

export function getCatalogWeather(city) {
  const key = city || 'Malatya'
  let h = 0
  for (let i = 0; i < key.length; i++) h += key.charCodeAt(i)
  return {
    temp: 16 + (h % 14),
    desc: ['Güneşli', 'Parçalı bulutlu', 'Açık'][h % 3],
    icon: ['sun', 'cloud', 'cloud-sun'][h % 3],
    tip: '',
  }
}

export function getCatalogDaysTr() {
  return [...DAYS_TR]
}

/** MarketDetail — API satırıyla uyumlu fiyat listesi */
export function getDetailPrices(marketId) {
  return getMarketPrices(marketId).map((p) => ({
    ...p,
    medianPrice:
      typeof p.medianPrice === 'number' ? String(p.medianPrice) : String(p.medianPrice ?? ''),
    minPrice: Number(p.minPrice),
    maxPrice: Number(p.maxPrice),
  }))
}

/** GET /markets/:id/layout ile uyumlu gövde */
export function getMarketLayoutResponse(marketId) {
  const id = Number(marketId)
  if (id === 1) {
    const layout = normalizeLayout({
      version: 2,
      width: kernekMarketCanvas.width,
      height: kernekMarketCanvas.height,
      nodes: kernekMarketCanvas.elements,
    })
    return {
      marketId: id,
      formatVersion: 2,
      revision: 1,
      layout,
    }
  }
  return {
    marketId: id,
    formatVersion: 2,
    revision: 0,
    layout: normalizeLayout(null),
  }
}

export const STATIC_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Kernek Semt Pazarı',
    body: 'Bu hafta giriş kapısı geçici olarak güney cepheye alınmıştır.',
    createdAt: '2026-05-08',
  },
  {
    id: 2,
    title: 'Malatya Büyükşehir',
    body: 'Ramazan ayında pazar saatleri 06:30–16:00 olarak güncellenmiştir.',
    createdAt: '2026-05-05',
  },
]

/** Şikâyet listeleri (zabıta / müdür / yönetici panelleri) */
export const STATIC_COMPLAINTS = [
  {
    id: 201,
    marketId: 1,
    marketName: 'Kernek Semt Pazarı',
    vendorId: 1,
    vendorName: 'Ahmet Yılmaz',
    stallCode: 'A-12',
    description: 'Tezgâhta etiket ile kasa fiyatı uyumsuz.',
    reporterPhone: '05001112233',
    status: 'NEW',
    createdAt: '2026-05-07',
  },
  {
    id: 202,
    marketId: 2,
    marketName: 'Çarşamba Pazarı',
    vendorId: 9,
    vendorName: 'Kemal Sunal',
    stallCode: 'Z-01',
    description: 'Hijyen şikâyeti — örnek kayıt.',
    reporterPhone: '05009998877',
    status: 'ASSIGNED',
    createdAt: '2026-05-06',
    assignedOfficerUserId: 501,
  },
]

export const STATIC_OFFICERS = [
  { id: 501, userId: 501, name: 'Zabıta Memuru K. Yıldız', email: 'kyildiz@belediye.local', badgeNo: 'Z-101' },
  { id: 502, userId: 502, name: 'Zabıta Memuru A. Koç', email: 'akoc@belediye.local', badgeNo: 'Z-102' },
]

export const STATIC_MUNICIPALITIES = [
  { id: 1, name: 'Malatya Büyükşehir Belediyesi', city: 'Malatya' },
  { id: 2, name: 'İstanbul Büyükşehir Belediyesi', city: 'İstanbul' },
]

/** Admin tablosu — vendors + API alanları */
export function getAdminVendors() {
  return vendors.map((v) => ({
    id: v.id,
    marketId: v.marketId,
    name: v.name,
    stallCode: v.stall,
    score: v.score,
    products: v.products,
  }))
}

/** Esnaf paneli — oturum özeti */
export const STATIC_VENDOR_PROFILE = {
  id: 1,
  marketId: 1,
  name: 'Ahmet Yılmaz',
  email: 'esnaf@pazar.com',
  stallCode: 'A-12',
  stall: 'A-12',
  marketName: 'Kernek Semt Pazarı',
}

/** vendor_products satırı mock */
export function getStaticVendorProducts(vendorId = 1) {
  const v = vendors.find((x) => x.id === vendorId) || vendors[0]
  const ids = Array.isArray(v.products) ? v.products : [1, 2, 3]
  return ids.map((productId, idx) => ({
    id: 100 + idx,
    vendorId: v.id,
    productId,
    unitPrice: 12 + (productId % 8) * 3,
    published: true,
  }))
}

export const STATIC_VENDOR_INVOICES = []

/** Şef paneli */
export const STATIC_CHIEF_WORKLOAD = {
  officerCount: STATIC_OFFICERS.length,
  openComplaints: STATIC_COMPLAINTS.filter((c) =>
    ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status),
  ).length,
}

/** Yönetici paneli tablosu — inspection satırı */
export function getAdminInspectionsDisplay() {
  return seedInspections.map((i) => ({
    ...i,
    marketName: markets.find((m) => m.id === i.marketId)?.name || `Pazar #${i.marketId}`,
    date: i.date,
  }))
}

/** Denetim kayıtları (zabıta) — inspections ile uyumlu */
export function getOfficerInspectionsList() {
  return seedInspections.map((i) => ({
    id: i.id,
    marketId: i.marketId,
    inspectionDate: i.date,
    status: i.status,
    violationsCount: i.violations,
    notes: i.notes,
    inspector: i.inspector,
  }))
}

/** Pazar seçici — tüm pazarlar */
export function getAllMarkets() {
  return [...markets]
}

/** Market bazlı esnaf (tezgâh kodu ile) */
export function getVendorsForMarket(marketId) {
  const mid = Number(marketId)
  return vendors.filter((v) => v.marketId === mid).map((v) => ({
    id: v.id,
    marketId: v.marketId,
    name: v.name,
    stallCode: v.stall,
    stall: v.stall,
    score: v.score,
  }))
}

/** Yerel bütçe optimizasyonu (API yerine) */
export function localAiOptimizeBudget(marketId, budget, productIds, quantities) {
  const ids = Array.isArray(productIds) ? productIds : []
  const qtyMap = quantities && typeof quantities === 'object' ? quantities : {}
  const n = Math.max(1, ids.length)
  const share = budget / n
  const items = ids.map((pid, idx) => {
    const p = products.find((x) => x.id === Number(pid))
    const q = Number(qtyMap[pid] ?? qtyMap[String(pid)] ?? 1) || 1
    const unitEst = share / Math.max(q, 0.5)
    return {
      productId: Number(pid),
      productName: p?.name || `Ürün ${pid}`,
      quantity: q,
      lineTotal: Math.round(share * 100) / 100,
      unitEstimate: Math.round(unitEst * 100) / 100,
      rank: idx + 1,
    }
  })
  return { marketId, budget, items, source: 'local-demo' }
}

/** Şikâyet gönderimi — sunucu yok, başarı döner */
export async function submitComplaintOffline() {
  return { ok: true }
}
