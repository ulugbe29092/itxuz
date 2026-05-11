import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap, BookOpen, DollarSign,
  User, LogOut, Menu, X, ShieldCheck, Eye
} from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const userNavLinks = [
    { to: '/', icon: <GraduationCap size={16} />, label: 'Bosh sahifa' },
    { to: '/courses', icon: <BookOpen size={16} />, label: 'Kurslar' },
    { to: '/pricing', icon: <DollarSign size={16} />, label: 'Narxlar' },
  ]

  const navLinkStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.9rem', borderRadius: 8,
    color: active ? '#3b82f6' : '#6b7280',
    fontWeight: active ? 600 : 500, fontSize: '0.87rem',
    background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
    transition: 'all 0.2s', textDecoration: 'none',
  })

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e5e7eb',
        height: 64,
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ITX</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} className="nav-desktop">
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin" style={{ ...navLinkStyle(isActive('/admin')), color: '#f59e0b', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Admin Panel
                </Link>
                <Link to="/" style={{ ...navLinkStyle(false), fontSize: '0.82rem' }}>
                  <Eye size={15} /> Saytni ko'rish
                </Link>
              </>
            ) : (
              <>
                {userNavLinks.map(({ to, icon, label }) => (
                  <Link key={to} to={to} style={navLinkStyle(isActive(to))}
                    onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = '#374151'; e.currentTarget.style.background = '#f9fafb' } }}
                    onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent' } }}
                  >
                    {icon} {label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} className="nav-desktop">
            {user ? (
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.35rem 0.8rem', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e5e7eb', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#eff6ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f8fafc' }}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
                        {user.first_name?.[0]?.toUpperCase()}
                      </div>
                  }
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>{user.first_name}</span>
                  <span className={`badge-${user.plan}`} style={{ fontSize: '0.62rem' }}>{user.plan?.toUpperCase()}</span>
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: 8, background: '#fef2f2', border: '1.5px solid #fecaca', color: '#ef4444', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca' }}
                >
                  <LogOut size={14} /> Chiqish
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', borderRadius: 9, background: '#fff', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}
                >
                  <User size={14} /> Kirish
                </Link>
                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.1rem', borderRadius: 9, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-toggle-btn" aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 999,
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: '#f59e0b', fontWeight: 600 }}>
                <ShieldCheck size={16} /> Admin Panel
              </Link>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: '#6b7280', fontWeight: 500 }}>
                <Eye size={16} /> Saytni ko'rish
              </Link>
            </>
          ) : (
            <>
              {userNavLinks.map(({ to, icon, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: isActive(to) ? '#3b82f6' : '#6b7280', fontWeight: isActive(to) ? 600 : 500, background: isActive(to) ? 'rgba(59,130,246,0.08)' : 'transparent' }}>
                  {icon} {label}
                </Link>
              ))}
            </>
          )}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: '#6b7280', fontWeight: 500 }}>
                <User size={16} /> Profil
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: '#ef4444', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontSize: '0.9rem' }}>
                <LogOut size={16} /> Chiqish
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem 0' }}>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Kirish</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Ro'yxatdan o'tish</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .nav-toggle-btn{display:none;background:none;border:none;color:#374151;cursor:pointer;padding:.4rem;border-radius:8px;transition:background .2s}
        .nav-toggle-btn:hover{background:#f3f4f6}
        @media(max-width:900px){
          .nav-desktop{display:none!important}
          .nav-toggle-btn{display:flex!important}
        }
      `}</style>
    </>
  )
}
