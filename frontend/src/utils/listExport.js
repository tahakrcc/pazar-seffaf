/**
 * Alışveriş listesini PNG olarak indirir (canvas).
 */
export async function exportShoppingListImage({
  title = 'Alışveriş listesi',
  city = '',
  rows = [],
  footerLines = [],
}) {
  const scale = 2
  const pad = 40
  const lineH = 36
  const titleSize = 22
  const bodySize = 15
  const smallSize = 13
  const maxRows = 40
  const slice = rows.slice(0, maxRows)
  const extra = rows.length > maxRows ? 1 : 0
  const w = 720
  const h = pad * 2 + titleSize + 28 + slice.length * lineH + extra * lineH + footerLines.length * (smallSize + 8) + 24

  const canvas = document.createElement('canvas')
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas desteklenmiyor.')
  }
  ctx.scale(scale, scale)

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1)

  ctx.fillStyle = '#0f172a'
  ctx.font = `700 ${titleSize}px Inter, system-ui, sans-serif`
  ctx.fillText(title, pad, pad + titleSize - 4)

  ctx.fillStyle = '#64748b'
  ctx.font = `600 ${smallSize}px Inter, system-ui, sans-serif`
  const sub = city ? `Şehir: ${city}` : 'Pazar Şeffaf'
  ctx.fillText(sub, pad, pad + titleSize + 14)

  let y = pad + titleSize + 36
  ctx.font = `600 ${bodySize}px Inter, system-ui, sans-serif`

  slice.forEach((row) => {
    ctx.fillStyle = '#0f172a'
    const left = row.left ?? ''
    const right = row.right ?? ''
    ctx.fillText(left, pad, y)
    ctx.textAlign = 'right'
    ctx.fillText(right, w - pad, y)
    ctx.textAlign = 'left'
    y += lineH
  })

  if (extra) {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `500 ${smallSize}px Inter, system-ui, sans-serif`
    ctx.fillText(`… ve ${rows.length - maxRows} satır daha (tam liste uygulamada)`, pad, y + smallSize)
    y += lineH
  }

  ctx.fillStyle = '#475569'
  ctx.font = `500 ${smallSize}px Inter, system-ui, sans-serif`
  footerLines.forEach((line) => {
    y += smallSize + 8
    ctx.fillText(line, pad, y)
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Görsel oluşturulamadı.'))
          return
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pazar-listesi-${Date.now()}.png`
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        resolve()
      },
      'image/png',
      0.92,
    )
  })
}
