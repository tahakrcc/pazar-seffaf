/** Serbest tuval şema modeli (API ile saklanır). */

export const DEFAULT_CANVAS = Object.freeze({
  version: 1,
  width: 720,
  height: 520,
  elements: [],
})

export function newElementId() {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function parseCanvasField(raw) {
  if (raw == null || raw === '') return null
  try {
    const o = typeof raw === 'string' ? JSON.parse(raw) : raw
    return normalizeCanvas(o)
  } catch {
    return null
  }
}

export function normalizeCanvas(input) {
  if (!input || typeof input !== 'object') return { ...DEFAULT_CANVAS, elements: [] }
  const width = Number(input.width) > 10 ? Number(input.width) : DEFAULT_CANVAS.width
  const height = Number(input.height) > 10 ? Number(input.height) : DEFAULT_CANVAS.height
  const rawEl = Array.isArray(input.elements) ? input.elements : []
  const elements = []
  for (const el of rawEl) {
    const n = normalizeElement(el)
    if (n) elements.push(n)
  }
  return { version: 1, width, height, elements }
}

function normalizeElement(el) {
  if (!el || typeof el !== 'object' || !el.kind) return null
  const id = typeof el.id === 'string' && el.id ? el.id : newElementId()
  if (el.kind === 'wall') {
    const x1 = Number(el.x1)
    const y1 = Number(el.y1)
    const x2 = Number(el.x2)
    const y2 = Number(el.y2)
    if (![x1, y1, x2, y2].every(Number.isFinite)) return null
    const thickness = Number(el.thickness) > 0 ? Number(el.thickness) : 4
    return { id, kind: 'wall', x1, y1, x2, y2, thickness }
  }
  if (el.kind === 'stall' || el.kind === 'tarti' || el.kind === 'entrance' || el.kind === 'exit') {
    const x = Number(el.x)
    const y = Number(el.y)
    const w = Number(el.w)
    const h = Number(el.h)
    if (![x, y, w, h].every(Number.isFinite) || w < 4 || h < 4) return null
    const rotRaw = Number(el.rotation)
    const rotation = Number.isFinite(rotRaw) ? ((rotRaw % 360) + 360) % 360 : 0
    const base = { id, kind: el.kind, x, y, w, h, rotation }
    if (el.kind === 'stall') {
      base.stallCode = el.stallCode != null ? String(el.stallCode) : null
      base.vendorId = el.vendorId != null ? Number(el.vendorId) : null
    }
    return base
  }
  return null
}

/** Tuval koordinatında döndürülmüş dikdörtgen (merkez etrafında `rotation` derece). */
export function pointInRotatedRect(px, py, el) {
  if (!el || typeof el.w !== 'number' || typeof el.h !== 'number') return false
  const rot = Number(el.rotation) || 0
  const rad = (rot * Math.PI) / 180
  const cx = el.x + el.w / 2
  const cy = el.y + el.h / 2
  const dx = px - cx
  const dy = py - cy
  const c = Math.cos(-rad)
  const s = Math.sin(-rad)
  const lx = dx * c - dy * s
  const ly = dx * s + dy * c
  return Math.abs(lx) <= el.w / 2 && Math.abs(ly) <= el.h / 2
}

/** stallCode: undefined ise mevcut kod korunur; null ise kod silinir. */
export function updateStallVendor(canvas, elementId, vendorId, stallCode) {
  const c = normalizeCanvas(canvas)
  const elements = c.elements.map((el) => {
    if (el.id !== elementId || el.kind !== 'stall') return el
    let nextCode = el.stallCode
    if (stallCode !== undefined) {
      nextCode = stallCode != null ? String(stallCode) : null
    }
    return {
      ...el,
      vendorId: vendorId != null ? Number(vendorId) : null,
      stallCode: nextCode,
    }
  })
  return { ...c, elements }
}

/** Tezgah için vendors listesinden eşleşen kayıt (vendorId veya tezgâh kodu). */
export function vendorForCanvasStall(el, vendors) {
  if (!el || el.kind !== 'stall') return null
  if (!Array.isArray(vendors)) return null
  if (el.vendorId != null) {
    const v = vendors.find((x) => Number(x.id) === Number(el.vendorId))
    if (v) return v
  }
  const code = el.stallCode != null ? String(el.stallCode).trim().toLowerCase() : ''
  if (!code) return null
  return (
    vendors.find((x) => String(x.stallCode || x.stall || '').trim().toLowerCase() === code) ||
    null
  )
}

export function parseMarketSchemaPayload(api) {
  if (!api || typeof api !== 'object') return api
  const canvas = parseCanvasField(api.canvas)
  return { ...api, canvas }
}
