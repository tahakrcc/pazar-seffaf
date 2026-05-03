/** Belediye portalı — rol başına görev paneli yolu */

export const PANEL_PATH = {
  Vatandaş: '/panel/vatandas',
  Esnaf: '/panel/esnaf/ozet',
  Zabıta: '/panel/zabita',
  'Zabıta Müdürü': '/panel/mudur',
  Yönetici: '/panel/yonetici',
}

export function getPanelPathForRole(role) {
  if (!role) return '/'
  return PANEL_PATH[role] || '/'
}

/** Panel URL'si ile oturum rolü uyumlu mu (alt yollar dahil). */
export function roleMatchesPath(role, pathname) {
  const p = pathname.replace(/\/$/, '')
  if (p.startsWith('/panel/esnaf')) return role === 'Esnaf'
  if (p.startsWith('/panel/zabita')) return role === 'Zabıta'
  if (p.startsWith('/panel/mudur')) return role === 'Zabıta Müdürü'
  if (p.startsWith('/panel/yonetici')) return role === 'Yönetici'
  if (p.startsWith('/panel/vatandas')) return role === 'Vatandaş'
  return true
}
