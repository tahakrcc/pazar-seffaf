export function vendorForStall(node, vendors) {
  if (!node || node.kind !== 'stall' || !Array.isArray(vendors)) return null
  if (node.vendorId != null) {
    const byId = vendors.find((v) => Number(v.id) === Number(node.vendorId))
    if (byId) return byId
  }
  const code = String(node.stallCode || '').trim().toLowerCase()
  if (!code) return null
  return vendors.find((v) => String(v.stallCode || v.stall || '').trim().toLowerCase() === code) || null
}

export function stallHasFilterProduct(vendor, selectedFilterProducts) {
  if (!vendor || !Array.isArray(vendor.products) || !Array.isArray(selectedFilterProducts)) return false
  return vendor.products.some((pid) => selectedFilterProducts.some((p) => Number(p.id) === Number(pid)))
}
