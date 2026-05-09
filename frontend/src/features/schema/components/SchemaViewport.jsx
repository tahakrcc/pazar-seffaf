import { memo } from 'react'
import { normalizeLayout } from '../model/layoutModel.js'
import Schema2DScene from '../render2d/Schema2DScene.jsx'
import Schema3DScene from '../render3d/Schema3DScene.jsx'

const SchemaViewport = memo(function SchemaViewport(props) {
  const { layout, is3D, vendors, onSelectStall } = props
  const normalized = normalizeLayout(layout)

  if (is3D) {
    return (
      <Schema3DScene
        layout={normalized}
        vendors={vendors}
        selectedFilterProducts={props.selectedFilterProducts}
        selectedStall={props.selectedStall}
        onSelectStall={onSelectStall}
      />
    )
  }

  /* Konva tabanlı 2D sahne — zoom/pan/pinch tamamen kütüphane tarafından yönetilir */
  return (
    <Schema2DScene
      layout={normalized}
      vendors={vendors}
      selectedFilterProducts={props.selectedFilterProducts}
      selectedStall={props.selectedStall}
      onSelectStall={onSelectStall}
      mergedSchemaTools={props.mergedSchemaTools}
      onTartiHint={props.onTartiHint}
      onEmptyStallHint={props.onEmptyStallHint}
    />
  )
})

export default SchemaViewport
