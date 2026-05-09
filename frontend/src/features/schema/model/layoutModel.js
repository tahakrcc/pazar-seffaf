export const DEFAULT_LAYOUT = Object.freeze({
  version: 2,
  width: 720,
  height: 520,
  nodes: [],
})

const ALLOWED = new Set(['wall', 'stall', 'tarti', 'entrance', 'exit'])

export function normalizeLayout(input) {
  if (!input || typeof input !== 'object') return { ...DEFAULT_LAYOUT, nodes: [] }
  const width = Number(input.width) >= 120 ? Number(input.width) : DEFAULT_LAYOUT.width
  const height = Number(input.height) >= 120 ? Number(input.height) : DEFAULT_LAYOUT.height
  const rawNodes = Array.isArray(input.nodes) ? input.nodes : Array.isArray(input.elements) ? input.elements : []
  const nodes = rawNodes.map(normalizeNode).filter(Boolean)
  return { version: 2, width, height, nodes }
}

function normalizeNode(node) {
  if (!node || typeof node !== 'object') return null
  const kind = String(node.kind || '').toLowerCase()
  if (!ALLOWED.has(kind)) return null
  const id = String(node.id || `n_${Math.random().toString(36).slice(2, 10)}`)
  if (kind === 'wall') {
    const x1 = Number(node.x1)
    const y1 = Number(node.y1)
    const x2 = Number(node.x2)
    const y2 = Number(node.y2)
    if (![x1, y1, x2, y2].every(Number.isFinite)) return null
    return { id, kind, x1, y1, x2, y2, thickness: Number(node.thickness) > 0 ? Number(node.thickness) : 4 }
  }
  const x = Number(node.x)
  const y = Number(node.y)
  const w = Number(node.w)
  const h = Number(node.h)
  if (![x, y, w, h].every(Number.isFinite) || w <= 2 || h <= 2) return null
  const rotation = Number.isFinite(Number(node.rotation)) ? ((Number(node.rotation) % 360) + 360) % 360 : 0
  const base = {
    id,
    kind,
    x,
    y,
    w,
    h,
    z: Number.isFinite(Number(node.z)) ? Number(node.z) : 0,
    depth: Number(node.depth) > 0 ? Number(node.depth) : 14,
    height: Number(node.height) > 0 ? Number(node.height) : 12,
    rotation,
  }
  if (kind === 'stall') {
    base.stallCode = node.stallCode != null ? String(node.stallCode) : null
    base.vendorId = node.vendorId != null ? Number(node.vendorId) : null
  }
  return base
}

export function toBackendLayoutPayload(layout) {
  const normalized = normalizeLayout(layout)
  return { ...normalized, nodes: normalized.nodes }
}
