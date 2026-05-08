import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, User, Calendar, RotateCcw } from 'lucide-react'
import api from '../../api/axios'
import Loader from '../../components/Loader'
import toast from 'react-hot-toast'

export default function AdminRetakeRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRequests = () => {
    api.get('/admin/retake-requests')
      .then(r => { setRequests(r.data.requests || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/retake-requests/${id}/approve`)
      toast.success('Ruxsat berildi!')
      loadRequests()
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/retake-requests/${id}/reject`)
      toast.success('Rad etildi')
      loadRequests()
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <RotateCcw size={24} color="#f59e0b" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Qayta topshirish so'rovlari</h1>
      </div>

      {requests.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' }}>
          <RotateCcw size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Hozircha so'rovlar yo'q</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(r => (
            <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                {/* User info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                      {r.first_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                        {r.first_name} {r.last_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        @{r.username}
                      </div>
                    </div>
                  </div>

                  {/* Quiz info */}
                  <div style={{ background: 'var(--bg2)', padding: '0.8rem 1rem', borderRadius: 10, marginBottom: '0.8rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Quiz: <strong style={{ color: 'var(--text)' }}>{r.quiz_title}</strong>
                    </div>
                  </div>

                  {/* Reset count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: '0.8rem' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                      {r.reset_count} marta qayta boshlandi
                    </div>
                  </div>

                  {/* Reason */}
                  {r.reason && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontStyle: 'italic' }}>
                      "{r.reason}"
                    </div>
                  )}

                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} />
                    {new Date(r.created_at).toLocaleString('uz-UZ', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleApprove(r.id)}
                    className="btn btn-primary"
                    style={{ minWidth: 120 }}
                  >
                    <CheckCircle size={16} /> Ruxsat berish
                  </button>
                  <button 
                    onClick={() => handleReject(r.id)}
                    className="btn btn-outline"
                    style={{ minWidth: 120, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    <XCircle size={16} /> Rad etish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
