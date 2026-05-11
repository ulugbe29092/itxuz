import { useEffect, useState } from 'react'
import { FileQuestion, Plus, Sparkles, Loader2, CheckCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'manual'
  const [expandedQuiz, setExpandedQuiz] = useState(null)

  // AI form
  const [aiForm, setAiForm] = useState({ lesson_id: '', count: 30 })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProgress, setAiProgress] = useState('') // status text

  // Manual quiz form
  const [quizForm, setQuizForm] = useState({ lesson_id: '', title: '', pass_percentage: 70 })
  const [qForm, setQForm] = useState({ quiz_id: '', question_text: '', options: ['', '', '', ''], correct_option: 0 })

  const load = async () => {
    const [q, l] = await Promise.all([api.get('/admin/quizzes'), api.get('/admin/lessons')])
    setQuizzes(q.data.quizzes)
    setLessons(l.data.lessons)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // ===== AI QUIZ YARATISH =====
  const handleAiGenerate = async (e) => {
    e.preventDefault()
    if (!aiForm.lesson_id) return toast.error('Darsni tanlang')

    const lesson = lessons.find(l => String(l.id) === String(aiForm.lesson_id))
    if (!lesson) return toast.error('Dars topilmadi')

    setAiLoading(true)
    setAiProgress('AI dars mavzusini tahlil qilmoqda...')

    try {
      // 1. Quiz yaratish
      setAiProgress(`"${lesson.title}" uchun quiz yaratilmoqda...`)
      const quizRes = await api.post('/admin/quizzes', {
        lesson_id: aiForm.lesson_id,
        title: `${lesson.title} — AI Test`,
        pass_percentage: 70
      })
      const quizId = quizRes.data.quiz?.id || quizRes.data.id

      // 2. AI savollar generatsiya
      setAiProgress(`🤖 Gemini AI ${aiForm.count} ta savol yozmoqda...`)
      const aiRes = await api.post('/ai-assistant/generate-quiz-auto', {
        courseTitle: lesson.course_title,
        lessonTitle: lesson.title,
        questionCount: Number(aiForm.count)
      })

      const questions = aiRes.data.questions || []
      if (!questions.length) throw new Error('AI savol qaytarmadi')

      // 3. Savollarni bazaga saqlash
      setAiProgress(`💾 ${questions.length} ta savol saqlanmoqda...`)
      let saved = 0
      for (const q of questions) {
        try {
          await api.post(`/admin/quizzes/${quizId}/questions`, {
            question_text: q.question,
            options: q.options,
            correct_option: q.correctIndex ?? 0
          })
          saved++
          if (saved % 5 === 0) {
            setAiProgress(`💾 ${saved}/${questions.length} savol saqlandi...`)
          }
        } catch { /* bitta savol xato bo'lsa davom et */ }
      }

      setAiProgress(`✅ Tayyor! ${saved} ta savol yaratildi`)
      toast.success(`🎉 AI ${saved} ta test savol yaratdi!`)
      setAiForm({ lesson_id: '', count: 30 })
      load()
      setTimeout(() => setAiProgress(''), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'AI xatolik berdi')
      setAiProgress('')
    } finally {
      setAiLoading(false)
    }
  }

  // ===== MANUAL QUIZ =====
  const addQuiz = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/quizzes', quizForm)
      toast.success('Quiz yaratildi!')
      setQuizForm({ lesson_id: '', title: '', pass_percentage: 70 })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  const addQuestion = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/admin/quizzes/${qForm.quiz_id}/questions`, {
        question_text: qForm.question_text,
        options: qForm.options,
        correct_option: qForm.correct_option
      })
      toast.success("Savol qo'shildi!")
      setQForm(f => ({ ...f, question_text: '', options: ['', '', '', ''], correct_option: 0 }))
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Quizni o'chirishni tasdiqlaysizmi?")) return
    try {
      await api.delete(`/admin/quizzes/${id}`)
      toast.success("O'chirildi")
      load()
    } catch { toast.error('Xatolik') }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileQuestion size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quiz boshqaruvi</h1>
        <span style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600 }}>
          {quizzes.length} ta quiz
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg2)', padding: '0.3rem', borderRadius: 'var(--radius)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('ai')}
          style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', background: activeTab === 'ai' ? 'var(--primary)' : 'transparent', color: activeTab === 'ai' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Sparkles size={15} /> AI bilan yaratish
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          style={{ padding: '0.5rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', background: activeTab === 'manual' ? 'var(--card)' : 'transparent', color: activeTab === 'manual' ? 'var(--text)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={15} /> Qo'lda yaratish
        </button>
      </div>

      {/* ===== AI TAB ===== */}
      {activeTab === 'ai' && (
        <div style={{ background: 'var(--card)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
              <Sparkles size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.1rem' }}>AI Quiz Generator</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Gemini AI dars mavzusiga qarab avtomatik test savollar yaratadi</p>
            </div>
          </div>

          <form onSubmit={handleAiGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Darsni tanlang</label>
                <select
                  className="form-input"
                  value={aiForm.lesson_id}
                  onChange={e => setAiForm(f => ({ ...f, lesson_id: e.target.value }))}
                  required
                  disabled={aiLoading}
                >
                  <option value="">— Darsni tanlang —</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.course_title} › {l.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0, minWidth: 120 }}>
                <label className="form-label">Savollar soni</label>
                <select
                  className="form-input"
                  value={aiForm.count}
                  onChange={e => setAiForm(f => ({ ...f, count: e.target.value }))}
                  disabled={aiLoading}
                >
                  <option value={10}>10 ta</option>
                  <option value={20}>20 ta</option>
                  <option value={30}>30 ta</option>
                  <option value={50}>50 ta</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={aiLoading || !aiForm.lesson_id}
              style={{
                marginTop: '1.2rem',
                width: '100%', padding: '0.9rem',
                borderRadius: 'var(--radius)', border: 'none', cursor: aiLoading ? 'not-allowed' : 'pointer',
                background: aiLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                boxShadow: aiLoading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                transition: 'all 0.3s'
              }}
            >
              {aiLoading
                ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> AI ishlayapti...</>
                : <><Sparkles size={18} /> {aiForm.count} ta savol yaratish</>
              }
            </button>
          </form>

          {/* Progress */}
          {aiProgress && (
            <div style={{
              marginTop: '1rem',
              background: aiProgress.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.08)',
              border: `1px solid ${aiProgress.startsWith('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.2)'}`,
              borderRadius: 'var(--radius)', padding: '0.9rem 1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              fontSize: '0.85rem', fontWeight: 500
            }}>
              {aiProgress.startsWith('✅')
                ? <CheckCircle size={18} color="#22c55e" />
                : <Loader2 size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              }
              <span style={{ color: aiProgress.startsWith('✅') ? '#22c55e' : 'var(--text)' }}>
                {aiProgress}
              </span>
            </div>
          )}

          {/* Info */}
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { icon: '🤖', text: 'Gemini AI ishlatiladi' },
              { icon: '📝', text: "O'zbek tilida savollar" },
              { icon: '⚡', text: '15-30 soniyada tayyor' },
              { icon: '✅', text: '4 ta variant, 1 ta to\'g\'ri' },
            ].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg2)', padding: '0.3rem 0.7rem', borderRadius: '50px' }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ===== MANUAL TAB ===== */}
      {activeTab === 'manual' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Yangi quiz yaratish
            </h2>
            <form onSubmit={addQuiz}>
              <div className="form-group">
                <label className="form-label">Dars</label>
                <select className="form-input" value={quizForm.lesson_id} onChange={e => setQuizForm(f => ({ ...f, lesson_id: e.target.value }))} required>
                  <option value="">Darsni tanlang</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.course_title} — {l.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quiz nomi</label>
                <input className="form-input" placeholder="HTML asoslari testi" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">O'tish foizi (%)</label>
                <input className="form-input" type="number" min={1} max={100} value={quizForm.pass_percentage} onChange={e => setQuizForm(f => ({ ...f, pass_percentage: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary"><Plus size={16} /> Quiz yaratish</button>
            </form>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Savol qo'shish
            </h2>
            <form onSubmit={addQuestion}>
              <div className="form-group">
                <label className="form-label">Quiz</label>
                <select className="form-input" value={qForm.quiz_id} onChange={e => setQForm(f => ({ ...f, quiz_id: e.target.value }))} required>
                  <option value="">Quizni tanlang</option>
                  {quizzes.map(q => <option key={q.id} value={q.id}>{q.lesson_title} — {q.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Savol matni</label>
                <textarea className="form-input" rows={2} placeholder="Savol..." value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Javob variantlari (to'g'risini belgilang)</label>
                {qForm.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="radio" name="correct" checked={qForm.correct_option === i} onChange={() => setQForm(f => ({ ...f, correct_option: i }))} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                    <input className="form-input" placeholder={`${i + 1}-variant`} value={opt} onChange={e => { const o = [...qForm.options]; o[i] = e.target.value; setQForm(f => ({ ...f, options: o })) }} />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn btn-primary"><Plus size={16} /> Savol qo'shish</button>
            </form>
          </div>
        </div>
      )}

      {/* ===== QUIZLAR RO'YXATI ===== */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Mavjud quizlar ({quizzes.length})</h2>
        </div>
        {quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileQuestion size={40} style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
            <p>Hali quizlar yo'q. AI bilan yarating!</p>
          </div>
        ) : (
          <div>
            {quizzes.map(q => (
              <div key={q.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', cursor: 'pointer', transition: 'background 0.2s' }}
                  onClick={() => setExpandedQuiz(expandedQuiz === q.id ? null : q.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileQuestion size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{q.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{q.lesson_title}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
                    <span style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {q.question_count} savol
                    </span>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {q.pass_percentage}% o'tish
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteQuiz(q.id) }}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '0.3rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}
                    >
                      <Trash2 size={13} />
                    </button>
                    {expandedQuiz === q.id ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
