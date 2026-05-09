import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Play, CheckCircle, Video, AlertTriangle, ChevronRight } from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loader from '../components/Loader'
import BackButton from '../components/BackButton'
import { getCourseLogo } from '../components/CourseLogos'

export default function Courses() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/courses').then(r => { setCourses(r.data.courses); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="page-hero-section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
            <BackButton fallback="/dashboard" label="Dashboardga qaytish" />
          </div>
          <h1 className="page-hero-title">Barcha <span className="gradient-text">Kurslar</span></h1>
          <p className="page-hero-sub">15 ta professional kurs — boshlang'ichdan ekspert darajasigacha</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        {user?.plan === 'free' && (
          <div className="plan-notice">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#f59e0b" /> Free rejada faqat 3 ta kurs mavjud.
            </span>
            <Link to="/pricing" className="btn btn-primary btn-sm">Pro rejaga o'tish</Link>
          </div>
        )}

        <div className="courses-grid">
          {courses.map((c, i) => {
            const pct = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
            const logo = getCourseLogo(c.slug, 36, c.icon)
            return (
              <div key={c.id} className={`course-card ${c.locked ? 'locked' : ''} fade-up`} style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="course-card-top">
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: logo.bg, border: `1px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    {logo.svg}
                  </div>
                  {c.locked && (
                    <div className="course-lock-overlay">
                      <Lock size={28} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="course-card-body">
                  <div className="course-order">#{c.order_num}</div>
                  <h3 className="course-card-title">{c.title}</h3>
                  <p className="course-card-desc">{c.description?.substring(0, 90)}...</p>
                  <div className="course-card-meta">
                    <span><Video size={13} /> {c.total_lessons || 0} dars</span>
                    <span><CheckCircle size={13} /> {pct}% tugatildi</span>
                  </div>
                  {c.total_lessons > 0 && (
                    <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
                <div className="course-card-footer">
                  {c.locked
                    ? <Link to="/pricing" className="btn btn-outline btn-block">
                        <Lock size={14} /> Ochish
                      </Link>
                    : <Link to={`/courses/${c.slug}`} className="btn btn-primary btn-block">
                        {pct > 0 ? <><Play size={14} /> Davom etish</> : <><Play size={14} /> Boshlash</>}
                        <ChevronRight size={14} />
                      </Link>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .page-hero-section{padding:4rem 0 2rem;background:linear-gradient(135deg,var(--bg2),var(--bg3));border-bottom:1px solid var(--border)}
        .page-hero-title{font-size:2.5rem;font-weight:800;margin-bottom:.5rem}
        .page-hero-sub{color:var(--text-muted)}
        .plan-notice{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);border-radius:var(--radius);padding:.8rem 1.2rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.8rem;font-size:.9rem}
        .courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem}
        .course-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;display:flex;flex-direction:column;transition:all .3s}
        .course-card:not(.locked):hover{transform:translateY(-4px);border-color:var(--primary);box-shadow:var(--shadow)}
        .course-card.locked{opacity:.7}
        .course-card-top{padding:1.5rem;background:var(--card2);text-align:center;position:relative}
        .course-card-emoji{font-size:3rem}
        .course-lock-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center}
        .course-card-body{padding:1.2rem;flex:1}
        .course-order{font-size:.72rem;color:var(--text-muted);margin-bottom:.3rem}
        .course-card-title{font-size:1rem;font-weight:700;margin-bottom:.5rem}
        .course-card-desc{font-size:.82rem;color:var(--text-muted);line-height:1.5;margin-bottom:.8rem}
        .course-card-meta{display:flex;gap:1rem;font-size:.78rem;color:var(--text-muted)}
        .course-card-meta span{display:flex;align-items:center;gap:.3rem}
        .course-card-footer{padding:1rem 1.2rem;border-top:1px solid var(--border)}
        @media(max-width:768px){
          .courses-grid{grid-template-columns:repeat(2,1fr)}
          .page-hero-title{font-size:1.8rem}
        }
        @media(max-width:480px){
          .courses-grid{grid-template-columns:1fr}
        }
      `}</style>
    </div>
  )
}
