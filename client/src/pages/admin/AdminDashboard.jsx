import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Video, CreditCard, Clock,
  LayoutDashboard, FileQuestion, Globe
} from 'lucide-react'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [retakeRequests, setRetakeRequests] = useState([])
  const [violations, setViolations] = useState([]) // Quizdan yiqilganlar
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
    
    // Admin notifikatsiyalarini yuklash
    api.get('/admin/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {})
    
    // Qayta topshirish so'rovlarini yuklash
    api.get('/admin/retake-requests').then(r => setRetakeRequests(r.data.requests || [])).catch(() => {})
    
    // Quizdan yiqilganlarni yuklash
    api.get('/admin/quiz-violations').then(r => setViolations(r.data.violations || [])).catch(() => {})
  }, [])

  const approveRetake = async (requestId) => {
    try {
      await api.post(`/admin/retake-requests/${requestId}/approve`)
      setRetakeRequests(prev => prev.filter(r => r.id !== requestId))
      alert('Qayta topshirish ruxsat etildi')
    } catch {
      alert('Xatolik yuz berdi')
    }
  }

  const rejectRetake = async (requestId) => {
    try {
      await api.post(`/admin/retake-requests/${requestId}/reject`)
      setRetakeRequests(prev => prev.filter(r => r.id !== requestId))
      alert('Qayta topshirish rad etildi')
    } catch {
      alert('Xatolik yuz berdi')
    }
  }

  if (loading) return <Loader fullScreen={false} />

  const { stats, recentUsers } = data || {}

  const statCards = [
    { Icon: Users, val: stats?.users, label: 'Foydalanuvchilar', color: '#3b82f6' },
    { Icon: BookOpen, val: stats?.courses, label: 'Kurslar', color: '#8b5cf6' },
    { Icon: Video, val: stats?.lessons, label: 'Videolar', color: '#22c55e' },
    { Icon: CreditCard, val: stats?.payments, label: "Tasdiqlangan to'lovlar", color: '#f97316' },
    { Icon: Clock, val: stats?.pending, label: "Kutilayotgan to'lovlar", color: '#ef4444' },
  ]

  const quickLinks = [
    { Icon: Users, label: 'Foydalanuvchilar', path: '/admin/users', color: '#3b82f6' },
    { Icon: BookOpen, label: 'Kurslar', path: '/admin/courses', color: '#8b5cf6' },
    { Icon: Video, label: 'Videolar', path: '/admin/lessons', color: '#22c55e' },
    { Icon: CreditCard, label: "To'lovlar", path: '/admin/payments', color: '#f97316' },
    { Icon: FileQuestion, label: 'Quizlar', path: '/admin/quiz', color: '#06b6d4' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <LayoutDashboard size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(({ Icon, val, label, color }, i) => (
          <div key={i} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem' }}>
              <Icon size={22} color={color} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{val ?? 0}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Yangi foydalanuvchilar</h2>
          <Link to="/admin/users" className="btn btn-outline btn-sm">Barchasini ko'rish</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                {['ID', 'Ism', 'Username', 'Tarif', 'Sana'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers || []).map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{u.id}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{u.first_name} {u.last_name}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>@{u.username}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}><span className={`badge-${u.plan}`}>{u.plan?.toUpperCase()}</span></td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('uz-UZ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Notifikatsiyalar - 3 ta ogohlantirish */}
      {notifications.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#ef4444' }}>⚠️ Ogohlantirish Notifikatsiyalari</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {n.first_name} {n.last_name} (@{n.username})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Quiz: {n.quiz_title} • {n.violation_count} ta ogohlantirish • {n.violation_type}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {new Date(n.created_at).toLocaleString('uz-UZ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizdan yiqilganlar - barcha ogohlantirishlar */}
      {violations.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🚫 Quizdan yiqilganlar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {violations.map(v => (
              <div key={v.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', gap: '1rem' }}>
                {/* Screenshot */}
                {v.screenshot && (
                  <img 
                    src={v.screenshot} 
                    alt="Violation" 
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid #ef4444' }}
                  />
                )}
                
                {/* Ma'lumotlar */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                    {v.first_name} {v.last_name} (@{v.username})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Quiz: {v.quiz_title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.3rem' }}>
                    Xato: {v.violation_type} - {v.violation_text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(v.created_at).toLocaleString('uz-UZ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qayta topshirish so'rovlari */}
      {retakeRequests.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📝 Qayta topshirish so'rovlari</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {retakeRequests.map(r => (
              <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {r.first_name} {r.last_name} (@{r.username})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Quiz: {r.quiz_title} • {r.reset_count || 0} marta qayta boshlandi
                  </div>
                  {r.reason && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                      Sabab: {r.reason}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {new Date(r.created_at).toLocaleString('uz-UZ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => approveRetake(r.id)} className="btn btn-primary btn-sm">
                    Ruxsat berish
                  </button>
                  <button onClick={() => rejectRetake(r.id)} className="btn btn-outline btn-sm">
                    Rad etish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem' }}>
        {quickLinks.map(({ Icon, label, path, color }) => (
          <Link key={path} to={path} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = `${color}10` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--card)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            {label}
          </Link>
        ))}
      </div>

      <style>{`
        @media(max-width:1200px){
          div[style*="repeat(5,1fr)"]{grid-template-columns:repeat(3,1fr)!important}
        }
        @media(max-width:768px){
          div[style*="repeat(5,1fr)"]{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </div>
  )
}
