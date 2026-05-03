/**
 * Ürün kartlarında kısaltma yerine Material Symbols ikon adı.
 * https://fonts.google.com/icons
 */
const PRODUCT_ICON_BY_ID = {
  1: 'nutrition',
  2: 'local_fire_department',
  3: 'brunch_dining',
  4: 'spa',
  5: 'nutrition',
  6: 'wb_sunny',
  7: 'restaurant_menu',
  8: 'layers',
  9: 'agriculture',
  10: 'water_drop',
  11: 'wine_bar',
  12: 'eco',
  13: 'nutrition',
  14: 'egg_alt',
  15: 'breakfast_dining',
  16: 'eco',
}

export function getProductIconName(product) {
  const id = product?.id
  if (id != null && PRODUCT_ICON_BY_ID[id]) {
    return PRODUCT_ICON_BY_ID[id]
  }
  const cat = product?.category
  if (cat === 'Sebze') return 'eco'
  if (cat === 'Meyve') return 'nutrition'
  if (cat === 'Süt Ürünü') return 'breakfast_dining'
  return 'shopping_basket'
}
