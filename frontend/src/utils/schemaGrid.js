/** Şema ızgarasında komşu duvar / giriş–çıkış (boşluk) çizimi için yardımcılar */

export function buildCellTypeMap(cells) {
  const map = {}
  for (const c of cells || []) map[c.id] = c.type
  return map
}

function isOpening(t) {
  return t === 'entrance' || t === 'exit'
}

function isWallType(t) {
  return t === 'wall'
}

/**
 * Duvar hücresini dolu kutu yerine segment çizgilere böler; giriş/çıkış komşusu olan yüzlerde çizgi yok (boşluk).
 */
export function getWallLineStyle(cellId, map) {
  const parts = String(cellId).split('-').map(Number)
  const r = parts[0]
  const c = parts[1]
  if (!Number.isFinite(r) || !Number.isFinite(c)) return {}
  const W = 3
  const color = 'var(--schema-wall, #334155)'
  const up = map[`${r - 1}-${c}`] ?? 'empty'
  const down = map[`${r + 1}-${c}`] ?? 'empty'
  const left = map[`${r}-${c - 1}`] ?? 'empty'
  const right = map[`${r}-${c + 1}`] ?? 'empty'

  const top = !isWallType(up) && !isOpening(up) ? `${W}px solid ${color}` : undefined
  const bottom = !isWallType(down) && !isOpening(down) ? `${W}px solid ${color}` : undefined
  const leftB = !isWallType(left) && !isOpening(left) ? `${W}px solid ${color}` : undefined
  const rightB = !isWallType(right) && !isOpening(right) ? `${W}px solid ${color}` : undefined

  return {
    background: 'transparent',
    borderTop: top,
    borderBottom: bottom,
    borderLeft: leftB,
    borderRight: rightB,
    borderRadius: 0,
    boxSizing: 'border-box',
  }
}

export function toolSupportsPaint(toolId, mergedTools) {
  const t = mergedTools.find((x) => x.id === toolId)
  if (toolId === 'stall') return false
  return t ? t.paintable !== false : true
}
