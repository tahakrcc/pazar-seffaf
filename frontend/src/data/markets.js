import { kernekMarketCanvas } from './kernekCanvasSchema.js'

// Malatya merkezli mock pazar verileri - Türkiye geneli 81 il
export const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export const markets = [
  { id: 1, name: 'Kernek Semt Pazarı', district: 'Battalgazi', city: 'Malatya', lat: 38.3554, lng: 38.3096, days: [2, 5], hours: '07:00-17:00', vendorCount: 120, type: 'Semt Pazarı', address: 'Kernek Mah., Battalgazi/Malatya', image: '/market_1_1777411006018.png' },
  { id: 2, name: 'Çarşamba Pazarı', district: 'Yeşilyurt', city: 'Malatya', lat: 38.3200, lng: 38.2800, days: [3], hours: '06:30-16:00', vendorCount: 85, type: 'Semt Pazarı', address: 'Tecde Mah., Yeşilyurt/Malatya', image: '/market_2_1777411026004.png' },
  { id: 3, name: 'Cumartesi Halk Pazarı', district: 'Battalgazi', city: 'Malatya', lat: 38.3600, lng: 38.3200, days: [6], hours: '07:00-18:00', vendorCount: 150, type: 'Halk Pazarı', address: 'Saray Mah., Battalgazi/Malatya', image: '/market_3_1777411048594.png' },
  { id: 4, name: 'İnönü Mahalle Pazarı', district: 'Battalgazi', city: 'Malatya', lat: 38.3450, lng: 38.3050, days: [1, 4], hours: '06:00-15:00', vendorCount: 65, type: 'Semt Pazarı', address: 'İnönü Mah., Battalgazi/Malatya', image: '/market_1_1777411006018.png' },
  { id: 5, name: 'Beydağı Pazarı', district: 'Yeşilyurt', city: 'Malatya', lat: 38.3150, lng: 38.2650, days: [0, 3], hours: '07:00-16:00', vendorCount: 90, type: 'Organik Pazar', address: 'Beydağı Mah., Yeşilyurt/Malatya', image: '/market_2_1777411026004.png' },
  { id: 6, name: 'Perşembe Pazarı', district: 'Battalgazi', city: 'Malatya', lat: 38.3580, lng: 38.3150, days: [4], hours: '06:30-17:00', vendorCount: 110, type: 'Semt Pazarı', address: 'İstasyon Mah., Battalgazi/Malatya', image: '/market_3_1777411048594.png' },
  { id: 7, name: 'Pazartesi Pazar Yeri', district: 'Yeşilyurt', city: 'Malatya', lat: 38.3100, lng: 38.2700, days: [1], hours: '07:00-15:00', vendorCount: 45, type: 'Mahalle Pazarı', address: 'Şifaiye Mah., Yeşilyurt/Malatya', image: '/market_1_1777411006018.png' },
  { id: 8, name: 'Kadıköy Pazarı', district: 'Kadıköy', city: 'İstanbul', lat: 40.9904, lng: 29.0233, days: [2, 5], hours: '07:00-19:00', vendorCount: 300, type: 'Semt Pazarı', address: 'Caferağa Mah., Kadıköy/İstanbul', image: '/market_2_1777411026004.png' },
  { id: 9, name: 'Beşiktaş Cumartesi Pazarı', district: 'Beşiktaş', city: 'İstanbul', lat: 41.0422, lng: 29.0053, days: [6], hours: '07:00-18:00', vendorCount: 200, type: 'Organik Pazar', address: 'Beşiktaş Meydanı, Beşiktaş/İstanbul', image: '/market_3_1777411048594.png' },
  { id: 10, name: 'Kızılay Halk Pazarı', district: 'Çankaya', city: 'Ankara', lat: 39.9215, lng: 32.8537, days: [3, 6], hours: '06:00-17:00', vendorCount: 180, type: 'Halk Pazarı', address: 'Kızılay Mah., Çankaya/Ankara', image: '/market_1_1777411006018.png' },
  { id: 11, name: 'Kemeraltı Pazarı', district: 'Konak', city: 'İzmir', lat: 38.4189, lng: 27.1287, days: [0, 3, 6], hours: '08:00-20:00', vendorCount: 250, type: 'Tarihi Pazar', address: 'Kemeraltı, Konak/İzmir', image: '/market_2_1777411026004.png' },
  { id: 12, name: 'Antalya Cumartesi Pazarı', district: 'Muratpaşa', city: 'Antalya', lat: 36.8969, lng: 30.7133, days: [6], hours: '07:00-16:00', vendorCount: 160, type: 'Semt Pazarı', address: 'Muratpaşa/Antalya', image: '/market_3_1777411048594.png' },
];

export const products = [
  { id: 1, name: 'Domates', abbr: 'DOM', category: 'Sebze', unit: 'kg', subtypes: ['Çeri Domates','Salkım Domates','Köy Domatesi','Sofralık Domates'] },
  { id: 2, name: 'Biber', abbr: 'BBR', category: 'Sebze', unit: 'kg', subtypes: ['Sivri Biber','Dolmalık Biber','Çarliston Biber','Kapya Biber'] },
  { id: 3, name: 'Patlıcan', abbr: 'PTL', category: 'Sebze', unit: 'kg', subtypes: ['Kemer Patlıcan','Bostan Patlıcan','Parmak Patlıcan'] },
  { id: 4, name: 'Salatalık', abbr: 'SLT', category: 'Sebze', unit: 'kg', subtypes: ['Çengelköy Salatalık','Hıyar','Kornişon'] },
  { id: 5, name: 'Elma', abbr: 'ELM', category: 'Meyve', unit: 'kg', subtypes: ['Starking Elma','Golden Elma','Granny Smith','Amasya Elması'] },
  { id: 6, name: 'Portakal', abbr: 'PRT', category: 'Meyve', unit: 'kg', subtypes: ['Washington Portakal','Sıkmalık Portakal','Kan Portakalı'] },
  { id: 7, name: 'Muz', abbr: 'MUZ', category: 'Meyve', unit: 'kg', subtypes: ['Yerli Muz','İthal Muz'] },
  { id: 8, name: 'Soğan', abbr: 'SĞN', category: 'Sebze', unit: 'kg', subtypes: ['Kuru Soğan','Taze Soğan','Mor Soğan'] },
  { id: 9, name: 'Patates', abbr: 'PTS', category: 'Sebze', unit: 'kg', subtypes: ['Taze Patates','Kışlık Patates'] },
  { id: 10, name: 'Limon', abbr: 'LMN', category: 'Meyve', unit: 'kg', subtypes: ['Mersin Limonu','Meyer Limon'] },
  { id: 11, name: 'Üzüm', abbr: 'ÜZM', category: 'Meyve', unit: 'kg', subtypes: ['Çekirdeksiz Üzüm','Sultani Üzüm','Kara Üzüm','Red Globe'] },
  { id: 12, name: 'Havuç', abbr: 'HVC', category: 'Sebze', unit: 'kg', subtypes: ['Baby Havuç','Kışlık Havuç'] },
  { id: 13, name: 'Kayısı', abbr: 'KYS', category: 'Meyve', unit: 'kg', subtypes: ['Malatya Kayısısı','Şekerpare','İğdır Kayısısı'] },
  { id: 14, name: 'Yumurta', abbr: 'YMR', category: 'Diğer', unit: 'adet (30lu)', subtypes: ['Köy Yumurtası','Organik Yumurta','Serbest Gezen'] },
  { id: 15, name: 'Peynir', abbr: 'PYN', category: 'Süt Ürünü', unit: 'kg', subtypes: ['Beyaz Peynir','Kaşar','Tulum Peyniri','Van Otlu Peynir','Lor'] },
  { id: 16, name: 'Zeytin', abbr: 'ZYT', category: 'Diğer', unit: 'kg', subtypes: ['Siyah Zeytin','Yeşil Zeytin','Gemlik Zeytini','Çizik Zeytin'] },
];

export function getMarketPrices(marketId) {
  const seed = marketId * 7;
  return products.map((p, i) => {
    const base = 15 + ((seed + i * 13) % 40);
    const min = base - 3 - (i % 4);
    const max = base + 5 + (i % 3);
    const median = (min + max) / 2;
    const confidence = 60 + ((seed + i) % 35);
    return { ...p, minPrice: Math.max(2, min), maxPrice: max, medianPrice: median.toFixed(1), confidence };
  });
}

export const vendors = [
  // Kernek Semt Pazarı (id: 1)
  { id: 1, marketId: 1, name: 'Ahmet Yılmaz', stall: 'A-12', score: 92, products: [1,2,3,4] },
  { id: 2, marketId: 1, name: 'Mehmet Kaya', stall: 'B-05', score: 87, products: [5,6,7,10] },
  { id: 3, marketId: 1, name: 'Fatma Demir', stall: 'C-18', score: 95, products: [8,9,12] },
  { id: 4, marketId: 1, name: 'Ali Öztürk', stall: 'A-03', score: 78, products: [1,5,11,13] },
  { id: 5, marketId: 1, name: 'Ayşe Çelik', stall: 'D-07', score: 88, products: [14,15,16] },
  { id: 6, marketId: 1, name: 'Hasan Acar', stall: 'B-22', score: 65, products: [2,3,4,8] },
  { id: 7, marketId: 1, name: 'Zeynep Şahin', stall: 'C-01', score: 91, products: [5,6,7] },
  { id: 8, marketId: 1, name: 'Mustafa Arslan', stall: 'A-15', score: 73, products: [9,12,1] },

  // Çarşamba Pazarı (id: 2)
  { id: 9, marketId: 2, name: 'Kemal Sunal', stall: 'Z-01', score: 98, products: [1,3,8,9] },
  { id: 10, marketId: 2, name: 'Halit Akçatepe', stall: 'Z-02', score: 85, products: [5,6,7] },
  { id: 11, marketId: 2, name: 'Şener Şen', stall: 'Y-01', score: 94, products: [14,15] },
  { id: 12, marketId: 2, name: 'Adile Naşit', stall: 'Y-02', score: 99, products: [2,4,12] },
  { id: 13, marketId: 2, name: 'Münir Özkul', stall: 'X-05', score: 91, products: [10,11,13] },

  // Beydağı Pazarı (id: 5)
  { id: 14, marketId: 5, name: 'Tarık Akan', stall: 'M-10', score: 89, products: [1,2,5] },
  { id: 15, marketId: 5, name: 'Türkan Şoray', stall: 'M-11', score: 96, products: [15,16] },
  { id: 16, marketId: 5, name: 'Kadir İnanır', stall: 'N-01', score: 88, products: [3,4,8,9] },

  // Beşiktaş Cumartesi Pazarı (id: 9)
  { id: 17, marketId: 9, name: 'Selim Beşiktaşlı', stall: 'BS-01', score: 93, products: [1,2,3,4] },
  { id: 18, marketId: 9, name: 'Emine Orhan', stall: 'BS-02', score: 89, products: [5,6,7,10] },
  { id: 19, marketId: 9, name: 'Oğuz Deniz', stall: 'BS-03', score: 91, products: [8,9,12] },
  { id: 20, marketId: 9, name: 'Pınar Aksoy', stall: 'BS-04', score: 87, products: [14,15,16] },
  { id: 21, marketId: 9, name: 'Murat Çınar', stall: 'BS-05', score: 95, products: [1,5,11,13] },
  { id: 22, marketId: 9, name: 'Gülhanım Tekin', stall: 'BS-06', score: 90, products: [2,4,6] },
  { id: 23, marketId: 9, name: 'Barış Yıldırım', stall: 'BS-07', score: 84, products: [3,9,10] },
  { id: 24, marketId: 9, name: 'Canan Ertürk', stall: 'BS-08', score: 92, products: [7,12,15] },
];

export const inspections = [
  { id: 1, marketId: 1, date: '2026-04-28', inspector: 'Zabıta Memuru K. Yıldız', status: 'completed', violations: 0, notes: 'Tüm tezgahlar uygun.' },
  { id: 2, marketId: 2, date: '2026-04-27', inspector: 'Zabıta Memuru A. Koç', status: 'violation', violations: 2, notes: 'Fiyat etiketi eksikliği (2 tezgah).' },
  { id: 3, marketId: 3, date: '2026-04-26', inspector: 'Zabıta Memuru S. Polat', status: 'pending', violations: 0, notes: 'Denetim planlandı.' },
];

// ===== DYNAMIC MUTATION FUNCTIONS =====
export function addMarket(marketData) {
  const newId = markets.length > 0 ? Math.max(...markets.map(m => m.id)) + 1 : 1;
  const newMarket = { id: newId, ...marketData };
  markets.push(newMarket);
  return newMarket;
}

export function addVendor(vendorData) {
  const newId = vendors.length > 0 ? Math.max(...vendors.map(v => v.id)) + 1 : 1;
  const newVendor = { id: newId, ...vendorData };
  vendors.push(newVendor);
  return newVendor;
}

export function addInspection(inspectionData) {
  const newId = inspections.length > 0 ? Math.max(...inspections.map(i => i.id)) + 1 : 1;
  const newInsp = { id: newId, ...inspectionData };
  inspections.push(newInsp);
  return newInsp;
}

// ===== DYNAMIC 2D GRID SCHEMA BUILDER STATE =====
const GRID_COLS = 30;
const GRID_ROWS = 30;

function createDefaultGrid() {
  const cells = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const id = `${r}-${c}`;
      cells.push({ id, type: 'empty', stallCode: null, vendorId: null });
    }
  }
  return { cols: GRID_COLS, rows: GRID_ROWS, cells };
}

export const marketSchemas = {};

// Initialize mock schemas
markets.forEach(m => {
  const schema = createDefaultGrid();
  
  if (m.id === 1) { // Kernek
    for(let c=0; c<GRID_COLS; c++) { schema.cells[c].type = 'wall'; schema.cells[(GRID_ROWS-1)*GRID_COLS + c].type = 'wall'; }
    for(let r=0; r<GRID_ROWS; r++) { schema.cells[r*GRID_COLS].type = 'wall'; schema.cells[r*GRID_COLS + GRID_COLS-1].type = 'wall'; }
    schema.cells[GRID_COLS/2].type = 'entrance'; schema.cells[(GRID_ROWS-1)*GRID_COLS + GRID_COLS/2].type = 'exit';
    
    const addStall = (r, c, code, vendorId) => { const cell = schema.cells[r*GRID_COLS + c]; cell.type = 'stall'; cell.stallCode = code; cell.vendorId = vendorId; };
    addStall(2, 2, 'A-12', 1); addStall(2, 3, 'B-05', 2); addStall(2, 4, 'A-03', 4);
    addStall(4, 2, 'C-18', 3); addStall(4, 3, 'D-07', 5); addStall(4, 4, 'B-22', 6);
    addStall(2, 8, 'C-01', 7); addStall(3, 8, 'A-15', 8);
  }
  else if (m.id === 2) { // Çarşamba
    for(let c=0; c<GRID_COLS; c++) { schema.cells[c].type = 'wall'; schema.cells[(GRID_ROWS-1)*GRID_COLS + c].type = 'wall'; }
    for(let r=0; r<GRID_ROWS; r++) { schema.cells[r*GRID_COLS].type = 'wall'; schema.cells[r*GRID_COLS + GRID_COLS-1].type = 'wall'; }
    schema.cells[2].type = 'entrance'; schema.cells[(GRID_ROWS-1)*GRID_COLS + 5].type = 'exit';
    
    const addStall = (r, c, code, vendorId) => { const cell = schema.cells[r*GRID_COLS + c]; cell.type = 'stall'; cell.stallCode = code; cell.vendorId = vendorId; };
    addStall(3, 3, 'Z-01', 9); addStall(3, 4, 'Z-02', 10);
    addStall(5, 3, 'Y-01', 11); addStall(5, 4, 'Y-02', 12);
    addStall(7, 5, 'X-05', 13);
  }
  else if (m.id === 5) { // Beydağı
    for(let c=0; c<GRID_COLS; c++) { schema.cells[c].type = 'wall'; } // Only top wall
    schema.cells[GRID_COLS/2].type = 'entrance';
    
    const addStall = (r, c, code, vendorId) => { const cell = schema.cells[r*GRID_COLS + c]; cell.type = 'stall'; cell.stallCode = code; cell.vendorId = vendorId; };
    addStall(2, 2, 'M-10', 14); addStall(2, 3, 'M-11', 15);
    addStall(4, 2, 'N-01', 16);
  }
  else if (m.id === 9) { // Beşiktaş Cumartesi Pazarı
    for(let c=0; c<GRID_COLS; c++) { schema.cells[c].type = 'wall'; schema.cells[(GRID_ROWS-1)*GRID_COLS + c].type = 'wall'; }
    for(let r=0; r<GRID_ROWS; r++) { schema.cells[r*GRID_COLS].type = 'wall'; schema.cells[r*GRID_COLS + GRID_COLS-1].type = 'wall'; }
    schema.cells[GRID_COLS/2].type = 'entrance'; schema.cells[(GRID_ROWS-1)*GRID_COLS + GRID_COLS/2].type = 'exit';

    const addStall = (r, c, code, vendorId) => { const cell = schema.cells[r*GRID_COLS + c]; cell.type = 'stall'; cell.stallCode = code; cell.vendorId = vendorId; };
    addStall(3, 3, 'BS-01', 17); addStall(3, 4, 'BS-02', 18); addStall(3, 5, 'BS-03', 19); addStall(3, 6, 'BS-04', 20);
    addStall(5, 3, 'BS-05', 21); addStall(5, 4, 'BS-06', 22); addStall(5, 5, 'BS-07', 23); addStall(5, 6, 'BS-08', 24);
  }

  marketSchemas[m.id] = schema;
});

export function getMarketSchema(marketId, isEditor = false) {
  const schema = marketSchemas[marketId] || createDefaultGrid();
  if (isEditor) return schema;

  // Crop to bounding box for the end-user display
  let minR = GRID_ROWS, maxR = -1;
  let minC = GRID_COLS, maxC = -1;

  schema.cells.forEach(cell => {
    if (cell.type !== 'empty') {
      const [r, c] = cell.id.split('-').map(Number);
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }
  });

  if (maxR === -1) {
    // If completely empty, return a default 5x5 slice
    const defaultSliceCols = 5;
    const defaultSliceRows = 5;
    const defaultCells = [];
    for(let r=0; r<defaultSliceRows; r++){
      for(let c=0; c<defaultSliceCols; c++) {
        defaultCells.push({ id: `${r}-${c}`, type: 'empty', stallCode: null, vendorId: null });
      }
    }
    const emptySlice = { cols: defaultSliceCols, rows: defaultSliceRows, cells: defaultCells }
    if (marketId === 1) emptySlice.canvas = kernekMarketCanvas
    return emptySlice
  }

  // Add 1 cell padding if possible
  minR = Math.max(0, minR - 1);
  maxR = Math.min(GRID_ROWS - 1, maxR + 1);
  minC = Math.max(0, minC - 1);
  maxC = Math.min(GRID_COLS - 1, maxC + 1);

  const croppedCols = maxC - minC + 1;
  const croppedRows = maxR - minR + 1;
  const croppedCells = [];

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      const cell = schema.cells.find(cl => cl.id === `${r}-${c}`);
      if (cell) croppedCells.push(cell);
    }
  }

  const out = { cols: croppedCols, rows: croppedRows, cells: croppedCells }
  if (marketId === 1) out.canvas = kernekMarketCanvas
  return out
}

export function updateGridCell(marketId, cellId, updates) {
  if (!marketSchemas[marketId]) {
    marketSchemas[marketId] = createDefaultGrid();
  }
  
  const schema = marketSchemas[marketId];
  const cell = schema.cells.find(c => c.id === cellId);
  if (cell) {
    Object.assign(cell, updates);
    return true;
  }
  return false;
}

export function updateStallAssignment(marketId, cellId, vendorId) {
  return updateGridCell(marketId, cellId, { vendorId: vendorId ? Number(vendorId) : null });
}

// ===== PRICE TRENDS (Mock 7-day history) =====
export function getPriceTrend(productId, marketId) {
  const seed = productId * 31 + marketId * 7;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const base = 15 + ((seed + i * 13) % 40);
    const variation = Math.sin(seed + i) * 5;
    days.push(Math.max(5, Math.round((base + variation) * 10) / 10));
  }
  const first = days[0], last = days[6];
  const change = ((last - first) / first * 100).toFixed(1);
  const direction = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';
  return { days, change: Math.abs(change), direction };
}

// ===== WEATHER MOCK =====
export const weatherData = {
  'Malatya': { temp: 22, desc: 'Güneşli', icon: '☀️', tip: 'Pazar alışverişi için ideal hava!' },
  'İstanbul': { temp: 18, desc: 'Parçalı Bulutlu', icon: '⛅', tip: 'Şemsiye yanınızda bulunsun.' },
  'Ankara': { temp: 20, desc: 'Açık', icon: '☀️', tip: 'Harika bir pazar günü!' },
  'İzmir': { temp: 25, desc: 'Güneşli', icon: '🌤️', tip: 'Sıcak olacak, su almayı unutmayın.' },
  'Antalya': { temp: 28, desc: 'Sıcak', icon: '🔥', tip: 'Güneş kremi kullanın!' },
};

// ===== SHOPPING LIST COMPARISON =====
export function compareShoppingList(productIds) {
  const results = [];
  const marketIds = [...new Set(markets.map(m => m.id))];
  marketIds.forEach(mId => {
    const m = markets.find(mk => mk.id === mId);
    const prices = getMarketPrices(mId);
    let total = 0;
    let found = 0;
    productIds.forEach(pid => {
      const p = prices.find(pr => pr.id === pid);
      if (p) { total += parseFloat(p.medianPrice); found++; }
    });
    if (found > 0) results.push({ marketId: mId, name: m.name, city: m.city, total: Math.round(total * 10) / 10, found });
  });
  return results.sort((a, b) => a.total - b.total);
}

// ===== VENDOR BADGE =====
export function getVendorBadge(score) {
  if (score >= 90) return { label: 'Altın', icon: '', className: 'gold' };
  if (score >= 75) return { label: 'Gümüş', icon: '', className: 'silver' };
  if (score >= 60) return { label: 'Bronz', icon: '', className: 'bronze' };
  return { label: 'Yeni', icon: '', className: 'bronze' };
}

// ===== NOTIFICATIONS MOCK =====
export const notifications = [
  { id: 1, type: 'price', icon: '📉', iconBg: 'var(--success-bg)', title: 'Fiyat Düştü!', desc: 'Domates fiyatı Kernek Pazarı\'nda ₺28/kg\'a düştü.', time: '5 dk önce' },
  { id: 2, type: 'market', icon: '🛒', iconBg: 'var(--accent-glow)', title: 'Yarın Pazar Açık', desc: 'Çarşamba Pazarı yarın açık, 85 esnaf sizi bekliyor!', time: '1 saat önce' },
  { id: 3, type: 'inspection', icon: '✅', iconBg: 'var(--success-bg)', title: 'Denetim Tamamlandı', desc: 'Kernek Semt Pazarı denetimden başarıyla geçti.', time: '3 saat önce' },
  { id: 4, type: 'alert', icon: '⚠️', iconBg: 'var(--warning-bg)', title: 'Fiyat Artışı Uyarısı', desc: 'Biber fiyatı son 3 günde %15 arttı.', time: '5 saat önce' },
  { id: 5, type: 'weather', icon: '☀️', iconBg: 'var(--warning-bg)', title: 'Hava Durumu', desc: 'Bugün 22°C güneşli, pazar alışverişi için ideal!', time: '6 saat önce' },
];
