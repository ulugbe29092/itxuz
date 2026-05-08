import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, XCircle, Clock, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import Loader from '../../components/Loader'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/admin/payments').then(r => { setPayments(r.data.payments); setLoading(false) })
  useEffect(() => { load() }, [])

  const approve = async (id) => {
    try { await api.post(`/admin/payments/${id}/approve`); toast.success('Tasdiqlandi! Tarif yangilandi.'); load() }
    catch { toast.error('Xatolik') }
  }

  const reject = async (id) => {
    if (!confirm('Rad etishni tasdiqlaysizmi?')) return
    try { await api.post(`/admin/payments/${id}/reject`); toast.success('Rad etildi'); load() }
    catch { toast.error('Xatolik') }
  }

  if (loading) return <Loader fullScreen={false} />

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <CreditCard size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>To'lovlar boshqaruvi</h1>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>{['ID', 'Foydalanuvchi', 'Tarif', 'Summa', 'Holat', 'Chek', 'Sana', 'Amallar'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.7rem 1rem', background: 'var(--bg2)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Hali to'lovlar yo'q</td></tr>
                : payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>#{p.id}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 500 }}>{p.first_name} {p.last_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{p.username}</div>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}><span className={`badge-${p.plan}`}>{p.plan?.toUpperCase()}</span></td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{p.amount?.toLocaleString()} so'm</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700, background: p.status === 'approved' ? 'rgba(34,197,94,0.15)' : p.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'approved' ? '#22c55e' : p.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>
                        {p.status === 'approved' ? <CheckCircle size={11} /> : p.status === 'rejected' ? <XCircle size={11} /> : <Clock size={11} />}
                        {p.status === 'approved' ? 'Tasdiqlandi' : p.status === 'rejected' ? 'Rad etildi' : 'Kutilmoqda'}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      {p.payment_proof_image
                        ? <a href={p.payment_proof_image} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Image size={13} /> Ko'rish
                          </a>
                        : <span style={{ color: 'var(--text-muted)' }}>Yo'q</span>
                      }
                    </td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(p.created_at).toLocaleDateString('uz-UZ')}</td>
                    <td style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      {p.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn btn-success btn-sm" onClick={() => approve(p.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={13} /> Tasdiqlash
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => reject(p.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <XCircle size={13} /> Rad
                          </button>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
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
