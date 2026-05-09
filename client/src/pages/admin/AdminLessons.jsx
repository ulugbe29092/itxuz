import { useEffect, useState } from 'react'
import { Video, Trash2, Plus, Youtube, HardDrive, Upload, EyeOff, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminLessons() {
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [videoType, setVideoType] = useState('youtube')
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    course_id: '', title: '', description: '',
    video_url: '', order_num: ''
  })

  const load = async () => {
    const [l, c] = await Promise.all([api.get('/admin/lessons'), api.get('/admin/courses')])
    setLessons(l.data.lessons); setCourses(c.data.courses); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!form.course_id) return toast.error('Kursni tanlang')
    if (!form.title) return toast.error('Dars nomini kiriting')
    if (videoType === 'youtube' && !form.video_url) return toast.error('YouTube URL kiriting')
    if (videoType === 'local' && !videoFile) return toast.error('Video faylni tanlang')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('course_id', form.course_id)
      fd.append('title', form.title)
      fd.append('description', form.description || '')
      fd.append('video_type', videoType)
      fd.append('order_num', form.order_num || '0')

      if (videoType === 'youtube') {
        fd.append('video_url', form.video_url)
      } else {
        fd.append('video_file', videoFile)
      }

      await api.post('/admin/lessons', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success("Dars qo'shildi!")
      setForm({ course_id: '', title: '', description: '', video_url: '', order_num: '' })
      setVideoFile(null)
      setVideoType('youtube')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xatolik')
    } finally {
      setUploading(false)
    }
  }

  const del = async (id) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    try { await api.delete(`/admin/lessons/${id}`); toast.success("O'chirildi"); load() }
    catch { toast.error('Xatolik') }
  }

  const toggleBlock = async (id, isBlocked) => {
    try {
      await api.post(`/admin/lessons/${id}/${isBlocked ? 'unblock' : 'block'}`)
      toast.success(isBlocked ? 'Video yoqildi' : 'Video bloklandi')
      load()
    } catch { toast.error('Xatolik') }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Video size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Videolar boshqaruvi</h1>
      </div>

      {/* Add form */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Yangi dars qo'shish
        </h2>
        <form onSubmit={add}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Kurs</label>
              <select className="form-input" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>
                <option value="">Kursni tanlang</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Video turi</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button"
                  onClick={() => setVideoType('youtube')}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: 'var(--radius)', border: `2px solid ${videoType === 'youtube' ? 'var(--primary)' : 'var(--border)'}`, background: videoType === 'youtube' ? 'rgba(99,102,241,0.1)' : 'var(--bg2)', color: videoType === 'youtube' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  <Youtube size={16} /> YouTube
                </button>
                <button type="button"
                  onClick={() => setVideoType('local')}
                  style={{ flex: 1, padding: '0.7rem', borderRadius: 'var(--radius)', border: `2px solid ${videoType === 'local' ? 'var(--primary)' : 'var(--border)'}`, background: videoType === 'local' ? 'rgba(99,102,241,0.1)' : 'var(--bg2)', color: videoType === 'local' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  <HardDrive size={16} /> O'z fayl
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dars nomi</label>
            <input className="form-input" placeholder="HTML asoslari - 1-dars" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>

          {/* Video input */}
          {videoType === 'youtube' ? (
            <div className="form-group">
              <label className="form-label">YouTube URL</label>
              <div style={{ position: 'relative' }}>
                <Youtube size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
                <input className="form-input" style={{ paddingLeft: '2.6rem' }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Video fayl (mp4, webm, mov)</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', background: 'var(--bg2)', border: `1.5px dashed ${videoFile ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: videoFile ? 'var(--text)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                <Upload size={18} color={videoFile ? 'var(--primary)' : 'var(--text-muted)'} />
                {videoFile ? videoFile.name : 'Video faylni tanlang (max 500MB)'}
                <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/avi" style={{ display: 'none' }}
                  onChange={e => setVideoFile(e.target.files[0])} />
              </label>
              {videoFile && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Hajm: {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tartib raqami</label>
              <input className="form-input" type="number" placeholder="1" value={form.order_num} onChange={e => setForm(f => ({ ...f, order_num: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tavsif</label>
            <textarea className="form-input" rows={2} placeholder="Dars haqida..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading
              ? <><span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> Yuklanmoqda...</>
              : <><Plus size={16} /> Dars qo'shish</>
            }
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Barcha darslar ({lessons.length})</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>{['ID', 'Kurs', 'Dars nomi', 'Turi', 'Holat', 'Tartib', 'Amallar'].map(h =>
                <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {lessons.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Hali darslar yo'q</td></tr>
                : lessons.map(l => (
                  <tr key={l.id}>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{l.id}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{l.course_title}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{l.title}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: l.video_type === 'youtube' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: l.video_type === 'youtube' ? '#ef4444' : '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>
                        {l.video_type === 'youtube' ? <Youtube size={11} /> : <HardDrive size={11} />}
                        {l.video_type === 'youtube' ? 'YouTube' : "O'z fayl"}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, background: l.is_blocked ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: l.is_blocked ? '#ef4444' : '#22c55e' }}>
                        {l.is_blocked ? <EyeOff size={11} /> : <Eye size={11} />}
                        {l.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>{l.order_num}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className={`btn btn-sm ${l.is_blocked ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => toggleBlock(l.id, l.is_blocked)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          title={l.is_blocked ? 'Yoqish' : 'Bloklash'}
                        >
                          {l.is_blocked ? <><Eye size={13} /> Yoqish</> : <><EyeOff size={13} /> Bloklash</>}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(l.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Trash2 size={13} /> O'chirish
                        </button>
                      </div>
                    </td>
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
