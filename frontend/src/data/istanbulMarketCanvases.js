/**
 * İstanbul pazarları — her biri farklı yerleşim (orta koridor, dik sıra, U blok vb.)
 * Tuval formatı kernekCanvasSchema ile uyumlu (version/width/height/elements).
 */

const W = 8

function box(x0, y0, x1, y1) {
  return [
    { id: `bx_t_${x0}`, kind: 'wall', x1: x0, y1: y0, x2: x1, y2: y0, thickness: W },
    { id: `bx_r_${x0}`, kind: 'wall', x1: x1, y1: y0, x2: x1, y2: y1, thickness: W },
    { id: `bx_b_${x0}`, kind: 'wall', x1: x1, y1: y1, x2: x0, y2: y1, thickness: W },
    { id: `bx_l_${x0}`, kind: 'wall', x1: x0, y1: y1, x2: x0, y2: y0, thickness: W },
  ]
}

function stall(id, x, y, code, vendorId, sw = 86, sh = 64) {
  return { id, kind: 'stall', x, y, w: sw, h: sh, stallCode: code, vendorId }
}

/** Kadıköy: İki uzun tezgâh sırası, ortada geniş yürüyüş yolu (yüz yüze) */
function canvasKadikoy() {
  const width = 1020
  const height = 700
  const x0 = 36
  const y0 = 36
  const x1 = 984
  const y1 = 664
  const walls = box(x0, y0, x1, y1)
  const vendors = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
  const codes = ['KDK-01', 'KDK-02', 'KDK-03', 'KDK-04', 'KDK-05', 'KDK-06', 'KDK-07', 'KDK-08', 'KDK-09', 'KDK-10']
  const stalls = []
  let i = 0
  for (let c = 0; c < 5; c++) {
    stalls.push(stall(`kd_a_${c}`, 72 + c * 172, 72, codes[i], vendors[i]))
    i++
  }
  for (let c = 0; c < 5; c++) {
    stalls.push(stall(`kd_b_${c}`, 72 + c * 172, 368, codes[i], vendors[i]))
    i++
  }
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'kd_in', kind: 'entrance', x: 400, y: 612, w: 160, h: 52 },
      { id: 'kd_out', kind: 'exit', x: 400, y: 44, w: 140, h: 48 },
      { id: 'kd_tt', kind: 'tarti', x: 468, y: 292, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** Beşiktaş: Ortada dik ana koridor; sol ve sağ tezgâh sütunları */
function canvasBesiktas() {
  const width = 920
  const height = 720
  const x0 = 36
  const y0 = 36
  const x1 = 884
  const y1 = 684
  const walls = box(x0, y0, x1, y1)
  const vendors = [17, 18, 19, 20, 21, 22, 23, 24]
  const codes = ['BS-01', 'BS-02', 'BS-03', 'BS-04', 'BS-05', 'BS-06', 'BS-07', 'BS-08']
  const stalls = []
  const xs = [56, 240]
  let k = 0
  for (const x of xs) {
    for (let r = 0; r < 4; r++) {
      stalls.push(stall(`bs_${x}_${r}`, x, 96 + r * 132, codes[k], vendors[k]))
      k++
    }
  }
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'bs_in', kind: 'entrance', x: 380, y: 628, w: 160, h: 52 },
      { id: 'bs_out', kind: 'exit', x: 380, y: 44, w: 140, h: 48 },
      { id: 'bs_tt', kind: 'tarti', x: 418, y: 520, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** Üsküdar: Yatay tezgâh bandı — boş koridor — ikinci tezgâh bandı (sıra / boşluk / sıra) */
function canvasUskudar() {
  const width = 980
  const height = 640
  const walls = box(36, 36, 944, 604)
  const vendors = [35, 36, 37, 38, 39, 40]
  const codes = ['USK-01', 'USK-02', 'USK-03', 'USK-04', 'USK-05', 'USK-06']
  const stalls = [
    stall('us_1', 80, 72, codes[0], vendors[0]),
    stall('us_2', 280, 72, codes[1], vendors[1]),
    stall('us_3', 480, 72, codes[2], vendors[2]),
    stall('us_4', 80, 328, codes[3], vendors[3]),
    stall('us_5', 280, 328, codes[4], vendors[4]),
    stall('us_6', 480, 328, codes[5], vendors[5]),
  ]
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'us_in', kind: 'entrance', x: 400, y: 556, w: 170, h: 52 },
      { id: 'us_out', kind: 'exit', x: 400, y: 44, w: 140, h: 48 },
      ...stalls,
    ],
  }
}

/** Fatih: U şeklinde iç koridor — duvarlara yaslı tezgâhlar */
function canvasFatih() {
  const width = 860
  const height = 760
  const walls = box(36, 36, 824, 724)
  const vendors = [41, 42, 43, 44, 45, 46]
  const codes = ['FTH-01', 'FTH-02', 'FTH-03', 'FTH-04', 'FTH-05', 'FTH-06']
  const stalls = [
    stall('ft_l1', 56, 120, codes[0], vendors[0], 70, 72),
    stall('ft_l2', 56, 220, codes[1], vendors[1], 70, 72),
    stall('ft_t1', 200, 96, codes[2], vendors[2], 86, 64),
    stall('ft_t2', 380, 96, codes[3], vendors[3], 86, 64),
    stall('ft_r1', 700, 120, codes[4], vendors[4], 70, 72),
    stall('ft_r2', 700, 220, codes[5], vendors[5], 70, 72),
  ]
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'ft_in', kind: 'entrance', x: 340, y: 676, w: 180, h: 52 },
      { id: 'ft_out', kind: 'exit', x: 340, y: 44, w: 140, h: 48 },
      { id: 'ft_tt', kind: 'tarti', x: 388, y: 380, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** Bakırköy: Ortada dik koridor; iki yüz yüze uzun sıra */
function canvasBakirkoy() {
  const width = 1040
  const height = 680
  const walls = box(36, 36, 1004, 644)
  const vendors = [47, 48, 49, 50, 51, 52, 53, 54]
  const codes = ['BKV-01', 'BKV-02', 'BKV-03', 'BKV-04', 'BKV-05', 'BKV-06', 'BKV-07', 'BKV-08']
  const stalls = []
  for (let r = 0; r < 4; r++) {
    stalls.push(stall(`bk_l_${r}`, 56, 88 + r * 120, codes[r], vendors[r]))
    stalls.push(stall(`bk_r_${r}`, 560, 88 + r * 120, codes[r + 4], vendors[r + 4]))
  }
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'bk_in', kind: 'entrance', x: 420, y: 588, w: 180, h: 52 },
      { id: 'bk_out', kind: 'exit', x: 420, y: 44, w: 140, h: 48 },
      { id: 'bk_tt', kind: 'tarti', x: 478, y: 300, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** Şişli: L blok tezgâhlar + açık köşe */
function canvasSisli() {
  const width = 900
  const height = 720
  const walls = box(36, 36, 864, 684)
  const vendors = [55, 56, 57, 58, 59, 60]
  const codes = ['SIS-01', 'SIS-02', 'SIS-03', 'SIS-04', 'SIS-05', 'SIS-06']
  const stalls = [
    stall('si_1', 60, 120, codes[0], vendors[0]),
    stall('si_2', 60, 210, codes[1], vendors[1]),
    stall('si_3', 60, 300, codes[2], vendors[2]),
    stall('si_4', 200, 120, codes[3], vendors[3]),
    stall('si_5', 300, 120, codes[4], vendors[4]),
    stall('si_6', 400, 120, codes[5], vendors[5]),
  ]
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'si_in', kind: 'entrance', x: 520, y: 628, w: 160, h: 52 },
      { id: 'si_out', kind: 'exit', x: 360, y: 44, w: 140, h: 48 },
      ...stalls,
    ],
  }
}

/** Beyoğlu: İnce uzun pazar — iki paralel hat, ortada yürüyüş şeridi */
function canvasBeyoglu() {
  const width = 1100
  const height = 560
  const walls = box(36, 36, 1064, 524)
  const vendors = [61, 62, 63, 64, 65, 66]
  const codes = ['BYG-01', 'BYG-02', 'BYG-03', 'BYG-04', 'BYG-05', 'BYG-06']
  const stalls = [
    stall('by_1', 70, 72, codes[0], vendors[0]),
    stall('by_2', 230, 72, codes[1], vendors[1]),
    stall('by_3', 390, 72, codes[2], vendors[2]),
    stall('by_4', 70, 312, codes[3], vendors[3]),
    stall('by_5', 230, 312, codes[4], vendors[4]),
    stall('by_6', 390, 312, codes[5], vendors[5]),
  ]
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'by_in', kind: 'entrance', x: 720, y: 468, w: 160, h: 52 },
      { id: 'by_out', kind: 'exit', x: 460, y: 44, w: 140, h: 48 },
      { id: 'by_tt', kind: 'tarti', x: 560, y: 248, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** Ümraniye: Dört küme + ortada haç koridor */
function canvasUmraniye() {
  const width = 1000
  const height = 780
  const walls = box(36, 36, 964, 744)
  const vendors = [67, 68, 69, 70, 71, 72, 73, 74]
  const codes = ['UMR-01', 'UMR-02', 'UMR-03', 'UMR-04', 'UMR-05', 'UMR-06', 'UMR-07', 'UMR-08']
  const stalls = [
    stall('um_a1', 80, 100, codes[0], vendors[0]),
    stall('um_a2', 200, 100, codes[1], vendors[1]),
    stall('um_b1', 560, 100, codes[2], vendors[2]),
    stall('um_b2', 680, 100, codes[3], vendors[3]),
    stall('um_c1', 80, 520, codes[4], vendors[4]),
    stall('um_c2', 200, 520, codes[5], vendors[5]),
    stall('um_d1', 560, 520, codes[6], vendors[6]),
    stall('um_d2', 680, 520, codes[7], vendors[7]),
  ]
  return {
    version: 1,
    width,
    height,
    elements: [
      ...walls,
      { id: 'um_in', kind: 'entrance', x: 420, y: 692, w: 160, h: 52 },
      { id: 'um_out', kind: 'exit', x: 420, y: 44, w: 140, h: 48 },
      { id: 'um_tt', kind: 'tarti', x: 458, y: 360, w: 84, h: 56 },
      ...stalls,
    ],
  }
}

/** marketId → tuval (8 Kadıköy, 9 Beşiktaş, 13–18 yeni İstanbul pazarları) */
export const ISTANBUL_MARKET_CANVAS = {
  8: canvasKadikoy(),
  9: canvasBesiktas(),
  13: canvasUskudar(),
  14: canvasFatih(),
  15: canvasBakirkoy(),
  16: canvasSisli(),
  17: canvasBeyoglu(),
  18: canvasUmraniye(),
}
