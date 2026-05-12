import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, CheckCircle, Award, TrendingUp, Clock,
  Play, Lock, ChevronRight, Star, Zap, Target, Calendar,
  BarChart2, ArrowRight, Flame
} from 'lucide-react'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import Loader from '../components/Loader'
import { getCourseLogo } from '../components/CourseLogos'

// Animatsiyali raqam
function AnimCounter({ target, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (target === 0 || started.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps = 60
        const inc = target / steps
        let cur = 0
        const t = setInterval(() => {
          cur += inc
          if (cur >= target) { cur = target; clearInterval(t) }
          setVal(Math.round(cur))
        }, duration / steps)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{val}{suffix}</span>
}

// Progress ring animatsiyasi
function ProgressRing({ pct, size = 80, stroke = 7, color = '#3b82f6' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circ - (pct / 100) * circ)
    }, 300)
    return () => clearTimeout(t)
  }, [pct, circ])

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  )
}

// Mini bar chart
function WeekChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
  const today = new Date().getDay()
  const dayMap = [6, 0, 1, 2, 3, 4, 5] // JS: 0=Yak, 1=Du...

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 60 }}>
      {data.map((d, i) => {
        const h = max > 0 ? Math.max(4, (d.count / max) * 52) : 4
        const isToday = dayMap[today] === i
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: '100%', height: h, borderRadius: 4,
              background: isToday ? 'linear-gradient(180deg,#3b82f6,#8b5cf6)' : d.count > 0 ? '#bfdbfe' : '#f3f4f6',
              transition: 'height 1s cubic-bezier(.4,0,.2,1)',
              boxShadow: isToday ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
            }} title={`${d.count} dars`} />
            <span style={{ fontSize: '0.6rem', color: isToday ? '#3b82f6' : '#9ca3af', fontWeight: isToday ? 700 : 400 }}>{days[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses') // courses | stats

  useEffect(() => {
    api.get('/user/dashboard').then(r => {
      setData(r.data)
      setLoading(false)
    }).catch(() => {
      // API xato bersa ham bo'sh data bilan ko'rsat
      setData({
        completedLessons: 0, totalLessons: 0, overallPct: 0,
        courses: [], certificates: [], quizStats: {},
        todayLessons: 0, monthLessons: 0, weekData: [],
        daysRemaining: null
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  const {
    completedLessons = 0, totalLessons = 0, overallPct = 0,
    courses = [], certificates = [], quizStats = {},
    todayLessons = 0, monthLessons = 0, weekData = [],
    daysRemaining
  } = data || {}

  // Eng ko'p progress qilingan kurs
  const activeCourse = courses.find(c => {
    const pct = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
    return pct > 0 && pct < 100
  }) || courses[0]

  const activePct = activeCourse && activeCourse.total_lessons > 0
    ? Math.round((activeCourse.completed_lessons / activeCourse.total_lessons) * 100) : 0

  // Streak (ketma-ket kunlar)
  const streak = weekData.filter(d => d.count > 0).length

  return (
    <div style={{ paddingTop: 64, background: '#f8fafc', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>

        {/* ===== HEADER ===== */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', marginBottom: '0.2rem' }}>
              Salom, <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.first_name}</span>! 👋
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {todayLessons > 0 ? `Bugun ${todayLessons} ta dars ko'rdingiz. Zo'r!` : "Bugun hali dars ko'rmadingiz. Boshlang!"}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
              <BookOpen size={15} /> Kurslar
            </Link>
            <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', borderRadius: 10, background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', border: '1.5px solid #e5e7eb' }}>
              Narxlar
            </Link>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: 12, width: 'fit-content' }}>
          {[
            { key: 'courses', label: 'Kurslar', icon: <BookOpen size={14} /> },
            { key: 'stats', label: 'Statistika', icon: <BarChart2 size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.1rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#3b82f6' : '#6b7280',
              boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ===== KURSLAR TAB ===== */}
        {activeTab === 'courses' && (
          <>
            {/* Reja xabari */}
            {daysRemaining !== null && daysRemaining <= 3 && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>Rejangiz {daysRemaining} kun ichida tugaydi!</div>
                  <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Uzluksiz o'rganish uchun rejangizni yangilang.</div>
                </div>
                <Link to="/pricing" style={{ marginLeft: 'auto', padding: '0.4rem 0.9rem', borderRadius: 8, background: '#f59e0b', color: '#fff', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>Yangilash</Link>
              </div>
            )}

            {/* Faol kurs */}
            {activeCourse && (
              <div style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1.5px solid #bfdbfe', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <ProgressRing pct={activePct} size={72} stroke={6} color="#3b82f6" />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6' }}>{activePct}%</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Davom etayotgan kurs</div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', marginBottom: '0.3rem' }}>{activeCourse.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{activeCourse.completed_lessons || 0} / {activeCourse.total_lessons} dars tugatildi</div>
                </div>
                <Link to={`/courses/${activeCourse.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.2rem', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', flexShrink: 0 }}>
                  <Play size={14} /> Davom etish
                </Link>
              </div>
            )}

            {/* Kurslar grid */}
            <div className="db-courses-grid">
              {courses.map((c, i) => {
                const pct = c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0
                const logo = getCourseLogo(c.slug, 28, c.icon)
                const isLocked = c.locked
                return (
                  <div key={c.id} className="db-course-card fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: logo.bg, border: `1.5px solid ${logo.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {logo.svg}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.completed_lessons || 0}/{c.total_lessons} dars</div>
                      </div>
                      {pct === 100 && <CheckCircle size={16} color="#10b981" />}
                      {isLocked && <Lock size={14} color="#9ca3af" />}
                    </div>
                    <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden', marginBottom: '0.7rem' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : `linear-gradient(90deg,${logo.color},${logo.color}cc)`, borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pct === 100 ? '#10b981' : logo.color }}>{pct}%</span>
                      {isLocked
                        ? <Link to="/pricing" style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Lock size={11} /> Ochish</Link>
                        : <Link to={`/courses/${c.slug}`} style={{ fontSize: '0.72rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                            {pct > 0 ? 'Davom' : 'Boshlash'} <ChevronRight size={11} />
                          </Link>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ===== STATISTIKA TAB ===== */}
        {activeTab === 'stats' && (
          <div>
            {/* Top stats */}
            <div className="db-stats-grid">
              {[
                { icon: <CheckCircle size={20} />, color: '#10b981', bg: '#f0fdf4', val: completedLessons, label: 'Tugatilgan darslar', suffix: '' },
                { icon: <Flame size={20} />, color: '#f59e0b', bg: '#fffbeb', val: streak, label: 'Haftalik streak', suffix: ' kun' },
                { icon: <Calendar size={20} />, color: '#3b82f6', bg: '#eff6ff', val: todayLessons, label: 'Bugun', suffix: ' dars' },
                { icon: <TrendingUp size={20} />, color: '#8b5cf6', bg: '#f5f3ff', val: monthLessons, label: 'Bu oy', suffix: ' dars' },
                { icon: <Target size={20} />, color: '#06b6d4', bg: '#ecfeff', val: overallPct, label: 'Umumiy progress', suffix: '%' },
                { icon: <Award size={20} />, color: '#f59e0b', bg: '#fffbeb', val: certificates.length, label: 'Sertifikatlar', suffix: '' },
              ].map((s, i) => (
                <div key={i} className="db-stat-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', color: s.color }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                    <AnimCounter target={s.val} />{s.suffix}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.3rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Haftalik chart + Progress ring */}
            <div className="db-chart-row">
              {/* Haftalik faollik */}
              <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Haftalik faollik</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Oxirgi 7 kun</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#eff6ff', padding: '0.3rem 0.7rem', borderRadius: '50px', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                    <Flame size={12} /> {streak} kun streak
                  </div>
                </div>
                <WeekChart data={weekData} />
              </div>

              {/* Umumiy progress */}
              <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                <div style={{ position: 'relative' }}>
                  <ProgressRing pct={overallPct} size={110} stroke={10} color="#3b82f6" />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827' }}>{overallPct}%</div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>progress</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>Umumiy progress</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{completedLessons} / {totalLessons} dars</div>
                </div>
              </div>
            </div>

            {/* Kurs bo'yicha progress */}
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', marginTop: '1.2rem' }}>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={16} color="#3b82f6" /> Kurs bo'yicha progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {courses.filter(c => c.total_lessons > 0).map((c, i) => {
                  const pct = Math.round((c.completed_lessons / c.total_lessons) * 100)
                  const logo = getCourseLogo(c.slug, 20)
                  return (
                    <div key={c.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.3rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: logo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {logo.svg}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{c.title}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: pct === 100 ? '#10b981' : '#3b82f6' }}>{pct}%</span>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.completed_lessons}/{c.total_lessons}</span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: pct === 100 ? '#10b981' : `linear-gradient(90deg,${logo.color},${logo.color}cc)`,
                          borderRadius: 3, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quiz statistika */}
            {quizStats?.total > 0 && (
              <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '1.5rem', marginTop: '1.2rem' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} color="#f59e0b" /> Quiz natijalari
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                  {[
                    { label: "Jami urinishlar", val: quizStats.total, color: '#3b82f6' },
                    { label: "O'tilgan quizlar", val: quizStats.passed || 0, color: '#10b981' },
                    { label: "O'rtacha ball", val: `${quizStats.avg_score || 0}%`, color: '#f59e0b', noAnim: true },
                  ].map((q, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: q.color }}>
                        {q.noAnim ? q.val : <AnimCounter target={parseInt(q.val)} />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{q.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sertifikatlar */}
            {certificates.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9c3)', border: '1.5px solid #fde68a', borderRadius: 16, padding: '1.5rem', marginTop: '1.2rem' }}>
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} color="#f59e0b" /> Sertifikatlarim ({certificates.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {certificates.map(cert => (
                    <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#fff', borderRadius: 10, padding: '0.7rem 1rem' }}>
                      <Award size={20} color="#f59e0b" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{cert.course_title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace' }}>{cert.certificate_code}</div>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{new Date(cert.issued_at).toLocaleDateString('uz-UZ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .db-courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
        .db-course-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:1.1rem;transition:all .3s;cursor:pointer}
        .db-course-card:hover{transform:translateY(-3px);border-color:#3b82f6;box-shadow:0 8px 24px rgba(59,130,246,0.1)}
        .db-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.2rem}
        .db-stat-card{background:#fff;border:1.5px solid #e5e7eb;border-radius:14px;padding:1.2rem;transition:all .3s}
        .db-stat-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.06)}
        .db-chart-row{display:grid;grid-template-columns:1fr auto;gap:1.2rem}
        @media(max-width:900px){
          .db-stats-grid{grid-template-columns:repeat(2,1fr)}
          .db-chart-row{grid-template-columns:1fr}
        }
        @media(max-width:600px){
          .db-courses-grid{grid-template-columns:1fr 1fr}
          .db-stats-grid{grid-template-columns:1fr 1fr}
        }
        @media(max-width:400px){
          .db-courses-grid{grid-template-columns:1fr}
        }
      `}</style>
    </div>
  )
}
