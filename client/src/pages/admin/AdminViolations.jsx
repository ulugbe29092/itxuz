import { useEffect, useState } from 'react'
import { ShieldCheck, AlertTriangle, User, Calendar } from 'lucide-react'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminViolations() {
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/quiz-violations')
      .then(r => { setViolations(r.data.violations || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldCheck size={24} color="#ef4444" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quizdan yiqilganlar</h1>
      </div>

      {violations.length === 0 ? (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center' }}>
          <ShieldCheck size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Hozircha hech kim yiqilmagan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {violations.map(v => (
            <div key={v.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
              {/* Screenshot */}
              {v.screenshot ? (
                <img 
                  src={v.screenshot} 
                  alt="Violation" 
                  style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 12, border: '3px solid #ef4444', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 160, height: 120, borderRadius: 12, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={32} color="var(--text-muted)" />
                </div>
              )}
              
              {/* Ma'lumotlar */}
              <div style={{ flex: 1 }}>
                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                  {v.avatar ? (
                    <img src={v.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                      {v.first_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                      {v.first_name} {v.last_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      @{v.username}
                    </div>
                  </div>
                </div>

                {/* Quiz info */}
                <div style={{ background: 'var(--bg2)', padding: '0.8rem 1rem', borderRadius: 10, marginBottom: '0.8rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Quiz: <strong style={{ color: 'var(--text)' }}>{v.quiz_title}</strong>
                  </div>
                </div>

                {/* Violation info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: '0.8rem' }}>
                  <AlertTriangle size={16} color="#ef4444" />
                  <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                    {v.violation_type}: {v.violation_text}
                  </div>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  {new Date(v.created_at).toLocaleString('uz-UZ', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
