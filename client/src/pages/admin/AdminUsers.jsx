import { useEffect, useState } from 'react'
import { Users, Award, X, ShieldOff, ShieldCheck, Crown, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import Loader from '../../components/Loader'

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [planModal, setPlanModal] = useState(null)
  const [certModal, setCertModal] = useState(null)
  const [planForm, setPlanForm] = useState({ plan: 'free', days: 30 })
  const [certForm, setCertForm] = useState({ course_id: '' })

  const load = () => api.get('/admin/users').then(r => {
    setUsers(r.data.users)
    setIsSuperAdmin(r.data.isSuperAdmin)
    setLoading(false)
  }).catch(() => setLoading(false))

  useEffect(() => { load() }, [])

  const block = async (id, isBlocked) => {
    try {
      await api.post(`/admin/users/${id}/${isBlocked ? 'unblock' : 'block'}`)
      toast.success(isBlocked ? 'Blokdan chiqarildi' : 'Bloklandi')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    }
  }

  const makeAdmin = async (id) => {
    if (!confirm("Bu foydalanuvchini admin qilishni tasdiqlaysizmi?")) return
    try {
      await api.post(`/admin/users/${id}/make-admin`)
      toast.success('Admin qilindi!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    }
  }

  const removeAdmin = async (id) => {
    if (!confirm("Admin huquqini olib tashlashni tasdiqlaysizmi?")) return
    try {
      await api.post(`/admin/users/${id}/remove-admin`)
      toast.success('Admin huquqi olindi')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    }
  }

  const setPlan = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/admin/users/${planModal.id}/set-plan`, planForm)
      toast.success('Tarif yangilandi')
      setPlanModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    }
  }

  const issueCert = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/certificates', { user_id: certModal.id, course_id: certForm.course_id })
      toast.success('Sertifikat berildi!')
      setCertModal(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Users size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Foydalanuvchilar</h1>
        {isSuperAdmin && (
          <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Crown size={13} /> Super-Admin
          </span>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          Siz sub-admin sifatida faqat oddiy foydalanuvchilarni boshqara olasiz. Adminlarni boshqarish uchun super-admin huquqi kerak.
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['ID', 'Ism', 'Username', 'Email', 'Rol', 'Tarif', 'Holat', 'Darslar', 'Sana', 'Amallar'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Foydalanuvchilar yo'q</td></tr>
                : users.map(u => {
                  const isAdmin = u.role === 'admin'
                  const canManage = isSuperAdmin || !isAdmin
                  return (
                    <tr key={u.id} style={{ background: u.is_blocked ? 'rgba(239,68,68,0.04)' : isAdmin ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{u.id}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{u.first_name} {u.last_name}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>@{u.username}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        {isAdmin ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700 }}>
                            <Crown size={11} /> Admin
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>User</span>
                        )}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <span className={`badge-${u.plan}`}>{u.plan?.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, background: u.is_blocked ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: u.is_blocked ? '#ef4444' : '#22c55e' }}>
                          {u.is_blocked ? <ShieldOff size={11} /> : <ShieldCheck size={11} />}
                          {u.is_blocked ? 'Bloklangan' : 'Faol'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{u.completed_lessons || 0}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                      <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {canManage && (
                            <>
                              <button
                                className={`btn btn-sm ${u.is_blocked ? 'btn-success' : 'btn-danger'}`}
                                onClick={() => block(u.id, u.is_blocked)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                {u.is_blocked ? <><ShieldCheck size={13} /> Ochish</> : <><ShieldOff size={13} /> Bloklash</>}
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => { setPlanModal(u); setPlanForm({ plan: u.plan, days: 30 }) }}
                              >
                                Tarif
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setCertModal(u)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Award size={13} /> Sert
                              </button>
                            </>
                          )}
                          {/* Super-admin only: make/remove admin */}
                          {isSuperAdmin && !isAdmin && (
                            <button
                              className="btn btn-sm"
                              onClick={() => makeAdmin(u.id)}
                              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Crown size={13} /> Admin qil
                            </button>
                          )}
                          {isSuperAdmin && isAdmin && (
                            <button
                              className="btn btn-sm"
                              onClick={() => removeAdmin(u.id)}
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <UserMinus size={13} /> Admin olish
                            </button>
                          )}
                          {!canManage && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Ruxsat yo'q</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Modal */}
      {planModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPlanModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Tarif o'zgartirish — @{planModal.username}</h3>
              <button className="modal-close" onClick={() => setPlanModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={setPlan}>
                <div className="form-group">
                  <label className="form-label">Tarif rejasi</label>
                  <select className="form-input" value={planForm.plan} onChange={e => setPlanForm(f => ({ ...f, plan: e.target.value }))}>
                    {['free', 'pro', 'max', 'vip'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Kunlar soni</label>
                  <input className="form-input" type="number" min={1} max={365} value={planForm.days} onChange={e => setPlanForm(f => ({ ...f, days: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Saqlash</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cert Modal */}
      {certModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCertModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3><Award size={18} /> Sertifikat berish — @{certModal.username}</h3>
              <button className="modal-close" onClick={() => setCertModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={issueCert}>
                <div className="form-group">
                  <label className="form-label">Kurs ID</label>
                  <input className="form-input" type="number" placeholder="Kurs ID raqami" value={certForm.course_id} onChange={e => setCertForm({ course_id: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block"><Award size={16} /> Sertifikat berish</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
