import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  GraduationCap, BookOpen, DollarSign, LayoutDashboard,
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
    padding: '0.45rem 0.85rem', borderRadius: 8,
    color: active ? 'var(--text)' : 'var(--text-muted)',
    fontWeight: 500, fontSize: '0.87rem',
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    transition: 'all 0.2s', textDecoration: 'none',
  })

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(15,15,26,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        height: 64,
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.4)' }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ITX</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }} className="nav-desktop">
            {user?.role === 'admin' ? (
              /* Admin nav */
              <>
                <Link to="/admin" style={{ ...navLinkStyle(isActive('/admin')), color: '#f59e0b', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Admin Panel
                </Link>
                <Link to="/" style={{ ...navLinkStyle(false), fontSize: '0.82rem' }}>
                  <Eye size={15} /> Saytni ko'rish
                </Link>
              </>
            ) : (
              /* Oddiy user nav */
              <>
                {userNavLinks.map(({ to, icon, label }) => (
                  <Link key={to} to={to} style={navLinkStyle(isActive(to))}>
                    {icon} {label}
                  </Link>
                ))}
                {user && (
                  <Link to="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} className="nav-desktop">
            {user ? (
              <>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.35rem 0.7rem', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
                        {user.first_name?.[0]?.toUpperCase()}
                      </div>
                  }
                  <span className={`badge-${user.plan}`} style={{ fontSize: '0.62rem' }}>{user.plan?.toUpperCase()}</span>
                </Link>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 500, fontSize: '0.84rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                >
                  <LogOut size={14} /> Chiqish
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Kirish
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
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
          background: 'rgba(15,15,26,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
        }}>
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: '#f59e0b', fontWeight: 600 }}>
                <ShieldCheck size={16} /> Admin Panel
              </Link>
              <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: 'var(--text-muted)', fontWeight: 500 }}>
                <Eye size={16} /> Saytni ko'rish
              </Link>
            </>
          ) : (
            <>
              {userNavLinks.map(({ to, icon, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: isActive(to) ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 500, background: isActive(to) ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                  {icon} {label}
                </Link>
              ))}
              {user && (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: 'var(--text-muted)', fontWeight: 500 }}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
            </>
          )}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', borderRadius: 8, color: 'var(--text-muted)', fontWeight: 500 }}>
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
        .nav-toggle-btn{display:none;background:none;border:none;color:var(--text);cursor:pointer;padding:.4rem;border-radius:8px;transition:background .2s}
        .nav-toggle-btn:hover{background:rgba(255,255,255,.08)}
        @media(max-width:900px){
          .nav-desktop{display:none!important}
          .nav-toggle-btn{display:flex!important}
        }
      `}</style>
    </>
  )
}
