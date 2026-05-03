import Icon from './Icon.jsx'
import { getToolMeta } from '../config/schemaCellTypes.js'

/**
 * Şema hücresinin içerik/glyph — duvar çizgisi üst öğede (style) kalır.
 */
export default function SchemaCellInner({
  cell,
  vendor,
  adminMode,
  mergedTools,
  iconSize = 18,
  is3D = false,
}) {
  const meta = getToolMeta(cell.type, mergedTools)

  if (cell.type === 'wall') return null

  if (cell.type === 'stall') {
    return (
      <div className="stall-visual">
        {is3D ? (
          <>
            <div className="stall-awning" aria-hidden />
            {vendor ? <div className="stall-products" aria-hidden /> : null}
          </>
        ) : (
          <div className="stall-awning stall-awning--2d" aria-hidden />
        )}
        <div className="stall-visual__counter">
          <span className="s-code">{cell.stallCode}</span>
          {vendor ? (
            <span className="s-vendor">{vendor.name.split(' ')[0]}</span>
          ) : (
            <span className="s-vendor schema-cell-muted">{adminMode ? 'BOŞ' : '—'}</span>
          )}
        </div>
      </div>
    )
  }

  if (cell.type === 'entrance') {
    return (
      <span className="schema-cell-glyph schema-cell-glyph--in" title="Giriş">
        <Icon name="door_front" size={iconSize} label="Giriş" />
      </span>
    )
  }

  if (cell.type === 'exit') {
    return (
      <span className="schema-cell-glyph schema-cell-glyph--out" title="Çıkış">
        <Icon name="door_open" size={iconSize} label="Çıkış" />
      </span>
    )
  }

  if (cell.type === 'empty' || cell.type === 'corridor') {
    return cell.type === 'corridor' ? (
      <span className="schema-cell-corridor-mark" title="Yürüyüş yolu">
        <Icon name="directions_walk" size={iconSize - 2} />
      </span>
    ) : null
  }

  return (
    <span className="schema-cell-service" title={meta.label}>
      <Icon name={meta.icon} size={iconSize} />
      <span className="schema-cell-service__lbl">{meta.shortLabel}</span>
    </span>
  )
}
