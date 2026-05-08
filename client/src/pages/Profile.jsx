import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Award, LogOut, User, Mail, Phone, MapPin, Calendar, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loader from '../components/Loader'
import BackButton from '../components/BackButton'

export default function Profile() {
  const { user, setUser, logout } = useAuthStore()
  const [data, setData] = useState(null)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    api.get('/user/profile').then(r => {
      setData(r.data)
      setForm({
        first_name: r.data.user.first_name,
        last_name: r.data.user.last_name,
        phone: r.data.user.phone || '',
        age: r.data.user.age || '',
        location: r.data.user.location || ''
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (avatarFile) fd.append('avatar', avatarFile)
      const res = await api.put('/user/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser(res.data.user)
      toast.success('Profil yangilandi!')
      setAvatarFile(null)
    } catch { toast.error('Xatolik yuz berdi') }
    finally { setSaving(false) }
  }

  if (loading) return <Loader />

  const avatar = avatarPreview || user?.avatar

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="page-hero-section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <BackButton fallback="/dashboard" label="Dashboardga qaytish" />
          </div>
          <h1 className="page-hero-title">Mening <span className="gradient-text">Profilim</span></h1>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="profile-layout">
          {/* Form */}
          <div className="profile-form-card">
            <h2 className="profile-form-title">Ma'lumotlarni tahrirlash</h2>
            <form onSubmit={handleSave}>
              {/* Avatar */}
              <div className="avatar-section">
                <div className="avatar-wrap">
                  {avatar
                    ? <img src={avatar} alt="" className="profile-avatar" />
                    : <div className="profile-avatar-placeholder">{user?.first_name?.[0]?.toUpperCase()}</div>
                  }
                  <label htmlFor="avatar" className="avatar-upload-btn" title="Rasm yuklash">
                    <Camera size={16} />
                  </label>
                  <input id="avatar" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{user?.first_name} {user?.last_name}</div>
                  <span className={`badge-${user?.plan}`}>{user?.plan?.toUpperCase()}</span>
                  <p className="field-hint" style={{ marginTop: '0.5rem' }}>Max 2MB, JPG/PNG</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input className="form-input with-icon" value={form.first_name || ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <div className="input-icon-wrap">
                    <User size={16} className="input-icon" />
                    <input className="form-input with-icon" value={form.last_name || ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input className="form-input with-icon" value={user?.email || ''} disabled />
                </div>
                <span className="field-hint">Email o'zgartirib bo'lmaydi</span>
              </div>

              <div className="form-group">
                <label className="form-label">Telefon</label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="input-icon" />
                  <input className="form-input with-icon" placeholder="+998901234567" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Yosh</label>
                  <div className="input-icon-wrap">
                    <Calendar size={16} className="input-icon" />
                    <input className="form-input with-icon" type="number" min={10} max={100} placeholder="25" value={form.age || ''} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Joylashuv</label>
                  <div className="input-icon-wrap">
                    <MapPin size={16} className="input-icon" />
                    <input className="form-input with-icon" placeholder="Toshkent" value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                {saving ? <><Loader2 size={16} className="spin" /> Saqlanmoqda...</> : <><Save size={16} /> Saqlash</>}
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="profile-stats-col">
            <div className="profile-info-card">
              <h3 className="profile-info-title">Hisob ma'lumotlari</h3>
              {[
                ['Username', `@${user?.username}`],
                ['Tarif', <span className={`badge-${user?.plan}`}>{user?.plan?.toUpperCase()}</span>],
                ["Ro'yxat sanasi", new Date(user?.created_at).toLocaleDateString('uz-UZ')],
                ['Tugatilgan darslar', data?.completedLessons || 0],
                ['Quiz urinishlar', data?.quizStats?.total || 0],
                ["O'tilgan quizlar", data?.quizStats?.passed || 0],
              ].map(([k, v]) => (
                <div key={k} className="info-row">
                  <span className="info-key">{k}:</span>
                  <span className="info-val">{v}</span>
                </div>
              ))}
            </div>

            <div className="profile-info-card">
              <h3 className="profile-info-title"><Award size={16} /> Sertifikatlarim</h3>
              {!data?.certificates?.length
                ? <div className="empty-state" style={{ padding: '1rem' }}><p style={{ fontSize: '0.85rem' }}>Hali sertifikat yo'q.</p></div>
                : data.certificates.map(c => (
                  <div key={c.id} className="cert-row">
                    <Award size={20} color="#f59e0b" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.course_title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{c.certificate_code}</div>
                    </div>
                  </div>
                ))
              }
            </div>

            <button onClick={logout} className="btn btn-danger btn-block">
              <LogOut size={16} /> Chiqish
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .page-hero-section{padding:4rem 0 2rem;background:linear-gradient(135deg,var(--bg2),var(--bg3));border-bottom:1px solid var(--border)}
        .page-hero-title{font-size:2rem;font-weight:800}
        .page-hero-sub{color:var(--text-muted)}
        .profile-layout{display:grid;grid-template-columns:1fr 340px;gap:2rem}
        .profile-form-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2rem}
        .profile-form-title{font-size:1.1rem;font-weight:700;margin-bottom:1.5rem}
        .avatar-section{display:flex;align-items:center;gap:1.5rem;margin-bottom:1.5rem;padding-bottom:1.5rem;border-bottom:1px solid var(--border)}
        .avatar-wrap{position:relative;flex-shrink:0}
        .profile-avatar{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--primary)}
        .profile-avatar-placeholder{width:80px;height:80px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:700;color:#fff}
        .avatar-upload-btn{position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;border:2px solid var(--bg)}
        .profile-stats-col{display:flex;flex-direction:column;gap:1.5rem}
        .profile-info-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem}
        .profile-info-title{font-size:1rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
        .info-row{display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border);font-size:.85rem}
        .info-row:last-child{border-bottom:none}
        .info-key{color:var(--text-muted)}
        .info-val{font-weight:500}
        .cert-row{display:flex;align-items:center;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--border)}
        .cert-row:last-child{border-bottom:none}
        @media(max-width:900px){
          .profile-layout{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .avatar-section{flex-direction:column;align-items:flex-start}
        }
      `}</style>
    </div>
  )
}
