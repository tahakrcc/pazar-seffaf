export function isValidPhone(phone) {
  const input = (phone || '').trim()
  if (!/^\+?[0-9\s()-]+$/.test(input)) return false
  const digits = input.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function getStallPhoto(vendorId) {
  try {
    const raw = localStorage.getItem('pazar_stall_photo_v1')
    if (!raw) return ''
    const map = JSON.parse(raw)
    return map?.[String(vendorId)] || ''
  } catch {
    return ''
  }
}

export function vendorInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const w = parts[0] || '?'
  return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w[0].toUpperCase()
}
