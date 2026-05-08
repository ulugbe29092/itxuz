import { useEffect, useState } from 'react'
import { BookOpen, Trash2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', description: '', icon: '', order_num: '' })

  const load = () => api.get('/admin/courses').then(r => { setCourses(r.data.courses); setLoading(false) })
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/courses', form)
      toast.success("Kurs qo'shildi!")
      setForm({ title: '', slug: '', description: '', icon: '', order_num: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    try { await api.delete(`/admin/courses/${id}`); toast.success("O'chirildi"); load() }
    catch { toast.error('Xatolik') }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BookOpen size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kurslar boshqaruvi</h1>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Yangi kurs qo'shish
        </h2>
        <form onSubmit={add}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Kurs nomi</label><input className="form-input" placeholder="HTML & CSS" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Slug (URL)</label><input className="form-input" placeholder="html-css" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Icon (emoji)</label><input className="form-input" placeholder="🌐" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Tartib raqami</label><input className="form-input" type="number" placeholder="16" value={form.order_num} onChange={e => setForm(f => ({ ...f, order_num: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Tavsif</label><textarea className="form-input" rows={2} placeholder="Kurs haqida..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <button type="submit" className="btn btn-primary"><Plus size={16} /> Kurs qo'shish</button>
        </form>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Mavjud kurslar ({courses.length})</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>{['ID', 'Icon', 'Nomi', 'Slug', 'Darslar', 'Tartib', 'Amallar'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{c.id}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '1.5rem' }}>{c.icon}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{c.title}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}><code style={{ background: 'var(--bg2)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>{c.slug}</code></td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{c.lesson_count || 0}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{c.order_num}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <button className="btn btn-danger btn-sm" onClick={() => del(c.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Trash2 size={13} /> O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
