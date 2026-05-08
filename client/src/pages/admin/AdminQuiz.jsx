import { useEffect, useState } from 'react'
import { FileQuestion, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizForm, setQuizForm] = useState({ lesson_id: '', title: '', pass_percentage: 70 })
  const [qForm, setQForm] = useState({ quiz_id: '', question_text: '', options: ['', '', '', ''], correct_option: 0 })

  const load = async () => {
    const [q, l] = await Promise.all([api.get('/admin/quizzes'), api.get('/admin/lessons')])
    setQuizzes(q.data.quizzes); setLessons(l.data.lessons); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const addQuiz = async (e) => {
    e.preventDefault()
    try { await api.post('/admin/quizzes', quizForm); toast.success('Quiz yaratildi!'); setQuizForm({ lesson_id: '', title: '', pass_percentage: 70 }); load() }
    catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  const addQuestion = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/admin/quizzes/${qForm.quiz_id}/questions`, { question_text: qForm.question_text, options: qForm.options, correct_option: qForm.correct_option })
      toast.success("Savol qo'shildi!")
      setQForm(f => ({ ...f, question_text: '', options: ['', '', '', ''], correct_option: 0 }))
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <FileQuestion size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quiz boshqaruvi</h1>
      </div>

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
            <div className="form-group"><label className="form-label">Quiz nomi</label><input className="form-input" placeholder="HTML asoslari testi" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">O'tish foizi (%)</label><input className="form-input" type="number" min={1} max={100} value={quizForm.pass_percentage} onChange={e => setQuizForm(f => ({ ...f, pass_percentage: e.target.value }))} /></div>
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
            <div className="form-group"><label className="form-label">Savol matni</label><textarea className="form-input" rows={2} placeholder="Savol..." value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} required /></div>
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

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Mavjud quizlar ({quizzes.length})</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>{['ID', 'Dars', 'Quiz nomi', "O'tish %", 'Savollar'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {quizzes.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Hali quizlar yo'q</td></tr>
                : quizzes.map(q => (
                  <tr key={q.id}>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{q.id}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{q.lesson_title}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{q.title}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{q.pass_percentage}%</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{q.question_count}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
