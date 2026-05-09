/** Sistem akışı adımları — başlık ve metin içeriği */
export const AKIS_FLOW_STEPS = [
  {
    id: 'citizen',
    title: 'Vatandaş',
    hint: 'İl seçimi · pazar kartları · akıllı liste',
    detail:
      'Kullanıcı şehir veya konumla pazarları görür; harita veya kart görünümünde gezinir. Akıllı alışveriş listesi ile ürünleri seçip ilgili pazara yönlendirilir.',
  },
  {
    id: 'market',
    title: 'Pazar detayı',
    hint: 'Fiyatlar · yerleşim · şikâyet',
    detail:
      'Seçilen pazarda güncel fiyat özeti, esnaf listesi ve yerleşim şeması (2D / 3D) üzerinden tezgâh konumu görülür; gerektiğinde şikâyet kaydı oluşturulur.',
  },
  {
    id: 'vendor',
    title: 'Esnaf paneli',
    hint: 'Fiyat girişi · yayın · fatura',
    detail:
      'Satıcı ürün fiyatlarını günceller, yayın durumunu yönetir ve fatura yükleyerek OCR iş akışına dahil olur.',
  },
  {
    id: 'officer',
    title: 'Zabıta',
    hint: 'Şikâyet · denetim · ihlal',
    detail: 'Atanan şikâyetler takip edilir; saha denetimi ve ihlal kayıtları sisteme işlenir.',
  },
  {
    id: 'chief',
    title: 'Zabıta müdürü',
    hint: 'İş yükü · atama',
    detail: 'Ekip iş yükü izlenir; şikâyetler uygun personele atanır.',
  },
  {
    id: 'admin',
    title: 'Yönetici',
    hint: 'Şema · pazar · kullanıcı',
    detail:
      'Pazar kayıtları, yerleşim şeması düzenlemesi ve sistem geneli operasyonlar yönetilir.',
  },
  {
    id: 'backend',
    title: 'API ve altyapı',
    hint: 'Spring Boot · güvenlik · veri',
    detail:
      'REST API, kimlik doğrulama, veritabanı ve mesaj kuyruğu ile uçtan uca veri akışı sağlanır; frontend WebGL ile şema ve akış görselleştirmesi yapar.',
  },
]
