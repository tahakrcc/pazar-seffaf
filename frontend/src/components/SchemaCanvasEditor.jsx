import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { DEFAULT_CANVAS, newElementId, normalizeCanvas, pointInRotatedRect } from '../utils/schemaCanvas.js'

const MIN_RECT = 14
const WALL_HIT = 16
const CLICK_MOVE_THRESH = 6

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-6) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const qx = x1 + t * dx
  const qy = y1 + t * dy
  return Math.hypot(px - qx, py - qy)
}

function hitTest(elements, x, y) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]
    if (el.kind !== 'wall' && pointInRotatedRect(x, y, el)) return el
  }
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i]
    if (el.kind === 'wall' && distToSegment(x, y, el.x1, el.y1, el.x2, el.y2) < WALL_HIT) return el
  }
  return null
}

function clampWallAfterDelta(orig, dx, dy, cw, ch) {
  let x1 = orig.x1 + dx
  let y1 = orig.y1 + dy
  let x2 = orig.x2 + dx
  let y2 = orig.y2 + dy
  let tdx = 0
  let tdy = 0
  const minx = Math.min(x1, x2)
  const maxx = Math.max(x1, x2)
  const miny = Math.min(y1, y2)
  const maxy = Math.max(y1, y2)
  if (minx < 0) tdx -= minx
  if (maxx > cw) tdx -= maxx - cw
  if (miny < 0) tdy -= miny
  if (maxy > ch) tdy -= maxy - ch
  x1 += tdx
  x2 += tdx
  y1 += tdy
  y2 += tdy
  return { x1, y1, x2, y2 }
}

export default function SchemaCanvasEditor({
  canvas: canvasProp,
  selectedMarketId,
  onSave,
  saving,
  vendorsOnMarket,
  onRequestEditStall,
}) {
  const floorGradId = useId().replace(/:/g, '')
  const [draft, setDraft] = useState(() => normalizeCanvas(canvasProp || DEFAULT_CANVAS))
  const [tool, setTool] = useState('select')
  const [selectedId, setSelectedId] = useState(null)
  const [wallAnchor, setWallAnchor] = useState(null)
  const [dragPreview, setDragPreview] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [hoverHit, setHoverHit] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const wrapRef = useRef(null)
  const rectDragRef = useRef(null)
  const draftRef = useRef(draft)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  useEffect(() => {
    setDraft(normalizeCanvas(canvasProp || DEFAULT_CANVAS))
    setSelectedId(null)
    setWallAnchor(null)
    setDragPreview(null)
    setCursor(null)
    setHoverHit(null)
    setIsDragging(false)
    rectDragRef.current = null
  }, [selectedMarketId, canvasProp])

  const cw = draft.width
  const ch = draft.height

  const clientToCanvas = useCallback(
    (cx, cy) => {
      const el = wrapRef.current
      if (!el) return { x: 0, y: 0 }
      const rect = el.getBoundingClientRect()
      const x = ((cx - rect.left) / rect.width) * cw
      const y = ((cy - rect.top) / rect.height) * ch
      return {
        x: Math.max(0, Math.min(cw, x)),
        y: Math.max(0, Math.min(ch, y)),
      }
    },
    [cw, ch],
  )

  const selectedEl = useMemo(() => draft.elements.find((e) => e.id === selectedId), [draft.elements, selectedId])

  const setBoxRotation = useCallback((id, degrees) => {
    const v = Number(degrees)
    if (!Number.isFinite(v) || !id) return
    const rotation = ((v % 360) + 360) % 360
    setDraft((d) => ({
      ...d,
      elements: d.elements.map((el) => (el.id === id && el.kind !== 'wall' ? { ...el, rotation } : el)),
    }))
  }, [])

  const removeSelected = useCallback(() => {
    if (!selectedId) return
    setDraft((d) => ({
      ...d,
      elements: d.elements.filter((e) => e.id !== selectedId),
    }))
    setSelectedId(null)
  }, [selectedId])

  useEffect(() => {
    const onKey = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeSelected()
        return
      }
      const d = draftRef.current
      const sid = selectedId
      if (!sid) return
      const sel = d.elements.find((x) => x.id === sid)
      if (!sel) return
      const step = e.shiftKey ? 8 : 2
      if (sel.kind === 'wall') {
        if (e.key === 'ArrowLeft')
          setDraft((dd) => ({
            ...dd,
            elements: dd.elements.map((el) =>
              el.id === sid ? { ...el, ...clampWallAfterDelta(el, -step, 0, dd.width, dd.height) } : el,
            ),
          }))
        if (e.key === 'ArrowRight')
          setDraft((dd) => ({
            ...dd,
            elements: dd.elements.map((el) =>
              el.id === sid ? { ...el, ...clampWallAfterDelta(el, step, 0, dd.width, dd.height) } : el,
            ),
          }))
        if (e.key === 'ArrowUp')
          setDraft((dd) => ({
            ...dd,
            elements: dd.elements.map((el) =>
              el.id === sid ? { ...el, ...clampWallAfterDelta(el, 0, -step, dd.width, dd.height) } : el,
            ),
          }))
        if (e.key === 'ArrowDown')
          setDraft((dd) => ({
            ...dd,
            elements: dd.elements.map((el) =>
              el.id === sid ? { ...el, ...clampWallAfterDelta(el, 0, step, dd.width, dd.height) } : el,
            ),
          }))
        return
      }
      if (e.key === 'ArrowLeft')
        setDraft((dd) => ({
          ...dd,
          elements: dd.elements.map((el) =>
            el.id === sid ? { ...el, x: Math.max(0, el.x - step) } : el,
          ),
        }))
      if (e.key === 'ArrowRight')
        setDraft((dd) => ({
          ...dd,
          elements: dd.elements.map((el) =>
            el.id === sid ? { ...el, x: Math.min(dd.width - el.w, el.x + step) } : el,
          ),
        }))
      if (e.key === 'ArrowUp')
        setDraft((dd) => ({
          ...dd,
          elements: dd.elements.map((el) =>
            el.id === sid ? { ...el, y: Math.max(0, el.y - step) } : el,
          ),
        }))
      if (e.key === 'ArrowDown')
        setDraft((dd) => ({
          ...dd,
          elements: dd.elements.map((el) =>
            el.id === sid ? { ...el, y: Math.min(dd.height - el.h, el.y + step) } : el,
          ),
        }))
      if (e.key === '[') setBoxRotation(sid, (Number(sel.rotation) || 0) - 5)
      if (e.key === ']') setBoxRotation(sid, (Number(sel.rotation) || 0) + 5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeSelected, selectedId, setBoxRotation])

  const finishRectDrag = useCallback(
    (kind, sx, sy, ex, ey) => {
      const x0 = Math.min(sx, ex)
      const y0 = Math.min(sy, ey)
      const ww = Math.abs(ex - sx)
      const hh = Math.abs(ey - sy)
      if (ww < MIN_RECT || hh < MIN_RECT) return
      const nx = Math.max(0, Math.min(cw - ww, x0))
      const ny = Math.max(0, Math.min(ch - hh, y0))
      const id = newElementId()
      if (kind === 'stall') {
        const code = `T-${Math.floor(Math.random() * 900 + 100)}`
        const stallEl = {
          id,
          kind: 'stall',
          x: nx,
          y: ny,
          w: ww,
          h: hh,
          rotation: 0,
          stallCode: code,
          vendorId: null,
        }
        setDraft((d) => ({ ...d, elements: [...d.elements, stallEl] }))
        setSelectedId(id)
        onRequestEditStall?.(stallEl)
      } else {
        setDraft((d) => ({
          ...d,
          elements: [...d.elements, { id, kind: 'tarti', x: nx, y: ny, w: ww, h: hh, rotation: 0 }],
        }))
      }
    },
    [cw, ch, onRequestEditStall],
  )

  const handlePointerDown = (e) => {
    if (e.button !== 0) return
    const { x, y } = clientToCanvas(e.clientX, e.clientY)

    if (tool === 'wall') {
      if (!wallAnchor) {
        setWallAnchor({ x, y })
      } else {
        const id = newElementId()
        setDraft((d) => ({
          ...d,
          elements: [
            ...d.elements,
            {
              id,
              kind: 'wall',
              x1: wallAnchor.x,
              y1: wallAnchor.y,
              x2: x,
              y2: y,
              thickness: 5,
            },
          ],
        }))
        setWallAnchor(null)
      }
      return
    }

    if (tool === 'erase') {
      const hit = hitTest(draftRef.current.elements, x, y)
      if (hit) setDraft((d) => ({ ...d, elements: d.elements.filter((el) => el.id !== hit.id) }))
      setSelectedId(null)
      return
    }

    if (tool === 'select') {
      const hit = hitTest(draftRef.current.elements, x, y)
      setSelectedId(hit?.id || null)
      if (!hit) return

      const orig = { ...hit }
      const ptr0 = { x, y }
      let moved = false
      const stage = e.currentTarget
      try {
        stage.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }

      const onMove = (ev) => {
        const p = clientToCanvas(ev.clientX, ev.clientY)
        if (!moved && Math.hypot(p.x - ptr0.x, p.y - ptr0.y) >= CLICK_MOVE_THRESH) moved = true
        if (!moved) return
        setIsDragging(true)
        const dx = p.x - ptr0.x
        const dy = p.y - ptr0.y
        setDraft((d) => ({
          ...d,
          elements: d.elements.map((el) => {
            if (el.id !== orig.id) return el
            if (el.kind === 'wall') {
              const next = clampWallAfterDelta(orig, dx, dy, d.width, d.height)
              return { ...el, ...next }
            }
            let nx = orig.x + dx
            let ny = orig.y + dy
            nx = Math.max(0, Math.min(d.width - orig.w, nx))
            ny = Math.max(0, Math.min(d.height - orig.h, ny))
            return { ...el, x: nx, y: ny }
          }),
        }))
      }

      const onUp = (ev) => {
        try {
          if (stage.hasPointerCapture?.(ev.pointerId)) stage.releasePointerCapture(ev.pointerId)
        } catch {
          /* ignore */
        }
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        setIsDragging(false)
        const p = clientToCanvas(ev.clientX, ev.clientY)
        const dist = Math.hypot(p.x - ptr0.x, p.y - ptr0.y)
        if (!moved && orig.kind === 'stall' && dist < CLICK_MOVE_THRESH) onRequestEditStall?.(orig)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
      return
    }

    if (tool === 'stall' || tool === 'tarti') {
      rectDragRef.current = { sx: x, sy: y, kind: tool }
      setDragPreview({ sx: x, sy: y, cx: x, cy: y })

      const onMove = (ev) => {
        const p = clientToCanvas(ev.clientX, ev.clientY)
        setDragPreview((d) => (d ? { ...d, cx: p.x, cy: p.y } : null))
      }
      const onUp = (ev) => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        const p = clientToCanvas(ev.clientX, ev.clientY)
        const r = rectDragRef.current
        rectDragRef.current = null
        setDragPreview(null)
        if (!r) return
        finishRectDrag(r.kind, r.sx, r.sy, p.x, p.y)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    }
  }

  const walls = draft.elements.filter((el) => el.kind === 'wall')
  const boxes = draft.elements.filter((el) => el.kind !== 'wall')

  const previewDrag =
    dragPreview &&
    Math.abs(dragPreview.cx - dragPreview.sx) >= MIN_RECT &&
    Math.abs(dragPreview.cy - dragPreview.sy) >= MIN_RECT
      ? {
          x: Math.min(dragPreview.sx, dragPreview.cx),
          y: Math.min(dragPreview.sy, dragPreview.cy),
          w: Math.abs(dragPreview.cx - dragPreview.sx),
          h: Math.abs(dragPreview.cy - dragPreview.sy),
        }
      : null

  const stageCursor =
    tool === 'select' && isDragging ? 'grabbing' : tool === 'select' && hoverHit ? 'grab' : 'crosshair'

  const showRotation =
    selectedEl && selectedEl.kind !== 'wall' && tool === 'select'

  return (
    <div className="schema-canvas-editor">
      <div className="schema-canvas-editor__toolbar">
        <button
          type="button"
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => {
            setTool('select')
            setWallAnchor(null)
          }}
        >
          <Icon name="near_me" size={16} />
          Seç / taşı
        </button>
        <button
          type="button"
          className={`tool-btn ${tool === 'wall' ? 'active' : ''}`}
          onClick={() => setTool('wall')}
          title="İki tık: duvar segmenti"
        >
          <Icon name="timeline" size={16} />
          Duvar
        </button>
        <button type="button" className={`tool-btn ${tool === 'stall' ? 'active' : ''}`} onClick={() => setTool('stall')}>
          <Icon name="storefront" size={16} />
          Tezgah
        </button>
        <button type="button" className={`tool-btn ${tool === 'tarti' ? 'active' : ''}`} onClick={() => setTool('tarti')}>
          <Icon name="scale" size={16} />
          Tartı
        </button>
        <button type="button" className={`tool-btn ${tool === 'erase' ? 'active' : ''}`} onClick={() => setTool('erase')}>
          <Icon name="ink_eraser" size={16} />
          Sil
        </button>
        {showRotation && (
          <label className="schema-canvas-editor__rotate-field">
            <span>Açı (°)</span>
            <input
              type="number"
              step={1}
              value={Math.round(Number(selectedEl.rotation) || 0)}
              onChange={(ev) => setBoxRotation(selectedEl.id, ev.target.value)}
            />
          </label>
        )}
        <span className="schema-canvas-editor__hint">
          {tool === 'wall'
            ? wallAnchor
              ? 'Bitiş noktasına tıklayın'
              : 'Başlangıç noktasına tıklayın'
            : tool === 'stall' || tool === 'tarti'
              ? 'Serbest dikdörtgen: sürükleyin (kare ızgara yok)'
              : tool === 'erase'
                ? 'Öğeye tıklayarak silin'
                : 'Duvar ve tezgâhı sürükleyin · tezgâha tek tık: esnaf · Shift+fare tekerleği: döndür'}
        </span>
        <button
          type="button"
          className="btn-v2 btn-primary schema-canvas-editor__save"
          disabled={saving}
          onClick={() => onSave?.(draft)}
        >
          {saving ? 'Kaydediliyor…' : 'Tuvali kaydet'}
        </button>
      </div>
      <p className="schema-canvas-editor__vendors-hint">
        Bu pazardaki esnaf: {vendorsOnMarket.length} kayıt · tezgâh seçerek atama yapın · ok tuşları: konum · [ ] : döndür.
      </p>
      <div className="schema-canvas-editor__wrap">
        <div
          ref={wrapRef}
          role="presentation"
          className="schema-canvas-editor__stage"
          style={{ aspectRatio: `${cw} / ${ch}`, cursor: stageCursor }}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => {
            const p = clientToCanvas(e.clientX, e.clientY)
            setCursor(p)
            if (tool === 'select' && !isDragging) {
              const h = hitTest(draftRef.current.elements, p.x, p.y)
              setHoverHit(h?.id || null)
            }
          }}
          onPointerLeave={() => {
            setHoverHit(null)
            setCursor(null)
          }}
          onWheel={(e) => {
            if (!e.shiftKey || !selectedId) return
            const sel = draftRef.current.elements.find((x) => x.id === selectedId)
            if (!sel || sel.kind === 'wall') return
            e.preventDefault()
            const delta = Math.sign(e.deltaY) * 4
            setBoxRotation(selectedId, (Number(sel.rotation) || 0) + delta)
          }}
        >
          <svg className="schema-canvas-editor__svg" viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id={floorGradId} cx="42%" cy="35%" r="85%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e8eef5" />
              </radialGradient>
            </defs>
            <rect width={cw} height={ch} fill={`url(#${floorGradId})`} />
            {walls.map((w) => (
              <line
                key={w.id}
                x1={w.x1}
                y1={w.y1}
                x2={w.x2}
                y2={w.y2}
                stroke={w.id === selectedId ? 'var(--accent)' : 'var(--schema-wall, #334155)'}
                strokeWidth={w.thickness || 5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {wallAnchor && cursor && (
              <line
                x1={wallAnchor.x}
                y1={wallAnchor.y}
                x2={cursor.x}
                y2={cursor.y}
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}
            {previewDrag && (
              <rect
                x={previewDrag.x}
                y={previewDrag.y}
                width={previewDrag.w}
                height={previewDrag.h}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="8 4"
              />
            )}
          </svg>
          <div className="schema-canvas-editor__html">
            {boxes.map((el) => {
              const cxPct = ((el.x + el.w / 2) / cw) * 100
              const cyPct = ((el.y + el.h / 2) / ch) * 100
              const widthPct = (el.w / cw) * 100
              const heightPct = (el.h / ch) * 100
              const rot = Number(el.rotation) || 0
              const isSel = el.id === selectedId
              return (
                <div
                  key={el.id}
                  className={`schema-canvas-editor__box schema-canvas-editor__box--${el.kind} ${isSel ? 'schema-canvas-editor__box--selected' : ''}`}
                  style={{
                    left: `${cxPct}%`,
                    top: `${cyPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                    transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                  }}
                >
                  <span className="schema-canvas-editor__box-label">
                    {el.kind === 'stall' ? el.stallCode || 'Tezgah' : el.kind === 'tarti' ? 'Tartı' : el.kind}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
