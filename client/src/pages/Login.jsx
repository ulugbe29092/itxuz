import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import './auth.css'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Barcha maydonlarni to\'ldiring')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Xush kelibsiz, ${user.first_name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      if (err.response?.data?.blocked) {
        toast.error('Hisobingiz bloklangan. Tarif rejasini yangilang.')
      } else {
        toast.error(err.response?.data?.error || 'Username yoki parol noto\'g\'ri')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      <div className="auth-wrapper fade-up">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <GraduationCap size={28} color="#fff" />
          </div>
          <span className="gradient-text">ITX</span>
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Xush kelibsiz!</h1>
            <p className="auth-subtitle">Hisobingizga kiring</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input
                  className="form-input with-icon"
                  placeholder="username kiriting"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Parol</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  className="form-input with-icon with-icon-right"
                  type={showPass ? 'text' : 'password'}
                  placeholder="parolingizni kiriting"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right-btn"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg auth-submit"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} className="spin" /> Kirilmoqda...</>
              ) : (
                <>Kirish <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>yoki</span>
          </div>

          <p className="auth-switch">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register">Ro'yxatdan o'ting</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
