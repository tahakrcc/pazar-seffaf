import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Group, Text, Circle, Ring, RegularPolygon, Arrow } from 'react-konva'
import { vendorForStall, stallHasFilterProduct } from '../model/layoutSelectors.js'

/* ─── Sabitler ─── */
const FLOOR_COLOR = '#f0f4f8'
const FLOOR_GRID_COLOR = '#e2e8f0'
const WALL_COLOR = '#475569'
const STALL_FILL = '#f8fafc'
const STALL_STROKE = '#94a3b8'
const STALL_VENDOR_FILL = '#f0fdf4'
const STALL_VENDOR_STROKE = '#10b981'
const STALL_ACTIVE_FILL = '#0f172a'
const STALL_ACTIVE_STROKE = '#0ea5e9'
const STALL_DIMMED_OPACITY = 0.18
const AWNING_COLORS = ['#ef4444', '#ffffff']
const AWNING_STRIPE_W = 8
const TARTI_FILL = '#dbeafe'
const TARTI_STROKE = '#3b82f6'
const ENTRANCE_FILL = '#d1fae5'
const ENTRANCE_STROKE = '#059669'
const EXIT_FILL = '#fee2e2'
const EXIT_STROKE = '#dc2626'
const FILTER_HIT_COLOR = '#10b981'
const FILTER_GLOW_COLOR = 'rgba(16,185,129,0.35)'
const MIN_SCALE = 0.3
const MAX_SCALE = 5
const LABEL_FONT = 'Inter, system-ui, sans-serif'

/* ─── Yardımcılar ─── */
function useContainerSize(ref) {
  const [size, setSize] = useState({ width: 400, height: 400 })
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/* ─── Zemin Izgarası ─── */
function FloorGrid({ cw, ch, step = 24 }) {
  const lines = useMemo(() => {
    const arr = []
    for (let x = 0; x <= cw; x += step)
      arr.push(<Line key={`v${x}`} points={[x, 0, x, ch]} stroke={FLOOR_GRID_COLOR} strokeWidth={0.5} />)
    for (let y = 0; y <= ch; y += step)
      arr.push(<Line key={`h${y}`} points={[0, y, cw, y]} stroke={FLOOR_GRID_COLOR} strokeWidth={0.5} />)
    return arr
  }, [cw, ch, step])
  return <>{lines}</>
}

/* ─── Tente (Çizgili) ─── */
function AwningStripes({ x, y, width, height }) {
  const rects = useMemo(() => {
    const arr = []
    let cx = 0
    let idx = 0
    while (cx < width) {
      const w = Math.min(AWNING_STRIPE_W, width - cx)
      arr.push(
        <Rect
          key={idx}
          x={x + cx}
          y={y}
          width={w}
          height={height}
          fill={AWNING_COLORS[idx % 2]}
          cornerRadius={idx === 0 ? [3, 0, 0, 3] : cx + w >= width ? [0, 3, 3, 0] : 0}
        />,
      )
      cx += w
      idx++
    }
    return arr
  }, [x, y, width, height])
  return <>{rects}</>
}

/* ─── Tezgah ─── */
function StallNode({ node, vendor, isActive, isDimmed, isFilterHit, onSelect }) {
  const { x, y, w, h, rotation = 0, stallCode } = node
  const hasVendor = Boolean(vendor)

  const fill = isActive ? STALL_ACTIVE_FILL : hasVendor ? STALL_VENDOR_FILL : STALL_FILL
  const stroke = isActive ? STALL_ACTIVE_STROKE : hasVendor ? STALL_VENDOR_STROKE : STALL_STROKE
  const textColor = isActive ? '#ffffff' : '#1e293b'
  const vendorColor = isActive ? 'rgba(255,255,255,0.75)' : '#64748b'
  const awningH = Math.max(6, h * 0.14)
  const opacity = isDimmed ? STALL_DIMMED_OPACITY : 1

  const handleClick = useCallback(() => {
    if (vendor) onSelect?.(isActive ? null : { ...node, vendorId: vendor.id })
  }, [vendor, isActive, node, onSelect])

  return (
    <Group
      x={x + w / 2}
      y={y + h / 2}
      offsetX={w / 2}
      offsetY={h / 2}
      rotation={rotation}
      opacity={opacity}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Filtre halesi */}
      {isFilterHit && !isDimmed && (
        <>
          <Rect x={-4} y={-4} width={w + 8} height={h + 8} fill={FILTER_GLOW_COLOR} cornerRadius={8} />
          <Rect x={-2} y={-2} width={w + 4} height={h + 4} stroke={FILTER_HIT_COLOR} strokeWidth={2.5} cornerRadius={7} dash={[6, 3]} fill="transparent" />
        </>
      )}
      {/* Gölge */}
      <Rect x={2} y={3} width={w} height={h} fill="rgba(0,0,0,0.08)" cornerRadius={4} />
      {/* Gövde */}
      <Rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={isActive ? 2.5 : 1.5} cornerRadius={4} shadowColor="rgba(0,0,0,0.12)" shadowBlur={8} shadowOffsetY={3} />
      {/* Tente */}
      {!isActive && <AwningStripes x={1} y={1} width={w - 2} height={awningH} />}
      {/* Tezgah Kodu */}
      <Text
        x={0}
        y={awningH + 4}
        width={w}
        text={stallCode || '—'}
        fontSize={Math.min(14, w * 0.28)}
        fontFamily={LABEL_FONT}
        fontStyle="900"
        fill={textColor}
        align="center"
      />
      {/* Esnaf adı */}
      {hasVendor && (
        <Text
          x={2}
          y={h - Math.min(16, h * 0.28) - 3}
          width={w - 4}
          text={vendor.name?.split(' ')[0] || ''}
          fontSize={Math.min(10, w * 0.18)}
          fontFamily={LABEL_FONT}
          fontStyle="600"
          fill={vendorColor}
          align="center"
          ellipsis
          wrap="none"
        />
      )}
      {/* Filtre rozet */}
      {isFilterHit && !isDimmed && (
        <Group x={w / 2} y={-12}>
          <Circle radius={8} fill={FILTER_HIT_COLOR} shadowColor={FILTER_HIT_COLOR} shadowBlur={8} />
          <Text x={-5} y={-5} text="✓" fontSize={10} fill="#fff" fontStyle="900" />
        </Group>
      )}
    </Group>
  )
}

/* ─── Tartı ─── */
function TartiNode({ node, onHint }) {
  const { x, y, w, h, rotation = 0 } = node
  return (
    <Group
      x={x + w / 2}
      y={y + h / 2}
      offsetX={w / 2}
      offsetY={h / 2}
      rotation={rotation}
      onClick={() => onHint?.()}
      onTap={() => onHint?.()}
    >
      <Rect x={1} y={2} width={w} height={h} fill="rgba(0,0,0,0.06)" cornerRadius={6} />
      <Rect x={0} y={0} width={w} height={h} fill={TARTI_FILL} stroke={TARTI_STROKE} strokeWidth={1.5} cornerRadius={6} />
      <Text x={0} y={h * 0.2} width={w} text="⚖" fontSize={Math.min(18, w * 0.35)} align="center" />
      <Text x={0} y={h * 0.6} width={w} text="Tartı" fontSize={Math.min(9, w * 0.18)} fontFamily={LABEL_FONT} fontStyle="800" fill={TARTI_STROKE} align="center" />
    </Group>
  )
}

/* ─── Giriş / Çıkış ─── */
function OpeningNode({ node }) {
  const { x, y, w, h, rotation = 0, kind } = node
  const isEntrance = kind === 'entrance'
  const fill = isEntrance ? ENTRANCE_FILL : EXIT_FILL
  const stroke = isEntrance ? ENTRANCE_STROKE : EXIT_STROKE
  const label = isEntrance ? 'Giriş' : 'Çıkış'
  const icon = isEntrance ? '🚪' : '🚶'
  return (
    <Group x={x + w / 2} y={y + h / 2} offsetX={w / 2} offsetY={h / 2} rotation={rotation}>
      <Rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={1.5} cornerRadius={4} dash={[6, 4]} />
      <Text x={0} y={h * 0.15} width={w} text={icon} fontSize={Math.min(16, w * 0.32)} align="center" />
      <Text x={0} y={h * 0.55} width={w} text={label} fontSize={Math.min(9, w * 0.18)} fontFamily={LABEL_FONT} fontStyle="800" fill={stroke} align="center" />
    </Group>
  )
}

/* ─── Duvar Segmenti ─── */
function WallSegment({ wall }) {
  return (
    <>
      {/* Gölge */}
      <Line points={[wall.x1 + 1, wall.y1 + 2, wall.x2 + 1, wall.y2 + 2]} stroke="rgba(0,0,0,0.1)" strokeWidth={(wall.thickness || 4) + 2} lineCap="round" />
      <Line points={[wall.x1, wall.y1, wall.x2, wall.y2]} stroke={WALL_COLOR} strokeWidth={wall.thickness || 4} lineCap="round" lineJoin="round" />
    </>
  )
}

/* ─── Zoom için ─── */
function clampScale(val) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, val))
}

/* ─── Ana 2D Sahne ─── */
export default function Schema2DScene({
  layout,
  vendors,
  selectedFilterProducts,
  selectedStall,
  onSelectStall,
  onTartiHint,
  onEmptyStallHint,
  mergedSchemaTools,
}) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const { width: containerW, height: containerH } = useContainerSize(containerRef)

  const cw = layout.width
  const ch = layout.height

  // Başlangıç ölçeğini hesapla — kanvas container'a sığsın
  const initScale = useMemo(() => {
    const pad = 48
    const sx = (containerW - pad) / cw
    const sy = (containerH - pad) / ch
    return clampScale(Math.min(sx, sy, 1.5))
  }, [containerW, containerH, cw, ch])

  const [scale, setScale] = useState(initScale)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  // Yeni layout geldiğinde ölçeği sıfırla ve ortala
  useEffect(() => {
    const s = initScale
    setScale(s)
    setPos({
      x: (containerW - cw * s) / 2,
      y: (containerH - ch * s) / 2,
    })
  }, [initScale, containerW, containerH, cw, ch])

  const walls = useMemo(() => layout.nodes.filter((n) => n.kind === 'wall'), [layout.nodes])
  const boxes = useMemo(() => layout.nodes.filter((n) => n.kind !== 'wall'), [layout.nodes])

  const handleWheel = useCallback(
    (e) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      const oldScale = scale
      const dir = e.evt.deltaY > 0 ? -1 : 1
      const factor = 1 + dir * 0.06
      const newScale = clampScale(oldScale * factor)
      const mousePointTo = {
        x: (pointer.x - pos.x) / oldScale,
        y: (pointer.y - pos.y) / oldScale,
      }
      setScale(newScale)
      setPos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      })
    },
    [scale, pos],
  )

  const filterOn = Array.isArray(selectedFilterProducts) && selectedFilterProducts.length > 0

  return (
    <div ref={containerRef} className="schema-konva-2d-container">
      <Stage
        ref={stageRef}
        width={containerW}
        height={containerH}
        scaleX={scale}
        scaleY={scale}
        x={pos.x}
        y={pos.y}
        draggable
        onDragEnd={(e) => setPos({ x: e.target.x(), y: e.target.y() })}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <Layer>
          {/* Zemin */}
          <Rect x={-4} y={-4} width={cw + 8} height={ch + 8} fill="rgba(0,0,0,0.06)" cornerRadius={16} />
          <Rect x={0} y={0} width={cw} height={ch} fill={FLOOR_COLOR} cornerRadius={12} shadowColor="rgba(0,0,0,0.15)" shadowBlur={24} shadowOffsetY={6} />
          <FloorGrid cw={cw} ch={ch} />

          {/* Duvarlar */}
          {walls.map((w) => (
            <WallSegment key={w.id} wall={w} />
          ))}

          {/* Kutular — giriş/çıkış arkada, tartı ortada, tezgah üstte */}
          {boxes
            .sort((a, b) => {
              const order = { entrance: 0, exit: 0, tarti: 1, stall: 2 }
              return (order[a.kind] ?? 1) - (order[b.kind] ?? 1)
            })
            .map((node) => {
              if (node.kind === 'entrance' || node.kind === 'exit') {
                return <OpeningNode key={node.id} node={node} />
              }
              if (node.kind === 'tarti') {
                return <TartiNode key={node.id} node={node} onHint={onTartiHint} />
              }
              // stall
              const cellVendor = vendorForStall(node, vendors)
              const isActive = selectedStall && selectedStall.id === node.id
              const hasProduct = stallHasFilterProduct(cellVendor, selectedFilterProducts)
              const isDimmed = filterOn && !hasProduct
              const isFilterHit = filterOn && hasProduct
              return (
                <StallNode
                  key={node.id}
                  node={node}
                  vendor={cellVendor}
                  isActive={isActive}
                  isDimmed={isDimmed}
                  isFilterHit={isFilterHit}
                  onSelect={(payload) => {
                    if (payload) onSelectStall?.(payload)
                    else if (cellVendor) onSelectStall?.(null)
                    else onEmptyStallHint?.()
                  }}
                />
              )
            })}
        </Layer>
      </Stage>
    </div>
  )
}
