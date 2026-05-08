import { useEffect, useState } from 'react'
import { ShieldCheck, AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

export default function AdminViolations() {
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/admin/quiz-violations')
      .then(r => { setViolations(r.data.violations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const deleteViolation = async (id) => {
    if (!confirm('Rasmni o\'chirishni tasdiqlaysizmi?')) return
    try {
      await api.delete(`/admin/quiz-violations/${id}`)
      toast.success('O\'chirildi')
      setViolations(v => v.filter(x => x.id !== id))
    } catch {
      toast.error('Xatolik')
    }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShieldCheck size={22} color="#ef4444" />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Quizdan yiqilganlar</h1>
          <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: '0.8rem', fontWeight: 700 }}>
            {violations.length}
          </span>
        </div>
      </div>

      {violations.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '4rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-muted)' }}>Hozircha hech kim yiqilmagan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {violations.map(v => (
            <div key={v.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
              
              {/* Screenshot */}
              {v.screenshot ? (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={v.screenshot}
                    alt="Violation"
                    style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 10, border: '2px solid #ef4444', display: 'block' }}
                  />
                  <button
                    onClick={() => deleteViolation(v.id)}
                    title="Rasmni o'chirish"
                    style={{ position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 6, background: 'rgba(239,68,68,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={13} color="#fff" />
                  </button>
                </div>
              ) : (
                <div style={{ width: 140, height: 105, borderRadius: 10, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--bg2)' }}>
                  <AlertTriangle size={24} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.7rem' }}>
                  {v.avatar
                    ? <img src={v.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem', flexShrink: 0 }}>
                        {v.first_name?.[0]?.toUpperCase()}
                      </div>
                  }
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.first_name} {v.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{v.username}</div>
                  </div>
                </div>

                {/* Quiz */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Quiz: <strong style={{ color: 'var(--text)' }}>{v.quiz_title}</strong>
                </div>

                {/* Violation */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: '0.5rem' }}>
                  <AlertTriangle size={13} color="#ef4444" />
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{v.violation_type}</span>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  {new Date(v.created_at).toLocaleString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
