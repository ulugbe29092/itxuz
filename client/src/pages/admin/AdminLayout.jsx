import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Video,
  CreditCard, FileQuestion, LogOut, GraduationCap, ShieldCheck, RotateCcw
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const NAV = [
  { to: '/admin', icon: <LayoutDashboard size={17} />, label: 'Dashboard', exact: true },
  { to: '/admin/users', icon: <Users size={17} />, label: 'Foydalanuvchilar' },
  { to: '/admin/courses', icon: <BookOpen size={17} />, label: 'Kurslar' },
  { to: '/admin/lessons', icon: <Video size={17} />, label: 'Videolar' },
  { to: '/admin/payments', icon: <CreditCard size={17} />, label: "To'lovlar" },
  { to: '/admin/quiz', icon: <FileQuestion size={17} />, label: 'Quizlar' },
  { to: '/admin/violations', icon: <ShieldCheck size={17} />, label: 'Quizdan yiqilganlar' },
  { to: '/admin/retake-requests', icon: <RotateCcw size={17} />, label: 'Qayta topshirish' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname === to

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#fff',
        borderRight: '1px solid #e5e7eb',
        padding: '1.5rem 0',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        overflowY: 'auto', zIndex: 100,
        display: 'flex', flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.2rem 1.5rem', borderBottom: '1px solid #f3f4f6', marginBottom: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ITX</div>
              <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '-2px' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 0.8rem', flex: 1 }}>
          {NAV.map(({ to, icon, label, exact }) => {
            const active = isActive(to, exact)
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.65rem 0.9rem', borderRadius: 10,
                color: active ? '#3b82f6' : '#6b7280',
                fontWeight: active ? 600 : 500, fontSize: '0.88rem',
                marginBottom: '0.2rem',
                background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s', textDecoration: 'none',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' } }}
              >
                {icon} {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '0 0.8rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
          <button onClick={() => { logout(); navigate('/') }} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.65rem 0.9rem', borderRadius: 10, color: '#ef4444', fontSize: '0.88rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            <LogOut size={17} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ marginLeft: 240, flex: 1, padding: '2rem', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0.8rem 1.2rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Admin Panel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
              {user?.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>@{user?.username}</div>
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
