import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, AtSign,
  GraduationCap, ArrowRight, ArrowLeft, Check, Loader2, CheckCircle, XCircle
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import './auth.css'

function getStrength(pass) {
  if (!pass) return { level: 0, label: '', color: '' }
  let s = 0
  if (pass.length >= 6) s++
  if (pass.length >= 10) s++
  if (/[A-Za-z]/.test(pass)) s++
  if (/[0-9]/.test(pass)) s++
  if (/[^A-Za-z0-9]/.test(pass)) s++
  if (s <= 1) return { level: 1, label: 'Juda zaif', color: '#ef4444' }
  if (s === 2) return { level: 2, label: "O'rtacha", color: '#f59e0b' }
  if (s <= 4) return { level: 3, label: 'Yaxshi', color: '#3b82f6' }
  return { level: 4, label: "Zo'r!", color: '#22c55e' }
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [step1, setStep1] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [step2, setStep2] = useState({ username: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const strength = getStrength(step2.password)

  useEffect(() => {
    if (step2.username.length < 3) { setUsernameStatus(null); return }
    const t = setTimeout(async () => {
      try {
        const r = await api.get(`/auth/check-username?username=${step2.username}`)
        setUsernameStatus(r.data)
      } catch { setUsernameStatus(null) }
    }, 500)
    return () => clearTimeout(t)
  }, [step2.username])

  const handleStep1 = async (e) => {
    e.preventDefault()
    const { first_name, last_name, email, phone } = step1
    if (!first_name || !last_name || !email || !phone) return toast.error('Barcha maydonlarni to\'ldiring')
    if (!email.toLowerCase().endsWith('@gmail.com')) return toast.error('Email @gmail.com bilan tugashi kerak')
    if (!/^\+998\d{9}$/.test(phone)) return toast.error('Telefon: +998 + 9 ta raqam')
    setLoading(true)
    try {
      await api.post('/auth/register/step1', step1)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    } finally { setLoading(false) }
  }

  const handleStep2 = async (e) => {
    e.preventDefault()
    const { username, password, confirm } = step2
    if (!username || !password) return toast.error('Barcha maydonlarni to\'ldiring')
    if (password !== confirm) return toast.error('Parollar mos kelmadi')
    if (password.length < 6 || password.length > 20) return toast.error('Parol 6-20 ta belgi')
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return toast.error('Username: faqat harf, raqam va _')
    if (usernameStatus && !usernameStatus.available) return toast.error('Bu username band')
    setLoading(true)
    try {
      const res = await api.post('/auth/register/step2', { ...step1, username, password })
      localStorage.setItem('itx_token', res.data.token)
      await useAuthStore.getState().fetchMe()
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    } finally { setLoading(false) }
  }

  const phoneAutoFormat = (val) => {
    if (!val.startsWith('+998')) {
      if (val.startsWith('998')) return '+' + val
      if (/^[89]/.test(val)) return '+998' + val
      if (val && !val.startsWith('+')) return '+998'
    }
    return val
  }

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-wrapper fade-up">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={28} color="#fff" />
          </div>
          <span className="gradient-text">ITX</span>
        </Link>

        <div className="auth-card">
          {/* Steps indicator */}
          <div className="steps-row">
            {[
              { n: 1, label: "Ma'lumotlar" },
              { n: 2, label: 'Hisob' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div className="step-item">
                  <div className={`step-circle ${step > s.n ? 'done' : step === s.n ? 'active' : ''}`}>
                    {step > s.n ? <Check size={14} /> : s.n}
                  </div>
                  <span className={`step-label ${step === s.n ? 'active' : ''}`}>{s.label}</span>
                </div>
                {i === 0 && <div className={`step-line ${step > 1 ? 'active' : ''}`} />}
              </div>
            ))}
          </div>

          <div className="auth-card-header">
            <h1 className="auth-title">Ro'yxatdan o'ting</h1>
            <p className="auth-subtitle">
              {step === 1 ? '1-qadam: Shaxsiy ma\'lumotlar' : '2-qadam: Username va parol'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input className="form-input with-icon" placeholder="Ismingiz"
                      value={step1.first_name} onChange={e => setStep1({ ...step1, first_name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input className="form-input with-icon" placeholder="Familiyangiz"
                      value={step1.last_name} onChange={e => setStep1({ ...step1, last_name: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input className="form-input with-icon" type="email" placeholder="example@gmail.com"
                    value={step1.email} onChange={e => setStep1({ ...step1, email: e.target.value })} required />
                </div>
                <span className="field-hint">Faqat @gmail.com qabul qilinadi</span>
              </div>

              <div className="form-group">
                <label className="form-label">Telefon</label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="input-icon" />
                  <input className="form-input with-icon" placeholder="+998901234567"
                    value={step1.phone} onChange={e => setStep1({ ...step1, phone: phoneAutoFormat(e.target.value) })} required />
                </div>
                <span className="field-hint">Format: +998 + 9 ta raqam</span>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg auth-submit" disabled={loading}>
                {loading ? <><Loader2 size={18} className="spin" /> Tekshirilmoqda...</> : <>Davom etish <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="auth-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-icon-wrap">
                  <AtSign size={16} className="input-icon" />
                  <input className="form-input with-icon with-icon-right"
                    placeholder="username tanlang" value={step2.username}
                    onChange={e => setStep2({ ...step2, username: e.target.value })} required />
                  {usernameStatus && (
                    <span className="input-icon-right-btn" style={{ pointerEvents: 'none' }}>
                      {usernameStatus.available
                        ? <CheckCircle size={16} color="#22c55e" />
                        : <XCircle size={16} color="#ef4444" />}
                    </span>
                  )}
                </div>
                {usernameStatus && (
                  <span style={{ fontSize: '0.78rem', color: usernameStatus.available ? '#22c55e' : '#f87171', display: 'block', marginTop: '0.3rem' }}>
                    {usernameStatus.message}
                  </span>
                )}
                <span className="field-hint">Faqat harf, raqam va _</span>
              </div>

              <div className="form-group">
                <label className="form-label">Parol</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="form-input with-icon with-icon-right"
                    type={showPass ? 'text' : 'password'} placeholder="parol kiriting (6-20 belgi)"
                    value={step2.password} onChange={e => setStep2({ ...step2, password: e.target.value })} required />
                  <button type="button" className="input-icon-right-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {step2.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: '0.3rem' }}>
                      <div style={{ height: '100%', borderRadius: 2, transition: 'all 0.4s', background: strength.color, width: `${strength.level * 25}%` }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Parolni tasdiqlang</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input className="form-input with-icon with-icon-right"
                    type={showConfirm ? 'text' : 'password'} placeholder="parolni qayta kiriting"
                    value={step2.confirm} onChange={e => setStep2({ ...step2, confirm: e.target.value })} required />
                  <button type="button" className="input-icon-right-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {step2.confirm && step2.confirm !== step2.password && (
                  <span className="field-error">Parollar mos kelmadi</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg auth-submit" disabled={loading}>
                {loading ? <><Loader2 size={18} className="spin" /> Yaratilmoqda...</> : <>Ro'yxatdan o'tish <Check size={18} /></>}
              </button>

              <button type="button" onClick={() => setStep(1)} className="btn-back">
                <ArrowLeft size={16} /> Orqaga
              </button>
            </form>
          )}

          <p className="auth-switch">
            Hisobingiz bormi? <Link to="/login">Kiring</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
