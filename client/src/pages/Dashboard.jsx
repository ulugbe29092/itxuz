import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, User, Gem, LogOut,
  BookCheck, Award, TrendingUp, Lock, ChevronRight,
  ArrowUpRight, Clock, CheckCircle, FileQuestion
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loader from '../components/Loader'
import { getCourseLogo } from '../components/CourseLogos'

function Sidebar({ user }) {
  const { logout } = useAuthStore()
  const location = useLocation()
  const links = [
    ['/dashboard', LayoutDashboard, 'Dashboard'],
    ['/courses', BookOpen, 'Kurslar'],
    ['/profile', User, 'Profil'],
    ['/pricing', Gem, 'Tarif rejalari'],
  ]
  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-user">
        {user.avatar
          ? <img src={user.avatar} alt="" className="dash-avatar-img" />
          : <div className="dash-avatar-placeholder">{user.first_name?.[0]?.toUpperCase()}</div>
        }
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.first_name}</span>
          <span className={`badge-${user.plan}`}>{user.plan?.toUpperCase()}</span>
        </div>
      </div>
      <nav className="dash-nav">
        {links.map(([path, Icon, label]) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path} className={`dash-nav-link ${active ? 'active' : ''}`}>
              <Icon size={17} /> {label}
            </Link>
          )
        })}
        <button onClick={logout} className="dash-nav-logout">
          <LogOut size={17} /> Chiqish
        </button>
      </nav>
    </aside>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/dashboard').then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const planLimits = { free: 3, pro: 999, max: 999, vip: 999 }
  const limit = user?.role === 'admin' ? 999 : (planLimits[user?.plan] || 3)

  // O'quvchi statistikasi
  const totalLessons = (data?.courses || []).reduce((s, c) => s + (c.total_lessons || 0), 0)
  const completedLessons = data?.completedLessons || 0
  const remainingLessons = Math.max(0, totalLessons - completedLessons)
  const totalQuizzes = (data?.courses || []).reduce((s, c) => s + (c.total_quizzes || 0), 0)
  const passedQuizzes = (data?.courses || []).reduce((s, c) => s + (c.passed_quizzes || 0), 0)

  return (
    <div className="dash-layout">
      <Sidebar user={user} />
      <main className="dash-main">

        {/* Welcome */}
        <div className="dash-welcome">
          <div>
            <h1 className="dash-welcome-title">
              Xush kelibsiz, <span className="gradient-text">{user?.first_name}</span>!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>O'qishni davom ettiring va maqsadlaringizga erishing.</p>
          </div>          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <span className={`badge-${user?.plan}`}>{user?.plan?.toUpperCase()}</span>
            {user?.plan === 'free' && data?.daysRemaining != null && (
              <span className="days-badge">
                <Clock size={12} /> {data?.daysRemaining} kun qoldi
              </span>
            )}
            {user?.plan === 'free' && (
              <Link to="/pricing" className="btn btn-primary btn-sm">
                <ArrowUpRight size={14} /> Yangilash
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          {[
            { Icon: BookCheck, val: completedLessons, label: 'Tugatilgan darslar', color: '#6366f1' },
            { Icon: Clock, val: remainingLessons, label: 'Qolgan darslar', color: '#f59e0b' },
            { Icon: CheckCircle, val: passedQuizzes, label: "O'tilgan quizlar", color: '#22c55e' },
            { Icon: FileQuestion, val: Math.max(0, totalQuizzes - passedQuizzes), label: 'Qolgan quizlar', color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <s.Icon size={20} color={s.color} />
              </div>
              <div className="dash-stat-val gradient-text">{s.val}</div>
              <div className="dash-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Courses progress */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title"><BookOpen size={18} /> Kurslar jarayoni</h2>
            <Link to="/courses" className="btn btn-outline btn-sm">Barchasini ko'rish</Link>
          </div>
          <div className="dash-courses-list">
            {(data?.courses || []).map((c, i) => {
              const locked = user?.role !== 'admin' && i >= limit
              const pct = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
              const logo = getCourseLogo(c.slug, 32, c.icon)
              return (
                <div key={c.id} className={`dash-course-row ${locked ? 'locked' : ''}`}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: logo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {logo.svg}
                  </div>
                  <div className="dash-course-info">
                    <div className="dash-course-name">
                      {c.title} {locked && <Lock size={12} style={{ display: 'inline', marginLeft: 4, opacity: 0.5 }} />}
                    </div>
                    <div className="dash-course-progress">
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dash-course-pct">{pct}%</span>
                    </div>
                    <div className="dash-course-meta">{c.completed_lessons}/{c.total_lessons} dars</div>
                  </div>
                  {locked
                    ? <Link to="/pricing" className="btn btn-outline btn-sm">Ochish</Link>
                    : <Link to={`/courses/${c.slug}`} className="btn btn-primary btn-sm">
                        {pct > 0 ? 'Davom' : 'Boshlash'} <ChevronRight size={14} />
                      </Link>
                  }
                </div>
              )
            })}
            {(!data?.courses || data.courses.length === 0) && (
              <div className="empty-state"><p>Hali kurslar yo'q.</p></div>
            )}
          </div>
        </div>

        {/* Certificates */}
        {data?.certificates?.length > 0 && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2 className="dash-card-title"><Award size={18} /> Sertifikatlarim</h2>
            </div>
            <div className="dash-certs-grid">
              {data.certificates.map(cert => (
                <div key={cert.id} className="dash-cert-card">
                  <Award size={26} color="#f59e0b" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{cert.course_title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{cert.certificate_code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .dash-layout{display:flex;min-height:100vh;padding-top:64px}
        .dash-sidebar{width:240px;background:var(--bg2);border-right:1px solid var(--border);padding:1.5rem 0;position:sticky;top:64px;height:calc(100vh - 64px);overflow-y:auto;flex-shrink:0}
        .dash-sidebar-user{padding:.8rem 1.2rem 1.2rem;border-bottom:1px solid var(--border);margin-bottom:.8rem;display:flex;align-items:center;gap:.7rem}
        .dash-avatar-img{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--primary)}
        .dash-avatar-placeholder{width:40px;height:40px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:#fff;flex-shrink:0}
        .dash-nav{padding:0 .7rem}
        .dash-nav-link{display:flex;align-items:center;gap:.6rem;padding:.6rem .85rem;border-radius:9px;color:var(--text-muted);font-weight:500;font-size:.86rem;margin-bottom:.15rem;border-left:3px solid transparent;transition:all .2s;text-decoration:none}
        .dash-nav-link:hover{background:rgba(255,255,255,.05);color:var(--text)}
        .dash-nav-link.active{background:rgba(99,102,241,.12);color:var(--primary);font-weight:600;border-left-color:var(--primary)}
        .dash-nav-logout{display:flex;align-items:center;gap:.6rem;padding:.6rem .85rem;border-radius:9px;color:#ef4444;font-weight:500;font-size:.86rem;margin-top:.8rem;background:none;border:none;cursor:pointer;width:100%;font-family:inherit;transition:all .2s}
        .dash-nav-logout:hover{background:rgba(239,68,68,.1)}
        .dash-main{flex:1;padding:1.8rem;overflow-x:hidden;min-width:0}
        .dash-welcome{background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem 1.8rem;margin-bottom:1.2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
        .dash-welcome-title{font-size:1.5rem;font-weight:800;margin-bottom:.2rem}
        .days-badge{display:flex;align-items:center;gap:.3rem;font-size:.78rem;color:var(--text-muted);background:var(--bg2);padding:.2rem .6rem;border-radius:50px;border:1px solid var(--border)}
        .dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.2rem}
        .dash-stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.1rem;text-align:center}
        .dash-stat-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin:0 auto .7rem}
        .dash-stat-val{font-size:1.5rem;font-weight:800}
        .dash-stat-lbl{font-size:.72rem;color:var(--text-muted);margin-top:.2rem}
        .dash-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.3rem;margin-bottom:1.2rem}
        .dash-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
        .dash-card-title{font-size:1rem;font-weight:700;display:flex;align-items:center;gap:.5rem}
        .dash-courses-list{display:flex;flex-direction:column;gap:.7rem}
        .dash-course-row{display:flex;align-items:center;gap:.9rem;padding:.9rem;background:var(--bg2);border-radius:var(--radius);border:1px solid var(--border);transition:border-color .2s}
        .dash-course-row:hover{border-color:var(--primary)}
        .dash-course-row.locked{opacity:.55}
        .dash-course-info{flex:1;min-width:0}
        .dash-course-name{font-weight:600;font-size:.87rem;margin-bottom:.35rem;display:flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dash-course-progress{display:flex;align-items:center;gap:.7rem}
        .dash-course-pct{font-size:.72rem;color:var(--text-muted);white-space:nowrap}
        .dash-course-meta{font-size:.72rem;color:var(--text-muted);margin-top:.25rem}
        .dash-certs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.8rem}
        .dash-cert-card{background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(139,92,246,.08));border:1px solid rgba(99,102,241,.25);border-radius:var(--radius);padding:1rem;display:flex;align-items:center;gap:.7rem}

        @media(max-width:900px){
          .dash-sidebar{display:none}
          .dash-main{padding:1rem}
          .dash-stats{grid-template-columns:repeat(2,1fr)}
          .dash-welcome{flex-direction:column;align-items:flex-start}
        }
        @media(max-width:480px){
          .dash-stats{grid-template-columns:1fr 1fr}
          .dash-welcome-title{font-size:1.2rem}
        }
      `}</style>
    </div>
  )
}
