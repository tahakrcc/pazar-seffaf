import Icon from '../Icon.jsx'

const COPY = {
  myprices: {
    icon: 'edit_note',
    title: 'Tezgah fiyatları',
    body: 'Kendi tezgahınız için güncel fiyatları Esnaf panelinde (/panel/esnaf/fiyatlar) yönetirsiniz. Bu ekranda yalnızca pazar bağlamını görürsünüz.',
    hint: 'Kalıcı düzenlemeler için Panelim → Esnaf “Fiyatlar” sayfasını kullanın.',
  },
  inspection: {
    icon: 'policy',
    title: 'Denetim kaydı',
    body: 'Zabıta denetim notları ve işlem kayıtları merkezi panele bağlanır; bu sayfa seçilen pazarın özet görünümüdür.',
    hint: 'Operasyonel işlemler için Panelim → Zabıta paneli “Denetim” sekmesini açın.',
  },
  analytics: {
    icon: 'monitoring',
    title: 'Pazar özeti',
    body: 'Analiz panosu aggregasyonları sunucu tarafında hesaplanır; burada yalnızca bu pazar kimliği ile uyumlu özet gösterilir.',
    hint: 'Çapraz pazar raporları için Panelim → Yönetici paneli analiz sekmesini kullanın.',
  },
}

export default function MarketDetailRoleTab({ variant }) {
  const c = COPY[variant]
  if (!c) return null
  return (
    <div className="pd-panel pd-role-panel">
      <div className="pd-role-panel__icon" aria-hidden>
        <Icon name={c.icon} size={36} />
      </div>
      <h3 className="pd-role-panel__title">{c.title}</h3>
      <p className="pd-role-panel__body">{c.body}</p>
      <p className="pd-role-panel__hint">
        <Icon name="info" size={18} aria-hidden />
        {c.hint}
      </p>
    </div>
  )
}
