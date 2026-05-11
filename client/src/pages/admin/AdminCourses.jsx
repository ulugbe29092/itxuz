import { useEffect, useState } from 'react'
import { BookOpen, Trash2, Plus, Upload, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import { getCourseLogo } from '../../components/CourseLogos'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', slug: '', description: '', order_num: '' })
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)

  // Edit modal state
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editIconFile, setEditIconFile] = useState(null)

  const load = () => api.get('/admin/courses').then(r => { setCourses(r.data.courses); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleIconChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIconFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setIconPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const add = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('slug', form.slug)
      fd.append('description', form.description || '')
      fd.append('order_num', form.order_num || '0')
      if (iconFile) fd.append('icon', iconFile)
      await api.post('/admin/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success("Kurs qo'shildi!")
      setForm({ title: '', slug: '', description: '', order_num: '' })
      setIconFile(null)
      setIconPreview(null)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
  }

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    try { await api.delete(`/admin/courses/${id}`); toast.success("O'chirildi"); load() }
    catch { toast.error('Xatolik') }
  }

  const openEdit = (c) => {
    setEditModal(c)
    setEditForm({ title: c.title, slug: c.slug, description: c.description || '', order_num: c.order_num })
    setEditIconFile(null)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('title', editForm.title)
      fd.append('slug', editForm.slug)
      fd.append('description', editForm.description || '')
      fd.append('order_num', editForm.order_num || '0')
      if (editIconFile) fd.append('icon', editIconFile)
      await api.put(`/admin/courses/${editModal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Kurs yangilandi!')
      setEditModal(null)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Xatolik') }
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
            <div className="form-group">
              <label className="form-label">Kurs rasmi (PNG, JPG, SVG) — ixtiyoriy</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', background: 'var(--bg2)', border: `1.5px dashed ${iconFile ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: iconFile ? 'var(--text)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {iconPreview ? <img src={iconPreview} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} /> : <Upload size={18} color={iconFile ? 'var(--primary)' : 'var(--text-muted)'} />}
                {iconFile ? iconFile.name : 'Rasm tanlang (max 2MB, ixtiyoriy)'}
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml" style={{ display: 'none' }} onChange={handleIconChange} />
              </label>
            </div>
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
              <tr>{['ID', 'Rasm/Icon', 'Nomi', 'Slug', 'Darslar', 'Tartib', 'Amallar'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{c.id}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    {c.icon && (c.icon.startsWith('/') || c.icon.startsWith('http'))
                      ? <img src={c.icon} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6 }} />
                      : (() => { const logo = getCourseLogo(c.slug, 28); return <div style={{ width: 40, height: 40, borderRadius: 8, background: logo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{logo.svg}</div> })()
                    }
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{c.title}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}><code style={{ background: 'var(--bg2)', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' }}>{c.slug}</code></td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{c.lesson_count || 0}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{c.order_num}</td>
                  <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Pencil size={13} /> Tahrirlash
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(c.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Trash2 size={13} /> O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>Kursni tahrirlash — {editModal.title}</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label className="form-label">Kurs ID (o'zgartirish mumkin)</label>
                  <input className="form-input" type="number" value={editForm.id || editModal.id} onChange={e => setEditForm(f => ({...f, id: e.target.value}))} />
                  <span className="field-hint">Diqqat: ID o'zgartirilsa bog'liq darslar ham yangilanadi</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Kurs nomi</label>
                  <input className="form-input" value={editForm.title} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input className="form-input" value={editForm.slug} onChange={e => setEditForm(f => ({...f, slug: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Tavsif</label>
                  <textarea className="form-input" rows={2} value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tartib raqami</label>
                  <input className="form-input" type="number" value={editForm.order_num} onChange={e => setEditForm(f => ({...f, order_num: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Yangi rasm (ixtiyoriy)</label>
                  <label style={{display:'flex',alignItems:'center',gap:'0.6rem',background:'var(--bg2)',border:'1.5px dashed var(--border)',borderRadius:'var(--radius)',padding:'0.8rem 1rem',cursor:'pointer',fontSize:'0.9rem',color:'var(--text-muted)'}}>
                    <Upload size={16} />
                    {editIconFile ? editIconFile.name : 'Rasm tanlang (ixtiyoriy)'}
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e => setEditIconFile(e.target.files[0])} />
                  </label>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Saqlash</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
