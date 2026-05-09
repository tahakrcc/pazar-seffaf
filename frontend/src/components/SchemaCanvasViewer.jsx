import SchemaCellInner from './SchemaCellInner.jsx'
import { normalizeCanvas, vendorForCanvasStall } from '../utils/schemaCanvas.js'

export default function SchemaCanvasViewer({
  canvas: canvasProp,
  vendors,
  mergedSchemaTools,
  is3D,
  selectedFilterProducts,
  selectedStall,
  onSelectStall,
  onTartiHint,
  onEmptyStallHint,
}) {
  const canvas = normalizeCanvas(canvasProp)
  const { width: cw, height: ch, elements } = canvas

  const walls = elements.filter((e) => e.kind === 'wall')
  const boxes = elements.filter((e) => e.kind !== 'wall')

  return (
    <div
      className={`schema-canvas-view schema-grid--viewer ${is3D ? 'schema-canvas-view--3d' : ''}`}
      style={{ touchAction: 'none' }}
    >
      <div className="schema-canvas-view__frame">
        <div className="schema-canvas-view__stage" style={{ aspectRatio: `${cw} / ${ch}` }}>
          <svg
            className="schema-canvas-view__svg"
            viewBox={`0 0 ${cw} ${ch}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <rect width={cw} height={ch} fill="var(--schema-floor, #e8eef5)" />
            {!is3D && walls.map((w) => (
              <line
                key={w.id}
                x1={w.x1}
                y1={w.y1}
                x2={w.x2}
                y2={w.y2}
                stroke="var(--schema-wall, #334155)"
                strokeWidth={w.thickness || 4}
                strokeLinecap="square"
                strokeDasharray="10 8"
                vectorEffect="nonScalingStroke"
              />
            ))}
          </svg>
          <div className="schema-canvas-view__html">
            {is3D && walls.map((w) => {
              const dx = w.x2 - w.x1
              const dy = w.y2 - w.y1
              const len = Math.sqrt(dx * dx + dy * dy)
              const angle = Math.atan2(dy, dx) * (180 / Math.PI)
              const cx = (w.x1 + w.x2) / 2
              const cy = (w.y1 + w.y2) / 2
              const cxPct = (cx / cw) * 100
              const cyPct = (cy / ch) * 100
              const widthPct = (len / cw) * 100
              
              return (
                <div 
                  key={w.id} 
                  className="schema-canvas-abs wall-3d"
                  style={{
                    left: `${cxPct}%`,
                    top: `${cyPct}%`,
                    width: `${widthPct}%`,
                    height: `${(w.thickness || 4) / ch * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                />
              )
            })}

            {boxes.map((el) => {
              const cxPct = ((el.x + el.w / 2) / cw) * 100
              const cyPct = ((el.y + el.h / 2) / ch) * 100
              const widthPct = (el.w / cw) * 100
              const heightPct = (el.h / ch) * 100
              const rot = Number(el.rotation) || 0
              const zLift =
                is3D && el.kind === 'stall' ? ' translateZ(16px)' : is3D && el.kind === 'tarti' ? ' translateZ(20px)' : ''
              const boxTransform = `translate(-50%, -50%) rotate(${rot}deg)${zLift}`
              const typeSafe = String(el.kind).replace(/[^a-zA-Z0-9_-]/g, '_')

              if (el.kind === 'stall') {
                const cellVendor = vendorForCanvasStall(el, vendors)
                const filterOn = selectedFilterProducts.length > 0
                const hasProduct = Boolean(
                  filterOn &&
                    cellVendor &&
                    cellVendor.products?.some((pid) =>
                      selectedFilterProducts.find((sp) => Number(sp.id) === Number(pid)),
                    ),
                )
                const isDimmed = filterOn && !hasProduct
                const isActive = selectedStall && selectedStall.id === el.id
                const syntheticCell = {
                  type: 'stall',
                  stallCode: el.stallCode,
                  vendorId: cellVendor ? cellVendor.id : el.vendorId,
                  id: el.id,
                }
                return (
                  <div
                    key={el.id}
                    role="presentation"
                    className={`schema-canvas-abs grid-cell cell-${typeSafe} canvas-hit ${cellVendor ? 'has-vendor' : ''} ${isDimmed ? 'dimmed' : ''} ${isActive ? 'active' : ''} ${hasProduct ? 'stall-filter-hit' : ''}`}
                    style={{
                      left: `${cxPct}%`,
                      top: `${cyPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`,
                      transform: boxTransform,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (cellVendor) {
                        onSelectStall(isActive ? null : { ...syntheticCell, vendorId: cellVendor.id })
                      } else if (onEmptyStallHint) {
                        onEmptyStallHint()
                      }
                    }}
                  >
                    <SchemaCellInner
                      cell={{ type: 'stall', stallCode: el.stallCode, vendorId: cellVendor?.id ?? el.vendorId }}
                      vendor={cellVendor}
                      adminMode={false}
                      mergedTools={mergedSchemaTools}
                      is3D={is3D}
                      iconSize={20}
                    />
                    {hasProduct ? (
                      <div className="stall-filter-hit-badge" aria-hidden>
                        Ürün burada
                      </div>
                    ) : null}
                  </div>
                )
              }

              const synthetic = {
                type: el.kind,
                id: el.id,
                stallCode: null,
                vendorId: null,
              }
              const interactive = el.kind === 'tarti'
              return (
                <div
                  key={el.id}
                  role="presentation"
                  className={`schema-canvas-abs grid-cell cell-${typeSafe}${interactive ? ' canvas-hit' : ''}`}
                  style={{
                    left: `${cxPct}%`,
                    top: `${cyPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    transform: boxTransform,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (el.kind === 'tarti' && onTartiHint) onTartiHint()
                  }}
                >
                  <SchemaCellInner
                    cell={synthetic}
                    vendor={null}
                    adminMode={false}
                    mergedTools={mergedSchemaTools}
                    is3D={is3D}
                    iconSize={20}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
