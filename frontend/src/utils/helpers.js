// Geolocation utility
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation desteklenmiyor'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function isMarketOpenToday(market) {
  if ((market?.city || '').trim().toLowerCase() === 'malatya') return true;
  const today = new Date().getDay();
  return market.days.includes(today);
}

export function getNextOpenDay(market) {
  const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const today = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const check = (today + i) % 7;
    if (market.days.includes(check)) {
      return i === 1 ? 'Yarın' : DAYS_TR[check];
    }
  }
  return '';
}

export function getMapsLink(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// City matching from coordinates (simplified)
const CITY_COORDS = {
  'Malatya': { lat: 38.35, lng: 38.31 },
  'İstanbul': { lat: 41.01, lng: 28.97 },
  'Ankara': { lat: 39.93, lng: 32.85 },
  'İzmir': { lat: 38.42, lng: 27.13 },
  'Antalya': { lat: 36.90, lng: 30.71 },
  'Bursa': { lat: 40.19, lng: 29.06 },
  'Adana': { lat: 37.00, lng: 35.32 },
};

export function findClosestCity(lat, lng) {
  let minDist = Infinity;
  let closest = 'Malatya';
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    const d = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (d < minDist) { minDist = d; closest = city; }
  }
  return closest;
}
