import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, FileQuestion, ChevronRight, Play } from 'lucide-react'
import api from '../api/axios'
import Loader from '../components/Loader'
import BackButton from '../components/BackButton'
import { getCourseLogo } from '../components/CourseLogos'

export default function CourseDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/courses/${slug}`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(err => {
        if (err.response?.data?.upgrade) navigate('/pricing?upgrade=1')
        else navigate('/courses')
      })
  }, [slug])

  if (loading) return <Loader />
  if (!data) return null

  const { course, lessons } = data
  const completed = lessons.filter(l => l.watched).length
  const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0

  return (
    <div style={{ paddingTop: 64 }}>
      <div className="page-hero-section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <BackButton fallback="/courses" label="Kurslarga qaytish" />
            <div className="breadcrumb-row" style={{ margin: 0 }}>
              <Link to="/courses">Kurslar</Link>
              <ChevronRight size={14} />
              <span>{course.title}</span>
            </div>
          </div>
          <div className="course-detail-header">
            <div style={{ width: 72, height: 72, borderRadius: 18, background: getCourseLogo(course.slug).bg, border: `1px solid ${getCourseLogo(course.slug).color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {getCourseLogo(course.slug, 40).svg}
            </div>
            <div>
              <h1 className="page-hero-title">{course.title}</h1>
              <p className="page-hero-sub">{course.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
        <div className="course-detail-layout">
          {/* Lessons */}
          <div className="lessons-card">
            <div className="lessons-header">
              <h2>Darslar ({lessons.length})</h2>
              <span className="lessons-progress-text">{completed}/{lessons.length} tugatildi</span>
            </div>
            {lessons.length === 0
              ? <div className="empty-state"><p>Hali darslar qo'shilmagan</p></div>
              : lessons.map((l, i) => (
                <Link key={l.id} to={`/lessons/${l.id}`} className={`lesson-row ${l.watched ? 'done' : ''}`}>
                  <div className="lesson-num-circle">
                    {l.watched ? <CheckCircle size={16} color="#22c55e" /> : <span>{i + 1}</span>}
                  </div>
                  <div className="lesson-row-info">
                    <div className="lesson-row-title">{l.title}</div>
                    <div className="lesson-row-meta">
                      {l.duration_minutes > 0 && (
                        <span><Clock size={12} /> {l.duration_minutes} daqiqa</span>
                      )}
                      {l.quiz_id && (
                        <span className={`quiz-tag ${l.quiz_passed ? 'passed' : ''}`}>
                          <FileQuestion size={12} />
                          {l.quiz_passed ? "Quiz o'tildi" : 'Quiz bor'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </Link>
              ))
            }
          </div>

          {/* Sidebar */}
          <div className="course-sidebar-card">
            <h3>Kurs haqida</h3>
            {[
              ['Darslar:', lessons.length],
              ['Tugatildi:', completed],
              ['Jarayon:', `${pct}%`],
            ].map(([k, v]) => (
              <div key={k} className="sidebar-info-row">
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            {lessons.length > 0 && (
              <>
                <div className="progress-bar" style={{ margin: '1rem 0' }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <Link to={`/lessons/${lessons[0].id}`} className="btn btn-primary btn-block">
                  {completed > 0 ? <><Play size={16} /> Davom etish</> : <><Play size={16} /> Boshlash</>}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .page-hero-section{padding:4rem 0 2rem;background:linear-gradient(135deg,var(--bg2),var(--bg3));border-bottom:1px solid var(--border)}
        .page-hero-title{font-size:2rem;font-weight:800;margin-bottom:.5rem}
        .page-hero-sub{color:var(--text-muted)}
        .breadcrumb-row{display:flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--text-muted);margin-bottom:1rem}
        .breadcrumb-row a{color:var(--primary);text-decoration:none}
        .course-detail-header{display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap}
        .course-detail-icon{font-size:3.5rem}
        .course-detail-layout{display:grid;grid-template-columns:1fr 300px;gap:2rem}
        .lessons-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
        .lessons-header{display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.5rem;border-bottom:1px solid var(--border)}
        .lessons-header h2{font-size:1rem;font-weight:700}
        .lessons-progress-text{font-size:.8rem;color:var(--text-muted)}
        .lesson-row{display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;border-bottom:1px solid var(--border);color:var(--text);text-decoration:none;transition:background .2s}
        .lesson-row:hover{background:var(--card2)}
        .lesson-row.done{background:rgba(34,197,94,.04)}
        .lesson-num-circle{width:32px;height:32px;border-radius:50%;background:var(--bg2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:600;flex-shrink:0}
        .lesson-row-info{flex:1}
        .lesson-row-title{font-weight:500;font-size:.9rem;margin-bottom:.2rem}
        .lesson-row-meta{display:flex;gap:.8rem;font-size:.75rem;color:var(--text-muted);flex-wrap:wrap}
        .lesson-row-meta span{display:flex;align-items:center;gap:.3rem}
        .quiz-tag{background:rgba(99,102,241,.15);color:var(--primary);padding:.1rem .5rem;border-radius:50px;display:flex;align-items:center;gap:.3rem}
        .quiz-tag.passed{background:rgba(34,197,94,.15);color:#22c55e}
        .course-sidebar-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;height:fit-content;position:sticky;top:80px}
        .course-sidebar-card h3{font-size:1rem;font-weight:700;margin-bottom:1rem}
        .sidebar-info-row{display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border);font-size:.85rem}
        .sidebar-info-row:last-of-type{border-bottom:none}
        @media(max-width:900px){
          .course-detail-layout{grid-template-columns:1fr}
          .course-sidebar-card{position:static}
        }
        @media(max-width:480px){
          .course-detail-header{flex-direction:column;align-items:flex-start}
          .lesson-row{padding:.8rem 1rem}
        }
      `}</style>
    </div>
  )
}
