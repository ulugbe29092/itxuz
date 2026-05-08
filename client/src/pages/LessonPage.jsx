import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle, FileQuestion, ChevronLeft, ChevronRight,
  Star, Send, Loader2, Video
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Loader from '../components/Loader'
import BackButton from '../components/BackButton'

function getYouTubeId(url) {
  const m = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [completing, setCompleting] = useState(false)
  const [comment, setComment]   = useState({ content: '', rating: 5 })
  const [submitting, setSubmitting] = useState(false)

  // Video progress tracking (faqat ma'lumot uchun)
  const [videoProgress, setVideoProgress] = useState(0)      // 0-100%
  const videoRef = useRef(null)
  const iframeRef = useRef(null)

  const fetchData = useCallback(() => {
    api.get(`/lessons/${id}`)
      .then(r => {
        setData(r.data)
        setLoading(false)
      })
      .catch(err => {
        if (err.response?.data?.upgrade) navigate('/pricing?upgrade=1')
        else navigate('/courses')
      })
  }, [id, navigate])

  useEffect(() => { fetchData() }, [fetchData])

  // ===== Local video progress (faqat ma'lumot uchun) =====
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = Math.round((v.currentTime / v.duration) * 100)
    setVideoProgress(pct)
  }, [])

  const handleVideoEnded = useCallback(() => {
    setVideoProgress(100)
  }, [])

  // ===== YouTube iframe progress (faqat ma'lumot uchun) =====
  useEffect(() => {
    if (!data?.lesson?.video_url) return
    const videoId = getYouTubeId(data.lesson.video_url)
    if (!videoId) return

    // YouTube API orqali progress kuzatish
    const handleMessage = (e) => {
      if (!e.data || typeof e.data !== 'string') return
      try {
        const msg = JSON.parse(e.data)
        if (msg.event === 'infoDelivery' && msg.info) {
          const { currentTime, duration } = msg.info
          if (duration && currentTime) {
            const pct = Math.round((currentTime / duration) * 100)
            setVideoProgress(pct)
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [data?.lesson?.video_url])

  // ===== Darsni tugatish =====
  const markComplete = async () => {
    setCompleting(true)
    try {
      await api.post(`/lessons/${id}/complete`)
      toast.success('Dars tugatildi!')
      fetchData()
    } catch {
      toast.error('Xatolik')
    } finally {
      setCompleting(false)
    }
  }

  // ===== Izoh yuborish =====
  const submitComment = async (e) => {
    e.preventDefault()
    if (!comment.content.trim()) return toast.error('Izoh yozing')
    setSubmitting(true)
    try {
      await api.post(`/lessons/${id}/comment`, comment)
      toast.success("Izoh qo'shildi!")
      setComment({ content: '', rating: 5 })
      fetchData()
    } catch {
      toast.error('Xatolik')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />
  if (!data) return null

  const { lesson, progress, quiz, comments, prevLesson, nextLesson } = data
  const videoId = getYouTubeId(lesson.video_url)
  const hasVideo = !!lesson.video_url

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Face Monitor - FAQAT QUIZ UCHUN, video uchun emas */}
      {/* Video paytida Face ID o'chirilgan */}

      <div className="lesson-wrap">

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <BackButton fallback="/courses" label="Kurslarga qaytish" />
          <div className="lesson-breadcrumb" style={{ margin: 0 }}>
            <Link to="/courses">Kurslar</Link>
            <ChevronRight size={14} />
            <Link to={`/courses/${lesson.course_slug}`}>{lesson.course_title}</Link>
            <ChevronRight size={14} />
            <span>{lesson.title}</span>
          </div>
        </div>

        <h1 className="lesson-title">{lesson.title}</h1>

        {/* ===== VIDEO ===== */}
        <div className="video-box">
          {hasVideo ? (
            lesson.video_type === 'youtube' && videoId ? (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3&disablekb=0&cc_load_policy=0&playsinline=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                title={lesson.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                ref={videoRef}
                controls
                style={{ width: '100%', height: '100%' }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                preload="metadata"
              >
                <source src={lesson.video_url} type="video/mp4" />
                <source src={lesson.video_url} type="video/webm" />
              </video>
            )
          ) : (
            <div className="video-empty">
              <Video size={48} color="var(--text-muted)" />
              <p>Video hali qo'shilmagan</p>
            </div>
          )}
        </div>

        {/* Video progress bar - faqat ma'lumot uchun */}
        {hasVideo && !progress?.watched && (
          <div className="video-progress-wrap">
            <div className="video-progress-bar">
              <div className="video-progress-fill" style={{ width: `${videoProgress}%` }} />
            </div>
            <span className="video-progress-label">
              Video progress: {videoProgress}% (ixtiyoriy)
            </span>
          </div>
        )}

        {/* ===== AMALLAR ===== */}
        <div className="lesson-actions">
          {/* Darsni tugatdim tugmasi */}
          {!progress?.watched ? (
            <button
              className="btn btn-primary"
              onClick={markComplete}
              disabled={completing}
            >
              {completing
                ? <><Loader2 size={16} className="spin" /> Saqlanmoqda...</>
                : <><CheckCircle size={16} /> Darsni tugatdim</>
              }
            </button>
          ) : (
            <span className="completed-badge">
              <CheckCircle size={16} /> Dars tugatildi
            </span>
          )}

          {/* Quiz tugmasi - doim ochiq */}
          {quiz && (
            <Link to={`/quiz/${quiz.id}`} className="btn btn-outline quiz-btn">
              <FileQuestion size={16} />
              {progress?.quiz_passed
                ? <>Quiz o'tildi <span style={{ color: '#22c55e', marginLeft: 4 }}>({progress.quiz_score}%)</span></>
                : 'Quizni boshlash'
              }
            </Link>
          )}
        </div>

        {/* Video ko'rilmagan ogohlantirish - olib tashlandi */}

        {/* ===== NAVIGATSIYA ===== */}
        <div className="lesson-nav">
          {prevLesson ? (
            <Link to={`/lessons/${prevLesson.id}`} className="btn btn-outline lesson-nav-btn">
              <ChevronLeft size={16} /> {prevLesson.title}
            </Link>
          ) : <div />}
          {nextLesson && (
            <Link to={`/lessons/${nextLesson.id}`} className="btn btn-primary lesson-nav-btn">
              {nextLesson.title} <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* ===== TAVSIF ===== */}
        {lesson.description && (
          <div className="lesson-desc-card">
            <h3>Dars haqida</h3>
            <p>{lesson.description}</p>
          </div>
        )}

        {/* ===== IZOHLAR ===== */}
        <div id="comments">
          <h3 className="comments-title">Izohlar ({comments.length})</h3>

          <form onSubmit={submitComment} className="comment-form">
            <div className="rating-row">
              <span>Baho:</span>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setComment(c => ({ ...c, rating: n }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem' }}>
                    <Star size={18}
                      fill={n <= comment.rating ? '#f59e0b' : 'none'}
                      color={n <= comment.rating ? '#f59e0b' : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="form-input" rows={3}
              placeholder="Izoh qoldiring..."
              value={comment.content}
              onChange={e => setComment(c => ({ ...c, content: e.target.value }))}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting
                ? <><Loader2 size={14} className="spin" /> Yuborilmoqda...</>
                : <><Send size={14} /> Yuborish</>
              }
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="empty-state"><p>Hali izoh yo'q. Birinchi bo'lib izoh qoldiring!</p></div>
            ) : comments.map(c => (
              <div key={c.id} className="comment-card">
                <div className="comment-header">
                  {c.avatar
                    ? <img src={c.avatar} alt="" className="comment-avatar" />
                    : <div className="comment-avatar-placeholder">{c.first_name?.[0]?.toUpperCase()}</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.first_name} {c.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  {c.rating && (
                    <div style={{ display: 'flex', gap: '0.1rem' }}>
                      {[...Array(c.rating)].map((_, j) => (
                        <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  )}
                </div>
                <p className="comment-text">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .lesson-wrap{max-width:900px;margin:0 auto;padding:2rem 1.5rem 4rem}
        .lesson-breadcrumb{display:flex;align-items:center;gap:.4rem;font-size:.82rem;color:var(--text-muted);flex-wrap:wrap}
        .lesson-breadcrumb a{color:var(--primary);text-decoration:none}
        .lesson-title{font-size:1.6rem;font-weight:800;margin-bottom:1.5rem}

        /* Video */
        .video-box{background:#000;border-radius:var(--radius-lg);overflow:hidden;aspect-ratio:16/9;margin-bottom:.8rem}
        .video-empty{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-muted);gap:1rem}

        /* Video progress */
        .video-progress-wrap{margin-bottom:1rem}
        .video-progress-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:.4rem}
        .video-progress-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width .5s}
        .video-progress-label{font-size:.75rem;color:var(--text-muted)}

        /* Video notice */
        .video-notice{
          display:flex;align-items:center;gap:.5rem;
          background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);
          border-radius:var(--radius);padding:.6rem 1rem;
          font-size:.82rem;color:#f59e0b;margin-bottom:1.2rem;
        }

        /* Actions */
        .lesson-actions{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
        .completed-badge{display:inline-flex;align-items:center;gap:.4rem;background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.3);padding:.65rem 1.5rem;border-radius:var(--radius);font-weight:600;font-size:.9rem}
        .quiz-btn{display:inline-flex;align-items:center;gap:.5rem}
        .quiz-locked{opacity:.5;cursor:not-allowed!important}

        /* Nav */
        .lesson-nav{display:flex;justify-content:space-between;gap:1rem;margin-bottom:2rem}
        .lesson-nav-btn{max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;align-items:center;gap:.3rem}

        /* Description */
        .lesson-desc-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;margin-bottom:2rem}
        .lesson-desc-card h3{font-size:1rem;font-weight:700;margin-bottom:.8rem}
        .lesson-desc-card p{color:var(--text-muted);font-size:.9rem;line-height:1.7}

        /* Comments */
        .comments-title{font-size:1.1rem;font-weight:700;margin-bottom:1.2rem}
        .comment-form{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.8rem}
        .rating-row{display:flex;align-items:center;gap:1rem;font-size:.85rem}
        .comments-list{display:flex;flex-direction:column;gap:1rem}
        .comment-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem}
        .comment-header{display:flex;align-items:center;gap:.8rem;margin-bottom:.8rem}
        .comment-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover}
        .comment-avatar-placeholder{width:36px;height:36px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;flex-shrink:0}
        .comment-text{font-size:.88rem;color:var(--text-muted);line-height:1.6}

        @media(max-width:768px){
          .lesson-wrap{padding:1rem 1rem 3rem}
          .lesson-title{font-size:1.3rem}
          .lesson-nav{flex-direction:column}
          .lesson-nav-btn{max-width:100%}
        }
      `}</style>
    </div>
  )
}
