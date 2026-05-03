import { useState } from 'react'
import { loginApi } from '../api/pazarApi'
import Icon from './Icon.jsx'

export default function LoginPage({ onLogin, darkMode }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [role, setRole] = useState('Esnaf')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await loginApi(email, pass, role)
      try {
        localStorage.setItem('pazar_token', res.token)
      } catch {
        /* ignore */
      }
      onLogin({ name: res.user.name || email.split('@')[0], email: res.user.email, role: res.user.role })
    } catch {
      setErr('Sunucuya ulaşılamadı; çevrimdışı mod denendi.')
      onLogin({ name: email.split('@')[0] || 'Kullanıcı', email, role })
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    {
      value: 'Esnaf',
      shortLabel: 'Esnaf',
      icon: 'storefront',
      desc: 'Fiyat ve tezgah',
      email: 'esnaf@pazar.com',
      pass: '123456',
    },
    {
      value: 'Zabıta',
      shortLabel: 'Zabıta',
      icon: 'shield',
      desc: 'Denetim',
      email: 'zabita@pazar.com',
      pass: '123456',
    },
    {
      value: 'Zabıta Müdürü',
      shortLabel: 'Müdür',
      icon: 'shield_person',
      desc: 'Ekip',
      email: 'mudur@pazar.com',
      pass: '123456',
    },
    {
      value: 'Yönetici',
      shortLabel: 'Yönetici',
      icon: 'admin_panel_settings',
      desc: 'Sistem',
      email: 'admin@pazar.com',
      pass: '123456',
    },
  ]

  const handleRoleSelect = (r) => {
    setRole(r.value)
    setEmail(r.email)
    setPass(r.pass)
  }

  return (
    <div className={`login-page ${darkMode ? 'dark' : ''}`}>
      <div className="login-shell">
        <div className="login-card login-card--modern">
          <header className="login-brand">
            <div className="login-brand-mark" aria-hidden>
              <Icon name="account_balance" size={28} />
            </div>
            <div className="login-brand-text">
              <h1 className="login-brand-title">Belediye Portalı</h1>
              <p className="login-brand-tagline">Esnaf, Zabıta ve Yönetici Girişi</p>
            </div>
          </header>

          <p className="login-lead">
            Lütfen giriş yapmak için rolünüzü seçin ve bilgilerinizi girin.
          </p>

          <form className="login-form login-form--modern" onSubmit={handleSubmit}>
            {err && (
              <div className="login-alert" role="alert">
                {err}
              </div>
            )}

            <div className="login-field-section">
              <span className="login-section-label">Kullanıcı rolü</span>
              <div className="login-role-strip" role="group" aria-label="Rol seçin">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    className={`login-role-pill ${role === r.value ? 'login-role-pill--active' : ''}`}
                    onClick={() => handleRoleSelect(r)}
                    aria-pressed={role === r.value}
                  >
                    <span className="login-role-pill__icon">
                      <Icon name={r.icon} size={26} />
                    </span>
                    <span className="login-role-pill__label">{r.shortLabel}</span>
                    <span className="login-role-pill__hint">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group login-form-group">
              <label htmlFor="login-email">E-posta adresi</label>
              <div className="login-input-wrap">
                <span className="login-input-wrap__icon" aria-hidden>
                  <Icon name="alternate_email" size={22} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="ornek@belediye.gov.tr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group login-form-group">
              <div className="login-label-row">
                <label htmlFor="login-pass">Şifre</label>
                <button
                  type="button"
                  className="login-inline-link"
                  onClick={() => alert('Şifre sıfırlama yakında eklenecek.')}
                >
                  Şifremi unuttum
                </button>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-wrap__icon" aria-hidden>
                  <Icon name="lock" size={22} />
                </span>
                <input
                  id="login-pass"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-input-wrap__suffix"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={22} />
                </button>
              </div>
            </div>

            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Beni hatırla</span>
            </label>

            <button type="submit" className="login-btn login-btn--modern" disabled={loading}>
              <span>{loading ? 'Giriş yapılıyor…' : 'Sisteme giriş yap'}</span>
              <Icon name="login" size={22} aria-hidden />
            </button>
          </form>

          <footer className="login-footer-modern">
            <p className="login-footer-modern__register">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                className="login-footer-modern__link"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                Vatandaş ekranına dön
              </button>
            </p>
            <div className="login-footer-modern__icons" aria-hidden>
              <span className="login-footer-modern__icon-slot">
                <Icon name="help" size={20} />
              </span>
              <span className="login-footer-modern__icon-slot">
                <Icon name="description" size={20} />
              </span>
              <span className="login-footer-modern__icon-slot">
                <Icon name="language" size={20} />
              </span>
            </div>
            <p className="login-footer-modern__copy">© {new Date().getFullYear()} BELEDİYE PORTALI</p>
          </footer>
        </div>

        <button type="button" className="login-fab" aria-label="Destek" onClick={() => alert('Destek hattı yakında.')}>
          <Icon name="chat" size={24} />
        </button>
      </div>
    </div>
  )
}
