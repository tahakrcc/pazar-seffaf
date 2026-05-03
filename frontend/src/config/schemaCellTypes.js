/** Varsayılan şema araçları + tarayıcıda saklanan özel tipler (admin) */

export const CUSTOM_TOOLS_LS = 'pazar_schema_custom_tools_v1'

export const DEFAULT_SCHEMA_TOOLS = [
  { id: 'empty', label: 'Boşalt', shortLabel: '∅', icon: 'crop_free', paintable: true },
  { id: 'wall', label: 'Duvar', shortLabel: '▯', icon: 'horizontal_rule', paintable: true },
  { id: 'entrance', label: 'Giriş', shortLabel: 'G', icon: 'door_front', paintable: true },
  { id: 'exit', label: 'Çıkış', shortLabel: 'Ç', icon: 'door_open', paintable: true },
  { id: 'corridor', label: 'Yürüyüş', shortLabel: 'Y', icon: 'directions_walk', paintable: true },
  { id: 'stall', label: 'Tezgah', shortLabel: 'T', icon: 'storefront', paintable: false },
  { id: 'tarti', label: 'Tartı', shortLabel: '⚖', icon: 'monitor_weight', paintable: true },
  { id: 'zabita', label: 'Zabıta', shortLabel: 'Z', icon: 'shield_person', paintable: true },
  { id: 'wc', label: 'WC', shortLabel: 'W', icon: 'wc', paintable: true },
  { id: 'info', label: 'Bilgi', shortLabel: 'i', icon: 'info', paintable: true },
]

function slugifyId(raw) {
  const s = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  return s.slice(0, 32)
}

export function loadCustomTools() {
  try {
    const raw = localStorage.getItem(CUSTOM_TOOLS_LS)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => x && typeof x.id === 'string') : []
  } catch {
    return []
  }
}

export function saveCustomTools(list) {
  localStorage.setItem(CUSTOM_TOOLS_LS, JSON.stringify(list))
}

export function getMergedSchemaTools() {
  const custom = loadCustomTools()
  const seen = new Set(DEFAULT_SCHEMA_TOOLS.map((t) => t.id))
  const merged = [...DEFAULT_SCHEMA_TOOLS]
  for (const t of custom) {
    const id = slugifyId(t.id)
    if (!id || seen.has(id)) continue
    merged.push({
      id,
      label: (t.label || id).slice(0, 40),
      shortLabel: (t.shortLabel || id.slice(0, 3)).slice(0, 4),
      icon: (t.icon || 'widgets').slice(0, 32),
      paintable: t.paintable !== false,
    })
    seen.add(id)
  }
  return merged
}

export function addMergedSchemaTool(entry) {
  const id = slugifyId(entry.id)
  if (!id) throw new Error('Geçerli bir tip anahtarı girin (harf, rakam, alt çizgi).')
  const custom = loadCustomTools().filter((x) => slugifyId(x.id) !== id)
  custom.push({
    id,
    label: entry.label || id,
    shortLabel: entry.shortLabel || id.slice(0, 3),
    icon: entry.icon || 'widgets',
    paintable: true,
  })
  saveCustomTools(custom)
  return getMergedSchemaTools()
}

export function getToolMeta(cellType, mergedTools) {
  const t = mergedTools.find((x) => x.id === cellType)
  if (t) return t
  return {
    id: cellType,
    label: cellType,
    shortLabel: String(cellType).slice(0, 3),
    icon: 'widgets',
    paintable: true,
  }
}
