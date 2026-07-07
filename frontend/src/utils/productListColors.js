/**
 * Liste ↔ kroki ürün vurgusu için ürün kimliğine göre kararlı renkler.
 */

export const PRODUCT_LIST_PALETTE = [
  '#e11d48',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#0d9488',
  '#4f46e5',
  '#c026d3',
  '#d97706',
]

function hashToIndex(id, len) {
  const n = Number(id)
  if (!Number.isFinite(n)) return 0
  let h = Math.abs(n)
  h = (h ^ (h >>> 16)) >>> 0
  return h % len
}

/** Tek ürün için paletten renk (aynı id her zaman aynı renk). */
export function getProductListColor(productId) {
  const idx = hashToIndex(productId, PRODUCT_LIST_PALETTE.length)
  return PRODUCT_LIST_PALETTE[idx]
}

/** Seçili ürün dizisi için id → renk haritası (sıra korunur). */
export function buildProductColorMap(products) {
  const m = new Map()
  if (!Array.isArray(products)) return m
  for (const p of products) {
    if (p?.id != null) {
      const id = Number(p.id)
      if (!m.has(id)) m.set(id, getProductListColor(id))
    }
  }
  return m
}
